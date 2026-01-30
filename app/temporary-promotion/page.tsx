'use client';

import React, { useState, useEffect } from 'react';
import {
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    UserPlus,
    Users,
    Calendar,
    Building2,
    ShieldCheck,
    ArrowRight,
    Search,
    Filter,
    X,
    ChevronDown,
    RefreshCw,
    Info,
    Zap,
    TrendingUp,
    Award,
    Pen
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
    temporaryPromotionService,
    TemporaryPromotion,
    TemporaryPromotionStats,
    StaffForPromotion,
    RoleOption,
    BranchOption,
    CreateTemporaryPromotionData
} from '../../services/temporaryPromotion.service';
import BMSLoader from '../../components/common/BMSLoader';

type FilterStatus = 'all' | 'Active' | 'Completed' | 'Cancelled';

export default function TemporaryPromotionPage() {
    // State for promotions list
    const [promotions, setPromotions] = useState<TemporaryPromotion[]>([]);
    const [stats, setStats] = useState<TemporaryPromotionStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Filter state
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [staffList, setStaffList] = useState<StaffForPromotion[]>([]);
    const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([]);
    const [branches, setBranches] = useState<BranchOption[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<StaffForPromotion | null>(null);
    const [formData, setFormData] = useState<CreateTemporaryPromotionData>({
        user_id: 0,
        target_role_id: 0,
        target_branch_id: null,
        start_date: '',
        end_date: '',
        reason: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Cancel modal state
    const [cancelModal, setCancelModal] = useState<{ open: boolean; promotion: TemporaryPromotion | null }>({
        open: false,
        promotion: null
    });
    const [completeModal, setCompleteModal] = useState<{ open: boolean; promotion: TemporaryPromotion | null }>({
        open: false,
        promotion: null
    });
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [completing, setCompleting] = useState<number | null>(null);

    // Fetch data on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // ... existing fetchData ...
        try {
            setLoading(true);
            const [promotionsData, statsData, staffData, branchesData] = await Promise.all([
                temporaryPromotionService.getAll(),
                temporaryPromotionService.getStats(),
                temporaryPromotionService.getAvailableStaff(),
                temporaryPromotionService.getBranches()
            ]);
            setPromotions(promotionsData);
            setStats(statsData);
            setStaffList(staffData);
            setBranches(branchesData);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load temporary promotions');
        } finally {
            setLoading(false);
        }
    };

    // ... (rest of the file until handleComplete) ...

    // Handle Complete (Open Modal)
    const handleComplete = (promotion: TemporaryPromotion) => {
        setCompleteModal({ open: true, promotion });
    };

    // Confirm Complete (Action)
    const confirmComplete = async () => {
        if (!completeModal.promotion) return;

        try {
            setCompleting(completeModal.promotion.id);
            await temporaryPromotionService.complete(completeModal.promotion.id);
            toast.success('Temporary promotion marked as completed');
            setCompleteModal({ open: false, promotion: null });
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to complete promotion');
        } finally {
            setCompleting(null);
        }
    };

    // Handle staff selection
    const handleStaffSelect = async (staffId: string) => {
        const staff = staffList.find(s => s.staff_id === staffId);
        if (staff) {
            setSelectedStaff(staff);
            setFormData(prev => ({
                ...prev,
                user_id: staff.user_id,
                target_role_id: 0,
                target_branch_id: null
            }));

            // Fetch available roles
            try {
                const roles = await temporaryPromotionService.getAvailableRoles();
                setAvailableRoles(roles);
            } catch (error) {
                console.error('Error fetching roles:', error);
                toast.error('Failed to load available roles');
            }
        }
    };

    // Handle Edit
    const handleEdit = (promotion: TemporaryPromotion) => {
        setEditId(promotion.id);

        // Construct staff object
        const staff: StaffForPromotion = {
            staff_id: promotion.staff_id,
            staff_name: promotion.staff_name,
            user_id: promotion.user_id,
            branch_id: promotion.original_branch_id,
            branch_name: promotion.original_branch_name,
            current_role_id: promotion.original_role_id,
            current_role_name: promotion.original_role_name,
            current_role_hierarchy: 0, // Mocked
            has_active_temp_promotion: true
        };

        // Ensure staff is in the list locally for this render
        setStaffList(prev => {
            if (prev.find(s => s.staff_id === staff.staff_id)) return prev;
            return [...prev, staff];
        });

        setSelectedStaff(staff);

        // Pre-fill form
        setFormData({
            user_id: promotion.user_id,
            target_role_id: promotion.target_role_id,
            target_branch_id: promotion.target_branch_id,
            start_date: formatDateForInput(promotion.start_date),
            end_date: formatDateForInput(promotion.end_date),
            reason: promotion.reason
        });

        // Mock available roles (include current target role)
        const currentTargetRole: RoleOption = {
            id: promotion.target_role_id,
            name: promotion.target_role_name,
            display_name: promotion.target_role_name,
            level: '',
            hierarchy: 0
        };
        setAvailableRoles([currentTargetRole]);

        setShowForm(true);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.user_id || !formData.target_role_id) {
            toast.error('Please select a staff member and target role');
            return;
        }

        if (!formData.start_date || !formData.end_date) {
            toast.error('Please specify start and end dates');
            return;
        }

        if (formData.reason.length < 10) {
            toast.error('Reason must be at least 10 characters');
            return;
        }

        try {
            setSubmitting(true);

            if (editId) {
                await temporaryPromotionService.update(editId, formData);
                toast.success('Temporary promotion updated successfully');
            } else {
                await temporaryPromotionService.create(formData);
                toast.success('Temporary promotion assigned successfully');
            }

            setShowForm(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            toast.error(error.message || `Failed to ${editId ? 'update' : 'assign'} temporary promotion`);
        } finally {
            setSubmitting(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setEditId(null);
        setSelectedStaff(null);
        setAvailableRoles([]);
        setFormData({
            user_id: 0,
            target_role_id: 0,
            target_branch_id: null,
            start_date: '',
            end_date: '',
            reason: ''
        });
    };

    // Handle cancel
    const handleCancel = async () => {
        if (!cancelModal.promotion || cancelReason.length < 5) {
            toast.error('Please provide a reason for cancellation');
            return;
        }

        try {
            setCancelling(true);
            await temporaryPromotionService.cancel(cancelModal.promotion.id, cancelReason);
            toast.success('Temporary promotion cancelled');
            setCancelModal({ open: false, promotion: null });
            setCancelReason('');
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to cancel promotion');
        } finally {
            setCancelling(false);
        }
    };



    // Filter promotions
    const filteredPromotions = promotions.filter(p => {
        if (filterStatus !== 'all' && p.status !== filterStatus) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                p.staff_name.toLowerCase().includes(query) ||
                p.staff_id.toLowerCase().includes(query) ||
                p.target_role_name.toLowerCase().includes(query)
            );
        }
        return true;
    });

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Active':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                    </span>
                );
            case 'Completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                    </span>
                );
            case 'Cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                        <XCircle className="w-3.5 h-3.5" />
                        Cancelled
                    </span>
                );
            default:
                return null;
        }
    };

    // Calculate days remaining
    const getDaysRemaining = (endDate: string) => {
        const end = new Date(endDate);
        const today = new Date();
        const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    // Get today's date for min date
    const getTodayString = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Helper to format date for input (YYYY-MM-DD)
    const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';

        // If it already looks like YYYY-MM-DD, just return the first 10 chars
        const match = dateString.match(/^(\d{4}-\d{2}-\d{2})/);
        if (match) return match[1];

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (e) {
            return '';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <BMSLoader message="Loading temporary promotions..." size="large" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50 dark:bg-gray-900/50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Temporary Promotion
                            </h1>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                <Building2 className="w-4 h-4" />
                                <span>MICROFINANCE MANAGEMENT</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">System Time</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <UserPlus className="w-5 h-5" />
                        New Assignment
                    </button>
                </div>
            </div>

            {/* Stats Overview - Premium Minimalist Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 border border-slate-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                    ACTIVE
                                </div>
                                <div className="text-4xl font-black text-slate-900 dark:text-white">
                                    {stats.currently_active}
                                </div>
                            </div>
                            {stats.expiring_soon > 0 && (
                                <div className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-lg border border-amber-100 dark:border-amber-800/30">
                                    {stats.expiring_soon} EXPIRING
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 border border-slate-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                COMPLETED
                            </div>
                            <div className="text-4xl font-black text-slate-900 dark:text-white">
                                {stats.completed}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 border border-slate-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                CANCELLED
                            </div>
                            <div className="text-4xl font-black text-slate-900 dark:text-white">
                                {stats.cancelled}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 border border-slate-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                                <Award className="w-3.5 h-3.5 text-blue-500" />
                                TOTAL
                            </div>
                            <div className="text-4xl font-black text-slate-900 dark:text-white">
                                {stats.total}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column - IN FOCUS Section (Card View) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                            IN FOCUS
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {promotions.filter(p => p.status === 'Active').slice(0, 3).map((promotion) => (
                            <div
                                key={promotion.id}
                                className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 rounded-[28px] p-6 text-white shadow-xl shadow-indigo-200/50 dark:shadow-none transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4">
                                    <Award className="w-32 h-32 rotate-12" />
                                </div>

                                <div className="relative flex flex-col h-full justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-bold border border-white/30">
                                            {promotion.staff_name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest opacity-80">
                                            ENDS {new Date(promotion.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="text-2xl font-bold tracking-tight mb-1">{promotion.staff_name}</h3>
                                        <div className="flex items-center gap-2 text-indigo-50/80 font-medium text-sm">
                                            <span>{promotion.original_role_name}</span>
                                            <ArrowRight className="w-3 h-3" />
                                            <span className="text-white font-bold">{promotion.target_role_name}</span>
                                        </div>
                                        {promotion.target_branch_name && (
                                            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-60">
                                                <Building2 className="w-3 h-3" />
                                                {promotion.target_branch_name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {promotions.filter(p => p.status === 'Active').length === 0 && (
                            <div className="p-12 border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-[28px] text-center space-y-3">
                                <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 dark:bg-gray-800 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-slate-300" />
                                </div>
                                <p className="text-sm font-medium text-slate-400">No active promotions in focus</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - MANAGEMENT BOARD Section (List View) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            {/* <Filter className="w-3.5 h-3.5" />
                            MANAGEMENT BOARD */}
                        </h2>

                        <div className="flex items-center bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm">
                            {(['all', 'Active', 'Completed'] as FilterStatus[]).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-slate-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        {/* Search Bar within Board */}
                        <div className="p-6 border-b border-slate-50 dark:border-gray-700/50">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or role..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-6 py-3.5 bg-slate-50 dark:bg-gray-900/50 border-none rounded-2xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Board Content */}
                        <div className="divide-y divide-slate-50 dark:divide-gray-700/50">
                            {filteredPromotions.length === 0 ? (
                                <div className="py-20 text-center space-y-4">
                                    <div className="mx-auto w-16 h-16 rounded-full bg-slate-50 dark:bg-gray-900/50 flex items-center justify-center">
                                        <TrendingUp className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <p className="text-slate-400 font-medium">No results match your filters</p>
                                </div>
                            ) : (
                                filteredPromotions.map((promotion) => (
                                    <div
                                        key={promotion.id}
                                        className="group p-6 hover:bg-slate-50/50 dark:hover:bg-gray-900/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-base font-bold text-slate-900 dark:text-white">
                                                        {promotion.staff_name}
                                                    </span>
                                                    {getStatusBadge(promotion.status)}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                    <span>{promotion.target_role_name}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span>{formatDate(promotion.start_date)} - {formatDate(promotion.end_date)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {promotion.status === 'Active' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleComplete(promotion)}
                                                        disabled={completing === promotion.id}
                                                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-2"
                                                    >
                                                        {completing === promotion.id ? '...' : 'FINALIZE'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(promotion)}
                                                        className="p-2.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                                                        title="Edit Assignment"
                                                    >
                                                        <Pen className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setCancelModal({ open: true, promotion })}
                                                        className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                                                        title="Cancel Assignment"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="px-4 py-2 bg-slate-50 dark:bg-gray-900/50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                                    ARCHIVED
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Assignment/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-50 dark:border-gray-700 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {editId ? 'Modify Assignment' : 'New Assignment'}
                                </h2>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
                                    Assign temporary role elevating privileges
                                </p>
                            </div>
                            <button
                                onClick={() => { setShowForm(false); resetForm(); }}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Staff Selection */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        STAFF MEMBER
                                    </label>
                                    <select
                                        value={selectedStaff?.staff_id || ''}
                                        onChange={(e) => handleStaffSelect(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-gray-900/50 border border-slate-100 dark:border-gray-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50 text-slate-900 dark:text-white"
                                        required
                                        disabled={!!editId}
                                    >
                                        <option value="">Select a staff member...</option>
                                        {staffList
                                            .filter(s => !s.has_active_temp_promotion || (selectedStaff?.staff_id === s.staff_id))
                                            .map((staff) => (
                                                <option key={staff.staff_id} value={staff.staff_id}>
                                                    {staff.staff_name} ({staff.staff_id})
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                {/* Current Role (Read Only) */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        CURRENT ROLE
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedStaff?.current_role_name || 'N/A'}
                                        disabled
                                        className="w-full px-5 py-3.5 bg-slate-100 dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-2xl text-sm font-medium text-slate-500 dark:text-slate-400 select-none cursor-not-allowed"
                                        readOnly
                                    />
                                </div>

                                {/* Target Role */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        TARGET ROLE
                                    </label>
                                    <select
                                        value={formData.target_role_id || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, target_role_id: Number(e.target.value) }))}
                                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-gray-900/50 border border-slate-100 dark:border-gray-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50 text-slate-900 dark:text-white"
                                        disabled={!selectedStaff}
                                        required
                                    >
                                        <option value="">Select role...</option>
                                        {availableRoles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.display_name || role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Target Branch (Optional) */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        TARGET BRANCH <span className="text-slate-300 normal-case tracking-normal font-medium">(Optional)</span>
                                    </label>
                                    <select
                                        value={formData.target_branch_id || ''}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            target_branch_id: e.target.value ? Number(e.target.value) : null
                                        }))}
                                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-gray-900/50 border border-slate-100 dark:border-gray-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-white"
                                    >
                                        <option value="">Keep current branch</option>
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name} ({branch.branch_code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Start Date */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        START DATE
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                        min={editId ? undefined : getTodayString()}
                                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-gray-900/50 border border-slate-100 dark:border-gray-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-white"
                                        required
                                    />
                                </div>

                                {/* End Date */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        END DATE
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                        min={formData.start_date || (editId ? undefined : getTodayString())}
                                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-gray-900/50 border border-slate-100 dark:border-gray-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-white"
                                        required
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        REASON FOR ASSIGNMENT
                                    </label>
                                    <textarea
                                        value={formData.reason}
                                        onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                        rows={3}
                                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-gray-900/50 border border-slate-100 dark:border-gray-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none text-slate-900 dark:text-white"
                                        placeholder="Briefly explain the need for this temporary role elevation..."
                                        required
                                        minLength={10}
                                    />
                                </div>
                            </div>
                        </form>

                        <div className="p-8 border-t border-slate-50 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/20 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); resetForm(); }}
                                className="px-6 py-3 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:text-slate-800 transition-all"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={(e) => handleSubmit(e as any)}
                                disabled={submitting || !selectedStaff || !formData.target_role_id}
                                className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
                            >
                                {submitting ? 'PROCESSING...' : (editId ? 'UPDATE ASSIGNMENT' : 'CONFIRM ASSIGNMENT')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal - Simplified Premium Design */}
            {cancelModal.open && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-2xl w-full max-w-md p-8 text-center space-y-6">
                        <div className="mx-auto w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-rose-500" />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Cancel Assignment?</h3>
                            <p className="text-sm text-slate-500 font-medium mt-2">
                                Terminating the temporary role for {cancelModal.promotion?.staff_name}. This action is irreversible.
                            </p>
                        </div>

                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                CANCELLATION REASON
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={2}
                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-gray-900/50 border border-slate-100 dark:border-gray-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 transition-all resize-none text-slate-900 dark:text-white"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleCancel}
                                disabled={cancelling || cancelReason.length < 5}
                                className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-rose-200 dark:shadow-none"
                            >
                                {cancelling ? 'CANCELLING...' : 'CONFIRM TERMINATION'}
                            </button>
                            <button
                                onClick={() => setCancelModal({ open: false, promotion: null })}
                                className="w-full py-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-800 transition-all"
                            >
                                GO BACK
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Complete Confirmation Modal */}
            {completeModal.open && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-2xl w-full max-w-md p-8 text-center space-y-6">
                        <div className="mx-auto w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Finalize Promotion?</h3>
                            <p className="text-sm text-slate-500 font-medium mt-2">
                                Are you sure you want to mark the temporary promotion for <span className="text-slate-900 dark:text-white font-bold">{completeModal.promotion?.staff_name}</span> as Completed?
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={confirmComplete}
                                disabled={!!completing}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-emerald-200 dark:shadow-none"
                            >
                                {completing ? 'FINALIZING...' : 'CONFIRM COMPLETION'}
                            </button>
                            <button
                                onClick={() => setCompleteModal({ open: false, promotion: null })}
                                className="w-full py-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-800 transition-all"
                            >
                                GO BACK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
