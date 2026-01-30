"use client";

import React, { useState, useEffect } from 'react';
import { SalaryApprovalStats } from '../../../components/transaction-approval/salary/SalaryApprovalStats';
import { SalaryApprovalTable } from '../../../components/transaction-approval/salary/SalaryApprovalTable';
import { financeService } from '../../../services/finance.service';
import { toast } from 'react-toastify';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import BMSLoader from '../../../components/common/BMSLoader';

export default function SalaryApprovalPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isApproving, setIsApproving] = useState(false);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const data = await financeService.getSalaryApprovals();
            setRecords(data);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch salary records');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = (id: string) => {
        setSelectedId(id);
        setIsConfirmOpen(true);
    };

    const handleConfirmApprove = async () => {
        if (selectedIds.length > 0) {
            try {
                setIsApproving(true);
                await financeService.bulkApproveSalaries(selectedIds.map(id => parseInt(id)));
                toast.success(`${selectedIds.length} salaries approved successfully`);
                setRecords(prev => prev.filter(rec => !selectedIds.includes(rec.id.toString())));
                setSelectedIds([]);
            } catch (error: any) {
                toast.error(error.message || 'Failed to approve salaries');
            } finally {
                setIsApproving(false);
                setIsConfirmOpen(false);
            }
            return;
        }

        if (!selectedId) return;

        try {
            setIsApproving(true);
            await financeService.approveSalary(parseInt(selectedId));
            toast.success('Salary approved successfully');
            setRecords(prev => prev.filter(rec => rec.id.toString() !== selectedId.toString()));
        } catch (error: any) {
            toast.error(error.message || 'Failed to approve salary');
        } finally {
            setIsApproving(false);
            setSelectedId(null);
            setIsConfirmOpen(false);
        }
    };

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleToggleSelectAll = () => {
        if (selectedIds.length === records.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(records.map(r => r.id.toString()));
        }
    };

    const handleBulkApproveClick = () => {
        if (selectedIds.length === 0) return;
        setIsConfirmOpen(true);
    };

    // Calculate dynamic stats
    const stats = {
        pendingCount: records.length,
        pendingAmount: records.reduce((sum, r) => sum + parseFloat(r.net_payable), 0),
        approvedCount: 0, // In this page we only show what's waiting
        approvedAmount: 0,
        monthlyTotal: records.reduce((sum, r) => sum + parseFloat(r.net_payable), 0),
        monthlyCount: records.length
    };

    if (loading) {
        return (
            <div className="h-[400px] flex items-center justify-center">
                <BMSLoader message="Loading approvals..." size="xsmall" className="text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">Salary Approval</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and authorize pending employee salary payments.</p>
                </div>
                {selectedIds.length > 0 && (
                    <button
                        onClick={handleBulkApproveClick}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 transition-all animate-in slide-in-from-right-4"
                        disabled={isApproving}
                    >
                        {isApproving ? (
                            <BMSLoader message="Approving..." size="xsmall" className="text-white" />
                        ) : (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Approve Selected ({selectedIds.length})
                                <span className="ml-2 pl-2 border-l border-white/20">
                                    Rs. {records.filter(r => selectedIds.includes(r.id.toString())).reduce((sum, r) => sum + parseFloat(r.net_payable), 0).toLocaleString()}
                                </span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <SalaryApprovalStats
                {...stats}
            />

            <SalaryApprovalTable
                records={records.map(r => ({
                    id: r.id.toString(),
                    processedDate: new Date(r.created_at).toLocaleDateString(),
                    employeeName: r.staff?.full_name || r.user?.full_name || 'Unknown',
                    role: r.staff?.work_info?.designation || r.staff?.role || 'Staff',
                    month: r.month,
                    baseSalary: parseFloat(r.base_salary),
                    adjustments: parseFloat(r.allowances) - parseFloat(r.deductions),
                    totalPaid: parseFloat(r.net_payable),
                    status: r.status
                }))}
                onApprove={handleApproveClick}
                approvingId={isApproving ? (selectedIds.length === 1 ? selectedIds[0] : selectedId) : null}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
            />

            <ConfirmDialog
                isOpen={isConfirmOpen}
                title={selectedIds.length > 0 ? `Approve ${selectedIds.length} Salaries` : "Approve Salary"}
                message={selectedIds.length > 0
                    ? `Are you sure you want to approve all ${selectedIds.length} selected salary payments? This will mark them as disbursed.`
                    : "Are you sure you want to approve this salary payment? This action will mark the funds as disbursed."
                }
                confirmText={isApproving ? "Approving..." : "Confirm Approval"}
                onConfirm={handleConfirmApprove}
                onCancel={() => {
                    if (!isApproving) {
                        setIsConfirmOpen(false);
                    }
                }}
                variant="info"
            />
        </div>
    );
}
