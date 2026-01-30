'use client';

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    DollarSign,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    ChevronRight,
    Check,
    X,
    Users
} from 'lucide-react';
import { toast } from 'react-toastify';
import { promotionService, salaryIncrementService, PromotionRequest, SalaryIncrementRequest } from '../../services/promotion.service';
import BMSLoader from '../../components/common/BMSLoader';

type TabType = 'promotion' | 'salary-increment';

export default function PromotionApprovalPage() {
    const [activeTab, setActiveTab] = useState<TabType>('promotion');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // Promotion state
    const [promotionRequests, setPromotionRequests] = useState<PromotionRequest[]>([]);

    // Salary Increment state
    const [incrementRequests, setIncrementRequests] = useState<SalaryIncrementRequest[]>([]);

    // Action Modal state
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<PromotionRequest | SalaryIncrementRequest | null>(null);
    const [feedbackReason, setFeedbackReason] = useState('');
    const [requestCategory, setRequestCategory] = useState<'promotion' | 'increment' | null>(null);

    useEffect(() => {
        fetchAllCounts();
    }, []);

    const fetchAllCounts = async () => {
        try {
            setLoading(true);
            const [promoData, incrementData] = await Promise.all([
                promotionService.getRequests(true),
                salaryIncrementService.getRequests(true)
            ]);
            setPromotionRequests(promoData);
            setIncrementRequests(incrementData);
        } catch (error) {
            console.error('Error fetching requests:', error);
            // toast.error('Failed to load pending counts');
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        // This is now redundant but kept for any specific refresh logic if needed
        fetchAllCounts();
    };

    const openActionModal = (
        request: PromotionRequest | SalaryIncrementRequest,
        action: 'approve' | 'reject',
        category: 'promotion' | 'increment'
    ) => {
        setSelectedRequest(request);
        setActionType(action);
        setRequestCategory(category);
        setFeedbackReason('');
        setShowActionModal(true);
    };

    const handleAction = async () => {
        if (!selectedRequest || !actionType || !requestCategory) return;

        if (actionType === 'reject' && feedbackReason.length < 5) {
            toast.error('Please provide a reason for rejection (at least 5 characters)');
            return;
        }

        try {
            setActionLoading(selectedRequest.id);

            if (requestCategory === 'promotion') {
                if (actionType === 'approve') {
                    await promotionService.approve(selectedRequest.id, feedbackReason || 'Approved');
                    toast.success('Promotion request approved! Staff role has been updated.');
                } else {
                    await promotionService.reject(selectedRequest.id, feedbackReason);
                    toast.success('Promotion request rejected.');
                }
            } else {
                if (actionType === 'approve') {
                    await salaryIncrementService.approve(selectedRequest.id, feedbackReason || 'Approved');
                    toast.success('Salary increment approved! Staff salary has been updated.');
                } else {
                    await salaryIncrementService.reject(selectedRequest.id, feedbackReason);
                    toast.success('Salary increment request rejected.');
                }
            }

            setShowActionModal(false);
            setSelectedRequest(null);
            setActionType(null);
            setFeedbackReason('');
            fetchRequests();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Action failed';
            toast.error(message);
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Promotion Approval</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Review and approve staff promotion and salary increment requests
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Promotions</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {activeTab === 'promotion' ? promotionRequests.length : '—'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Increments</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {activeTab === 'salary-increment' ? incrementRequests.length : '—'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    onClick={() => setActiveTab('promotion')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors relative ${activeTab === 'promotion'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                >
                    <TrendingUp className="w-4 h-4" />
                    <span>Promotion</span>
                    {promotionRequests.length > 0 && (
                        <span className="flex items-center justify-center bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full px-1 shadow-sm">
                            {promotionRequests.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('salary-increment')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors relative ${activeTab === 'salary-increment'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                >
                    <DollarSign className="w-4 h-4" />
                    <span>Salary Increment</span>
                    {incrementRequests.length > 0 && (
                        <span className="flex items-center justify-center bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full px-1 shadow-sm">
                            {incrementRequests.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <BMSLoader message="Loading requests..." size="xsmall" />
                </div>
            ) : (
                <>
                    {/* Promotion Requests List */}
                    {activeTab === 'promotion' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {promotionRequests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">No pending promotion requests</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Staff</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Role</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requested Role</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requested</th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {promotionRequests.map((request) => (
                                                <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white">{request.staff_name}</p>
                                                                <p className="text-sm text-gray-500">{request.staff_id}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                                                            {request.current_role_name}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                                                            {request.requested_role_name}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={request.reason}>
                                                            {request.reason}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="text-sm text-gray-500">{formatDate(request.requested_at)}</p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => openActionModal(request, 'approve', 'promotion')}
                                                                disabled={actionLoading === request.id}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => openActionModal(request, 'reject', 'promotion')}
                                                                disabled={actionLoading === request.id}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Salary Increment Requests List */}
                    {activeTab === 'salary-increment' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {incrementRequests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">No pending salary increment requests</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Staff</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Salary</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requested Increment</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">New Salary</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requested</th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {incrementRequests.map((request) => (
                                                <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                                                <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white">{request.staff_name}</p>
                                                                <p className="text-sm text-gray-500">{request.staff_id}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">{formatCurrency(request.current_salary)}</p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-green-600 dark:text-green-400 font-medium">
                                                            +{formatCurrency(request.requested_amount)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(request.new_salary)}</p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={request.reason}>
                                                            {request.reason}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="text-sm text-gray-500">{formatDate(request.requested_at)}</p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => openActionModal(request, 'approve', 'increment')}
                                                                disabled={actionLoading === request.id}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => openActionModal(request, 'reject', 'increment')}
                                                                disabled={actionLoading === request.id}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Action Modal */}
            {showActionModal && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className={`p-4 ${actionType === 'approve' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                            <h3 className={`text-lg font-semibold ${actionType === 'approve' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                                {actionType === 'approve' ? 'Approve' : 'Reject'} Request
                            </h3>
                        </div>
                        <div className="p-4">
                            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Staff:</span> {selectedRequest.staff_name}
                                </p>
                                {requestCategory === 'promotion' && 'requested_role_name' in selectedRequest && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        <span className="font-medium">Promotion:</span> {(selectedRequest as PromotionRequest).current_role_name} → {(selectedRequest as PromotionRequest).requested_role_name}
                                    </p>
                                )}
                                {requestCategory === 'increment' && 'requested_amount' in selectedRequest && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        <span className="font-medium">Increment:</span> +{formatCurrency((selectedRequest as SalaryIncrementRequest).requested_amount)}
                                    </p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {actionType === 'approve' ? 'Feedback (Optional)' : 'Reason for Rejection *'}
                                </label>
                                <textarea
                                    value={feedbackReason}
                                    onChange={(e) => setFeedbackReason(e.target.value)}
                                    rows={3}
                                    placeholder={actionType === 'approve' ? 'Add any feedback for the staff member...' : 'Explain why this request is being rejected...'}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>

                            {actionType === 'approve' && requestCategory === 'promotion' && (
                                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                        ⚠️ Approving this request will immediately change the staff member's role and permissions in the system.
                                    </p>
                                </div>
                            )}

                            {actionType === 'approve' && requestCategory === 'increment' && (
                                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                        ⚠️ Approving this request will immediately update the staff member's basic salary.
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowActionModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAction}
                                    disabled={actionLoading !== null}
                                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 ${actionType === 'approve'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                >
                                    {actionLoading !== null ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
