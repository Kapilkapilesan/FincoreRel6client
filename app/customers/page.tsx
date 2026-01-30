"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, Filter, Upload, UserPlus, MapPin, Building, Briefcase } from 'lucide-react';
import { Customer, CustomerStats } from '../../types/customer.types';
import { customerService } from '../../services/customer.service';
import { CustomerStatsCard } from '../../components/customers/CustomerStats';
import { CustomerTable } from '../../components/customers/CustomerTable';
import { CustomerDetailsModal } from '../../components/customers/CustomerDetailsModal';
import { CustomerForm } from '../../components/customers/CustomerForm';
import { CustomerProfilePanel } from '../../components/customers/CustomerProfilePanel';
import { CenterAssignmentModal } from '../../components/customers/CenterAssignmentModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { toast } from 'react-toastify';
import { authService } from '../../services/auth.service';
import { useRouter } from 'next/navigation';
import BMSLoader from '../../components/common/BMSLoader';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'active' | 'blocked'>('All');
    const [filterBranch, setFilterBranch] = useState<string>('All');
    const [filterCenter, setFilterCenter] = useState<string>('All');
    const [filterGroup, setFilterGroup] = useState<string>('All');
    const [constants, setConstants] = useState<any>(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Confirmation States
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [importing, setImporting] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [pendingAction, setPendingAction] = useState<{
        customer: Customer | null;
        newStatus?: string;
    }>({ customer: null });

    const router = useRouter();

    const [hasAccess, setHasAccess] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAccess = () => {
            const hasViewPermission = authService.hasPermission('customers.view');
            const isSuperAdmin = authService.hasRole('super_admin');

            if (!hasViewPermission && !isSuperAdmin) {
                toast.error('You do not have permission to view customers');
                router.push('/');
                return false;
            }
            return true;
        };

        if (typeof window !== 'undefined') {
            const allowed = checkAccess();
            setHasAccess(allowed);
            if (allowed) loadCustomers();
        }
    }, [router]);

    // Stats
    const [stats, setStats] = useState<CustomerStats>({
        totalCustomers: 0,
        activeCustomers: 0,
        customersWithLoans: 0,
        newThisMonth: 0
    });

    useEffect(() => {
        applyFilters();
    }, [customers, searchTerm, filterStatus, filterBranch, filterCenter, filterGroup]);

    useEffect(() => {
        loadConstants();
    }, []);

    const loadConstants = async () => {
        try {
            const data = await customerService.getConstants();
            setConstants(data);
        } catch (error) {
            console.error('Failed to load constants');
        }
    };

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const data = await customerService.getCustomers();
            setCustomers(data);

            // Calculate real stats from data
            const activeCount = data.filter(c => c.status === 'active').length;
            const withLoansCount = data.filter(c => (Number(c.active_loans_count) || 0) > 0).length;
            const pendingCount = data.filter(c => c.edit_request_status === 'pending').length;

            // Calculate new this month
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const newThisMonthCount = data.filter(c => {
                if (!c.created_at) return false;
                const createdDate = new Date(c.created_at);
                return createdDate >= firstDayOfMonth;
            }).length;

            setStats({
                totalCustomers: data.length,
                activeCustomers: activeCount,
                customersWithLoans: withLoansCount,
                newThisMonth: newThisMonthCount,
                pendingRequestsCount: pendingCount
            } as any);
        } catch (error) {
            console.error('Failed to load customers', error);
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = customers;

        // Search filter
        if (searchTerm) {
            const query = searchTerm.trim().toLowerCase();
            filtered = filtered.filter(customer =>
                customer.full_name.toLowerCase().includes(query) ||
                customer.customer_code.toLowerCase().includes(query) ||
                customer.mobile_no_1.includes(searchTerm.trim())
            );
        }

        // Status filter
        if (filterStatus !== 'All') {
            filtered = filtered.filter(customer => customer.status === filterStatus);
        }

        // Branch filter
        if (filterBranch !== 'All') {
            if (filterBranch === 'unassigned') {
                filtered = filtered.filter(customer => !customer.branch_id);
            } else {
                filtered = filtered.filter(customer => customer.branch_id?.toString() === filterBranch);
            }
        }

        // Center filter
        if (filterCenter !== 'All') {
            if (filterCenter === 'unassigned') {
                filtered = filtered.filter(customer => !customer.center_id);
            } else {
                filtered = filtered.filter(customer => customer.center_id?.toString() === filterCenter);
            }
        }

        // Group filter
        if (filterGroup !== 'All') {
            if (filterGroup === 'unassigned') {
                filtered = filtered.filter(customer => !customer.grp_id);
            } else {
                filtered = filtered.filter(customer => customer.grp_id?.toString() === filterGroup);
            }
        }

        setFilteredCustomers(filtered);
    };

    const handleViewDetails = (customer: Customer) => {
        if (selectedCustomer?.id === customer.id) {
            setSelectedCustomer(null);
        } else {
            setSelectedCustomer(customer);
        }
    };


    const handleViewFullDetails = () => {
        setShowDetailsModal(true);
    };

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowEditModal(true);
    };

    const handleDelete = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        setPendingAction({ customer: customer || null });
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!pendingAction.customer) return;
        try {
            await customerService.deleteCustomer(pendingAction.customer.id);
            toast.success('Customer deleted successfully');
            loadCustomers();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete customer');
        } finally {
            setShowDeleteConfirm(false);
            setPendingAction({ customer: null });
        }
    };

    const handleStatusChange = (customer: Customer, newStatus: string) => {
        setPendingAction({ customer, newStatus });
        setShowStatusConfirm(true);
    };

    const confirmStatusChange = async () => {
        if (!pendingAction.customer || !pendingAction.newStatus) return;
        const { customer, newStatus } = pendingAction;

        // 🔒 Group Validation (Final Guard)
        if (newStatus !== 'active' && (customer.grp_id || customer.group?.id)) {
            toast.error('Cannot block customer while assigned to a group. Remove from group first.');
            setShowStatusConfirm(false);
            return;
        }

        try {
            await customerService.updateCustomer(customer.id, { status: newStatus as any });
            toast.success(`Customer ${newStatus === 'blocked' ? 'disabled' : 'enabled'} successfully`);
            loadCustomers();
        } catch (error: any) {
            toast.error(error.message || `Failed to update customer status`);
        } finally {
            setShowStatusConfirm(false);
            setPendingAction({ customer: null });
        }
    };

    const handleSaveCustomer = async (data: any) => {
        if (showEditModal && selectedCustomer) {
            // Update
            return await customerService.updateCustomer(selectedCustomer.id, data);
        } else {
            // Create
            return await customerService.createCustomer(data);
        }
    };

    const handleOpenAddModal = () => {
        setSelectedCustomer(null); // Clear selection to prevent accidents
        setShowAddModal(true);
    };

    const handleFormClose = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedCustomer(null);
        loadCustomers();
    };

    const handleExport = async () => {
        try {
            await customerService.exportCustomers();
            toast.success('Customers exported successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to export customers');
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.name.endsWith('.csv')) {
            toast.error('Please upload a valid CSV file');
            return;
        }

        setImporting(true);
        try {
            await customerService.importCustomers(file);
            toast.success('Customers imported successfully');
            loadCustomers();
        } catch (error: any) {
            toast.error(error.message || 'Failed to import customers');
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (hasAccess === false) return null;

    if (hasAccess === null || loading) {
        return (
            <div className="p-12 text-center flex flex-col items-center">
                <BMSLoader message="Loading customers..." size="xsmall" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customer List</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track all customer information</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".csv"
                        className="hidden"
                    />
                    {authService.hasPermission('customers.view') && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={importing}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm font-medium text-sm disabled:opacity-50"
                        >
                            <Upload className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span>{importing ? 'Importing...' : 'Import CSV'}</span>
                        </button>
                    )}
                    {authService.hasPermission('customers.view') && (
                        <button
                            onClick={handleExport}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm font-medium text-sm"
                        >
                            <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span>Export CSV</span>
                        </button>
                    )}
                    {authService.hasPermission('customers.edit') && (
                        <button
                            onClick={() => setShowAssignModal(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 text-blue-700 dark:text-blue-400 px-4 py-2.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all font-bold text-sm"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Add to Center</span>
                        </button>
                    )}
                    {authService.hasPermission('customers.create') && (
                        <button
                            onClick={handleOpenAddModal}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 dark:shadow-none font-medium text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Customer</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Statistics */}
            <CustomerStatsCard
                stats={stats}
                pendingRequestsCount={(stats as any).pendingRequestsCount}
            />

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search customers by name, NIC, or mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-xl px-3 bg-gray-50 dark:bg-gray-700 transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
                            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as 'All' | 'active' | 'blocked')}
                                className="bg-transparent border-none text-sm py-2.5 focus:outline-none text-gray-700 dark:text-gray-200"
                            >
                                <option value="All">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="blocked">Blocked</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-xl px-3 bg-gray-50 dark:bg-gray-700 transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
                            <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <select
                                value={filterBranch}
                                onChange={(e) => setFilterBranch(e.target.value)}
                                className="bg-transparent border-none text-sm py-2.5 focus:outline-none text-gray-700 dark:text-gray-200"
                            >
                                <option value="All">All Branches</option>
                                <option value="unassigned">Unassigned</option>
                                {constants?.branches?.map((b: any) => (
                                    <option key={b.id} value={b.id.toString()}>{b.branch_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-xl px-3 bg-gray-50 dark:bg-gray-700 transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
                            <Building className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <select
                                value={filterCenter}
                                onChange={(e) => setFilterCenter(e.target.value)}
                                className="bg-transparent border-none text-sm py-2.5 focus:outline-none text-gray-700 dark:text-gray-200"
                            >
                                <option value="All">All Centers</option>
                                <option value="unassigned">Unassigned</option>
                                {constants?.centers?.filter((c: any) => filterBranch === 'All' || c.branch_id?.toString() === filterBranch).map((c: any) => (
                                    <option key={c.id} value={c.id.toString()}>{c.center_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-xl px-3 bg-gray-50 dark:bg-gray-700 transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
                            <Briefcase className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <select
                                value={filterGroup}
                                onChange={(e) => setFilterGroup(e.target.value)}
                                className="bg-transparent border-none text-sm py-2.5 focus:outline-none text-gray-700 dark:text-gray-200"
                            >
                                <option value="All">All Groups</option>
                                <option value="unassigned">Unassigned</option>
                                {constants?.groups?.filter((g: any) => filterCenter === 'All' || g.center_id?.toString() === filterCenter).map((g: any) => (
                                    <option key={g.id} value={g.id.toString()}>{g.group_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Customer Table */}
                <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <BMSLoader message="Loading customers..." size="xsmall" />
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500 dark:text-gray-400">No customers found</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                            >
                                Add your first customer
                            </button>
                        </div>
                    ) : (
                        <CustomerTable
                            customers={filteredCustomers}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                            onViewDetails={handleViewDetails}
                            selectedCustomer={selectedCustomer}
                        />
                    )}
                </div>

                {/* Side Panel */}
                {selectedCustomer && (
                    <div className="w-full lg:w-[400px] flex-shrink-0">
                        <CustomerProfilePanel
                            customer={selectedCustomer}
                            onClose={() => setSelectedCustomer(null)}
                            onEdit={handleEdit}
                            onViewFullDetails={handleViewFullDetails}
                            onStatusChange={handleStatusChange}
                        />
                    </div>
                )}
            </div>

            {/* Modals */}
            {showDetailsModal && selectedCustomer && (
                <CustomerDetailsModal
                    customer={selectedCustomer}
                    onClose={() => {
                        setShowDetailsModal(false);
                        // Do NOT clear selectedCustomer, so panel stays open? 
                        // Or if panel is open, modal is overlay? 
                        // If modal closes, panel should remain? 
                        // Yes.
                    }}
                />
            )}

            {showAddModal && (
                <CustomerForm
                    onClose={handleFormClose}
                    onSubmit={handleSaveCustomer}
                />
            )}

            {showEditModal && selectedCustomer && (
                <CustomerForm
                    onClose={handleFormClose}
                    onSubmit={handleSaveCustomer}
                    initialData={selectedCustomer}
                />
            )}

            {showAssignModal && (
                <CenterAssignmentModal
                    onClose={() => setShowAssignModal(false)}
                    onSuccess={() => {
                        setShowAssignModal(false);
                        loadCustomers();
                    }}
                />
            )}

            {/* Confirmation Dialogs */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Customer Profile"
                message={`Are you sure you want to permanently delete ${pendingAction.customer?.full_name}'s profile? This action cannot be undone.`}
                confirmText="Permanently Delete"
                cancelText="Cancel"
                variant="danger"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />

            <ConfirmDialog
                isOpen={showStatusConfirm}
                title={pendingAction.newStatus === 'blocked' ? 'Disable Customer' : 'Activate Customer'}
                message={`Are you sure you want to ${pendingAction.newStatus === 'blocked' ? 'disable' : 'enable'} ${pendingAction.customer?.full_name}? ${pendingAction.newStatus === 'blocked' ? 'They will no longer be eligible for new transactions.' : 'They will be able to perform transactions again.'}`}
                confirmText={pendingAction.newStatus === 'blocked' ? 'Yes, Disable' : 'Yes, Activate'}
                cancelText="Cancel"
                variant={pendingAction.newStatus === 'blocked' ? 'warning' : 'info'}
                onConfirm={confirmStatusChange}
                onCancel={() => setShowStatusConfirm(false)}
            />
        </div>
    );
}
