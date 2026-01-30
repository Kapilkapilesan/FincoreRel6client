'use client'

import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Search, Clock, CheckCircle, Users } from 'lucide-react';
import { BranchPerformanceData, DateFilter, AttendanceFilter } from '@/types/dashboard.types';
import PendingRequestsTab from './tabs/PendingRequestsTab';
import ApprovalRequestsTab from '@/components/dashboard/tabs/ApprovalRequestsTab';
import StaffTab from '@/components/dashboard/tabs/StaffTab';
import StaffCollectionEfficiencyGauge from './charts/StaffCollectionEfficiencyGauge';
import { dashboardService } from '@/services/dashboard.service';
import { StaffCollectionEfficiency } from '@/types/dashboard.types';
import { authService } from '@/services/auth.service';
import BMSLoader from '@/components/common/BMSLoader';

interface BranchPerformanceViewProps {
    branchData: BranchPerformanceData;
    onBack: () => void;
    onRefresh: (filterType: DateFilter, date?: string, startDate?: string, endDate?: string) => void;
    hideBack?: boolean;
    hideHeader?: boolean;
}

type TabType = 'pending' | 'approved' | 'staff';

export default function BranchPerformanceView({
    branchData,
    onBack,
    onRefresh,
    hideBack = false,
    hideHeader = false
}: BranchPerformanceViewProps) {
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [dateFilter, setDateFilter] = useState<DateFilter>('day');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>('all');
    const [efficiency, setEfficiency] = useState<StaffCollectionEfficiency | null>(null);
    const [selectedStaffId, setSelectedStaffId] = useState<string>('');
    const [isLoadingEfficiency, setIsLoadingEfficiency] = useState(false);

    const isAdmin = authService.hasRole('Admin') || authService.hasRole('admin') || authService.hasRole('super_admin');
    const isManager = authService.hasRole('manager') || authService.hasRole('Manager');
    const isFieldOfficer = !isAdmin && !isManager;

    useEffect(() => {
        if (!isAdmin) {
            loadEfficiency();
        }
    }, [selectedStaffId]);

    const loadEfficiency = async () => {
        setIsLoadingEfficiency(true);
        try {
            const data = await dashboardService.getStaffCollectionEfficiency(selectedStaffId || undefined);
            setEfficiency(data);
        } catch (error) {
            console.error('Error loading staff efficiency:', error);
        } finally {
            setIsLoadingEfficiency(false);
        }
    };

    // Extract staff list from attendance data for the dropdown
    const staffList = branchData.staff_attendance.map(s => ({
        staff_id: s.staff_id,
        full_name: s.staff_name
    }));

    // Handle date filter change
    const handleDateFilterChange = (filter: DateFilter) => {
        setDateFilter(filter);

        let newDate = selectedDate;

        // Update the date format based on filter type and update state
        if (filter === 'day') {
            // If coming from month/year, default to 1st of month/year
            if (newDate.length === 4) newDate = `${newDate}-01-01`;
            else if (newDate.length === 7) newDate = `${newDate}-01`;

            setSelectedDate(newDate);
            onRefresh(filter, newDate);
        } else if (filter === 'month') {
            newDate = selectedDate.substring(0, 7); // YYYY-MM
            setSelectedDate(newDate);
            onRefresh(filter, newDate);
        } else if (filter === 'year') {
            newDate = selectedDate.substring(0, 4); // YYYY
            setSelectedDate(newDate);
            onRefresh(filter, newDate);
        }
    };

    // Handle date selection
    const handleDateChange = (date: string) => {
        setSelectedDate(date);

        if (dateFilter === 'day') {
            onRefresh(dateFilter, date);
        } else if (dateFilter === 'month') {
            onRefresh(dateFilter, date.substring(0, 7));
        } else if (dateFilter === 'year') {
            onRefresh(dateFilter, date.substring(0, 4));
        }
    };

    const tabs = [
        { id: 'pending' as TabType, label: 'Pending Request', icon: Clock },
        { id: 'approved' as TabType, label: 'Approval Requests', icon: CheckCircle },
        { id: 'staff' as TabType, label: (isFieldOfficer || authService.hasRole('staff')) ? 'My Attendance' : 'Staffs', icon: Users },
    ];

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            {!hideHeader && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {!hideBack && (
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {branchData.branch_name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {branchData.location} • Manager: {branchData.manager_name}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Staff Collection Efficiency Gauge - Hidden for Admins */}
            {!isAdmin && (
                <div className="mt-8 transition-all duration-500 ease-in-out">
                    {isLoadingEfficiency ? (
                        <div className="w-full bg-white dark:bg-gray-800 rounded-3xl p-12 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center min-h-[400px]">
                            <BMSLoader message="Loading performance data..." className="text-gray-500 dark:text-gray-400" />
                        </div>
                    ) : (
                        <StaffCollectionEfficiencyGauge
                            efficiency={efficiency}
                            staffList={staffList}
                            selectedStaffId={selectedStaffId}
                            onStaffChange={setSelectedStaffId}
                            isManager={isManager}
                        />
                    )}
                </div>
            )}

            {/* Filters and Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Date Filter Buttons */}
                    <div className="flex items-center gap-2">
                        {['day', 'month', 'year'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => handleDateFilterChange(filter as DateFilter)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateFilter === filter
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Date Picker */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type={dateFilter === 'day' ? 'date' : dateFilter === 'month' ? 'month' : 'number'}
                            value={selectedDate}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 min-w-[250px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search branch, staff, requests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-1 items-center justify-center px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            <tab.icon className="w-5 h-5 mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'pending' && (
                        <PendingRequestsTab
                            loanRequests={branchData.pending_loan_requests}
                            centerRequests={branchData.pending_center_requests}
                            promotionRequests={branchData.pending_promotion_requests}
                            incrementRequests={branchData.pending_increment_requests}
                            centerChangeRequests={branchData.pending_center_change_requests}
                            customerEditRequests={branchData.pending_customer_edit_requests}
                            leaveRequests={branchData.pending_leave_requests}
                            searchQuery={searchQuery}
                        />
                    )}

                    {activeTab === 'approved' && (
                        <ApprovalRequestsTab
                            loanRequests={branchData.approved_loan_requests}
                            centerRequests={branchData.approved_center_requests}
                            promotionRequests={branchData.approved_promotion_requests}
                            incrementRequests={branchData.approved_increment_requests}
                            centerChangeRequests={branchData.approved_center_change_requests}
                            customerEditRequests={branchData.approved_customer_edit_requests}
                            leaveRequests={branchData.approved_leave_requests}
                            searchQuery={searchQuery}
                        />
                    )}

                    {activeTab === 'staff' && (
                        <StaffTab
                            staffData={branchData.staff_attendance}
                            dateFilter={dateFilter}
                            searchQuery={searchQuery}
                            attendanceFilter={attendanceFilter}
                            onFilterChange={setAttendanceFilter}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
