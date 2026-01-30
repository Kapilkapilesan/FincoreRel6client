'use client';

import React, { useState } from 'react';
import { TrendingUp, User, X, Calendar, Download, RefreshCcw, AlertTriangle, ArrowRight, Calculator, DollarSign, Clock, Info } from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { toast } from 'react-toastify';
import { Investment } from '../../types/investment.types';

import { ActionConfirmModal } from '../collections/ActionConfirmModal'; // Assuming ActionConfirmModal is preferred or checking imports
import { colors } from '@/themes/colors';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    investment: Investment | null;
}

export function InvestmentDetailModal({ isOpen, onClose, investment }: Props) {
    if (!isOpen || !investment) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'CLOSED': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'MATURED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'RENEWED': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const [isPreviewing, setIsPreviewing] = React.useState(false);
    const [returnPreview, setReturnPreview] = React.useState<any>(null);
    const [isLoadingPreview, setIsLoadingPreview] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showRenewConfirm, setShowRenewConfirm] = useState(false);
    const [showReturnConfirm, setShowReturnConfirm] = useState(false);

    const handlePreviewReturn = async () => {
        setIsLoadingPreview(true);
        setIsPreviewing(true);
        try {
            const data = await import('../../services/investment.service').then(m => m.investmentService.previewReturn(investment.id));
            setReturnPreview(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to calculate return preview');
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleConfirmReturn = async () => {
        setIsSubmitting(true);
        try {
            await import('../../services/investment.service').then(m =>
                m.investmentService.initiatePayout(investment.id, returnPreview.status === 'MATURITY' ? 'MATURITY' : 'EARLY_BREAK')
            );
            toast.success('Return request initiated successfully! It now requires approval.');
            onClose();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
            setShowReturnConfirm(false); // Close confirm dialog
        }
    };

    const handleRenew = async () => {
        setIsSubmitting(true);
        try {
            await import('../../services/investment.service').then(m => m.investmentService.renewInvestment(investment.id));
            toast.success('Investment renewed successfully!');
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Renewal failed');
        } finally {
            setIsSubmitting(false);
            setShowRenewConfirm(false); // Close confirm dialog
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 overflow-y-auto">
            <div className={`bg-white rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20 w-full ${isPreviewing ? 'max-w-2xl' : 'max-w-5xl'
                } my-auto`}>
                {isPreviewing ? (
                    /* Preview Return View */
                    <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <Calculator className="w-6 h-6 text-red-600" />
                                Return Settlement Preview
                            </h2>
                            <button onClick={() => setIsPreviewing(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {isLoadingPreview ? (
                            <div className="py-12 text-center">
                                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="font-bold text-gray-500">Calculating yields from snapshot...</p>
                            </div>
                        ) : returnPreview && (
                            <div className="space-y-6">
                                <div className={`p-6 rounded-2xl border flex flex-col items-center ${returnPreview.is_early_break
                                    ? 'bg-red-50 border-red-100'
                                    : 'bg-emerald-50 border-emerald-100'
                                    }`}>
                                    <p className={`text-xs font-black uppercase tracking-widest mb-1 ${returnPreview.is_early_break ? 'text-red-400' : 'text-emerald-400'
                                        }`}>Total Payout Amount</p>
                                    <div className="flex items-end gap-2">
                                        <span className={`text-sm font-bold mb-1 ${returnPreview.is_early_break ? 'text-red-300' : 'text-emerald-300'
                                            }`}>LKR</span>
                                        <span className={`text-4xl font-black ${returnPreview.is_early_break ? 'text-red-600' : 'text-emerald-600'
                                            }`}>
                                            {Number(returnPreview.total_payout).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <span className={`mt-2 px-3 py-1 text-white text-[10px] font-black rounded-full uppercase ${returnPreview.is_early_break ? 'bg-red-600' : 'bg-emerald-600'
                                        }`}>
                                        {returnPreview.badge}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Principal Invested</p>
                                        <p className="text-base font-black text-gray-900">LKR {Number(returnPreview.principal).toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase truncate mr-2">Interest Payable Today</p>
                                            <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-1.5 rounded">{returnPreview.interest_rate_used}%</span>
                                        </div>
                                        <p className={`text-base font-black ${returnPreview.interest_payable_today > 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                                            LKR {Number(returnPreview.interest_payable_today || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>

                                    {/* CLAWBACK BREAKDOWN - Only for Monthly Early Break */}
                                    {returnPreview.payout_type === 'MONTHLY' && returnPreview.is_early_break && (
                                        <div className="p-4 bg-red-50 rounded-xl border border-red-200 col-span-1 md:col-span-2">
                                            <div className="flex justify-between items-center mb-3">
                                                <p className="text-[10px] font-black text-red-600 uppercase">Clawback Calculation</p>
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-100 rounded text-[9px] font-bold text-red-700 uppercase">
                                                    <AlertTriangle className="w-3 h-3" /> Penalty Applied
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[11px] font-medium text-gray-600">
                                                    <span>Interest Already Paid (at {returnPreview.normal_rate}% normal rate)</span>
                                                    <span>LKR {Number(returnPreview.interest_already_paid).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between text-[11px] font-medium text-emerald-600">
                                                    <span>Allowed Interest (at {returnPreview.break_rate}% break rate)</span>
                                                    <span>- LKR {Number(returnPreview.allowed_interest).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="pt-2 border-t border-red-200 flex justify-between text-sm font-black text-red-700 uppercase">
                                                    <span>Overpaid Interest (Penalty)</span>
                                                    <span>LKR {Number(returnPreview.overpaid_interest).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-red-200 space-y-1">
                                                <div className="flex justify-between text-xs font-bold text-gray-600">
                                                    <span>Principal</span>
                                                    <span>LKR {Number(returnPreview.principal).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-xs font-bold text-red-600">
                                                    <span>Less: Penalty Recovered</span>
                                                    <span>- LKR {Number(returnPreview.overpaid_interest).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between text-sm font-black text-gray-900 pt-1 border-t border-red-200">
                                                    <span>Capital Returned</span>
                                                    <span>LKR {Number(returnPreview.capital_returned).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>


                                {returnPreview.notice && (
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                        <p className="text-[11px] text-amber-800 font-bold leading-relaxed uppercase tracking-tight">
                                            {returnPreview.notice}
                                        </p>
                                    </div>
                                )}

                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                                    <Info className="w-5 h-5 text-blue-600 shrink-0" />
                                    <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
                                        <strong>Bank Correctness Notice:</strong> This calculation uses the immutable snapshot created at the time of investment.
                                        Total term stayed: <b>{returnPreview.stayed_months} Months</b>.
                                    </p>
                                </div>

                                <div className="flex gap-4 pt-4 text-center">
                                    <button onClick={() => setIsPreviewing(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all">
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setShowReturnConfirm(true)}
                                        disabled={isSubmitting}
                                        className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? 'Processing...' : 'Request Payout'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Main Detail View */
                    <>
                        {/* Header Section - Matched to Dashboard Vibrant Blue (Light) / Sleek Neutral (Dark) */}
                        <div
                            className="dark:bg-[#111827] dark:bg-none p-8 text-white relative"
                            style={{
                                background: `linear-gradient(to bottom right, ${colors.indigo[600]}, ${colors.primary[400]}, ${colors.primary[600]})`
                            }}
                        >
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 p-8 opacity-10 dark:opacity-5 pointer-events-none select-none">
                                <TrendingUp className="w-32 h-32" />
                            </div>

                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 text-white dark:text-gray-300">
                                            {investment.snapshot_product_code}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/40 dark:border-emerald-500/50 bg-white/10 dark:bg-emerald-500/10 text-white dark:text-emerald-400">
                                            {investment.status}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tight">{investment.snapshot_product_name}</h2>
                                    <p className="text-blue-100 dark:text-gray-400 flex items-center gap-2 font-medium">
                                        <User className="w-4 h-4" />
                                        {investment.customer?.full_name} • {investment.customer?.customer_code}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="relative z-[110] p-2.5 bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl transition-all group shrink-0 shadow-lg active:scale-95 text-white dark:text-gray-400"
                                    title="Close"
                                >
                                    <X className="w-5 h-5 transition-all group-hover:rotate-90 group-hover:text-white" />
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
                                <div className="bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 p-5 rounded-2xl min-w-[240px] shadow-2xl">
                                    <p className="text-[10px] text-blue-100 dark:text-gray-400 font-black uppercase tracking-widest mb-1">Principal Invested</p>
                                    <div className="flex items-end gap-2 text-white">
                                        <span className="text-sm font-bold opacity-80 dark:text-gray-500 mb-1">LKR</span>
                                        <span className="text-3xl font-black">{Number(investment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Parameters & Timeline */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Policy Term
                                        </p>
                                        <p className="text-lg font-black text-gray-900">{investment.snapshot_policy_term} <span className="text-xs font-bold text-gray-400">Months</span></p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" /> Payout Type
                                        </p>
                                        <p className="text-lg font-black text-gray-900 capitalize">{investment.snapshot_payout_type.toLowerCase()}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Active Rate</p>
                                        <p className="text-xl font-black text-gray-900">
                                            {investment.snapshot_payout_type === 'MONTHLY' ? investment.snapshot_interest_rate_monthly : investment.snapshot_interest_rate_maturity}%
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Neg. Rate</p>
                                        <p className="text-xl font-black text-gray-900">+{investment.snapshot_negotiation_rate}%</p>
                                    </div>
                                </div>

                                {/* Yield Calculation Engine Preview */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                                    <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            Yield Calculation Engine (Immutable Snapshot)
                                        </h3>
                                        <div className="text-[10px] font-black bg-blue-600 dark:bg-blue-500 text-white px-2 py-1 rounded">LIVE RULES</div>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-1">Interest Parameters</p>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center text-sm font-bold">
                                                        <span className="text-gray-500">Normal Rate (Monthly Payout)</span>
                                                        <span className="text-gray-900">{investment.snapshot_interest_rate_monthly}%</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm font-bold">
                                                        <span className="text-gray-500">Normal Rate (Maturity Payout)</span>
                                                        <span className="text-gray-900">{investment.snapshot_interest_rate_maturity}%</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm font-bold text-purple-600">
                                                        <span>Negotiation Surcharge</span>
                                                        <span>+{investment.snapshot_negotiation_rate}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-xs font-black text-red-400 uppercase tracking-widest border-b pb-1">Early Break Penalty Rules</p>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center text-sm font-bold">
                                                        <span className="text-gray-500 text-xs">If Early Breakdown (Monthly)</span>
                                                        <span className="text-red-500">{investment.snapshot_early_break_rate_monthly}%</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm font-bold">
                                                        <span className="text-gray-500 text-xs">If Early Breakdown (Maturity)</span>
                                                        <span className="text-red-500">{investment.snapshot_early_break_rate_maturity}%</span>
                                                    </div>
                                                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                                                        <p className="text-[10px] text-amber-700 leading-tight">
                                                            <strong>Bank Rule:</strong> Early breakdown results in a principal clawback if monthly interest was already paid at the higher rate.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Nominees */}
                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-blue-600 dark:text-gray-400" />
                                        Nominee Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {investment.nominees?.map((n, i) => (
                                            <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <p className="font-bold text-gray-900">{n.name}</p>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-xs text-gray-500">NIC: {n.nic}</span>
                                                    <span className="text-xs text-blue-600 font-bold">{n.relationship}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Timeline & Audit */}
                            <div className="space-y-8">
                                <div
                                    className="dark:from-[#111827] dark:to-[#1f2937] rounded-3xl p-6 text-white space-y-6 shadow-xl"
                                    style={{
                                        background: `linear-gradient(to bottom right, ${colors.indigo[950]}, ${colors.indigo[900]})`
                                    }}
                                >
                                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-300 dark:text-gray-400 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Timeline
                                    </h3>

                                    <div className="space-y-6 relative">
                                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-blue-900/50"></div>

                                        <div className="relative pl-8">
                                            <div className="absolute left-0 top-1 w-6 h-6 bg-blue-600 rounded-full border-4 border-gray-900 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                            </div>
                                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Start Date</p>
                                            <p className="text-sm font-black">{new Date(investment.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                        </div>

                                        <div className="relative pl-8">
                                            <div className="absolute left-0 top-1 w-6 h-6 bg-gray-700 rounded-full border-4 border-gray-900 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-white rounded-full opacity-20"></div>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Current Progress</p>
                                            <div className="mt-1 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="bg-blue-600 h-full transition-all duration-1000"
                                                    style={{
                                                        width: `${Math.min(100, Math.max(0,
                                                            ((new Date().getTime() - new Date(investment.start_date).getTime()) /
                                                                (new Date(investment.maturity_date).getTime() - new Date(investment.start_date).getTime())) * 100
                                                        ))}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="relative pl-8">
                                            <div className="absolute left-0 top-1 w-6 h-6 bg-indigo-500 dark:bg-gray-700 rounded-full border-4 border-[#1e1b4b] dark:border-[#111827] flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-white rounded-full opacity-30"></div>
                                            </div>
                                            <p className="text-[10px] font-bold text-indigo-300 dark:text-gray-500 uppercase tracking-tighter">Maturity Date</p>
                                            <p className="text-sm font-black">{new Date(investment.maturity_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Audit Info</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs font-bold bg-gray-50 p-2 rounded-lg">
                                            <span className="text-gray-500">TX ID</span>
                                            <span className="text-gray-900 font-mono">{investment.transaction_id}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold bg-gray-50 p-2 rounded-lg">
                                            <span className="text-gray-500">Created At</span>
                                            <span className="text-gray-900">{new Date(investment.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full py-3 bg-blue-50 text-blue-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-all active:scale-95 text-sm">
                                    <Download className="w-4 h-4" /> Download Investment Cert.
                                </button>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={onClose} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm shadow-sm">
                                Close Detail
                            </button>
                            {(investment.status === 'ACTIVE' || investment.status === 'MATURED') && (
                                <button
                                    onClick={() => setShowRenewConfirm(true)}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 text-sm"
                                >
                                    <RefreshCcw className="w-4 h-4" /> Renew Investment
                                </button>
                            )}
                            {investment.status === 'ACTIVE' && (
                                <button
                                    onClick={handlePreviewReturn}
                                    className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center gap-2 text-sm"
                                >
                                    <ArrowRight className="w-4 h-4 rotate-[-45deg]" /> Return Investment
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Confirmation Dialogs */}
            <ConfirmDialog
                isOpen={showRenewConfirm}
                title="Renew Investment"
                message="Are you sure you want to renew this investment? This will close the current account and create a new one using the LATEST product configuration."
                onConfirm={handleRenew}
                onCancel={() => setShowRenewConfirm(false)}
                variant="info"
                confirmText="Renew Now"
            />

            <ConfirmDialog
                isOpen={showReturnConfirm}
                title="Confirm Settlement"
                message="Are you sure you want to initiate this settlement? This will lock the calculated payout and send it for final approval."
                onConfirm={handleConfirmReturn}
                onCancel={() => setShowReturnConfirm(false)}
                variant="danger"
                confirmText="Settle Now"
            />
        </div>
    );
}
