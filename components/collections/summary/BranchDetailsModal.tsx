'use client';

import React, { useEffect, useState } from 'react';
import {
    X,
    Building2,
    TrendingUp,
    TrendingDown,
    Calendar,
    UserCheck,
    Users,
    Search,
    Loader2,
    Info
} from 'lucide-react';
import { collectionSummaryService } from '@/services/collectionSummary.service';
import { BranchCollection } from './types';

interface BranchDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    branchId: string;
    branchName: string;
    date: string;
    viewType: 'daily' | 'weekly' | 'monthly';
}

export function BranchDetailsModal({
    isOpen,
    onClose,
    branchId,
    branchName,
    date,
    viewType
}: BranchDetailsModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [centerData, setCenterData] = useState<BranchCollection[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen && branchId) {
            fetchDetails();
        }
    }, [isOpen, branchId, date, viewType]);

    const fetchDetails = async () => {
        setIsLoading(true);
        try {
            const response = await collectionSummaryService.getBranchDetails(branchId, date, viewType);
            // Map the API backend keys to our frontend interface
            const mappedData = response.data.map((item: any) => ({
                branch: item.center_name, // Mapping center_name to branch label for the component
                branchId: item.center_id.toString(),
                target: item.target,
                collected: item.collected,
                variance: item.variance,
                total_active_customers: item.total_active_customers,
                due_customers: item.due_customers,
                paid_customers: item.paid_customers,
                achievement: item.achievement
            }));
            setCenterData(mappedData);
        } catch (error) {
            console.error('Failed to fetch details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredData = centerData.filter(center =>
        center.branch.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{branchName} - Center Breakdown</h3>
                                <p className="text-sm text-gray-500">
                                    Individual performance for all centers in this branch ({viewType.toUpperCase()} - {date})
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Filters/Search */}
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search center..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                        <Info className="w-4 h-4" />
                        Showing {filteredData.length} Centers
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 bg-gray-50/30">
                    {isLoading ? (
                        <div className="h-64 flex flex-center flex-col items-center justify-center gap-3">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                            <p className="text-gray-500 animate-pulse font-medium">Loading details...</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4 bg-white border-2 border-dashed border-gray-200 rounded-xl">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium text-lg">No centers found matching your search</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Center Name</th>
                                        <th className="text-right px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Expectation</th>
                                        <th className="text-right px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Collected</th>
                                        <th className="text-right px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
                                        <th className="text-center px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Due</th>
                                        <th className="text-center px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Paid</th>
                                        <th className="text-center px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredData.map((center, index) => {
                                        const isPositive = center.variance >= 0;
                                        return (
                                            <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">{center.branch}</td>
                                                <td className="px-4 py-4 text-sm text-right text-gray-700 font-mono font-semibold">
                                                    {center.target.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-right text-green-600 font-mono font-bold">
                                                    {center.collected.toLocaleString()}
                                                </td>
                                                <td className={`px-4 py-4 text-sm text-right font-bold font-mono ${isPositive ? 'text-emerald-600' : 'text-red-700'}`}>
                                                    {isPositive ? '+' : ''}{center.variance.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-center text-orange-600 font-bold font-mono">
                                                    {center.due_customers}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-center text-teal-600 font-bold font-mono">
                                                    {center.paid_customers}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${center.achievement >= 100 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                            {center.achievement}%
                                                        </span>
                                                        <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${center.achievement >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                                style={{ width: `${Math.min(center.achievement, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 p-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
}
