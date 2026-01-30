'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Check, Users, Loader2, UserPlus } from 'lucide-react';
import { Customer } from '../../types/customer.types';
import { Center } from '../../types/center.types';
import { customerService } from '../../services/customer.service';
import { toast } from 'react-toastify';

interface AssignCustomersModalProps {
    isOpen: boolean;
    onClose: () => void;
    center: Center;
    onAssignSuccess: () => void;
}

export function AssignCustomersModal({ isOpen, onClose, center, onAssignSuccess }: AssignCustomersModalProps) {
    const [unassignedCustomers, setUnassignedCustomers] = useState<Customer[]>([]);
    const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadUnassignedCustomers();
            setSelectedCustomers([]);
            setSearchQuery('');
        }
    }, [isOpen]);

    const loadUnassignedCustomers = async () => {
        setIsLoading(true);
        try {
            // Fetch only LOAD CUSTOMERS without center assignment
            const customers = await customerService.getCustomers({
                unassigned_only: true,
                customer_type: 'Loan Customer'
            });
            setUnassignedCustomers(customers);
        } catch (error) {
            console.error('Failed to load unassigned customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleCustomer = (customer: Customer) => {
        const isSelected = selectedCustomers.find(c => c.id === customer.id);
        if (isSelected) {
            setSelectedCustomers(selectedCustomers.filter(c => c.id !== customer.id));
        } else {
            setSelectedCustomers([...selectedCustomers, customer]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedCustomers.length === filteredCustomers.length) {
            setSelectedCustomers([]);
        } else {
            setSelectedCustomers([...filteredCustomers]);
        }
    };

    const handleAssign = async () => {
        if (selectedCustomers.length === 0) {
            toast.warning('Please select at least one customer');
            return;
        }

        setIsSubmitting(true);
        try {
            const customerIds = selectedCustomers.map(c => c.id.toString());
            await customerService.bulkAssignToCenter(customerIds, center.id);

            toast.success(`Successfully assigned ${selectedCustomers.length} customer(s) to ${center.center_name}`);
            onAssignSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to assign customers:', error);
            toast.error(error.message || 'Failed to assign customers');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredCustomers = unassignedCustomers.filter(c =>
        c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customer_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <UserPlus className="w-6 h-6 text-blue-600" />
                                Assign Customers to Center
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Center: <span className="font-semibold text-blue-600 dark:text-blue-400">{center.center_name}</span>
                                {center.CSU_id && <span className="ml-2 text-gray-500">({center.CSU_id})</span>}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X size={20} className="text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Search and Select All */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Unassigned Customers
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold py-1.5 px-3 rounded-lg ${selectedCustomers.length > 0
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                    {selectedCustomers.length} selected
                                </span>
                                {filteredCustomers.length > 0 && (
                                    <button
                                        onClick={toggleSelectAll}
                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                    >
                                        {selectedCustomers.length === filteredCustomers.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or customer code..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Customer List */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        {isLoading ? (
                            <div className="p-12 flex flex-col items-center justify-center space-y-3">
                                <Loader2 size={32} className="animate-spin text-blue-500" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Loading customers...</p>
                            </div>
                        ) : filteredCustomers.length > 0 ? (
                            <div className="max-h-[350px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredCustomers.map((customer) => {
                                    const isSelected = selectedCustomers.find(c => c.id === customer.id);

                                    return (
                                        <div
                                            key={customer.id}
                                            onClick={() => toggleCustomer(customer)}
                                            className={`p-4 flex items-center justify-between cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${isSelected
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                    }`}>
                                                    {customer.full_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                        {customer.full_name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                                            {customer.customer_code}
                                                        </p>
                                                    </div>
                                                    {customer.branch && (
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                            Branch: {typeof customer.branch === 'string' ? customer.branch : customer.branch.branch_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 ml-3">
                                                {isSelected ? (
                                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                                                        <Check size={14} className="text-white" strokeWidth={3} />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {searchQuery ? 'No customers found matching your search.' : 'No unassigned customers available.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={selectedCustomers.length === 0 || isSubmitting}
                        className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all font-semibold text-sm shadow-lg shadow-blue-200 dark:shadow-blue-900/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            <>
                                <UserPlus size={16} />
                                Assign {selectedCustomers.length > 0 ? `(${selectedCustomers.length})` : 'Customers'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
