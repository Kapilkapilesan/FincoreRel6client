'use client';

import React from 'react';
import { FileText, Download, BarChart3, Calendar } from 'lucide-react';
import { ReportStats } from '../../types/report.types';

interface ReportsStatsProps {
    stats: ReportStats | null;
    isLoading: boolean;
}

export function ReportsStats({ stats, isLoading }: ReportsStatsProps) {
    const statCards = [
        {
            label: 'Total Reports',
            value: stats?.total_reports ?? 0,
            icon: FileText,
            bgColor: 'bg-blue-500',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600'
        },
        {
            label: 'Downloads This Month',
            value: stats?.downloads_this_month ?? 0,
            icon: Download,
            bgColor: 'bg-emerald-500',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600'
        },
        {
            label: 'Scheduled Reports',
            value: stats?.scheduled_reports ?? 0,
            icon: BarChart3,
            bgColor: 'bg-purple-500',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600'
        },
        {
            label: 'Last Generated',
            value: stats?.last_generated ?? 'Never',
            icon: Calendar,
            bgColor: 'bg-rose-500',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
            isText: true
        }
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                            <div className="flex-1">
                                <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                                <Icon className={`w-6 h-6 ${card.iconColor}`} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                                <p className={`text-2xl font-bold text-gray-900 ${card.isText ? 'text-lg' : ''}`}>
                                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
