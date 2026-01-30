'use client';

import React, { useState } from 'react';
import { BadgeDollarSign, User, Calendar, Tag, Clock, ArrowUpRight, Search } from 'lucide-react';
import { Investment } from '../../types/investment.types';
import { InvestmentDetailModal } from '../investment/InvestmentDetailModal';

interface Props {
    records: Investment[];
}

export function CustomerInvestmentsTable({ records }: Props) {
    const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const handleRowClick = (investment: Investment) => {
        setSelectedInvestment(investment);
        setIsDetailOpen(true);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'CLOSED': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'MATURED': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'RENEWED': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <BadgeDollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Customer Investment Accounts</h3>
                            <p className="text-xs text-gray-500 font-medium tracking-tight">Immutable snapshot rules applied to each active account</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100/50">
                            {records.length} Subscriptions
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Info</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Investor</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Snapshot Rules</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Balance</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timeline</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {records.length > 0 ? records.map((record) => (
                            <tr
                                key={record.id}
                                onClick={() => handleRowClick(record)}
                                className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-all group cursor-pointer"
                            >
                                <td className="px-8 py-6">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono text-[11px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                                                {record.transaction_id}
                                            </p>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${getStatusStyle(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                            <Tag className="w-3 h-3" />
                                            Cert: #INV-{String(record.id).padStart(4, '0')}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/10 border border-white/20">
                                            {record.customer?.full_name?.charAt(0) || 'C'}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 dark:text-gray-100 text-sm group-hover:text-blue-600 transition-colors">
                                                {record.customer?.full_name || 'N/A'}
                                            </p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">NIC: {record.customer?.customer_code}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-100">
                                                {record.snapshot_product_code}
                                            </span>
                                            <p className="text-sm font-black text-gray-800 dark:text-gray-200">{record.snapshot_product_name}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                                                <ArrowUpRight className="w-3 h-3" />
                                                {record.snapshot_payout_type === 'MONTHLY' ? record.snapshot_interest_rate_monthly : record.snapshot_interest_rate_maturity}%
                                                <span className="text-[8px] font-bold text-gray-400"> (+{record.snapshot_negotiation_rate}%)</span>
                                            </div>
                                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                                                <Clock className="w-3 h-3" />
                                                {record.snapshot_policy_term} M
                                            </div>
                                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500 uppercase tracking-tighter">
                                                {record.snapshot_payout_type}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex flex-col">
                                        <span className="text-base font-black text-gray-900 dark:text-gray-100 tracking-tight">
                                            LKR {Number(record.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Principal Invested</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 text-[11px] font-black">
                                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                            {record.start_date ? new Date(record.start_date).toLocaleDateString() : 'N/A'}
                                        </div>
                                        <p className="text-[9px] font-bold text-red-400 uppercase">
                                            Ends: {record.maturity_date ? new Date(record.maturity_date).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 text-gray-400">
                                        <BadgeDollarSign className="w-12 h-12 opacity-20" />
                                        <p className="font-bold text-sm">No investment records found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <InvestmentDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                investment={selectedInvestment}
            />
        </div>
    );
}
