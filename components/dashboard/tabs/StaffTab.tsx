'use client'

import { UserCheck, Clock, Filter } from 'lucide-react';
import { StaffAttendanceRecord, StaffMonthlyAttendance, DateFilter, AttendanceFilter } from '@/types/dashboard.types';

interface StaffTabProps {
    staffData: (StaffAttendanceRecord | StaffMonthlyAttendance)[];
    dateFilter: DateFilter;
    searchQuery: string;
    attendanceFilter: AttendanceFilter;
    onFilterChange: (filter: AttendanceFilter) => void;
}

export default function StaffTab({
    staffData,
    dateFilter,
    searchQuery,
    attendanceFilter,
    onFilterChange
}: StaffTabProps) {
    // Check if it's daily or monthly/yearly data
    const isDailyView = dateFilter === 'day';

    // Filter staff based on search and attendance filter
    const filteredStaff = staffData.filter((staff) => {
        const matchesSearch = staff.staff_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.staff_id.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (isDailyView) {
            const dailyStaff = staff as StaffAttendanceRecord;
            if (attendanceFilter === 'all') return true;
            return dailyStaff.status === attendanceFilter;
        }

        return true;
    });

    // Get status badge styling
    const getStatusBadge = (status: string) => {
        const safeStatus = (status || 'not marked').toLowerCase();
        const statusMap: Record<string, { bg: string; text: string }> = {
            'present': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
            'absent': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
            'half day': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
            'leave': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
            'not marked': { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400' },
        };
        return statusMap[safeStatus] || statusMap['not marked'];
    };

    // Filter buttons for attendance
    const filterOptions: AttendanceFilter[] = ['all', 'present', 'absent', 'half day', 'leave', 'not marked'];

    return (
        <div className="space-y-6">
            {/* Filter Options (only for daily view) */}
            {isDailyView && (
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
                    {filterOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => onFilterChange(option)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${attendanceFilter === option
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}

            {/* Daily View - List with status and check-in/out times */}
            {isDailyView && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Staff ID
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Staff Name
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Status
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Check-In Time
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Check-Out Time
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStaff.map((staff) => {
                                const dailyStaff = staff as StaffAttendanceRecord;
                                const statusStyle = getStatusBadge(dailyStaff.status);

                                return (
                                    <tr
                                        key={dailyStaff.staff_id}
                                        className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                    >
                                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                            {dailyStaff.staff_id}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                {dailyStaff.avatar ? (
                                                    <img
                                                        src={dailyStaff.avatar}
                                                        alt={dailyStaff.staff_name}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                                        <UserCheck className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                )}
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {dailyStaff.staff_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                                                {dailyStaff.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                            {dailyStaff.check_in_time ? (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-green-600" />
                                                    {dailyStaff.check_in_time}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                            {dailyStaff.check_out_time ? (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-red-600" />
                                                    {dailyStaff.check_out_time}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredStaff.length === 0 && (
                        <div className="text-center py-12">
                            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 dark:text-gray-400">No staff records found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Monthly/Yearly View - Summary with counts */}
            {!isDailyView && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Staff ID
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Staff Name
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-green-600 dark:text-green-400">
                                    Present
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-red-600 dark:text-red-400">
                                    Absent
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                                    Half Day
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    Leave
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    Not Marked
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStaff.map((staff) => {
                                const monthlyStaff = staff as StaffMonthlyAttendance;

                                return (
                                    <tr
                                        key={monthlyStaff.staff_id}
                                        className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                    >
                                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                            {monthlyStaff.staff_id}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                {monthlyStaff.avatar ? (
                                                    <img
                                                        src={monthlyStaff.avatar}
                                                        alt={monthlyStaff.staff_name}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                                        <UserCheck className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                )}
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {monthlyStaff.staff_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-flex px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold text-sm">
                                                {monthlyStaff.present_count}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-flex px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-semibold text-sm">
                                                {monthlyStaff.absent_count}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-flex px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-semibold text-sm">
                                                {monthlyStaff.half_day_count}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-flex px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold text-sm">
                                                {monthlyStaff.leave_count}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-flex px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 font-semibold text-sm">
                                                {monthlyStaff.not_marked_count}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredStaff.length === 0 && (
                        <div className="text-center py-12">
                            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 dark:text-gray-400">No staff records found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
