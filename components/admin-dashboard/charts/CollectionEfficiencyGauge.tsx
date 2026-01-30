'use client'

import React from 'react';
import { Info, TrendingUp } from 'lucide-react';
import { BranchCollectionEfficiency, Branch } from '@/types/admin-dashboard.types';
import { colors } from '@/themes/colors';

interface CollectionEfficiencyGaugeProps {
    efficiency: BranchCollectionEfficiency | null;
    branches: Branch[];
    selectedBranch: number | null;
    onBranchChange: (branchId: number) => void;
}

export default function CollectionEfficiencyGauge({
    efficiency,
    branches,
    selectedBranch,
    onBranchChange
}: CollectionEfficiencyGaugeProps) {
    const percentage = efficiency?.efficiency_percentage || 0;
    const status = efficiency?.status || 'Good';

    const getStatusTheme = (status: string) => {
        switch (status) {
            case 'Critical':
                return {
                    primary: colors.danger[500],
                    gradient: 'from-red-500 to-red-600',
                    bg: 'bg-red-50 dark:bg-red-900/10',
                    border: 'border-red-100 dark:border-red-900/20'
                };
            case 'Good':
                return {
                    primary: colors.warning[500],
                    gradient: 'from-yellow-400 to-yellow-600',
                    bg: 'bg-yellow-50 dark:bg-yellow-900/10',
                    border: 'border-yellow-100 dark:border-yellow-900/20'
                };
            case 'Excellent':
                return {
                    primary: colors.success[500],
                    gradient: 'from-green-500 to-green-600',
                    bg: 'bg-green-50 dark:bg-green-900/10',
                    border: 'border-green-100 dark:border-green-900/20'
                };
            default:
                return {
                    primary: colors.gray[500],
                    gradient: 'from-gray-400 to-gray-600',
                    bg: 'bg-gray-50 dark:bg-gray-800',
                    border: 'border-gray-100 dark:border-gray-700'
                };
        }
    };

    const theme = getStatusTheme(status);
    const needleRotation = (Math.min(percentage, 100) / 100) * 180 - 90;

    return (
        <div className="w-full">
            {/* Header with Branch Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Collection Efficiency
                        </h3>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">
                            Real-time Performance Monitoring
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="pl-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Viewing Branch</span>
                    <select
                        value={selectedBranch || ''}
                        onChange={(e) => onBranchChange(Number(e.target.value))}
                        className="px-4 py-2 text-sm font-bold border-none rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    >
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                                {branch.branch_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 2xl:grid-cols-12 gap-12 items-center">
                {/* Visual Gauge Section */}
                <div className="lg:col-span-12 2xl:col-span-7 flex flex-col items-center justify-center relative bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/20 rounded-3xl py-8">
                    <div className="relative w-full max-w-[340px] aspect-[1.6/1]">
                        <svg viewBox="0 0 200 120" className="w-full h-full">
                            <defs>
                                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor={colors.danger[500]} />
                                    <stop offset="50%" stopColor={colors.warning[500]} />
                                    <stop offset="100%" stopColor={colors.success[500]} />
                                </linearGradient>
                                <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>

                            {/* Base Track */}
                            <path
                                d="M 20 100 A 80 80 0 0 1 180 100"
                                fill="none"
                                stroke="currentColor"
                                className="text-gray-200 dark:text-gray-800"
                                strokeWidth="14"
                                strokeLinecap="round"
                            />

                            {/* Color Legend Path (Faint) */}
                            <path
                                d="M 20 100 A 80 80 0 0 1 180 100"
                                fill="none"
                                stroke="url(#gaugeGradient)"
                                strokeWidth="14"
                                strokeLinecap="round"
                                opacity="0.15"
                            />

                            {/* Dynamic Progress Path */}
                            <path
                                d="M 20 100 A 80 80 0 0 1 180 100"
                                fill="none"
                                stroke="url(#gaugeGradient)"
                                strokeWidth="14"
                                strokeLinecap="round"
                                strokeDasharray={`${(percentage / 100) * 251}, 251`}
                                className="transition-all duration-1000 ease-in-out"
                            />

                            {/* Needle Assembly */}
                            <g transform={`rotate(${needleRotation} 100 100)`} className="transition-transform duration-1000 ease-in-out">
                                <circle cx="100" cy="100" r="10" fill="currentColor" className="text-gray-900 dark:text-gray-100" />
                                <line
                                    x1="100"
                                    y1="100"
                                    x2="100"
                                    y2="30"
                                    stroke="currentColor"
                                    className="text-gray-900 dark:text-gray-100"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    filter="url(#needleGlow)"
                                />
                                <circle cx="100" cy="100" r="4" fill={theme.primary} />
                            </g>

                            {/* Scale Markers */}
                            <text x="12" y="115" className="text-[7px] font-black fill-gray-400">BEGIN</text>
                            <text x="175" y="115" className="text-[7px] font-black fill-gray-400">TARGET</text>
                        </svg>

                        {/* Centered Stats - Moved lower to avoid radial overlap */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex flex-col items-center">
                            <div className={`px-6 py-2 rounded-2xl ${theme.bg} ${theme.border} border shadow-xl flex flex-col items-center`}>
                                <span className={`text-4xl font-black italic tracking-tighter`} style={{ color: theme.primary }}>
                                    {percentage.toFixed(0)}%
                                </span>
                                <div className="h-px w-8 bg-gray-200 dark:bg-gray-700 my-1"></div>
                                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em]">
                                    {status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytical Data Section */}
                <div className="lg:col-span-12 2xl:col-span-5 space-y-6">
                    {/* Insights Box */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-start gap-4 mb-6">
                            <div className={`p-3 rounded-2xl ${theme.bg}`}>
                                <Info className="w-5 h-5" style={{ color: theme.primary }} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Manager's Insight</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed font-medium">
                                    {efficiency?.message || "Data processing in progress for the selected branch performance metrics."}
                                </p>
                            </div>
                        </div>

                        {/* Numbers Breakdown */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Monthly Target</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-[10px] font-bold text-gray-400">LKR</span>
                                    <span className="text-base font-black text-gray-900 dark:text-white">
                                        {(efficiency?.monthly_target || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20">
                                <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-1.5">Total Collected</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-[10px] font-bold text-emerald-500">LKR</span>
                                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                                        {(efficiency?.total_collection || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Threshold Legend */}
                    <div className="flex flex-col gap-2.5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Performance Benchmarks</p>
                        <div className="flex flex-wrap gap-2">
                            {['Critical', 'Good', 'Excellent'].map((lvl) => {
                                const t = getStatusTheme(lvl);
                                const isCurrent = status === lvl;
                                return (
                                    <div
                                        key={lvl}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-500 ${isCurrent ? `${t.bg} ${t.border} shadow-lg scale-105 z-10` : 'border-transparent bg-gray-50 dark:bg-gray-900/40 opacity-50 grayscale hover:grayscale-0 hover:opacity-100'
                                            }`}
                                    >
                                        <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]" style={{ backgroundColor: t.primary }} />
                                        <span className="text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-tight">{lvl}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
