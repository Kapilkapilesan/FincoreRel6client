'use client'

import React from 'react';
import {
    Calendar,
    User,
    Users,
    AlertTriangle,
    Trash2,
    Power,
    Edit,
    CheckCircle,
    XCircle,
    Eye,
    UserPlus,
    MapPin,
    Clock
} from 'lucide-react';
import { Center, TemporaryAssignment } from '../../types/center.types';
import { colors } from '../../themes/colors';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../common/Pagination';

interface CenterTableProps {
    centers: Center[];
    totalCenters: number;
    getTemporaryAssignment: (centerId: string) => TemporaryAssignment | undefined;
    onEdit: (centerId: string) => void;
    onViewSchedule?: (centerId: string) => void;
    onApprove?: (centerId: string) => void;
    onReject?: (centerId: string) => void;
    onViewDetails: (center: Center) => void;
    onDelete?: (centerId: string) => void;
    onToggleStatus?: (center: Center) => void;
    onAssignCustomers?: (center: Center) => void;
    isFieldOfficer?: boolean;
    isManager?: boolean;
    isSuperAdmin?: boolean;
}

export function CenterTable({
    centers,
    totalCenters,
    getTemporaryAssignment,
    onEdit,
    onApprove,
    onReject,
    onViewDetails,
    onDelete,
    onToggleStatus,
    onAssignCustomers,
    isFieldOfficer,
    isManager,
    isSuperAdmin
}: CenterTableProps) {
    const {
        currentPage,
        itemsPerPage,
        startIndex,
        endIndex,
        handlePageChange,
        handleItemsPerPageChange
    } = usePagination({ totalItems: centers.length });

    const currentCenters = centers.slice(startIndex, endIndex);

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                {/* Header - Hidden on small screens, shown as thin bar on large */}
                <div className="hidden lg:grid grid-cols-12 gap-4 bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700 px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="col-span-3">Center & Branch</div>
                    <div className="col-span-3">Meeting Schedule</div>
                    <div className="col-span-2 text-center">Assigned User</div>
                    <div className="col-span-1 text-center">Status</div>
                    <div className="col-span-3 text-right">Actions</div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {currentCenters.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No centers found.</p>
                        </div>
                    ) : (
                        currentCenters.map((center) => {
                            const tempAssignment = getTemporaryAssignment(center.id);

                            return (
                                <div key={center.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-all duration-200">
                                    <div className="px-6 py-5">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start lg:items-center">
                                            {/* Center Info */}
                                            <div className="lg:col-span-3 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-blue-50 dark:bg-blue-900/20 group-hover:scale-110 transition-transform duration-200">
                                                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => onViewDetails(center)}
                                                            className="text-base font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                                                        >
                                                            {center.center_name}
                                                        </button>
                                                        <span className={`lg:hidden px-2 py-0.5 text-[10px] font-bold rounded-full ${center.location === 'Urban' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                            }`}>
                                                            {center.location}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col gap-0.5 mt-0.5">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{center.CSU_id}</span>
                                                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {center.branch?.branch_name || center.branch_id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Schedule Card */}
                                            <div className="lg:col-span-3">
                                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 border border-gray-100 dark:border-gray-700/50">
                                                    <div className="space-y-1.5">
                                                        {center.open_days?.slice(0, 2).map((s, i) => (
                                                            <div key={i} className="flex items-center justify-between text-[11px]">
                                                                <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                                                    <Calendar className="w-3 h-3 text-gray-400" />
                                                                    {s.day}
                                                                </span>
                                                                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded shadow-sm border border-gray-100 dark:border-gray-600">
                                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                                    {s.time}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {(!center.open_days || center.open_days.length === 0) && (
                                                            <span className="text-[11px] text-gray-400 italic">No schedule set</span>
                                                        )}
                                                        {(center.open_days?.length || 0) > 2 && (
                                                            <button
                                                                onClick={() => onViewDetails(center)}
                                                                className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                                                            >
                                                                +{(center.open_days?.length || 0) - 2} more schedules
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Assigned User */}
                                            <div className="lg:col-span-2">
                                                <div className="flex flex-col items-center lg:justify-center gap-1">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-600 overflow-hidden">
                                                        {center.staff?.profile_image_url ? (
                                                            <img src={center.staff.profile_image_url} alt="User" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-4 h-4 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 w-full text-center">
                                                        <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">
                                                            {center.staff?.full_name || 'Unassigned'}
                                                        </p>
                                                        {center.staff_id && (
                                                            <p className="text-[9px] text-gray-400 dark:text-gray-500 font-medium tracking-tight">
                                                                {center.staff_id}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="lg:col-span-1 flex justify-center">
                                                <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border shadow-sm ${center.status === 'active'
                                                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                                    : center.status === 'rejected'
                                                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                                        : center.status === 'disabled'
                                                            ? 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                                                    }`}>
                                                    {center.status === 'inactive' ? 'Pending' : center.status}
                                                </span>
                                            </div>

                                            {/* ACTIONS FOCUS AREA */}
                                            <div className="lg:col-span-3 flex flex-wrap justify-end gap-2 mt-4 lg:mt-0">
                                                {/* Quick View */}
                                                <button
                                                    onClick={() => onViewDetails(center)}
                                                    className="p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-all hover:scale-105"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {/* Edit */}
                                                {(center.status !== 'rejected' || isFieldOfficer) && (
                                                    <button
                                                        onClick={() => onEdit(center.id)}
                                                        className="p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-amber-600 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-all hover:scale-105"
                                                        title="Edit Center"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                )}

                                                {/* Approval Flow */}
                                                {center.status === 'inactive' && onApprove && (
                                                    <button
                                                        onClick={() => onApprove(center.id)}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all font-bold text-xs hover:scale-105"
                                                    >
                                                        <CheckCircle size={14} />
                                                        Approve
                                                    </button>
                                                )}

                                                {center.status === 'inactive' && onReject && (
                                                    <button
                                                        onClick={() => onReject(center.id)}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all font-bold text-xs hover:scale-105"
                                                    >
                                                        <XCircle size={14} />
                                                        Reject
                                                    </button>
                                                )}

                                                {/* Toggle Status (Enable/Disable) */}
                                                {onToggleStatus && (
                                                    <button
                                                        onClick={() => onToggleStatus(center)}
                                                        className={`p-2 rounded-lg border shadow-sm transition-all hover:scale-105 ${center.status === 'active'
                                                            ? 'text-red-500 bg-red-50 border-red-100 hover:bg-red-100'
                                                            : 'text-green-500 bg-green-50 border-green-100 hover:bg-green-100'
                                                            }`}
                                                        title={center.status === 'active' ? "Disable Center" : "Enable Center"}
                                                    >
                                                        <Power size={16} />
                                                    </button>
                                                )}

                                                {/* Assign Customers */}
                                                {onAssignCustomers && center.status === 'active' && (
                                                    <button
                                                        onClick={() => onAssignCustomers(center)}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all font-bold text-xs hover:scale-105"
                                                    >
                                                        <UserPlus size={14} />
                                                        Assign Customers
                                                    </button>
                                                )}

                                                {/* Delete - Only for cleanup */}
                                                {onDelete && center.status === 'inactive' && isFieldOfficer && (center.groups_count || 0) === 0 && (center.customers_count || 0) === 0 && (!center.open_days || center.open_days.length === 0) && (
                                                    <button
                                                        onClick={() => onDelete(center.id)}
                                                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-lg transition-all hover:scale-105"
                                                        title="Delete Center"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bottom Stats & Extra Info */}
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex gap-8">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Groups</span>
                                                    <span className="text-base font-black text-gray-900 dark:text-white">{center.groups_count || 0}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Members</span>
                                                    <span className="text-base font-black text-gray-900 dark:text-white">{center.customers_count || 0}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Loans</span>
                                                    <span className="text-base font-black text-gray-900 dark:text-white">{center.loans_count || center.totalLoans || 0}</span>
                                                </div>
                                            </div>

                                            {center.location && (
                                                <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold">
                                                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                                    <span className={`px-2 py-0.5 rounded-full ${center.location === 'Urban'
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        }`}>
                                                        {center.location} Area
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Temporary Assignment Banner */}
                                        {tempAssignment && (
                                            <div className="mt-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-xl p-3 flex items-start gap-3">
                                                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-amber-900 dark:text-amber-400">Temporary Duty Active</p>
                                                    <p className="text-[11px] text-amber-800 dark:text-amber-500 mt-0.5">
                                                        {tempAssignment.originalUser} is on leave. <span className="underline font-bold text-amber-900">{tempAssignment.temporaryUser}</span> is covering for {tempAssignment.date}.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <Pagination
                    currentPage={currentPage}
                    totalItems={centers.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    itemName="centers"
                />
            </div>
        </div>
    );
}
