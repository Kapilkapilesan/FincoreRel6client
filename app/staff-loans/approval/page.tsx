"use client";

import React, { useEffect, useState } from 'react';
import { staffLoanService, StaffLoan } from '../../../services/staffLoan.service';
import { toast } from 'react-toastify';
import { CheckCircle2, XCircle, Search, Filter, AlertCircle, User, Building, Phone, CreditCard, MapPin, Briefcase, X } from 'lucide-react';
import BMSLoader from '../../../components/common/BMSLoader';

export default function StaffLoanApprovalPage() {
    const [loading, setLoading] = useState(true);
    const [loans, setLoans] = useState<StaffLoan[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Action Modal State
    const [selectedLoan, setSelectedLoan] = useState<StaffLoan | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    // Staff Details Modal State
    const [viewStaff, setViewStaff] = useState<StaffLoan['staff'] | null>(null);

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

    const handleAction = (loan: StaffLoan, type: 'approve' | 'reject') => {
        setSelectedLoan(loan);
        setActionType(type);
        setRejectionReason('');
    };

    const confirmAction = async () => {
        if (!selectedLoan || !actionType) return;

        if (actionType === 'reject' && !rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        setProcessing(true);
        try {
            const response = await staffLoanService.updateStatus(
                selectedLoan.id,
                actionType === 'approve' ? 'approved' : 'rejected',
                rejectionReason
            );

            if (response.status === 'success') {
                toast.success(`Loan ${actionType === 'approve' ? 'Approved' : 'Rejected'} Successfully`);
                fetchLoans(); // Refresh list
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

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Staff Loan Approval</h1>

                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search staff, ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Applicant</th>
                                <th className="px-6 py-4">Loan Details</th>
                                <th className="px-6 py-4">Witness</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center">
                                        <div className="flex justify-center">
                                            <BMSLoader message="Loading loans..." size="xsmall" />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLoans.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No loans found matching filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredLoans.map((loan) => (
                                    <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div
                                                onClick={() => setViewStaff(loan.staff || null)}
                                                className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:underline decoration-blue-600/30 underline-offset-2 transition-all flex items-center gap-2 w-fit"
                                            >
                                                {loan.staff?.full_name}
                                                <User className="w-3.5 h-3.5 opacity-50" />
                                            </div>
                                            <div
                                                className="text-xs text-gray-500 mt-0.5 font-mono cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit"
                                                onClick={() => setViewStaff(loan.staff || null)}
                                            >
                                                {loan.staff_id} • {loan.staff?.branch?.branch_name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono font-medium text-gray-900 dark:text-white">
                                                {Number(loan.amount).toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {loan.loan_duration} Months • {loan.purpose}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900 dark:text-white">{loan.witness?.full_name || 'N/A'}</div>
                                            <div className="text-xs text-gray-500">{loan.witness_staff_id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                                                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {loan.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
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
                                                </div>
                                            )}
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
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${actionType === 'approve' ? 'text-green-600' : 'text-red-600'}`}>
                            {actionType === 'approve' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                            {actionType === 'approve' ? 'Approve Loan' : 'Reject Loan'}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to {actionType} the loan request for <span className="font-semibold text-gray-900 dark:text-white">{selectedLoan.staff?.full_name}</span>?
                            {actionType === 'approve' && " This will mark the loan as ready for disbursement."}
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
                                className={`px-4 py-2 text-white rounded-lg font-medium shadow-sm transition-colors ${actionType === 'approve'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                                    } disabled:opacity-50`}
                            >
                                {processing ? 'Processing...' : `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Staff Details Modal */}
            {viewStaff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-6 pt-10 pb-8 text-center text-white">
                            <button
                                onClick={() => setViewStaff(null)}
                                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-24 h-24 mx-auto bg-white rounded-full p-1 shadow-xl mb-4">
                                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                    <User className="w-12 h-12 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold">{viewStaff.full_name}</h3>
                            <div className="flex items-center justify-center gap-2 mt-1 opacity-90 text-sm">
                                <span className="font-mono bg-white/20 px-2 py-0.5 rounded-md">{viewStaff.staff_id}</span>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                        <Building className="w-3.5 h-3.5" />
                                        Branch
                                    </div>
                                    <div className="font-semibold text-gray-900 dark:text-gray-100">{viewStaff.branch?.branch_name || 'N/A'}</div>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        Role
                                    </div>
                                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                                        {viewStaff.user?.roles?.[0]?.name
                                            ? viewStaff.user.roles[0].name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                            : 'Staff Member'
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors">
                                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 font-medium">NIC Number</div>
                                        <div className="font-mono font-semibold text-gray-900 dark:text-white">{viewStaff.nic || 'N/A'}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors">
                                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 font-medium">Contact Number</div>
                                        <div className="font-mono font-semibold text-gray-900 dark:text-white">{viewStaff.contact_no || 'N/A'}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors">
                                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 font-medium">Address</div>
                                        <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{viewStaff.address || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <button
                                onClick={() => setViewStaff(null)}
                                className="px-5 py-2.5 bg-gray-900 dark:bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-200 dark:shadow-none hover:translate-y-[-1px] transition-all"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
