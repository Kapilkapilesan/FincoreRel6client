'use client';

import React from 'react';
import { X, Check, Download } from 'lucide-react';
import { ReportColumn } from '../../types/report.types';

interface ColumnSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    columns: ReportColumn[];
    selectedColumns: Set<string>;
    onToggleColumn: (key: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onExport: () => void;
    isExporting: boolean;
}

export function ColumnSelectionModal({
    isOpen,
    onClose,
    columns,
    selectedColumns,
    onToggleColumn,
    onSelectAll,
    onDeselectAll,
    onExport,
    isExporting
}: ColumnSelectionModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Select Columns to Export</h2>
                            <p className="text-sm text-gray-500 mt-1">Choose which columns to include in your export file</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onSelectAll}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                Select All
                            </button>
                            <button
                                onClick={onDeselectAll}
                                className="text-sm font-medium text-gray-600 hover:text-gray-700"
                            >
                                Deselect All
                            </button>
                        </div>
                        <span className="text-sm text-gray-500">
                            {selectedColumns.size} of {columns.length} columns selected
                        </span>
                    </div>
                </div>

                {/* Column Grid */}
                <div className="p-6 overflow-y-auto max-h-[50vh]">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {columns.map((col) => {
                            const isSelected = selectedColumns.has(col.key);
                            return (
                                <button
                                    key={col.key}
                                    onClick={() => onToggleColumn(col.key)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-left ${isSelected
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-white/20' : 'border border-gray-300'
                                        }`}>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <span className="text-sm font-medium truncate">{col.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onExport}
                        disabled={selectedColumns.size === 0 || isExporting}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Export ({selectedColumns.size} columns)
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
