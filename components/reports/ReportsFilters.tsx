'use client';

import React, { useState } from 'react';
import { Filter, X, Plus, Search } from 'lucide-react';
import { ReportColumn, ReportFilter } from '../../types/report.types';

interface ReportsFiltersProps {
    columns: ReportColumn[];
    activeFilters: ReportFilter[];
    onAddFilter: (filter: ReportFilter) => void;
    onRemoveFilter: (index: number) => void;
    onClearAllFilters: () => void;
    totalRecords: number;
    filteredRecords: number;
}

export function ReportsFilters({
    columns,
    activeFilters,
    onAddFilter,
    onRemoveFilter,
    onClearAllFilters,
    totalRecords,
    filteredRecords
}: ReportsFiltersProps) {
    const [selectedColumn, setSelectedColumn] = useState('');
    const [filterValue, setFilterValue] = useState('');

    const handleAddFilter = () => {
        if (selectedColumn && filterValue.trim()) {
            onAddFilter({
                column: selectedColumn,
                value: filterValue.trim()
            });
            setSelectedColumn('');
            setFilterValue('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddFilter();
        }
    };

    const getColumnLabel = (key: string) => {
        const col = columns.find(c => c.key === key);
        return col ? col.label : key;
    };

    return (
        <div className="mb-4">
            <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="flex items-center gap-2 text-gray-600">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filter by columns:</span>
                </div>

                {/* Column selector */}
                <select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[160px]"
                >
                    <option value="">Select Column...</option>
                    {columns.map((col) => (
                        <option key={col.key} value={col.key}>
                            {col.label}
                        </option>
                    ))}
                </select>

                {/* Filter value input */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={selectedColumn ? `Search ${getColumnLabel(selectedColumn)}...` : 'Select a column first...'}
                        disabled={!selectedColumn}
                        className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                    {filterValue && (
                        <button
                            onClick={() => setFilterValue('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Add filter button */}
                <button
                    onClick={handleAddFilter}
                    disabled={!selectedColumn || !filterValue.trim()}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-4 h-4" />
                    Add Filter
                </button>

                {/* Records count */}
                <div className="ml-auto text-sm text-gray-500">
                    Showing {filteredRecords} of {totalRecords} records
                </div>

                {/* Clear all button */}
                {activeFilters.length > 0 && (
                    <button
                        onClick={onClearAllFilters}
                        className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                    >
                        ✕ Clear All
                    </button>
                )}
            </div>

            {/* Active filters */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500">Active filters:</span>
                    {activeFilters.map((filter, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                        >
                            {getColumnLabel(filter.column)}: "{filter.value}"
                            <button
                                onClick={() => onRemoveFilter(index)}
                                className="ml-1 hover:bg-blue-100 rounded p-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
