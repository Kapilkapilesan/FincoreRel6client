"use client";

import React, { useState } from 'react';
import { FundTruncationStats } from '../../components/fund-transactions/FundTruncationStats';
import { ShareholdersTable } from '../../components/fund-transactions/InvestmentsTable';
import { CustomerInvestmentsTable } from '../../components/fund-transactions/CustomerInvestmentsTable';
import { LoanDisbursementTable } from '../../components/fund-transactions/LoanDisbursementTable';
import { SalaryDisbursementTable } from '../../components/fund-transactions/SalaryDisbursementTable';
import { PayoutModal } from '../../components/fund-transactions/PayoutModal';
import { toast } from 'react-toastify';
import { financeService } from '../../services/finance.service';
import { investmentService } from '../../services/investment.service';
import { shareholderService } from '../../services/shareholder.service';
import { staffLoanService } from '../../services/staffLoan.service';
import { StaffLoanDisbursementTable } from '../../components/fund-transactions/StaffLoanDisbursementTable';
import { InvestmentPayoutsTable } from '../../components/fund-transactions/InvestmentPayoutsTable';

export default function FundTransactionsPage() {
    const [activeTab, setActiveTab] = useState<'shareholders' | 'investments' | 'loans' | 'salaries' | 'staff-loans' | 'investment-payouts'>('shareholders');
    const [payoutModal, setPayoutModal] = useState<{
        isOpen: boolean;
        recipientName: string;
        amount: number;
        type: 'loan' | 'salary' | 'bulk-salary' | 'staff-loan' | 'investment';
        bankDetails?: {
            bankName: string;
            accountNumber: string;
        };
        id: string | string[];
    }>({
        isOpen: false,
        recipientName: '',
        amount: 0,
        type: 'loan',
        bankDetails: undefined,
        id: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({
        total_income: 0,
        total_expense: 0,
        net_flow: 0,
        total_truncation: 0,
        total_shareholder_investment: 0,
        total_customer_investment: 0
    });
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());
    const [period, setPeriod] = useState<'day' | 'month' | 'year' | 'all'>('month');
    const [shareholders, setShareholders] = useState<any[]>([]);
    const [customerInvestments, setCustomerInvestments] = useState<any[]>([]);
    const [loans, setLoans] = useState<any[]>([]);
    const [salaries, setSalaries] = useState<any[]>([]);
    const [staffLoans, setStaffLoans] = useState<any[]>([]);
    const [investmentPayouts, setInvestmentPayouts] = useState<any[]>([]);

    const fetchShareholders = async () => {
        try {
            const data = await shareholderService.getAll();
            setShareholders(data.shareholders);
        } catch (error) {
            console.error('Failed to fetch shareholders', error);
        }
    };

    const fetchInvestments = async () => {
        try {
            const data = await investmentService.getInvestments();
            setCustomerInvestments(data);
        } catch (error) {
            console.error('Failed to fetch investments', error);
        }
    };

    const fetchLoans = async () => {
        try {
            const data = await financeService.getApprovedLoans();
            setLoans(data);
        } catch (error) {
            toast.error('Failed to fetch loans for disbursement');
        }
    };

    const fetchStats = async () => {
        try {
            const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
            const data = await financeService.getBranchTransactions(undefined, dateStr, period);
            setStats(data.stats);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const fetchSalaries = async () => {
        try {
            const data = await financeService.getPendingSalaries();
            setSalaries(data);
        } catch (error) {
            toast.error('Failed to fetch pending salaries');
        }
    };

    const fetchStaffLoans = async () => {
        try {
            const response = await staffLoanService.getAll({ status: 'approved,disbursed' });
            if (response.status === 'success') {
                // Sort: Approved first, then Disbursed (descending date)
                const sorted = response.data.data.sort((a: any, b: any) => {
                    if (a.status === b.status) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    return a.status === 'approved' ? -1 : 1;
                });
                setStaffLoans(sorted);
            }
        } catch (error) {
            console.error('Failed to fetch staff loans', error);
        }
    };

    const fetchPayouts = async () => {
        try {
            const data = await investmentService.getPayouts();
            setInvestmentPayouts(data);
        } catch (error) {
            console.error('Failed to fetch investment payouts', error);
        }
    };

    React.useEffect(() => {
        fetchShareholders();
        fetchInvestments();
        fetchLoans();
        fetchSalaries();
        fetchStaffLoans();
        fetchPayouts();
    }, []);

    React.useEffect(() => {
        fetchStats();
    }, [selectedMonth, selectedYear, selectedDay, period]);

    const handleDisburseClick = (type: 'loan' | 'salary' | 'staff-loan' | 'investment', record: any) => {
        setPayoutModal({
            isOpen: true,
            recipientName: type === 'loan' || type === 'investment'
                ? record.investment?.customer?.full_name || record.customer?.full_name
                : record.staff?.full_name,
            amount: type === 'loan'
                ? parseFloat(record.approved_amount)
                : type === 'investment'
                    ? parseFloat(record.total_payout)
                    : parseFloat(record.net_payable),
            bankDetails: type === 'loan' && record.borrower_bank_details ? {
                bankName: record.borrower_bank_details.bank_name,
                accountNumber: record.borrower_bank_details.account_number
            } : undefined,
            type,
            id: record.id
        });
    };

    const handleBulkSalaryDisburse = (selectedRecords: any[]) => {
        const totalAmount = selectedRecords.reduce((sum, rec) => sum + parseFloat(rec.net_payable), 0);
        setPayoutModal({
            isOpen: true,
            recipientName: `${selectedRecords.length} Staff Members (Bulk Transfer)`,
            amount: totalAmount,
            type: 'bulk-salary',
            id: selectedRecords.map(r => r.id.toString())
        });
    };

    const handleConfirmPayout = async (refNo: string, remark: string) => {
        setIsLoading(true);
        try {
            if (payoutModal.type === 'loan') {
                await financeService.disburseLoan(Number(payoutModal.id));
                toast.success('Loan disbursed successfully!');
                await fetchLoans();
            } else if (payoutModal.type === 'salary') {
                await financeService.disburseSalary(Number(payoutModal.id));
                toast.success('Salary disbursed successfully!');
                await fetchSalaries();
            } else if (payoutModal.type === 'bulk-salary') {
                const ids = payoutModal.id as string[];
                await Promise.all(ids.map(id => financeService.disburseSalary(Number(id))));
                toast.success(`${ids.length} Salaries disbursed successfully!`);
                await fetchSalaries();
            } else if (payoutModal.type === 'staff-loan') {
                await staffLoanService.disburse(Number(payoutModal.id), refNo);
                toast.success('Staff Loan disbursed successfully!');
                await fetchStaffLoans();
            } else if (payoutModal.type === 'investment') {
                await investmentService.settlePayout(Number(payoutModal.id), refNo);
                toast.success('Investment yield disbursed successfully!');
                await fetchPayouts();
                await fetchInvestments();
            }
            fetchStats();
            setPayoutModal(prev => ({ ...prev, isOpen: false }));
        } catch (error: any) {
            toast.error(error.message || 'Disbursement failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveInvestmentPayout = async (id: number) => {
        if (!confirm('Approve this investment payout?')) return;
        try {
            await investmentService.approvePayout(id);
            toast.success('Payout approved successfully');
            fetchPayouts();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleSettleInvestmentPayout = async (id: number) => {
        const refNo = prompt('Enter payment reference code:');
        if (!refNo) return;
        try {
            await investmentService.settlePayout(id, refNo);
            toast.success('Investment yield settled and paid!');
            fetchPayouts();
            fetchInvestments();
            fetchStats();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Fund Truncation</h1>
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 mt-1">Manage organization investments and loan disbursements</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex bg-gray-50 dark:bg-gray-900 rounded-xl p-1 border border-gray-100 dark:border-gray-700">
                        {(['day', 'month', 'year', 'all'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${period === p
                                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-gray-100 dark:ring-gray-700'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    {period !== 'all' && (
                        <div className="flex items-center gap-2">
                            {period === 'day' ? (
                                <input
                                    type="date"
                                    value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            const d = new Date(e.target.value);
                                            setSelectedYear(d.getFullYear());
                                            setSelectedMonth(d.getMonth() + 1);
                                            setSelectedDay(d.getDate());
                                        }
                                    }}
                                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-gray-800 border-none text-gray-900 dark:text-white ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                                />
                            ) : (
                                <>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                        disabled={period === 'year'}
                                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-gray-800 border-none text-gray-900 dark:text-white ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                                            <option key={month} value={index + 1}>{month}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-gray-800 border-none text-gray-900 dark:text-white ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                                    >
                                        {[2024, 2025, 2026, 2027, 2028].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <FundTruncationStats stats={stats} />

            <div className="space-y-6">
                <div className="flex gap-12 border-b border-gray-100 dark:border-gray-700 px-4">
                    {[
                        { id: 'shareholders', label: 'Shareholders' },
                        { id: 'investments', label: 'Investments' },
                        { id: 'loans', label: 'Loan Payment Details', count: loans.length },
                        { id: 'salaries', label: 'Salary Payment', count: salaries.length },
                        { id: 'staff-loans', label: 'Staff Loan', count: staffLoans.length },
                        { id: 'investment-payouts', label: 'Investment Payouts', count: investmentPayouts.length }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeTab === tab.id
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            <span>{tab.label}</span>
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="flex items-center justify-center bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full px-1 shadow-sm">
                                    {tab.count}
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.3)]"></div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'shareholders' && <ShareholdersTable records={shareholders} />}
                    {activeTab === 'investments' && <CustomerInvestmentsTable records={customerInvestments} />}
                    {activeTab === 'loans' && (
                        <LoanDisbursementTable
                            records={loans}
                            onDisburse={(rec) => handleDisburseClick('loan', rec)}
                        />
                    )}
                    {activeTab === 'salaries' && (
                        <SalaryDisbursementTable
                            records={salaries}
                            onDisburse={(rec) => handleDisburseClick('salary', rec)}
                            onBulkDisburse={handleBulkSalaryDisburse}
                        />
                    )}
                    {activeTab === 'staff-loans' && (
                        <StaffLoanDisbursementTable
                            records={staffLoans}
                            onDisburse={(rec) => handleDisburseClick('staff-loan', rec)}
                        />
                    )}
                    {activeTab === 'investment-payouts' && (
                        <InvestmentPayoutsTable
                            records={investmentPayouts}
                            onDisburse={(rec) => handleDisburseClick('investment', rec)}
                            onSettle={handleSettleInvestmentPayout}
                        />
                    )}
                </div>
            </div>

            <PayoutModal
                isOpen={payoutModal.isOpen}
                onClose={() => setPayoutModal(prev => ({ ...prev, isOpen: false }))}
                recipientName={payoutModal.recipientName}
                amount={payoutModal.amount}
                bankDetails={payoutModal.bankDetails}
                onConfirm={handleConfirmPayout}
                isProcessing={isLoading}
            />
        </div>
    );
}
