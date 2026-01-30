"use client";

import React, { useState, useEffect } from 'react';
import {
    FileText,
    DollarSign,
    TrendingUp,
    Download,
    Search,
    Calendar,
    ChevronRight,
    ArrowLeftRight,
    Users
} from 'lucide-react';
import { financeService } from '../../services/finance.service';
import { toast } from 'react-toastify';

export default function FundTruncationSummaryPage() {
    const [activeTab, setActiveTab] = useState<'loans' | 'investments' | 'salaries' | 'staff_loans'>('loans');
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState({
        loans: [],
        investments: [],
        salaries: [],
        staff_loans: []
    });

    const [period, setPeriod] = useState<'day' | 'month' | 'year' | 'all'>('month');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSummary = async () => {
        setIsLoading(true);
        try {
            const result = await financeService.getTruncationSummary(selectedDate, period);
            setData(result);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch summary');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, [selectedDate, period]);

    const handleExport = () => {
        const records = data[activeTab];
        if (records.length === 0) {
            toast.warn('No records to export');
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";

        // Define headers based on tab
        const headers = activeTab === 'loans'
            ? ["Date", "Loan ID", "Customer", "Amount", "Status"]
            : activeTab === 'investments'
                ? ["Date", "Investment ID", "Customer", "Type", "Amount", "Reference"]
                : activeTab === 'salaries'
                    ? ["Date", "Staff Name", "Month", "Net Payable", "Method"]
                    : ["Date", "Staff Name", "Amount", "Purpose", "Reference"];

        csvContent += headers.join(",") + "\r\n";

        records.forEach((rec: any) => {
            const row = activeTab === 'loans'
                ? [rec.activation_date, rec.loan_id, rec.customer?.full_name, rec.approved_amount, rec.status]
                : activeTab === 'investments'
                    ? [rec.paid_at, rec.investment?.account_no, rec.investment?.customer?.full_name, rec.payout_type, rec.total_payout, rec.reference_code]
                    : activeTab === 'salaries'
                        ? [rec.payment_date, rec.staff?.full_name, rec.month, rec.net_payable, rec.payment_method]
                        : [rec.disbursed_at, rec.staff?.full_name, rec.amount, rec.purpose, rec.payment_reference];

            csvContent += row.map(v => `"${v}"`).join(",") + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `truncation_summary_${activeTab}_${period}_${selectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredRecords = data[activeTab].filter((rec: any) => {
        const searchStr = searchTerm.toLowerCase();
        if (activeTab === 'loans') {
            return rec.loan_id.toLowerCase().includes(searchStr) || rec.customer?.full_name?.toLowerCase().includes(searchStr);
        } else if (activeTab === 'investments') {
            return rec.investment?.account_no?.toLowerCase().includes(searchStr) || rec.investment?.customer?.full_name?.toLowerCase().includes(searchStr);
        } else if (activeTab === 'salaries' || activeTab === 'staff_loans') {
            return rec.staff?.full_name?.toLowerCase().includes(searchStr);
        }
        return true;
    });

    return (
        <div className="p-8 space-y-8 bg-gray-50/50 dark:bg-gray-900/50 min-h-screen animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                            <ArrowLeftRight className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Truncation Summary</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-bold ml-14">Historical log of all disbursed funds and settlements</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Period Filter */}
                    <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        {['day', 'month', 'year', 'all'].map((p: any) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${period === p
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    {period !== 'all' && (
                        <div className="relative group">
                            <Calendar className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type={period === 'day' ? 'date' : period === 'month' ? 'month' : 'number'}
                                value={period === 'year' ? selectedDate.split('-')[0] : (period === 'month' ? selectedDate.substring(0, 7) : selectedDate)}
                                onChange={(e) => {
                                    if (period === 'year') {
                                        setSelectedDate(`${e.target.value}-01-01`);
                                    } else if (period === 'month') {
                                        setSelectedDate(`${e.target.value}-01`);
                                    } else {
                                        setSelectedDate(e.target.value);
                                    }
                                }}
                                className="pl-11 pr-5 py-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all w-44 dark:text-white"
                            />
                        </div>
                    )}

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Statistics Row (Optional but Premium) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Loans Disbursed', value: data.loans.length, icon: DollarSign, color: 'blue' },
                    { label: 'Payouts Completed', value: data.investments.length, icon: TrendingUp, color: 'purple' },
                    { label: 'Salaries Paid', value: data.salaries.length, icon: Users, color: 'orange' },
                    { label: 'Staff Loans', value: data.staff_loans.length, icon: FileText, color: 'emerald' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col gap-1">
                            <span className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                            <span className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</span>
                        </div>
                        <stat.icon className={`w-12 h-12 absolute -right-2 -bottom-2 text-${stat.color}-500 opacity-[0.05] group-hover:scale-110 transition-transform duration-500`} />
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                {/* Tabs */}
                <div className="flex border-b border-gray-50 dark:border-gray-700 px-6 pt-6 gap-8">
                    {[
                        { id: 'loans', label: 'Loan Disbursements', icon: DollarSign },
                        { id: 'investments', label: 'Investment Yields', icon: TrendingUp },
                        { id: 'salaries', label: 'Staff Salaries', icon: Users },
                        { id: 'staff_loans', label: 'Staff Loans', icon: FileText },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 pb-6 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.3)]"></div>
                            )}
                        </button>
                    ))}

                    <div className="ml-auto mb-4 relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Quick search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-5 py-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-xs font-bold outline-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 w-64 transition-all"
                        />
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 p-6 overflow-x-auto">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-bold animate-pulse">Filtering your summary...</p>
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 gap-4">
                            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-full">
                                <Search className="w-12 h-12 text-gray-300" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-gray-900 dark:text-white font-black">No records found</h3>
                                <p className="text-gray-500 text-sm font-medium mt-1">Try changing your filters or searching for something else</p>
                            </div>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50 dark:border-gray-700">
                                    <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Date & Time</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Recipient Details</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Amount</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Ref / Method</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Branch</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {filteredRecords.map((rec: any, idx: number) => (
                                    <tr key={idx} className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-4 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900 dark:text-white">
                                                    {activeTab === 'loans' ? rec.activation_date : activeTab === 'investments' ? (rec.paid_at ? new Date(rec.paid_at).toISOString().split('T')[0] : 'N/A') : activeTab === 'salaries' ? rec.payment_date : rec.disbursed_at}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold">Processed</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xs">
                                                    {(activeTab === 'loans' ? rec.customer?.full_name : activeTab === 'investments' ? rec.investment?.customer?.full_name : rec.staff?.full_name)?.[0] || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-900 dark:text-white">
                                                        {activeTab === 'loans' ? rec.customer?.full_name : activeTab === 'investments' ? rec.investment?.customer?.full_name : rec.staff?.full_name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-medium">
                                                        {activeTab === 'loans' ? `LN: ${rec.loan_id}` : activeTab === 'investments' ? `INV: ${rec.investment?.account_no}` : `Staff: ${rec.staff?.staff_id}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5 text-right">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900 dark:text-white">
                                                    LKR {Number(activeTab === 'loans' ? rec.approved_amount : activeTab === 'investments' ? rec.total_payout : rec.net_payable || rec.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">Confirmed</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-700 dark:text-gray-300">
                                                    {activeTab === 'loans' ? 'Cash / Transfer' : activeTab === 'investments' ? rec.reference_code : activeTab === 'salaries' ? rec.payment_method : rec.payment_reference}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Reference</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5">
                                            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-200 dark:border-gray-600">
                                                {(activeTab === 'loans' ? rec.center?.branch?.branch_name : rec.staff?.branch?.branch_name) || 'Head Office'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-5 text-right">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center">
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                        Showing {filteredRecords.length} records in {activeTab}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Live Audit Trail</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
