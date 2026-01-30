'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Users, Loader2, UserPlus, Info, CheckCircle2 } from 'lucide-react';
import { Customer } from '../../types/customer.types';
import { Center } from '../../types/center.types';
import { groupService } from '../../services/group.service';
import { customerService } from '../../services/customer.service';
import { centerService } from '../../services/center.service';
import { authService } from '../../services/auth.service';
import { toast } from 'react-toastify';

interface BulkGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function BulkGroupModal({ isOpen, onClose, onSuccess }: BulkGroupModalProps) {
    const [centers, setCenters] = useState<Center[]>([]);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [existingGroups, setExistingGroups] = useState<any[]>([]);
    const [isLoadingCenters, setIsLoadingCenters] = useState(false);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedCenterId, setSelectedCenterId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [customerGroupMap, setCustomerGroupMap] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            loadCenters();
            setSelectedCenterId('');
            setCustomerGroupMap({});
            setSearchQuery('');
        }
    }, [isOpen]);

    const loadCenters = async () => {
        setIsLoadingCenters(true);
        try {
            const data = await centerService.getCenters();
            const user = authService.getCurrentUser();
            const isFieldOfficer = authService.hasRole('field_officer');

            let filtered = data.filter((center: Center) => center.status === 'active');
            if (isFieldOfficer && user) {
                filtered = filtered.filter((center: Center) => center.staff_id === user.user_name);
            }
            setCenters(filtered);
        } catch (error) {
            console.error('Failed to load centers:', error);
            toast.error('Failed to load centers');
        } finally {
            setIsLoadingCenters(false);
        }
    };

    useEffect(() => {
        const loadCustomers = async () => {
            if (!selectedCenterId) {
                setAllCustomers([]);
                return;
            }

            setIsLoadingCustomers(true);
            try {
                const customers = await customerService.getCustomers({ center_id: selectedCenterId });
                const unassigned = customers.filter(c => !c.grp_id && c.status === 'active');
                setAllCustomers(unassigned);
                setCustomerGroupMap({});

                const groups = await groupService.getGroupsByCenter(selectedCenterId);
                setExistingGroups(groups);
            } catch (error) {
                console.error('Failed to load customers:', error);
                toast.error('Failed to load customers');
            } finally {
                setIsLoadingCustomers(false);
            }
        };

        if (isOpen && selectedCenterId) {
            loadCustomers();
        }
    }, [selectedCenterId, isOpen]);

    const handleGroupNumberChange = (customerId: string, value: string) => {
        const sanitized = value.replace(/[^0-9a-zA-Z]/g, '').slice(0, 5);
        setCustomerGroupMap(prev => ({
            ...prev,
            [customerId]: sanitized
        }));
    };

    const filteredCustomers = allCustomers.filter(c =>
        c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customer_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group customers by the number entered
    const groupsToCreate: Record<string, string[]> = {};
    Object.entries(customerGroupMap).forEach(([custId, groupNum]) => {
        if (groupNum.trim()) {
            if (!groupsToCreate[groupNum]) {
                groupsToCreate[groupNum] = [];
            }
            groupsToCreate[groupNum].push(custId);
        }
    });

    const groupCounts: Record<string, number> = {};
    Object.values(customerGroupMap).forEach(num => {
        if (num.trim()) {
            groupCounts[num] = (groupCounts[num] || 0) + 1;
        }
    });

    const totalGroups = Object.keys(groupsToCreate).length;

    const getValidationErrors = (customerId: string) => {
        const num = customerGroupMap[customerId];
        if (!num) return null;

        const errors = [];
        const center = centers.find(c => c.id.toString() === selectedCenterId);
        const potentialName = `${center?.center_name || ''} - Group ${num}`.toLowerCase();
        const existingGroup = existingGroups.find(eg => eg.group_name.toLowerCase() === potentialName);

        const existingCount = existingGroup?.customers_count || 0;
        const newCount = groupCounts[num] || 0;
        const totalCount = existingCount + newCount;

        if (totalCount > 3) {
            if (existingCount > 0) {
                errors.push(`Group ${num} already has ${existingCount} members. Cannot add ${newCount} more. (Limit 3)`);
            } else {
                errors.push(`Already has 3 members in this group. Please select another number.`);
            }
        }

        return errors.length > 0 ? errors : null;
    };

    const hasGlobalErrors = Object.keys(groupsToCreate).some(num => {
        const center = centers.find(c => c.id.toString() === selectedCenterId);
        const potentialName = `${center?.center_name || ''} - Group ${num}`.toLowerCase();
        const existingGroup = existingGroups.find(eg => eg.group_name.toLowerCase() === potentialName);
        const totalCount = (existingGroup?.customers_count || 0) + (groupCounts[num] || 0);
        return totalCount > 3;
    });

    const handleSubmit = async () => {
        if (totalGroups === 0) {
            toast.warning('Please assign at least one customer to a group number');
            return;
        }

        if (hasGlobalErrors) {
            toast.error('Please fix the validation errors before submitting');
            return;
        }

        setIsSubmitting(true);
        try {
            const groupsPayload = Object.entries(groupsToCreate).map(([num, ids]) => ({
                group_number: num,
                customer_ids: ids
            }));

            await groupService.bulkCreateGroups(selectedCenterId, groupsPayload);
            toast.success('Groups created successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to create groups:', error);
            toast.error(error.message || 'Failed to create groups');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add Group</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100">Create Multiple Groups</h3>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                                Select a center and assign group numbers to customers. Customers with the same number will be grouped together. (Max 3 members per group)
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 px-1">Select Center *</label>
                        <select
                            value={selectedCenterId}
                            onChange={(e) => setSelectedCenterId(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm appearance-none shadow-sm"
                        >
                            <option value="">Select a Center</option>
                            {centers.map(center => (
                                <option key={center.id} value={center.id}>{center.center_name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedCenterId && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Filter customers..."
                                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                    />
                                </div>
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                                    {filteredCustomers.length} Customers found
                                </span>
                            </div>

                            <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer List</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Group Number</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                        {isLoadingCustomers ? (
                                            <tr>
                                                <td colSpan={2} className="px-6 py-12 text-center">
                                                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                                                    <p className="text-xs text-gray-400 mt-2 font-medium">Loading customers...</p>
                                                </td>
                                            </tr>
                                        ) : filteredCustomers.length > 0 ? (
                                            filteredCustomers.map(customer => {
                                                const errors = getValidationErrors(customer.id.toString());
                                                return (
                                                    <tr key={customer.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{customer.full_name}</p>
                                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">{customer.customer_code}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex justify-end relative">
                                                                <input
                                                                    type="text"
                                                                    value={customerGroupMap[customer.id] || ''}
                                                                    onChange={(e) => handleGroupNumberChange(customer.id.toString(), e.target.value)}
                                                                    placeholder="e.g. 1"
                                                                    className={`w-24 px-3 py-2 bg-white dark:bg-gray-900 border ${errors ? 'border-red-500' : 'border-gray-200'} dark:border-gray-700 rounded-xl text-center text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm`}
                                                                />
                                                                {errors && errors.length > 0 && (
                                                                    <div className="absolute top-full mt-1 right-0 w-max z-20 pointer-events-none">
                                                                        {errors.map((err, i) => (
                                                                            <p key={i} className="text-[10px] text-red-500 font-bold bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-lg border border-red-100 flex items-center gap-1 mb-1">
                                                                                <Info size={10} /> {err}
                                                                            </p>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={2} className="px-6 py-12 text-center text-gray-400">
                                                    <div className="flex flex-col items-center">
                                                        <UserPlus size={32} className="opacity-20 mb-2" />
                                                        <p className="text-sm">No unassigned customers available in this center.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                        <Info size={14} className="text-blue-500" />
                        <span>Same group number creates one group.</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 font-bold text-sm transition-all shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || totalGroups === 0 || hasGlobalErrors}
                            className={`px-8 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 ${totalGroups > 0 && !hasGlobalErrors
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 dark:shadow-none'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-white/70" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Create {totalGroups} Group{totalGroups !== 1 ? 's' : ''}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
