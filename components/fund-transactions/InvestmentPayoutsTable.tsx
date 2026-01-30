'use client';

import React from 'react';
import { Search, WalletMinimal, CheckCircle2, ShieldCheck, Clock, ArrowUpRight, DollarSign } from 'lucide-react';

interface InvestmentPayout {
    id: number;
    investment_id: number;
    payout_type: 'MONTHLY_INTEREST' | 'MATURITY' | 'EARLY_BREAK';
    principal_amount: number;
    interest_amount: number;
    penalty_amount: number;
    total_payout: number;
    status: 'PENDING' | 'APPROVED' | 'PAID';
    investment?: {
        transaction_id: string;
        customer?: {
            full_name: string;
        };
        product?: {
            name: string;
        };
    };
    created_at: string;
}

interface Props {
    records: InvestmentPayout[];
    onDisburse: (record: any) => void;
    onSettle: (id: number) => void;
}

export function InvestmentPayoutsTable({ records, onDisburse, onSettle }: Props) {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredRecords = records.filter(p =>
        p.investment?.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.investment?.customer?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'APPROVED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'PAID': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-1 min-w-[300px] items-center gap-3 bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Transaction ID or Customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm dark:text-gray-200"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Payout Info</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Customer</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Yield Breakdown</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Total Payout</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                                        No investment payouts pending action
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <p className="font-mono text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit mb-1">
                                                    {record.investment?.transaction_id}
                                                </p>
                                                <span className="text-[10px] font-black text-gray-900 flex items-center gap-1 uppercase">
                                                    <DollarSign className="w-3 h-3" />
                                                    {record.payout_type.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-black text-gray-900 dark:text-gray-100 text-sm">
                                            {record.investment?.customer?.full_name}
                                            <p className="text-[10px] font-medium text-gray-400 uppercase">{record.investment?.product?.name}</p>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex flex-col items-end text-[10px] font-bold">
                                                <span className="text-gray-500">Principal: LKR {Number(record.principal_amount).toLocaleString()}</span>
                                                <span className="text-emerald-600">Interest: + LKR {Number(record.interest_amount).toLocaleString()}</span>
                                                {Number(record.penalty_amount) > 0 && (
                                                    <span className="text-red-600">Penalty: - LKR {Number(record.penalty_amount).toLocaleString()}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-gray-900 dark:text-gray-100">
                                            LKR {Number(record.total_payout).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-widest ${getStatusStyle(record.status)}`}>
                                                {record.status}
                                            </span>
                                            <p className="text-[8px] text-gray-400 mt-1 font-bold">{new Date(record.created_at).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                {record.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => onDisburse(record)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                                                    >
                                                        <WalletMinimal className="w-4 h-4" />
                                                        Disburse
                                                    </button>
                                                )}
                                                {record.status === 'APPROVED' && (
                                                    <button
                                                        onClick={() => onDisburse(record)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                                                    >
                                                        <WalletMinimal className="w-4 h-4" />
                                                        Disburse
                                                    </button>
                                                )}
                                                {record.status === 'PAID' && (
                                                    <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Settled
                                                    </div>
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
        </div>
    );
}
