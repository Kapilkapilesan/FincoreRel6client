"use client";

import React, { useEffect, useState } from 'react';
import { staffLoanService, StaffLoan } from '../../services/staffLoan.service';
import { toast } from 'react-toastify';
import { CheckCircle2, XCircle, Search, Filter, AlertCircle, DollarSign, Banknote, Eye } from 'lucide-react';

export default function StaffLoanListPage() {
    const [loading, setLoading] = useState(true);
    const [loans, setLoans] = useState<StaffLoan[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Action Modal State
    const [selectedLoan, setSelectedLoan] = useState<StaffLoan | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'disburse' | 'view' | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [paymentReference, setPaymentReference] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        setLoading(true);
        try {
            const response = await staffLoanService.getAll();
            if (response.status === 'success') {
                setLoans(response.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch loans");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (loan: StaffLoan, type: 'approve' | 'reject' | 'disburse' | 'view') => {
        setSelectedLoan(loan);
        setActionType(type);
        setRejectionReason('');
        setPaymentReference('');
    };

    const confirmAction = async () => {
        if (!selectedLoan || !actionType) return;

        if (actionType === 'view') {
            setSelectedLoan(null);
            setActionType(null);
            return;
        }

        if (actionType === 'reject' && !rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        if (actionType === 'disburse' && !paymentReference.trim()) {
            toast.error("Please provide a payment reference");
            return;
        }

        setProcessing(true);
        try {
            let response;

            if (actionType === 'disburse') {
                response = await staffLoanService.disburse(selectedLoan.id, paymentReference);
            } else {
                response = await staffLoanService.updateStatus(
                    selectedLoan.id,
                    actionType === 'approve' ? 'approved' : 'rejected',
                    rejectionReason
                );
            }

            if (response.status === 'success') {
                const messages: Record<string, string> = {
                    approve: 'Loan Approved Successfully',
                    reject: 'Loan Rejected',
                    disburse: 'Loan Disbursed Successfully'
                };
                toast.success(messages[actionType]);
                fetchLoans();
                setSelectedLoan(null);
                setActionType(null);
            } else {
                toast.error(response.message || "Action failed");
            }
        } catch (error: any) {
            toast.error(error.message || "Action failed");
        } finally {
            setProcessing(false);
        }
    };

    const filteredLoans = loans.filter(loan => {
        const matchesStatus = filterStatus === 'all' || loan.status === filterStatus;
        const matchesSearch =
            loan.staff?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.staff_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.staff?.branch?.branch_name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'disbursed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        }
    };

    // Stats
    const pendingCount = loans.filter(l => l.status === 'pending').length;
    const approvedCount = loans.filter(l => l.status === 'approved').length;
    const disbursedCount = loans.filter(l => l.status === 'disbursed').length;
    const totalAmount = loans.reduce((sum, l) => sum + Number(l.amount), 0);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Staff Loan Management</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{approvedCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Banknote className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Disbursed</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{disbursedCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {Number(totalAmount).toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search staff, ID, branch..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="relative">
                    <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="disbursed">Disbursed</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Applicant</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Loan Details</th>
                                <th className="px-6 py-4">Witness</th>
                                <th className="px-6 py-4">Applied</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center">
                                        <div className="flex justify-center"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                                    </td>
                                </tr>
                            ) : filteredLoans.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No loans found matching filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredLoans.map((loan) => (
                                    <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{loan.staff?.full_name}</div>
                                            <div className="text-xs text-gray-500">{loan.staff_id} • {loan.staff?.branch?.branch_name || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900 dark:text-white">{(loan as any).product?.product_name || '-'}</div>
                                            <div className="text-xs text-gray-500">{(loan as any).product?.product_code || ''}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono font-medium text-gray-900 dark:text-white">
                                                {Number(loan.amount).toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {loan.loan_duration} Months
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900 dark:text-white">{loan.witness?.full_name || 'N/A'}</div>
                                            <div className="text-xs text-gray-500">{loan.witness_staff_id}</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(loan.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                                                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleAction(loan, 'view')}
                                                    className="p-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {loan.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(loan, 'approve')}
                                                            className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(loan, 'reject')}
                                                            className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {loan.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleAction(loan, 'disburse')}
                                                        className="p-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                                                        title="Disburse"
                                                    >
                                                        <Banknote className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Modal */}
            {selectedLoan && actionType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
                        {actionType === 'view' ? (
                            <>
                                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                    <Eye className="w-6 h-6 text-blue-600" />
                                    Loan Details
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Applicant</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedLoan.staff?.full_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Staff ID</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedLoan.staff_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Amount</p>
                                            <p className="font-medium text-gray-900 dark:text-white font-mono">
                                                {Number(selectedLoan.amount).toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Duration</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedLoan.loan_duration} Months</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-gray-500 dark:text-gray-400">Purpose</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedLoan.purpose}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Witness</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedLoan.witness?.full_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Status</p>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedLoan.status)}`}>
                                                {selectedLoan.status.charAt(0).toUpperCase() + selectedLoan.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={() => { setSelectedLoan(null); setActionType(null); }}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${actionType === 'approve' ? 'text-green-600' :
                                        actionType === 'disburse' ? 'text-blue-600' : 'text-red-600'
                                    }`}>
                                    {actionType === 'approve' && <CheckCircle2 className="w-6 h-6" />}
                                    {actionType === 'reject' && <AlertCircle className="w-6 h-6" />}
                                    {actionType === 'disburse' && <Banknote className="w-6 h-6" />}
                                    {actionType === 'approve' ? 'Approve Loan' : actionType === 'disburse' ? 'Disburse Loan' : 'Reject Loan'}
                                </h3>

                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    {actionType === 'disburse' ? (
                                        <>Disburse <span className="font-semibold text-gray-900 dark:text-white">{Number(selectedLoan.amount).toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}</span> to <span className="font-semibold text-gray-900 dark:text-white">{selectedLoan.staff?.full_name}</span>?</>
                                    ) : (
                                        <>Are you sure you want to {actionType} the loan request for <span className="font-semibold text-gray-900 dark:text-white">{selectedLoan.staff?.full_name}</span>?</>
                                    )}
                                </p>

                                {actionType === 'reject' && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rejection Reason</label>
                                        <textarea
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            rows={3}
                                            placeholder="Enter reason for rejection..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                )}

                                {actionType === 'disburse' && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Reference</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Enter cheque number or transfer reference..."
                                            value={paymentReference}
                                            onChange={(e) => setPaymentReference(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                )}

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => { setSelectedLoan(null); setActionType(null); }}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmAction}
                                        disabled={processing}
                                        className={`px-4 py-2 text-white rounded-lg font-medium shadow-sm transition-colors ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                                                actionType === 'disburse' ? 'bg-blue-600 hover:bg-blue-700' :
                                                    'bg-red-600 hover:bg-red-700'
                                            } disabled:opacity-50`}
                                    >
                                        {processing ? 'Processing...' :
                                            actionType === 'approve' ? 'Confirm Approval' :
                                                actionType === 'disburse' ? 'Confirm Disbursement' :
                                                    'Confirm Rejection'
                                        }
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
