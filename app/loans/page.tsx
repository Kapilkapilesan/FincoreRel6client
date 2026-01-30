'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Search, Download, Upload } from 'lucide-react';
import { Loan, LoanStats as LoanStatsType } from '@/types/loan.types';
import { loanService } from '@/services/loan.service';
import { authService } from '@/services/auth.service';
import { LoanStats } from '@/components/loan/list/LoanStats';
import { LoanTable } from '@/components/loan/list/LoanTable';
import { LoanDetailModal } from '@/components/loan/list/LoanDetailModal';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import BMSLoader from '@/components/common/BMSLoader';


export default function LoanListPage() {
    const searchParams = useSearchParams();
    const statusFromUrl = searchParams.get('status');

    const [loans, setLoans] = useState<Loan[]>([]);
    const [stats, setStats] = useState<LoanStatsType>({
        total_count: 0,
        active_count: 0,
        completed_count: 0,
        total_disbursed: 0,
        total_outstanding: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(statusFromUrl || 'All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (statusFromUrl) {
            setStatusFilter(statusFromUrl);
            setCurrentPage(1);
        }
    }, [statusFromUrl]);

    const fetchLoans = useCallback(async () => {
        try {
            setLoading(true);
            const response = await loanService.getLoans({
                search: searchTerm,
                status: statusFilter,
                startDate: startDate,
                endDate: endDate,
                page: currentPage
            });
            setLoans(response.data);
            setStats(response.meta.stats);
            setTotalPages(response.meta.last_page);
            setTotalItems(response.meta.total);
        } catch (error) {
            toast.error('Failed to load loans');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter, startDate, endDate, currentPage]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLoans();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchLoans]);

    const handleExport = async () => {
        try {
            await loanService.exportLoans();
            toast.success('Loans exported successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to export loans');
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            toast.error('Please upload a valid CSV file');
            return;
        }

        setImporting(true);
        try {
            await loanService.importLoans(file);
            toast.success('Loans imported successfully');
            fetchLoans();
        } catch (error: any) {
            toast.error(error.message || 'Failed to import loans');
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Loan List</h1>
                    <p className="text-sm text-gray-500 mt-1">View and manage all loan accounts</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".csv"
                        className="hidden"
                    />
                    {authService.hasPermission('loans.view') && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={importing}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium text-sm disabled:opacity-50"
                        >
                            <Upload className="w-4 h-4 text-gray-500" />
                            <span>{importing ? 'Importing...' : 'Import CSV'}</span>
                        </button>
                    )}
                    {authService.hasPermission('loans.view') && (
                        <button
                            onClick={handleExport}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium text-sm"
                        >
                            <Download className="w-4 h-4 text-gray-500" />
                            <span>Export CSV</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Statistics */}
            <LoanStats stats={stats} />

            {/* Search and Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 relative w-full max-w-md">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by contract no, customer name or code..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 transition-all"
                            >
                                <option value="All">All Active</option>
                                <option value="Active">Active</option>
                                <option value="approved">Approved</option>
                                <option value="Completed">Completed</option>
                                <option value="pending_1st">Pending 1st</option>
                                <option value="pending_2nd">Pending 2nd</option>
                                <option value="sent_back">Sent Back</option>
                                <option value="all_statuses">All Statuses</option>
                            </select>
                        </div>

                        {/* Date Range Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date:</span>
                            <div className="flex items-center gap-1">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-bold rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                                <span className="text-gray-400 text-xs font-bold">to</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-bold rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                                {(startDate || endDate) && (
                                    <button
                                        onClick={() => {
                                            setStartDate('');
                                            setEndDate('');
                                            setCurrentPage(1);
                                        }}
                                        className="text-[10px] text-red-500 font-bold hover:underline ml-1"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legacy Quick Toggles (Optional, removed to save space but can be kept if desired) */}
                <div className="flex items-center gap-2 border-t border-gray-50 pt-3">
                    <button
                        onClick={() => {
                            setStatusFilter('All');
                            setCurrentPage(1);
                        }}
                        className={`px-4 py-1.5 text-[10px] font-bold rounded-full transition-all ${statusFilter === 'All'
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        ALL ACTIVE
                    </button>
                    <button
                        onClick={() => {
                            setStatusFilter('Active');
                            setCurrentPage(1);
                        }}
                        className={`px-4 py-1.5 text-[10px] font-bold rounded-full transition-all ${statusFilter === 'Active'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        DISBURSED
                    </button>
                    <button
                        onClick={() => {
                            setStatusFilter('Completed');
                            setCurrentPage(1);
                        }}
                        className={`px-4 py-1.5 text-[10px] font-bold rounded-full transition-all ${statusFilter === 'Completed'
                            ? 'bg-green-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        COMPLETED
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center space-y-4">
                    <BMSLoader message="Loading loans..." size="xsmall" className="text-gray-500" />
                </div>
            ) : (
                <>
                    <LoanTable loans={loans} onView={setSelectedLoan} />

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <p className="text-sm text-gray-500 font-medium">
                            Showing <span className="text-gray-900">{loans.length}</span> of <span className="text-gray-900">{totalItems}</span> loans
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-all shadow-sm"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-all shadow-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Detail Modal */}
            {selectedLoan && (
                <LoanDetailModal
                    loan={selectedLoan}
                    onClose={() => setSelectedLoan(null)}
                />
            )}
        </div>
    );
}
