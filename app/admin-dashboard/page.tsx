'use client'

import React, { useEffect, useState } from 'react';
import { authService, User } from '@/services/auth.service';
import AdminDashboardHeader from '@/components/admin-dashboard/AdminDashboardHeader';
import AdminStatsCards from '@/components/admin-dashboard/AdminStatsCards';
import CollectionEfficiencyGauge from '@/components/admin-dashboard/charts/CollectionEfficiencyGauge';
import TotalCollectionChart from '@/components/admin-dashboard/charts/TotalCollectionChart';
import FinancialPerformanceChart from '@/components/admin-dashboard/charts/FinancialPerformanceChart';
import TotalIncomeChart from '@/components/admin-dashboard/charts/TotalIncomeChart';
import TotalDisbursementsChart from '@/components/admin-dashboard/charts/TotalDisbursementsChart';
import MonthYearPicker from '@/components/ui/MonthYearPicker';
import { adminDashboardService } from '@/services/admin-dashboard.service';
import {
    AdminDashboardStats,
    BranchCollectionEfficiency,
    MonthlyCollectionData,
    MonthlyFinancialData,
    Branch
} from '@/types/admin-dashboard.types';
import BMSLoader from '@/components/common/BMSLoader';
import { colors } from '@/themes/colors';

export default function AdminDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [collectionEfficiency, setCollectionEfficiency] = useState<BranchCollectionEfficiency | null>(null);
    const [monthlyCollections, setMonthlyCollections] = useState<MonthlyCollectionData[]>([]);
    const [financialData, setFinancialData] = useState<MonthlyFinancialData[]>([]);
    const [monthlyIncome, setMonthlyIncome] = useState<MonthlyCollectionData[]>([]);
    const [monthlyDisbursements, setMonthlyDisbursements] = useState<MonthlyCollectionData[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        loadDashboardData(true);
    }, []);

    useEffect(() => {
        if (!isLoading) {
            loadDashboardData(false);
        }
    }, [selectedMonth, selectedYear]);

    const loadDashboardData = async (initial = false) => {
        if (initial) setIsLoading(true);
        else setIsRefreshing(true);

        try {
            const [
                statsData,
                branchesData,
                collectionsData,
                financialDataResponse,
                incomeData,
                disbursementsData
            ] = await Promise.all([
                adminDashboardService.getAdminStats(selectedMonth, selectedYear),
                initial ? adminDashboardService.getBranches() : Promise.resolve(branches),
                adminDashboardService.getMonthlyCollections(null, selectedYear),
                adminDashboardService.getFinancialPerformance(selectedYear),
                adminDashboardService.getMonthlyIncome(null, selectedYear),
                adminDashboardService.getMonthlyDisbursements(null, selectedYear)
            ]);

            setStats(statsData);
            setBranches(branchesData);
            setMonthlyCollections(collectionsData);
            setFinancialData(financialDataResponse);
            setMonthlyIncome(incomeData);
            setMonthlyDisbursements(disbursementsData);

            if (initial && branchesData.length > 0) {
                const firstBranchId = branchesData[0].id;
                setSelectedBranch(firstBranchId);
                loadCollectionEfficiency(firstBranchId);
            } else if (selectedBranch) {
                loadCollectionEfficiency(selectedBranch);
            }
        } catch (error) {
            console.error('Error loading admin dashboard data:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const loadCollectionEfficiency = async (branchId: number) => {
        try {
            const efficiency = await adminDashboardService.getCollectionEfficiency(branchId, selectedMonth, selectedYear);
            setCollectionEfficiency(efficiency);
        } catch (error) {
            console.error('Error loading collection efficiency:', error);
        }
    };

    const handleBranchChange = (branchId: number) => {
        setSelectedBranch(branchId);
        loadCollectionEfficiency(branchId);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
                <BMSLoader message="Initializing Console..." size="large" />
            </div>
        );
    }

    return (
        <div
            className="min-h-screen p-4 md:p-6 lg:p-10 relative overflow-hidden"
            style={{
                backgroundColor: colors.surface.background
            }}
        >
            {/* Soft Ambient Background Glows */}
            <div
                className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
                style={{ backgroundColor: `${colors.primary[500]}0D` }}
            />
            <div
                className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
                style={{ backgroundColor: `${colors.indigo[500]}0D` }}
            />

            <div className="relative z-10 max-w-[1600px] mx-auto space-y-10">
                {/* Header Section */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                    <AdminDashboardHeader userName={user?.name || user?.full_name || 'Admin'} />
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {isRefreshing && (
                            <div
                                className="flex items-center gap-2 text-xs font-bold animate-pulse"
                                style={{ color: colors.primary[600] }}
                            >
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: colors.primary[600] }}
                                />
                                Refreshing Data...
                            </div>
                        )}
                        <MonthYearPicker
                            selectedMonth={selectedMonth}
                            selectedYear={selectedYear}
                            onChange={(m, y) => {
                                setSelectedMonth(m);
                                setSelectedYear(y);
                            }}
                        />
                    </div>
                </div>

                {/* Statistics Grid */}
                {stats && <AdminStatsCards stats={stats} />}

                {/* Bento Grid Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
                    {/* Gauge Chart - Full Width */}
                    <div className="lg:col-span-12 bg-white dark:bg-gray-800 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-6 md:p-8 shadow-sm transition-all hover:shadow-xl group">
                        <CollectionEfficiencyGauge
                            efficiency={collectionEfficiency}
                            branches={branches}
                            selectedBranch={selectedBranch}
                            onBranchChange={handleBranchChange}
                        />
                    </div>

                    {/* Performance Line Chart */}
                    <div className="lg:col-span-12 2xl:col-span-8 bg-white dark:bg-gray-800 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-6 md:p-8 shadow-sm transition-all hover:shadow-xl">
                        <FinancialPerformanceChart data={financialData} />
                    </div>

                    {/* Total Collection Chart */}
                    <div className="lg:col-span-12 2xl:col-span-4 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-8 shadow-sm transition-all hover:shadow-xl">
                        <TotalCollectionChart
                            data={monthlyCollections}
                            branches={branches}
                            onBranchChange={(id) => adminDashboardService.getMonthlyCollections(id, selectedYear).then(setMonthlyCollections)}
                        />
                    </div>

                    {/* Side-by-Side Bento Boxes */}
                    <div className="lg:col-span-6 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-8 shadow-sm transition-all hover:shadow-xl">
                        <TotalIncomeChart
                            data={monthlyIncome}
                            branches={branches}
                            onBranchChange={(id) => adminDashboardService.getMonthlyIncome(id, selectedYear).then(setMonthlyIncome)}
                        />
                    </div>

                    <div className="lg:col-span-6 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-8 shadow-sm transition-all hover:shadow-xl">
                        <TotalDisbursementsChart
                            data={monthlyDisbursements}
                            branches={branches}
                            onBranchChange={(id) => adminDashboardService.getMonthlyDisbursements(id, selectedYear).then(setMonthlyDisbursements)}
                        />
                    </div>
                </div>

                {/* Footer Accent */}
                <div className="pt-10 flex items-center justify-center gap-4 text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.5em]">
                    <div className="h-px w-20 bg-gray-100 dark:bg-gray-800" />
                    FinCore Strategic Intelligence
                    <div className="h-px w-20 bg-gray-100 dark:bg-gray-800" />
                </div>
            </div>
        </div>
    );
}
