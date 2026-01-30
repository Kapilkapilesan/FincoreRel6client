import React from 'react';
import { DollarSign, User } from 'lucide-react';

interface StaffLoanDisbursementTableProps {
    records: any[];
    onDisburse: (record: any) => void;
}

export function StaffLoanDisbursementTable({ records, onDisburse }: StaffLoanDisbursementTableProps) {
    if (!records || records.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Pending Staff Loan Disbursements</h3>
                <p className="text-sm text-gray-400 text-center max-w-sm mt-1">All approved staff loans have been processed.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700">
                            <th className="px-6 py-4">Staff Member</th>
                            <th className="px-6 py-4">Loan Details</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {records.map((record) => (
                            <tr key={record.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                                            {record.staff?.full_name?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{record.staff?.full_name}</p>
                                            <p className="text-xs font-semibold text-gray-400">{record.staff?.staff_id} • {record.staff?.branch?.branch_name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{record.purpose}</p>
                                    <p className="text-xs font-semibold text-gray-400">{record.loan_duration} Months</p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <p className="text-sm font-black text-gray-900 dark:text-white font-mono">
                                        {Number(record.amount).toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${record.status === 'disbursed'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}>
                                        {record.status === 'disbursed' ? 'Disbursed' : record.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {record.status === 'disbursed' ? (
                                        <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-900/50 outline outline-2 outline-blue-600/10 ml-auto w-fit">
                                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
                                            Disbursed
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => onDisburse(record)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-200 dark:shadow-none active:scale-95"
                                        >
                                            <DollarSign className="w-4 h-4" />
                                            Disburse
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
