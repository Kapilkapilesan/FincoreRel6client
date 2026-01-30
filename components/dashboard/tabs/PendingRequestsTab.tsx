'use client'

import { FileText, Calendar, DollarSign, Users, Edit3, Briefcase } from 'lucide-react';
import { PendingRequest } from '@/types/dashboard.types';

interface PendingRequestsTabProps {
    loanRequests: PendingRequest[];
    centerRequests: PendingRequest[];
    promotionRequests: PendingRequest[];
    incrementRequests: PendingRequest[];
    centerChangeRequests: PendingRequest[];
    customerEditRequests: PendingRequest[];
    leaveRequests: PendingRequest[];
    searchQuery: string;
}

export default function PendingRequestsTab({
    loanRequests,
    centerRequests,
    promotionRequests,
    incrementRequests,
    centerChangeRequests,
    customerEditRequests,
    leaveRequests,
    searchQuery
}: PendingRequestsTabProps) {
    // Filter requests based on search
    const filteredLoanRequests = loanRequests.filter(req =>
        req.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.loan_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCenterRequests = centerRequests.filter(req =>
        req.center_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPromotionRequests = promotionRequests.filter(req =>
        req.staff_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredIncrementRequests = incrementRequests.filter(req =>
        req.staff_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCenterChangeRequests = centerChangeRequests.filter(req =>
        req.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCustomerEditRequests = customerEditRequests.filter(req =>
        req.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredLeaveRequests = leaveRequests.filter(req =>
        req.staff_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Loan Approval Requests */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    Loan Approval Requests ({filteredLoanRequests.length})
                </h3>

                {filteredLoanRequests.length > 0 ? (
                    <div className="space-y-3">
                        {filteredLoanRequests.map((request) => (
                            <div
                                key={request.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                        <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {request.customer_name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Loan ID: {request.loan_id}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            ${request.amount?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Request Date</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {new Date(request.request_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No pending loan requests</p>
                    </div>
                )}
            </div>

            {/* Center Creation Approval Requests */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Center Creation Approval ({filteredCenterRequests.length})
                </h3>

                {filteredCenterRequests.length > 0 ? (
                    <div className="space-y-3">
                        {filteredCenterRequests.map((request) => (
                            <div
                                key={request.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {request.center_name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Center Creation Request
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Request Date</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {new Date(request.request_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No pending center creation requests</p>
                    </div>
                )}
            </div>

            {/* Promotion Approval Requests */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Promotion Approval ({filteredPromotionRequests.length})
                </h3>

                {filteredPromotionRequests.length > 0 ? (
                    <div className="space-y-3">
                        {filteredPromotionRequests.map((request) => (
                            <div
                                key={request.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {request.staff_name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Promotion: {request.role_change}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Request Date</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {new Date(request.request_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No pending promotion requests</p>
                    </div>
                )}
            </div>

            {/* Salary Increment Approval Requests */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-teal-600" />
                    Salary Increment Approval ({filteredIncrementRequests.length})
                </h3>

                {filteredIncrementRequests.length > 0 ? (
                    <div className="space-y-3">
                        {filteredIncrementRequests.map((request) => (
                            <div
                                key={request.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                                        <DollarSign className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {request.staff_name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Requested Amount: LKR {request.amount?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Request Date</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {new Date(request.request_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No pending salary increment requests</p>
                    </div>
                )}
            </div>

            {/* Center Change Requests */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Center Change Approval ({filteredCenterChangeRequests.length})
                </h3>

                {filteredCenterChangeRequests.length > 0 ? (
                    <div className="space-y-3">
                        {filteredCenterChangeRequests.map((request) => (
                            <div
                                key={request.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                        <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {request.customer_name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Change: {request.change_detail}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Request Date</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {new Date(request.request_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No pending center change requests</p>
                    </div>
                )}
            </div>

            {/* Customer Edit Requests */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-orange-600" />
                    Customer Edit Approval ({filteredCustomerEditRequests.length})
                </h3>

                {filteredCustomerEditRequests.length > 0 ? (
                    <div className="space-y-3">
                        {filteredCustomerEditRequests.map((request) => (
                            <div
                                key={request.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                        <Edit3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {request.customer_name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Profile Information Update
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Request Date</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {new Date(request.request_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <Edit3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No pending customer edit requests</p>
                    </div>
                )}
            </div>

            {/* Leave Requests */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-rose-600" />
                    Leave Approval ({filteredLeaveRequests.length})
                </h3>

                {filteredLeaveRequests.length > 0 ? (
                    <div className="space-y-3">
                        {filteredLeaveRequests.map((request) => (
                            <div
                                key={request.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                                        <Briefcase className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {request.staff_name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {request.leave_type} ({request.duration})
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Request Date</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {new Date(request.request_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No pending leave requests</p>
                    </div>
                )}
            </div>
        </div>
    );
}
