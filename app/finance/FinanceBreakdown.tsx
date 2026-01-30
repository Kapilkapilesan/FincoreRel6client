'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BreakdownItem } from '@/types/finance.types';

interface FinanceBreakdownProps {
    incomeBreakdown: BreakdownItem[];
    expenseBreakdown: BreakdownItem[];
}

import { colors } from '@/themes/colors';

export const FinanceBreakdown: React.FC<FinanceBreakdownProps> = ({ incomeBreakdown, expenseBreakdown }) => {

    const renderCustomizedLabel = (props: any) => {
        const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value, fill } = props;
        const RADIAN = Math.PI / 180;
        // Radius for label position (outside the pie)
        const radius = outerRadius + 20;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill={fill}
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-[11px] font-semibold"
            >
                {`${name}: LKR ${(value / 1000000).toFixed(1)}M`}
            </text>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Breakdown */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Income Breakdown</h3>
                <div className="h-[350px] w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={incomeBreakdown}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={renderCustomizedLabel}
                                innerRadius={0}
                                outerRadius={100}
                                paddingAngle={1}
                                dataKey="value"
                            >
                                {incomeBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any) => [`LKR ${Number(value).toLocaleString()}`, 'Amount']}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontWeight: 600, color: colors.gray[700] }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Expense Breakdown</h3>
                <div className="h-[350px] w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={expenseBreakdown}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={renderCustomizedLabel}
                                innerRadius={0}
                                outerRadius={100}
                                paddingAngle={1}
                                dataKey="value"
                            >
                                {expenseBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any) => [`LKR ${Number(value).toLocaleString()}`, 'Amount']}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontWeight: 600, color: colors.gray[700] }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
