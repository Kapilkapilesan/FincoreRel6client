'use client'

import { TrendingUp, DollarSign, Clock, Wallet } from 'lucide-react';
import { DashboardStats } from '@/types/dashboard.types';
import { colors } from '@/themes/colors';

interface DashboardStatsCardsProps {
    stats: DashboardStats;
    isManager?: boolean;
    selectedMonth?: number;
    selectedYear?: number;
}

export default function DashboardStatsCards({ stats, isManager, selectedMonth, selectedYear }: DashboardStatsCardsProps) {
    const isAllMonth = selectedMonth === 0;
    const isAllYear = selectedYear === 0;

    const prefix = (isAllMonth && isAllYear) ? 'Total' : (isAllMonth ? 'Yearly' : (isAllYear ? 'Combined' : 'Monthly'));

    const cards = [
        {
            label: isManager ? `${prefix} Active Loans` : `Active Loans (${prefix})`,
            value: stats.activeLoansCount.toLocaleString(),
            icon: TrendingUp,
            color: colors.primary,
            iconBg: colors.primary[50],
            iconColor: colors.primary[600],
        },
        {
            label: isManager ? `${prefix} Approve Amounts` : `${prefix} Disbursements`,
            value: `$${(stats.totalDisbursementsAmount / 1000000).toFixed(2)}M`,
            icon: DollarSign,
            color: colors.success,
            iconBg: colors.success[50],
            iconColor: colors.success[600],
        },
        {
            label: isManager ? `${prefix} Pending Approvals` : `Pending Approvals (${prefix})`,
            value: stats.pendingApprovalsCount.toLocaleString(),
            icon: Clock,
            color: colors.warning,
            iconBg: colors.warning[50],
            iconColor: colors.warning[600],
        },
        {
            label: isManager ? `${prefix} Collection Amount` : `${prefix} Collection`,
            value: `$${(stats.todayCollectionAmount / 1000).toFixed(1)}K`,
            icon: Wallet,
            color: colors.indigo,
            iconBg: colors.indigo[50] || `${colors.indigo[500]}1A`,
            iconColor: colors.indigo[600] || colors.indigo[500],
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className="p-3 rounded-lg"
                                style={{ backgroundColor: card.iconBg }}
                            >
                                <Icon
                                    className="w-6 h-6"
                                    style={{ color: card.iconColor }}
                                />
                            </div>
                            <div
                                className="h-2 w-2 rounded-full animate-pulse"
                                style={{
                                    backgroundColor: (card.color as any)[500] || card.color
                                }}
                            ></div>
                        </div>

                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            {card.label}
                        </h3>

                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {card.value}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
