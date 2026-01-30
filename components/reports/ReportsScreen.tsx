'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { ReportsStats } from './ReportsStats';
import { ReportsFilters } from './ReportsFilters';
import { ReportsTable } from './ReportsTable';
import { ColumnSelectionModal } from './ColumnSelectionModal';
import { reportService } from '../../services/report.service';
import {
    ReportRow,
    ReportStats,
    ReportFilter,
    ReportColumn,
    REPORT_COLUMNS
} from '../../types/report.types';

export function ReportsScreen() {
    // Data state
    const [reportData, setReportData] = useState<ReportRow[]>([]);
    const [filteredData, setFilteredData] = useState<ReportRow[]>([]);
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [columns] = useState<ReportColumn[]>(REPORT_COLUMNS);

    // Selection state
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());

    // Filter state
    const [activeFilters, setActiveFilters] = useState<ReportFilter[]>([]);

    // UI state
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isStatsLoading, setIsStatsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Fetch report data
    const fetchReportData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Convert active filters to API format
            const filterParams: Record<string, string> = {};
            activeFilters.forEach(filter => {
                filterParams[filter.column] = filter.value;
            });

            const data = await reportService.getReportData(filterParams);
            setReportData(data);
            setFilteredData(data);
        } catch (error) {
            console.error('Failed to fetch report data:', error);
            toast.error('Failed to load report data');
        } finally {
            setIsLoading(false);
        }
    }, [activeFilters]);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        setIsStatsLoading(true);
        try {
            const statsData = await reportService.getReportStats();
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            // Use fallback stats
            setStats({
                total_reports: reportData.length,
                downloads_this_month: 0,
                scheduled_reports: 0,
                last_generated: 'Today'
            });
        } finally {
            setIsStatsLoading(false);
        }
    }, [reportData.length]);

    // Initial load
    useEffect(() => {
        fetchReportData();
        fetchStats();
    }, []);

    // Refetch when filters change
    useEffect(() => {
        fetchReportData();
    }, [activeFilters]);

    // Apply client-side filtering
    useEffect(() => {
        if (activeFilters.length === 0) {
            setFilteredData(reportData);
            return;
        }

        const filtered = reportData.filter(row => {
            return activeFilters.every(filter => {
                const value = (row as any)[filter.column];
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(filter.value.toLowerCase());
            });
        });

        setFilteredData(filtered);
    }, [reportData, activeFilters]);

    // Row selection handlers
    const handleSelectRow = (id: string) => {
        setSelectedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleSelectAllRows = () => {
        if (selectedRows.size === filteredData.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(filteredData.map(row => row.id)));
        }
    };

    // Filter handlers
    const handleAddFilter = (filter: ReportFilter) => {
        setActiveFilters(prev => [...prev, filter]);
    };

    const handleRemoveFilter = (index: number) => {
        setActiveFilters(prev => prev.filter((_, i) => i !== index));
    };

    const handleClearAllFilters = () => {
        setActiveFilters([]);
    };

    // Export handlers
    const handleOpenExportModal = () => {
        // Initialize with all columns selected
        setSelectedColumns(new Set(columns.map(c => c.key)));
        setIsExportModalOpen(true);
    };

    const handleToggleColumn = (key: string) => {
        setSelectedColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const handleSelectAllColumns = () => {
        setSelectedColumns(new Set(columns.map(c => c.key)));
    };

    const handleDeselectAllColumns = () => {
        setSelectedColumns(new Set());
    };

    const handleExport = async () => {
        if (selectedColumns.size === 0) {
            toast.error('Please select at least one column');
            return;
        }

        setIsExporting(true);
        try {
            const payload = {
                columns: Array.from(selectedColumns),
                filters: activeFilters.reduce((acc, f) => ({ ...acc, [f.column]: f.value }), {}),
                rowIds: selectedRows.size > 0 ? Array.from(selectedRows) : undefined
            };

            await reportService.exportReport(payload);
            toast.success('Report exported successfully');
            setIsExportModalOpen(false);
        } catch (error) {
            console.error('Failed to export:', error);
            toast.error('Failed to export report');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                <p className="text-sm text-gray-500 mt-1">Generate and export various system reports</p>
            </div>

            {/* Stats Cards */}
            <ReportsStats stats={stats} isLoading={isStatsLoading} />

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Detailed Report Data</h2>
                    <button
                        onClick={handleOpenExportModal}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export to Excel
                    </button>
                </div>

                {/* Filters */}
                <ReportsFilters
                    columns={columns}
                    activeFilters={activeFilters}
                    onAddFilter={handleAddFilter}
                    onRemoveFilter={handleRemoveFilter}
                    onClearAllFilters={handleClearAllFilters}
                    totalRecords={reportData.length}
                    filteredRecords={filteredData.length}
                />

                {/* Table */}
                <ReportsTable
                    data={filteredData}
                    columns={columns}
                    selectedRows={selectedRows}
                    onSelectRow={handleSelectRow}
                    onSelectAll={handleSelectAllRows}
                    isLoading={isLoading}
                />
            </div>

            {/* Column Selection Modal */}
            <ColumnSelectionModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                columns={columns}
                selectedColumns={selectedColumns}
                onToggleColumn={handleToggleColumn}
                onSelectAll={handleSelectAllColumns}
                onDeselectAll={handleDeselectAllColumns}
                onExport={handleExport}
                isExporting={isExporting}
            />
        </div>
    );
}
