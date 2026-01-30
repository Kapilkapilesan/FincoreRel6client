'use client';

import React from 'react';
import { ReportRow, ReportColumn } from '../../types/report.types';
import BMSLoader from '@/components/common/BMSLoader';

interface ReportsTableProps {
    data: ReportRow[];
    columns: ReportColumn[];
    selectedRows: Set<string>;
    onSelectRow: (id: string) => void;
    onSelectAll: () => void;
    isLoading: boolean;
}

export function ReportsTable({
    data,
    columns,
    selectedRows,
    onSelectRow,
    onSelectAll,
    isLoading
}: ReportsTableProps) {
    const allSelected = data.length > 0 && data.every(row => selectedRows.has(row.id));
    const someSelected = data.some(row => selectedRows.has(row.id)) && !allSelected;

    const formatValue = (value: any, key: string): string => {
        if (value === null || value === undefined) return '-';

        // Format currency values
        if (['loan_amount', 'rental', 'bank_transfer_amount', 'full_balance', 'arrears', 'payment_balance', 'last_payment_amount', 'monthly_collect_amount'].includes(key)) {
            return typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 0 }) : value;
        }

        return String(value);
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-8 text-center flex flex-col items-center">
                    <BMSLoader message="Loading report data..." size="xsmall" />
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-8 text-center">
                    <p className="text-gray-500">No records found matching your criteria.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            {/* Checkbox column */}
                            <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left z-10">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={input => {
                                        if (input) {
                                            input.indeterminate = someSelected;
                                        }
                                    }}
                                    onChange={onSelectAll}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                            </th>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                    style={{ minWidth: col.width || 120 }}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((row) => (
                            <tr
                                key={row.id}
                                className={`hover:bg-gray-50 transition-colors ${selectedRows.has(row.id) ? 'bg-blue-50' : ''
                                    }`}
                            >
                                {/* Checkbox column */}
                                <td className="sticky left-0 bg-white px-4 py-3 z-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.has(row.id)}
                                        onChange={() => onSelectRow(row.id)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                </td>
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
                                    >
                                        {formatValue((row as any)[col.key], col.key)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                <span>
                    {selectedRows.size > 0
                        ? `${selectedRows.size} row${selectedRows.size > 1 ? 's' : ''} selected`
                        : `Showing ${data.length} records`
                    }
                </span>
            </div>
        </div>
    );
}
