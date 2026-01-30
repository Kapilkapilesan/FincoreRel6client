import React, { useState, useEffect } from "react";
import { X, Search, CheckCircle2, Building, MapPin, UserPlus } from "lucide-react";
import { Customer } from "../../types/customer.types";
import { customerService } from "../../services/customer.service";
import { toast } from "react-toastify";

interface CenterAssignmentModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function CenterAssignmentModal({ onClose, onSuccess }: CenterAssignmentModalProps) {
    const [loading, setLoading] = useState(false);
    const [constants, setConstants] = useState<any>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [targetBranchId, setTargetBranchId] = useState<number | undefined>();
    const [targetCenterId, setTargetCenterId] = useState<number | undefined>();
    const [filteredCenters, setFilteredCenters] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [consts, unassigned] = await Promise.all([
                customerService.getConstants(),
                customerService.getCustomers({ center_id: 'unassigned', customer_type: 'Loan Customer' })
            ]);
            setConstants(consts);
            setCustomers(unassigned);
            setFilteredCustomers(unassigned);
        } catch (error) {
            toast.error("Failed to load unassigned customers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = customers.filter(c =>
            c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.customer_code.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (targetBranchId) {
            filtered = filtered.filter(c => c.branch_id === targetBranchId);
        }

        setFilteredCustomers(filtered);
        // Clear selection if customers are filtered out
        setSelectedIds(prev => prev.filter(id => filtered.some(c => c.id === id as any)));
    }, [searchTerm, customers, targetBranchId]);

    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const branchId = parseInt(e.target.value);
        setTargetBranchId(branchId);
        setTargetCenterId(undefined);
        if (constants?.centers) {
            setFilteredCenters(constants.centers.filter((c: any) => c.branch_id === branchId && c.status === 'active'));
        }
    };

    const toggleSelection = (id: any) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredCustomers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredCustomers.map(c => c.id as unknown as number));
        }
    };

    const handleSubmit = async () => {
        if (selectedIds.length === 0) {
            toast.warning("Please select at least one customer");
            return;
        }
        if (!targetBranchId || !targetCenterId) {
            toast.warning("Please select a Branch and Center");
            return;
        }

        setLoading(true);
        try {
            await customerService.assignToCenter({
                customer_ids: selectedIds,
                branch_id: targetBranchId,
                center_id: targetCenterId
            });
            toast.success("Customers assigned successfully");
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || "Assignment failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] max-w-4xl w-full shadow-2xl border border-gray-200 dark:border-gray-700/50 flex flex-col h-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                            <UserPlus className="text-blue-600" />
                            Add Customers to Center
                        </h2>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Assign unassigned customers to collections centers</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Left: Customer Selection */}
                    <div className="flex-1 p-6 border-r border-gray-100 dark:border-gray-700/50 flex flex-col gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search unassigned customers..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-tight px-1">
                            <span>{selectedIds.length} Selected</span>
                            <button onClick={handleSelectAll} className="text-blue-600 hover:underline">
                                {selectedIds.length === filteredCustomers.length ? "Deselect All" : "Select All"}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                            {filteredCustomers.length === 0 ? (
                                <div className="text-center py-12 text-gray-400 italic">No unassigned customers found</div>
                            ) : (
                                filteredCustomers.map(customer => (
                                    <div
                                        key={customer.id}
                                        onClick={() => toggleSelection(customer.id)}
                                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${selectedIds.includes(customer.id as unknown as number)
                                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                                            : "border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            }`}
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{customer.full_name}</p>
                                            <p className="text-[10px] text-gray-500 font-mono">{customer.customer_code}</p>
                                        </div>
                                        {selectedIds.includes(customer.id as unknown as number) && (
                                            <CheckCircle2 className="text-blue-600" size={18} />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right: Target Assignment */}
                    <div className="w-full md:w-[320px] p-6 bg-gray-50/50 dark:bg-gray-900/20 flex flex-col gap-6">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Assignment Target</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
                                    <MapPin size={12} /> Target Branch
                                </label>
                                <select
                                    className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none"
                                    onChange={handleBranchChange}
                                    value={targetBranchId}
                                >
                                    <option value="">Select Branch</option>
                                    {constants?.branches?.map((b: any) => (
                                        <option key={b.id} value={b.id}>{b.branch_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
                                    <Building size={12} /> Target Center
                                </label>
                                <select
                                    className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none disabled:opacity-50"
                                    disabled={!targetBranchId}
                                    onChange={(e) => setTargetCenterId(parseInt(e.target.value))}
                                    value={targetCenterId}
                                >
                                    <option value="">Select Center</option>
                                    {filteredCenters.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.center_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-700/50">
                            <button
                                onClick={handleSubmit}
                                disabled={loading || selectedIds.length === 0 || !targetCenterId}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:grayscale"
                            >
                                {loading ? "Processing..." : "Confirm Assignment"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
