'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, BadgeDollarSign, Download, Plus } from 'lucide-react';
import { CustomerInvestmentsTable } from '../../components/fund-transactions/CustomerInvestmentsTable';
import { investmentService } from '../../services/investment.service';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import BMSLoader from '../../components/common/BMSLoader';

export default function InvestmentsListPage() {
    const [investments, setInvestments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ACTIVE');
    const router = useRouter();

    useEffect(() => {
        loadInvestments(true);
        const interval = setInterval(() => loadInvestments(false), 5000);
        return () => clearInterval(interval);
    }, []);

    const loadInvestments = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const data = await investmentService.getInvestments();
            setInvestments(data);
        } catch (error) {
            console.error(error);
            if (showLoading) toast.error('Failed to load investments');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const filteredInvestments = investments.filter(inv => {
        const matchesSearch = (
            inv.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                        <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Investment Accounts</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Manage and track all customer investment subscriptions</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/investments/create')}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 font-bold"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Investment</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
                            <BadgeDollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Active Principal</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-1">
                                LKR {investments.reduce((sum, inv) => sum + Number(inv.amount), 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
                {/* Add more stats if needed */}
            </div>

            {/* Filters and List */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by Transaction ID, Customer, or Product..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-gray-700 dark:text-gray-300 font-medium"
                        />
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="relative group w-full sm:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full appearance-none pl-5 pr-10 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-750 transition-all shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE" className="text-emerald-600 font-bold">Active</option>
                                <option value="CLOSED" className="text-red-600 font-bold">Closed</option>
                                <option value="RENEWED" className="text-blue-600 font-bold">Renewed</option>
                                <option value="MATURED" className="text-amber-600 font-bold">Matured</option>
                            </select>
                            <Filter className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-750 transition-all shadow-sm group">
                            <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            <span className="hidden md:inline">Export</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-20 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex flex-col items-center gap-4">
                            <BMSLoader message="Loading investment accounts..." size="xsmall" className="text-gray-500 font-bold" />
                        </div>
                    </div>
                ) : (
                    <CustomerInvestmentsTable records={filteredInvestments} />
                )}
            </div>
            <ToastContainer />
        </div>
    );
}
