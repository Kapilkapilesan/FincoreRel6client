'use client'

import { useEffect, useState } from 'react';
import { authService, User } from '@/services/auth.service';
import { Search } from 'lucide-react';
import WelcomeDialog from '@/components/dashboard/WelcomeDialog';
import MonthYearPicker from '@/components/ui/MonthYearPicker';
import DashboardStatsCards from '@/components/dashboard/DashboardStatsCards';
import BranchList from '@/components/dashboard/BranchList';
import BranchPerformanceView from '@/components/dashboard/BranchPerformanceView';
import { dashboardService } from '@/services/dashboard.service';
import { DashboardStats, BranchSummary, BranchPerformanceData, DateFilter } from '@/types/dashboard.types';
import BMSLoader from '@/components/common/BMSLoader';
import { colors } from '@/themes/colors';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [branches, setBranches] = useState<BranchSummary[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchPerformanceData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize user on component mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Show welcome dialog on first load
  useEffect(() => {
    if (user && (user.role === 'Admin' || authService.hasRole('manager') || authService.hasRole('staff') || authService.hasRole('field_officer'))) {
      const hasShownWelcome = sessionStorage.getItem('hasShownWelcome');
      if (!hasShownWelcome) {
        setShowWelcomeDialog(true);
        sessionStorage.setItem('hasShownWelcome', 'true');
      }
    }
  }, [user]);

  // Fetch dashboard data
  useEffect(() => {
    loadDashboardData(true);
  }, [user]);

  // Handle filter changes
  useEffect(() => {
    if (!isLoading) {
      loadDashboardData(false);
    }
  }, [selectedMonth, selectedYear]);

  const loadDashboardData = async (initial = false) => {
    if (initial) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const currentUser = authService.getCurrentUser();
      // Robustly get branchId from user object
      const branchId = (authService.hasRole('manager') || authService.hasRole('field_officer') || authService.hasRole('staff'))
        ? (currentUser?.branch?.id || (currentUser as any)?.staff?.branch_id)
        : undefined;

      console.log('Loading dashboard data for branchId:', branchId, 'Month:', selectedMonth, 'Year:', selectedYear);

      const [statsData, branchesData] = await Promise.all([
        dashboardService.getDashboardStats(branchId, selectedMonth, selectedYear),
        dashboardService.getBranchSummaries(),
      ]);

      setStats(statsData);
      setBranches(branchesData);

      // Auto-load branch performance for managers
      if (branchId) {
        const today = new Date().toISOString().split('T')[0];
        const branchData = await dashboardService.getBranchPerformance(branchId, 'day', today);
        if (branchData) {
          setSelectedBranch(branchData);
        } else {
          console.warn('Branch performance data returned null for branchId:', branchId);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleBranchClick = async (branchId: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const branchData = await dashboardService.getBranchPerformance(branchId, 'day', today);

      if (branchData) {
        setSelectedBranch(branchData);
        // Refresh stats for this specific branch when viewed
        const statsData = await dashboardService.getDashboardStats(branchId);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading branch performance:', error);
    }
  };

  const handleBranchPerformanceRefresh = async (
    filterType: DateFilter,
    date?: string,
    startDate?: string,
    endDate?: string
  ) => {
    if (!selectedBranch) return;

    try {
      const branchData = await dashboardService.getBranchPerformance(
        selectedBranch.branch_id,
        filterType,
        date,
        startDate,
        endDate
      );

      if (branchData) {
        setSelectedBranch(branchData);
      }
    } catch (error) {
      console.error('Error refreshing branch performance:', error);
    }
  };

  const handleBackToBranches = async () => {
    setSelectedBranch(null);
    // Refresh global stats when going back to branch list
    const statsData = await dashboardService.getDashboardStats();
    setStats(statsData);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <BMSLoader message="Loading dashboard..." className="text-gray-600 dark:text-gray-400" />
      </div>
    );
  }

  const isManager = authService.hasRole('manager') || authService.hasRole('field_officer') || authService.hasRole('staff');

  return (
    <div className="p-6">
      {/* Welcome Dialog */}
      {showWelcomeDialog && user && (
        <WelcomeDialog
          username={user.name}
          onClose={() => setShowWelcomeDialog(false)}
        />
      )}

      {(isManager || !selectedBranch) && (
        <div className="mb-8">
          <div
            className="rounded-2xl p-8 text-white shadow-lg"
            style={{
              background: `linear-gradient(to right, ${colors.primary[600]}, ${colors.primary[700]})`,
              boxShadow: `0 10px 25px -5px ${colors.primary[500]}33`
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Hello, {user?.name || user?.full_name || 'User'}
                </h1>
                <p className="italic text-lg" style={{ color: colors.primary[100] }}>
                  Welcome to BMS capital.
                </p>
                <p className="mt-2" style={{ color: colors.primary[100] }}>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex flex-col items-center sm:items-end">
                  <div className="flex items-center gap-2 mb-2">
                    {isRefreshing && (
                      <div className="flex items-center gap-2 text-xs font-bold text-white/80 animate-pulse">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Syncing...
                      </div>
                    )}
                    <MonthYearPicker
                      selectedMonth={selectedMonth}
                      selectedYear={selectedYear}
                      onChange={(m, y) => {
                        setSelectedMonth(m);
                        setSelectedYear(y);
                      }}
                      className="!bg-white/10 !border-white/20 !text-white"
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-sm mb-1 uppercase tracking-widest font-black" style={{ color: colors.primary[100] }}>Control Terminal</p>
                    <p className="text-xl font-semibold">
                      {new Date().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Stats Cards - Always show for Manager OR when no branch is selected by Admin */}
      {(isManager || !selectedBranch) && stats && (
        <div className="mb-8">
          <DashboardStatsCards
            stats={stats}
            isManager={isManager}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>
      )}

      {/* Branch Section or Branch Performance View */}
      {selectedBranch ? (
        <BranchPerformanceView
          branchData={selectedBranch}
          onBack={handleBackToBranches}
          onRefresh={handleBranchPerformanceRefresh}
          hideBack={isManager}
        />
      ) : isManager ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading branch performance details...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Branches Header with Controls */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Branches</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click on a branch to view performance details
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search branches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all shadow-sm"
                style={{
                  borderColor: searchQuery ? colors.primary[400] : undefined,
                  boxShadow: searchQuery ? `0 0 0 2px ${colors.primary[500]}33` : undefined
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary[500];
                  e.target.style.boxShadow = `0 0 0 4px ${colors.primary[500]}26`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = searchQuery ? colors.primary[400] : '';
                  e.target.style.boxShadow = searchQuery ? `0 0 0 2px ${colors.primary[500]}33` : '';
                }}
              />
            </div>
          </div>

          {/* Branches List */}
          <BranchList
            branches={branches}
            onBranchClick={handleBranchClick}
            searchQuery={searchQuery}
          />
        </div>
      )}
    </div>
  );
}
