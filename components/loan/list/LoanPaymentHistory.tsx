'use client';

import React, { useEffect, useState } from 'react';
import { collectionService } from '@/services/collection.service';
import { PaymentHistoryItem } from '@/services/collection.types';
import { authService } from '@/services/auth.service';
import { toast } from 'react-toastify';
import { Printer, RotateCcw, CheckCircle2, Trash2, AlertCircle, Clock, FileText } from 'lucide-react';
import { ReceiptPreviewModal } from '@/components/collections/ReceiptPreviewModal';
import { ScheduledPayment } from '@/services/collection.types';

interface Props {
    loanId: string;
}

export function LoanPaymentHistory({ loanId }: Props) {
    const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [requestingCancelId, setRequestingCancelId] = useState<number | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showReceiptPreview, setShowReceiptPreview] = useState(false);
    const [previewData, setPreviewData] = useState<{ customer: ScheduledPayment; receiptData: any } | null>(null);

    const isManager = authService.hasRole('manager') || authService.hasRole('admin');

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await collectionService.getPaymentHistory(loanId);
            // Filter to show only unique receipts (Ledger might have multiple entries for one receipt, but we want the high-level history)
            const receiptHistory = data.filter(item => item.receipt);
            setHistory(receiptHistory);
        } catch (error: any) {
            toast.error(error.message || 'Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [loanId]);

    const handleRequestCancellation = async (receiptId: number) => {
        if (!cancelReason.trim()) {
            toast.warn("Please provide a reason for cancellation");
            return;
        }

        setIsProcessing(true);
        try {
            await collectionService.requestReceiptCancellation(receiptId, cancelReason);
            toast.success('Cancellation request sent to manager');
            setCancelReason('');
            setRequestingCancelId(null);
            fetchHistory();
        } catch (error: any) {
            toast.error(error.message || 'Failed to request cancellation');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleApproveCancel = async (receiptId: number) => {
        if (!window.confirm('Are you sure you want to approve this cancellation? This will revert the loan balance and schedule.')) return;

        try {
            setIsProcessing(true);
            await collectionService.approveReceiptCancellation(receiptId);
            toast.success('Payment successfully cancelled and balance reverted');
            fetchHistory();
        } catch (error: any) {
            toast.error(error.message || 'Failed to approve cancellation');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleViewReceipt = (item: any) => {
        const scheduledPayment: ScheduledPayment = {
            id: loanId,
            customer: item.customer?.full_name || item.receipt?.customer?.full_name || 'N/A',
            customerId: item.customer?.id || item.receipt?.customer?.id,
            customerCode: item.customer?.customer_code || item.receipt?.customer?.customer_code || 'N/A',
            contractNo: item.receipt?.loan?.loan_id || 'N/A',
            dueAmount: 0,
            standardRental: item.rental_amount || 0,
            arrears: item.arrears || 0,
            suspense_balance: 0,
            group: item.receipt?.group?.group_name || 'N/A',
            center_name: item.receipt?.center?.center_name || 'N/A',
            outstanding: item.current_balance_amount || 0,
            rentel: item.rental_amount || 0,
            address: 'N/A',
            nic: item.customer?.customer_code || item.receipt?.customer?.customer_code || 'N/A',
            center_id: item.receipt?.center?.CSU_id || item.receipt?.center_id || 'N/A',
        };

        const receiptData = {
            payment: item,
            receipt: item.receipt,
            loan: item.receipt?.loan
        };

        setPreviewData({
            customer: scheduledPayment,
            receiptData: receiptData
        });
        setShowReceiptPreview(true);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Securing Ledger Data...</p>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                <p className="text-sm font-bold text-gray-400">No payment records found for this portfolio.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-6">
                {history.map((item) => (
                    <div
                        key={item.id}
                        className={`relative bg-white rounded-2xl border transition-all duration-300 ${item.receipt?.status === 'cancelled'
                            ? 'border-gray-200 opacity-75 grayscale-[0.3]'
                            : 'border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200'
                            }`}
                    >
                        {/* Header Section */}
                        <div className="p-5 border-b border-gray-50">
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${item.receipt?.status === 'cancelled' ? 'bg-gray-100 text-gray-400' :
                                        item.receipt?.status === 'cancellation_pending' ? 'bg-amber-50 text-amber-600' :
                                            'bg-emerald-50 text-emerald-600'
                                        }`}>
                                        <RotateCcw className={item.receipt?.status === 'cancellation_pending' ? 'animate-spin-slow' : ''} size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="text-2xl font-black text-gray-900 tracking-tighter">
                                                LKR {Number(item.last_payment_amount).toLocaleString()}
                                            </span>

                                            {item.receipt?.status === 'cancellation_pending' && (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-amber-100">
                                                    <Clock size={12} />
                                                    Cancellation Pending
                                                </div>
                                            )}

                                            {item.receipt?.status === 'cancelled' && (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-red-100">
                                                    <Trash2 size={12} />
                                                    Reversed / Void
                                                </div>
                                            )}

                                            {item.receipt?.status === 'active' && (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-emerald-100">
                                                    <CheckCircle2 size={12} />
                                                    Confirmed
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">
                                            <span>{new Date(item.last_payment_date).toLocaleDateString()}</span>
                                            <span className="text-gray-200">•</span>
                                            <span className="text-blue-600 font-black">{item.receipt?.receipt_id}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    {item.receipt?.status === 'active' && (
                                        <>
                                            <button
                                                onClick={() => setRequestingCancelId(requestingCancelId === item.receipt?.id ? null : item.receipt?.id || null)}
                                                className="px-4 py-2 border border-gray-200 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                                            >
                                                Request Void
                                            </button>
                                            <button
                                                onClick={() => handleViewReceipt(item)}
                                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-blue-100 transition-all flex items-center gap-2"
                                            >
                                                <Printer size={12} />
                                                View Receipt
                                            </button>
                                        </>
                                    )}

                                    {item.receipt?.status === 'cancellation_pending' && isManager && (
                                        <button
                                            disabled={isProcessing}
                                            onClick={() => item.receipt && handleApproveCancel(item.receipt.id)}
                                            className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                                        >
                                            {isProcessing ? 'Processing...' : 'Approve Void'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Inline Cancellation Form */}
                            {requestingCancelId === item.receipt?.id && (
                                <div className="mt-6 p-5 bg-red-50/50 rounded-2xl border border-red-100 animate-in zoom-in-95 duration-200">
                                    <div className="flex items-center gap-2 text-red-600 mb-3">
                                        <AlertCircle size={16} />
                                        <span className="text-[11px] font-black uppercase tracking-wider">Reason for Cancellation</span>
                                    </div>
                                    <textarea
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        className="w-full h-20 p-4 bg-white border border-red-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                        placeholder="Explain why this receipt must be voided..."
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-3 mt-4">
                                        <button
                                            onClick={() => setRequestingCancelId(null)}
                                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            disabled={isProcessing || !cancelReason.trim()}
                                            onClick={() => item.receipt && handleRequestCancellation(item.receipt.id)}
                                            className="px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-30"
                                        >
                                            {isProcessing ? 'Processing' : 'Submit for Reversal'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Financial Breakdown (Style from Screen 2) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-50 bg-gray-50/20 py-4 px-2">
                            <div className="px-4 py-2">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-70 italic">Capital Collected</p>
                                <p className="text-sm font-bold text-gray-800">LKR {(Number(item.last_payment_amount) - Number(item.interest_amount)).toLocaleString()}</p>
                            </div>
                            <div className="px-4 py-2">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-70 italic">Interest Share</p>
                                <p className="text-sm font-bold text-gray-800">LKR {Number(item.interest_amount).toLocaleString()}</p>
                            </div>
                            <div className="px-4 py-2">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-70 italic">Loan Balance</p>
                                <p className="text-sm font-black text-blue-600">LKR {Number(item.current_balance_amount).toLocaleString()}</p>
                            </div>
                            <div className="px-4 py-2">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-70 italic">Arrears Impact</p>
                                <p className={`text-sm font-black ${item.arrears > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {item.arrears > 0 ? `LKR ${Number(item.arrears).toLocaleString()}` : (item.receipt?.status === 'cancelled' ? 'REVERTED' : 'CLEARED')}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                    <span className="font-bold">i</span>
                </div>
                <p className="text-[11px] font-bold text-blue-800 leading-relaxed">
                    Voiding a receipt will automatically restore the loan outstanding balance and revert the repayment schedule to its prior state. Both the customer and field officer will be notified via SMS.
                </p>
            </div>

            {/* Receipt Preview Modal */}
            {previewData && (
                <ReceiptPreviewModal
                    isOpen={showReceiptPreview}
                    customer={previewData.customer}
                    paymentAmount={previewData.receiptData.payment.last_payment_amount.toString()}
                    receiptData={previewData.receiptData}
                    onClose={() => setShowReceiptPreview(false)}
                    onPrint={() => window.print()}
                />
            )}
        </div>
    );
}
