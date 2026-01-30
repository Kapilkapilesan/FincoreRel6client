"use client";

import React, { useEffect, useState } from 'react';
import { staffLoanService } from '../../../services/staffLoan.service';
import { staffService } from '../../../services/staff.service';
import { toast } from 'react-toastify';
import { Users, FileText, Calendar, DollarSign, UserCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';
import BMSLoader from '../../../components/common/BMSLoader';
import { colors } from '@/themes/colors';

export default function CreateStaffLoanPage() {
    const [loading, setLoading] = useState(true);
    const [staffDetails, setStaffDetails] = useState<any>(null);
    const [witnessCandidates, setWitnessCandidates] = useState<any[]>([]);
    const [loanProducts, setLoanProducts] = useState<any[]>([]);
    const [myLoans, setMyLoans] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        loan_product_id: '',
        purpose: '',
        loan_duration: '',
        amount: '',
        witness_staff_id: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [myDetails, witnesses, productsResponse, loansResponse] = await Promise.all([
                staffLoanService.getMyDetails().catch(e => ({ status: 'error', message: e.message })),
                staffService.getStaffDropdownList().catch(() => []),
                staffLoanService.getAvailableProducts().catch(() => ({ status: 'error', data: [] })),
                staffLoanService.getAll({ scope: 'mine' }).catch(() => ({ status: 'error', data: { data: [] } }))
            ]);

            if (myDetails.status === 'success') {
                setStaffDetails(myDetails.data);
            }

            // Handle response from new available-products endpoint
            // Backend already filters by product_type=staff_loan and staff gender
            const products = productsResponse.status === 'success' ? productsResponse.data : [];
            setLoanProducts(products);

            setWitnessCandidates(Array.isArray(witnesses) ? witnesses : []);
            if (loansResponse.status === 'success') {
                setMyLoans(loansResponse.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load details");
        } finally {
            setLoading(false);
        }
    };

    const handleProductChange = (productId: string) => {
        const product = loanProducts.find(p => p.id.toString() === productId);
        setFormData({
            ...formData,
            loan_product_id: productId,
            loan_duration: product ? product.loan_term.toString() : '',
            amount: '' // Clear amount - staff will enter their required amount
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const result = await staffLoanService.create({
                loan_product_id: parseInt(formData.loan_product_id),
                purpose: formData.purpose,
                loan_duration: parseInt(formData.loan_duration),
                amount: parseFloat(formData.amount),
                witness_staff_id: formData.witness_staff_id
            });

            if (result.status === 'success') {
                toast.success("Staff Loan Request Submitted Successfully");
                setFormData({ loan_product_id: '', purpose: '', loan_duration: '', amount: '', witness_staff_id: '' });
                // Refresh list
                const loansResponse = await staffLoanService.getAll({ scope: 'mine' });
                if (loansResponse.status === 'success') {
                    setMyLoans(loansResponse.data.data);
                }
            } else {
                toast.error(result.message || "Failed to submit request");
            }

        } catch (error: any) {
            toast.error(error.message || "Failed to submit request");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'disbursed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <BMSLoader message="Loading..." size="xsmall" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Staff Loan Application</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Staff Details Card (Readonly) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2
                        className="text-lg font-semibold mb-6 flex items-center gap-2"
                        style={{ color: colors.primary[600] }}
                    >
                        <UserCheck className="w-5 h-5" />
                        Applicant Details
                    </h2>
                    <div className="space-y-4">
                        <DetailRow label="Staff Name" value={staffDetails?.full_name} />
                        <DetailRow label="Staff ID" value={staffDetails?.staff_id} />
                        <DetailRow label="NIC" value={staffDetails?.nic} />
                        <DetailRow label="Gender" value={staffDetails?.gender} />
                        <DetailRow label="Address" value={staffDetails?.address} />
                        <DetailRow label="Branch" value={staffDetails?.branch} />
                        <DetailRow label="Phone" value={staffDetails?.contact_no} />
                    </div>
                </div>

                {/* Application Form */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-green-600 dark:text-green-400">
                        <FileText className="w-5 h-5" />
                        Loan Request
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Loan Product</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <select
                                    required
                                    value={formData.loan_product_id}
                                    onChange={e => handleProductChange(e.target.value)}
                                    className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
                                >
                                    <option value="">Select Product</option>
                                    {loanProducts.map((p: any) => (
                                        <option key={p.id} value={p.id}>
                                            {p.product_name} ({p.product_code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose of Loan</label>
                            <textarea
                                required
                                value={formData.purpose}
                                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                                placeholder="Enter reason for loan..."
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (Months)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="number"
                                        required
                                        readOnly
                                        min="1"
                                        placeholder="12"
                                        value={formData.loan_duration}
                                        className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Amount Requested
                                    {formData.loan_product_id && loanProducts.find(p => p.id.toString() === formData.loan_product_id) && (
                                        <span className="text-xs text-gray-500 ml-1">
                                            (Max: {Number(loanProducts.find(p => p.id.toString() === formData.loan_product_id)?.loan_amount || 0).toLocaleString()})
                                        </span>
                                    )}
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max={loanProducts.find(p => p.id.toString() === formData.loan_product_id)?.loan_amount || undefined}
                                        step="0.01"
                                        placeholder="Enter amount"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Witness (Same Branch Staff)</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <select
                                    required
                                    value={formData.witness_staff_id}
                                    onChange={e => setFormData({ ...formData, witness_staff_id: e.target.value })}
                                    className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
                                >
                                    <option value="">Select Witness</option>
                                    {witnessCandidates.map((staff: any) => (
                                        <option key={staff.staff_id} value={staff.staff_id}>
                                            {staff.full_name || staff.name} ({staff.staff_id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 text-white rounded-lg font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: `linear-gradient(to right, ${colors.primary[600]}, ${colors.primary[700]})`,
                                boxShadow: `0 10px 15px -3px ${colors.primary[500]}4D`
                            }}
                        >
                            {submitting ? 'Submitting Application...' : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Application History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">My Applications History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Purpose</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Witness</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {myLoans.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No loan applications found.
                                    </td>
                                </tr>
                            ) : (
                                myLoans.map((loan) => (
                                    <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(loan.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {loan.purpose}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-900 dark:text-white">
                                            {Number(loan.amount).toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {loan.loan_duration} Months
                                        </td>
                                        <td className="px-6 py-4">
                                            {loan.witness?.full_name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                                                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                                            </span>
                                            {loan.rejection_reason && loan.status === 'rejected' && (
                                                <p className="text-xs text-red-500 mt-1 max-w-xs truncate" title={loan.rejection_reason}>
                                                    {loan.rejection_reason}
                                                </p>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</span>
            <span className="font-semibold text-gray-900 dark:text-white text-sm text-right">{value || 'N/A'}</span>
        </div>
    );
}
