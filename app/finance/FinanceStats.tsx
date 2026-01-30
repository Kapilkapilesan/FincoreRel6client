import React from 'react';
import { FinanceOverviewStats } from '@/types/finance.types';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface FinanceStatsProps {
    stats: FinanceOverviewStats;
}

export const FinanceStats: React.FC<FinanceStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Income */}
            <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                </div>
                <div>
                    <p className="text-gray-500 font-medium mb-1">Total Income</p>
                    <h3 className="text-2xl font-bold text-gray-900">LKR {(stats.totalIncome / 1000000).toFixed(2)}M</h3>
                    <p className="text-sm font-medium text-emerald-600 mt-2 flex items-center gap-1">
                        +{stats.incomeChange}% <span className="text-gray-400 font-normal">from last month</span>
                    </p>
                </div>
            </div>

            {/* Total Expense */}
            <div className="bg-white rounded-xl p-6 border border-red-100 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                        <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                </div>
                <div>
                    <p className="text-gray-500 font-medium mb-1">Total Expense</p>
                    <h3 className="text-2xl font-bold text-gray-900">LKR {(stats.totalExpense / 1000000).toFixed(2)}M</h3>
                    <p className="text-sm font-medium text-red-600 mt-2 flex items-center gap-1">
                        +{stats.expenseChange}% <span className="text-gray-400 font-normal">from last month</span>
                    </p>
                </div>
            </div>

            {/* Net Profit */}
            <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
                <div>
                    <p className="text-gray-500 font-medium mb-1">Net Profit</p>
                    <h3 className="text-2xl font-bold text-gray-900">LKR {(stats.netProfit / 1000000).toFixed(2)}M</h3>
                    <p className="text-sm font-medium text-blue-600 mt-2 flex items-center gap-1">
                        +{stats.profitChange}% <span className="text-gray-400 font-normal">from last month</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
