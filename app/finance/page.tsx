'use client';

import React, { useEffect, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { financeService } from '@/services/finance.service';
import BMSLoader from '@/components/common/BMSLoader';
import { FinanceOverviewData } from '@/types/finance.types';
import { FinanceStats } from './FinanceStats';
import { FinanceBreakdown } from './FinanceBreakdown';
import { RecentTransactions } from './RecentTransactions';

export default function FinanceOverviewPage() {
    const [data, setData] = useState<FinanceOverviewData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const overviewData = await financeService.getOverview();
            setData(overviewData);
        } catch (error: any) {
            console.error('Failed to load finance data:', error);
            toast.error(error.message || 'Failed to load finance overview');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <BMSLoader message="Loading financial data..." size="large" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Finance Module</h1>
                    <p className="text-sm text-gray-500 mt-1">Track income, expenses, and financial performance</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium text-sm">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm">
                        <Plus className="w-4 h-4" />
                        New Entry
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <FinanceStats stats={data.stats} />

            {/* Charts Breakdown */}
            <FinanceBreakdown
                incomeBreakdown={data.incomeBreakdown}
                expenseBreakdown={data.expenseBreakdown}
            />

            {/* Recent Transactions */}
            <RecentTransactions transactions={data.recentTransactions} />
        </div>
    );
}
