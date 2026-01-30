'use client';

import React from 'react';
import { Building2, TrendingUp, TrendingDown, Users, UserCheck, Calendar } from 'lucide-react';
import { BranchCollection } from './types';

interface CollectionBranchTableProps {
    branchCollections: BranchCollection[];
    isLoading?: boolean;
    onViewDetails: (branchId: string, branchName: string) => void;
}

export function CollectionBranchTable({ branchCollections, isLoading, onViewDetails }: CollectionBranchTableProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
                </div>
                <div className="p-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded-lg mb-4 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const totals = branchCollections.reduce((acc, curr) => ({
        target: acc.target + curr.target,
        collected: acc.collected + curr.collected,
        variance: acc.variance + curr.variance,
        total_active_customers: acc.total_active_customers + curr.total_active_customers,
        due_customers: acc.due_customers + curr.due_customers,
        paid_customers: acc.paid_customers + curr.paid_customers,
    }), { target: 0, collected: 0, variance: 0, total_active_customers: 0, due_customers: 0, paid_customers: 0 });

    const totalAchievement = totals.target > 0
        ? ((totals.collected / totals.target) * 100).toFixed(1)
        : '0.0';

    const getStatusBadge = (achievement: number) => {
        if (achievement >= 100) {
            return { label: 'Exceeded', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
        } else if (achievement >= 80) {
            return { label: 'On Track', class: 'bg-blue-50 text-blue-700 border-blue-200' };
        } else if (achievement >= 50) {
            return { label: 'Fair', class: 'bg-amber-50 text-amber-700 border-amber-200' };
        } else if (achievement > 0) {
            return { label: 'Low', class: 'bg-rose-50 text-rose-700 border-rose-200' };
        }
        return { label: 'No Data', class: 'bg-gray-50 text-gray-500 border-gray-200' };
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-bold text-gray-900">Branch Performance</h2>
                </div>
                <p className="text-sm text-gray-500 mt-1">Breakdown of collection performance by branch</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Branch</th>
                            <th className="text-right px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Expectation</th>
                            <th className="text-right px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Collected</th>
                            <th className="text-right px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
                            <th className="text-center px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <div className="flex items-center justify-center gap-1">
                                    <Calendar className="w-3 h-3" /> Due
                                </div>
                            </th>
                            <th className="text-center px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <div className="flex items-center justify-center gap-1">
                                    <UserCheck className="w-3 h-3" /> Paid
                                </div>
                            </th>
                            <th className="text-center px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <div className="flex items-center justify-center gap-1">
                                    <Users className="w-3 h-3" /> Active
                                </div>
                            </th>
                            <th className="text-center px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Rate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {branchCollections.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                    No branch data available for this period.
                                </td>
                            </tr>
                        ) : (
                            <>
                                {branchCollections.map((branch, index) => {
                                    const isPositiveVariance = branch.variance >= 0;

                                    return (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                <button
                                                    onClick={() => onViewDetails(branch.branchId, branch.branch)}
                                                    className="text-blue-600 hover:text-blue-800 font-bold hover:underline transition-all flex items-center gap-2 group text-left"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    {branch.branch}
                                                </button>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-right text-gray-700 font-mono font-bold">
                                                {branch.target.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-right font-bold text-green-600 font-mono">
                                                {branch.collected.toLocaleString()}
                                            </td>
                                            <td className={`px-4 py-4 text-sm text-right font-bold font-mono ${isPositiveVariance ? 'text-emerald-600' : 'text-red-700'}`}>
                                                <span className="inline-flex items-center gap-1">
                                                    {isPositiveVariance ? '+' : ''}{branch.variance.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-center text-orange-600 font-bold font-mono">
                                                {branch.due_customers}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-center text-teal-600 font-bold font-mono">
                                                {branch.paid_customers}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-center text-gray-600 font-mono">
                                                {branch.total_active_customers}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold border ${branch.achievement >= 100 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                    {branch.achievement}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr className="bg-gray-50 font-bold border-t-2 border-gray-300">
                                    <td className="px-6 py-4 text-sm text-gray-900">Total</td>
                                    <td className="px-4 py-4 text-sm text-right text-gray-900 font-mono font-bold">
                                        {totals.target.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-right text-green-700 font-mono font-bold">
                                        {totals.collected.toLocaleString()}
                                    </td>
                                    <td className={`px-4 py-4 text-sm text-right font-bold font-mono ${totals.variance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                        {totals.variance >= 0 ? '+' : ''}{totals.variance.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-center text-orange-700 font-mono font-bold">
                                        {totals.due_customers}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-center text-teal-700 font-mono font-bold">
                                        {totals.paid_customers}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-center text-gray-900 font-mono font-bold">
                                        {totals.total_active_customers}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold border ${parseFloat(totalAchievement) >= 100 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                            {totalAchievement}%
                                        </span>
                                    </td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
