'use client';

import React from 'react';
import { Loan } from '@/types/loan.types';
import { authService } from '@/services/auth.service';
import { LoanPaymentHistory } from '@/components/loan/list/LoanPaymentHistory';

interface LoanDetailModalProps {
    loan: Loan;
    onClose: () => void;
}

export function LoanDetailModal({ loan, onClose }: LoanDetailModalProps) {
    const [activeTab, setActiveTab] = React.useState<'overview' | 'payments'>('overview');
    const isFieldOfficer = authService.hasRole('field_officer') || authService.hasRole('staff');

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'pending':
            case 'pending_1st':
            case 'pending_2nd':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'completed':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'defaulted':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'sent_back':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <div className="space-y-4">
            <h3 className="text-[11px] font-black text-gray-400 underline decoration-blue-500/30 underline-offset-4 uppercase tracking-[0.2em]">
                {title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {children}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 text-gray-900">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[90vh]">
                {/* Header */}
                <div className="p-8 pb-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 text-white text-xl font-black">
                                LN
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Loan Management Center</h2>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                            System ID: <span className="text-blue-600 font-black">{loan.contract_number || loan.loan_id}</span>
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(loan.status)}`}>
                                            {loan.status?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {loan.contract_number && (
                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">Ref: {loan.loan_id}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex items-center bg-gray-50 p-1.5 rounded-2xl border border-gray-100 self-start md:self-center">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'overview' ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/10' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('payments')}
                                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'payments' ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/10' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Payments
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="hidden md:flex w-12 h-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                        >
                            <span className="text-2xl font-light">&times;</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                    {activeTab === 'overview' && (
                        <div className="p-8 space-y-10">
                            {/* Sent Back Alert */}
                            {loan.status === 'sent_back' && loan.rejection_reason && (
                                <div className="bg-orange-50/50 border border-orange-200 rounded-2xl p-5 flex items-start gap-4">
                                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0 border border-orange-200">
                                        <span className="font-bold text-lg">!</span>
                                    </div>
                                    <div>
                                        <p className="font-black text-orange-900 text-xs uppercase tracking-wider">Adjustment Feedback</p>
                                        <p className="text-sm font-bold text-orange-800 mt-1 leading-relaxed italic">
                                            "{loan.rejection_reason}"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Section: Identity & Context */}
                            <Section title="Institutional Context">
                                <DetailItem label="Center" value={loan.center?.center_name || 'N/A'} />
                                <DetailItem label="Group" value={loan.group?.group_name || 'N/A'} />
                                <DetailItem label="Branch" value={loan.center?.branch?.branch_name || 'N/A'} />
                                <DetailItem label="Loan Product" value={loan.product?.product_name || 'N/A'} />
                                <DetailItem label="Field Officer" value={loan.staff?.full_name || loan.staff?.user_name || 'System Assigned'} />
                            </Section>

                            {/* Section: Customer Profile */}
                            <Section title="Borrower Profile">
                                <DetailItem label="Full Name" value={loan.customer?.full_name} />
                                <DetailItem label="Identity (NIC)" value={loan.customer?.customer_code} />
                                <DetailItem label="Current Outstanding" value={`Rs. ${Number(loan.outstanding_amount).toLocaleString()}`} highlight />
                            </Section>

                            {/* Section: Financials */}
                            <Section title="Financial Breakdown">
                                <DetailItem label="Requested Amount" value={`Rs. ${Number(loan.request_amount || 0).toLocaleString()}`} />
                                <DetailItem label="Approved Amount" value={`Rs. ${Number(loan.approved_amount).toLocaleString()}`} highlight={false} />
                                <DetailItem label="Interest Rate" value={`${Number(loan.interest_rate)}%`} />
                                <DetailItem label="Processing Fee" value={`Rs. ${Number(loan.service_charge || 0).toLocaleString()}`} />
                                <DetailItem label="Documentation Fee" value={`Rs. ${Number(loan.document_charge || 0).toLocaleString()}`} />
                                <DetailItem label="Expected Installment" value={loan.rentel ? `Rs. ${Number(loan.rentel).toLocaleString()}` : 'Not Calculated'} />
                            </Section>

                            {/* Section: Schedule */}
                            <Section title="Repayment Schedule">
                                <DetailItem label="Tenure" value={`${loan.terms} periods (${loan.product?.term_type || 'Monthly'})`} />
                                <DetailItem label="Agreement Date" value={loan.agreement_date || 'N/A'} />
                                <DetailItem label="Maturity Date" value={loan.end_term || 'N/A'} />
                            </Section>

                            {/* Section: Guarantees */}
                            <Section title="Securities & Guarantees">
                                <DetailItem label="Guarantor 01" value={loan.g1_details?.name || 'N/A'} subValue={loan.g1_details?.nic} />
                                <DetailItem label="Guarantor 02" value={loan.g2_details?.name || 'N/A'} subValue={loan.g2_details?.nic} />
                                <DetailItem label="Guardian" value={loan.guardian_name || 'N/A'} subValue={loan.guardian_nic} />
                                <DetailItem label="Witness 01" value={loan.w1_details?.name || 'N/A'} />
                                <DetailItem label="Witness 02" value={loan.w2_details?.name || 'N/A'} />
                            </Section>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="p-8">
                            <LoanPaymentHistory loanId={loan.id.toString()} />
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-4 sticky bottom-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hidden sm:block">
                        Updated at: {new Date(loan.created_at || Date.now()).toLocaleDateString()}
                    </p>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-8 py-3 rounded-2xl bg-white border border-gray-200 text-gray-600 font-black text-sm hover:bg-gray-50 transition-all active:scale-95"
                        >
                            Close View
                        </button>
                        {activeTab === 'overview' && isFieldOfficer && (loan.status === 'sent_back' || loan.status === 'pending_1st' || loan.status === 'pending_2nd') && (
                            <button
                                onClick={() => window.location.href = `/loans/edit?edit=${loan.id}`}
                                className="flex-1 sm:flex-none bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {loan.status === 'sent_back' ? 'Correct & Resubmit' : 'Update Application'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value, subValue, highlight }: { label: string; value: React.ReactNode; subValue?: string; highlight?: boolean }) {
    return (
        <div className="group">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 transition-colors group-hover:text-blue-500">
                {label}
            </p>
            <div className={`text-sm font-bold truncate ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>
                {value || '-'}
            </div>
            {subValue && <p className="text-[11px] text-gray-500 font-medium mt-0.5 tracking-tight">{subValue}</p>}
        </div>
    );
}
