'use client';

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    DollarSign,
    History,
    Send,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    ChevronRight,
    User,
    Briefcase,
    Calendar,
    ArrowUpRight,
    FileText,
    Lightbulb
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
    promotionService,
    salaryIncrementService,
    Role,
    PromotionRequest,
    SalaryIncrementRequest
} from '../../services/promotion.service';
import { authService, User as AuthUser } from '../../services/auth.service';
import { colors } from '@/themes/colors';

type TabType = 'promotion' | 'salary-increment';

export default function StaffPromotionPage() {
    const [activeTab, setActiveTab] = useState<TabType>('promotion');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);

    // Promotion state
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [currentRole, setCurrentRole] = useState<Role | null>(null);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [promotionReason, setPromotionReason] = useState('');
    const [promotionHistory, setPromotionHistory] = useState<PromotionRequest[]>([]);
    const [showPromotionHistory, setShowPromotionHistory] = useState(false);

    // Salary Increment state
    const [currentSalary, setCurrentSalary] = useState<number>(0);
    const [joiningDate, setJoiningDate] = useState<string | null>(null);
    const [currentRoleDisplay, setCurrentRoleDisplay] = useState<string>('');
    const [department, setDepartment] = useState<string>('');
    const [requestedAmount, setRequestedAmount] = useState<string>('');
    const [incrementReason, setIncrementReason] = useState('');
    const [incrementHistory, setIncrementHistory] = useState<SalaryIncrementRequest[]>([]);
    const [showIncrementHistory, setShowIncrementHistory] = useState(false);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        fetchCurrentSalary();
        if (activeTab === 'promotion') {
            fetchAvailableRoles();
        }
    }, [activeTab]);

    const fetchAvailableRoles = async () => {
        try {
            setLoading(true);
            const { roles, current_role } = await promotionService.getAvailableRoles();
            setAvailableRoles(roles);
            setCurrentRole(current_role);
        } catch (error) {
            console.error('Error fetching roles:', error);
            // toast.error('Failed to load available roles');
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentSalary = async () => {
        try {
            setLoading(true);
            const data = await salaryIncrementService.getCurrentSalary();
            setCurrentSalary(data.current_salary);
            setJoiningDate(data.joining_date);
            setCurrentRoleDisplay(data.role_display || '');
            setDepartment(data.department || '');
        } catch (error) {
            console.error('Error fetching salary:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPromotionHistory = async () => {
        try {
            setLoading(true);
            const history = await promotionService.getMyHistory();
            setPromotionHistory(history);
            setShowPromotionHistory(true);
        } catch (error) {
            console.error('Error fetching promotion history:', error);
            toast.error('Failed to load promotion history');
        } finally {
            setLoading(false);
        }
    };

    const fetchIncrementHistory = async () => {
        try {
            setLoading(true);
            const history = await salaryIncrementService.getMyHistory();
            setIncrementHistory(history);
            setShowIncrementHistory(true);
        } catch (error) {
            console.error('Error fetching increment history:', error);
            toast.error('Failed to load increment history');
        } finally {
            setLoading(false);
        }
    };

    const handlePromotionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedRoleId) {
            toast.error('Please select a role to request promotion');
            return;
        }

        if (promotionReason.length < 10) {
            toast.error('Please provide a detailed reason (at least 10 characters)');
            return;
        }

        try {
            setLoading(true);
            await promotionService.createRequest({
                requested_role_id: selectedRoleId,
                reason: promotionReason
            });
            toast.success('Promotion request submitted successfully!');
            setSelectedRoleId(null);
            setPromotionReason('');
            fetchAvailableRoles();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to submit promotion request';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleIncrementSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const amount = parseFloat(requestedAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid increment amount');
            return;
        }

        if (incrementReason.length < 10) {
            toast.error('Please provide a detailed reason (at least 10 characters)');
            return;
        }

        try {
            setLoading(true);
            await salaryIncrementService.createRequest({
                requested_amount: amount,
                reason: incrementReason
            });
            toast.success('Salary increment request submitted successfully!');
            setRequestedAmount('');
            setIncrementReason('');
            fetchCurrentSalary();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to submit increment request';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                        <Clock className="w-3 h-3" /> Pending
                    </span>
                );
            case 'Approved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                    </span>
                );
            case 'Rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 ring-1 ring-rose-200">
                        <XCircle className="w-3 h-3" /> Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-700 ring-1 ring-gray-200">
                        {status}
                    </span>
                );
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const calculateExperience = (joinDateStr: string | null) => {
        if (!joinDateStr) return 'N/A';
        const joinDate = new Date(joinDateStr);
        const today = new Date();

        let years = today.getFullYear() - joinDate.getFullYear();
        let months = today.getMonth() - joinDate.getMonth();

        if (months < 0 || (months === 0 && today.getDate() < joinDate.getDate())) {
            years--;
            months += 12;
        }

        if (years === 0) {
            return months + (months === 1 ? ' Month' : ' Months');
        }

        if (months === 0) {
            return years + (years === 1 ? ' Year' : ' Years');
        }

        return `${years}.${Math.floor((months / 12) * 10)} Years`;
    };

    return (
        <div
            className="p-8 max-w-6xl mx-auto space-y-8 min-h-screen"
            style={{ backgroundColor: colors.surface.background }}
        >
            {/* Header section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Career & Growth</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage your promotion and salary increment requests</p>
                </div>
                <button
                    onClick={activeTab === 'promotion' ? fetchPromotionHistory : fetchIncrementHistory}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm ring-1 ring-gray-100"
                >
                    <History className="w-4 h-4 text-blue-600" />
                    View History
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: User Info & Tips */}
                <div className="lg:col-span-4 space-y-6">
                    {/* User Profile Card */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-blue-500/5 p-8 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />

                        <div className="relative inline-flex mb-4">
                            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center ring-4 ring-white shadow-lg overflow-hidden transition-transform group-hover:scale-105 duration-500">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-blue-600" />
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-white rounded-full" />
                        </div>

                        <h2 className="text-xl font-extrabold text-gray-900">{user?.name || 'User'}</h2>
                        <p className="text-blue-600 font-bold text-sm uppercase tracking-wider mt-0.5">
                            {department || 'Operations'}
                        </p>

                        <div className="mt-8 pt-8 border-t border-gray-50 space-y-5 text-left">
                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                                    <Briefcase className="w-4.5 h-4.5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Role</p>
                                    <p className="text-sm font-bold text-gray-900">{currentRoleDisplay || 'Staff'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                                    <DollarSign className="w-4.5 h-4.5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base Salary</p>
                                    <p className="text-sm font-bold text-gray-900">{formatCurrency(currentSalary)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                                    <Calendar className="w-4.5 h-4.5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Experience</p>
                                    <p className="text-sm font-bold text-gray-900">{calculateExperience(joiningDate)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Growth Tip Card */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-[1.5rem] p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                            <Lightbulb size={48} className="text-blue-600" />
                        </div>
                        <h4 className="flex items-center gap-2 text-blue-900 font-extrabold text-sm mb-2">
                            <span className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                                <TrendingUp size={14} className="text-blue-600" />
                            </span>
                            Growth Tip
                        </h4>
                        <p className="text-blue-700/80 text-xs leading-relaxed font-medium">
                            {activeTab === 'promotion'
                                ? "Highlight your leadership skills and project successes for promotion requests."
                                : "When requesting an increment, focus on your key performance metrics and extra responsibilities taken."}
                        </p>
                    </div>
                </div>

                {/* Right Column: Dynamic Form */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Navigation Tabs */}
                    <div className="bg-gray-100/50 p-1.5 rounded-2xl flex items-center gap-1 shrink-0 w-max">
                        <button
                            onClick={() => setActiveTab('promotion')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'promotion'
                                ? 'bg-white text-blue-600 shadow-md shadow-blue-500/10'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Promotion
                        </button>
                        <button
                            onClick={() => setActiveTab('salary-increment')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'salary-increment'
                                ? 'bg-white text-blue-600 shadow-md shadow-blue-500/10'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Salary Increment
                        </button>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-blue-500/5 overflow-hidden transition-all">
                        {/* Tab Header Icon */}
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-4 bg-white/50">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${activeTab === 'promotion' ? 'bg-blue-50 text-blue-600 shadow-blue-100' : 'bg-emerald-50 text-emerald-600 shadow-emerald-100'
                                }`}>
                                {activeTab === 'promotion' ? <Briefcase size={22} /> : <ArrowUpRight size={22} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-gray-900">
                                    {activeTab === 'promotion' ? 'Request Promotion' : 'Request Salary Increment'}
                                </h3>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Form Submission</p>
                            </div>
                        </div>

                        <form
                            onSubmit={activeTab === 'promotion' ? handlePromotionSubmit : handleIncrementSubmit}
                            className="p-8 space-y-6"
                        >
                            {activeTab === 'promotion' ? (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Requested Role</label>
                                        <select
                                            value={selectedRoleId || ''}
                                            onChange={(e) => setSelectedRoleId(e.target.value ? parseInt(e.target.value) : null)}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none appearance-none"
                                        >
                                            <option value="">Select Target Role</option>
                                            {availableRoles.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.display_name || role.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Justification / Reason</label>
                                        <textarea
                                            value={promotionReason}
                                            onChange={(e) => setPromotionReason(e.target.value)}
                                            rows={6}
                                            placeholder="Describe your achievements and why you deserve this promotion..."
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none"
                                        />
                                        <div className="flex items-center justify-between mt-2 px-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detailed explanation required</p>
                                            <p className={`text-[10px] font-bold transition-all ${promotionReason.length >= 10 ? 'text-green-500' : 'text-amber-500'}`}>
                                                {promotionReason.length}/10 chars min
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Desired Increment (LKR)</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs.</div>
                                                <input
                                                    type="number"
                                                    value={requestedAmount}
                                                    onChange={(e) => setRequestedAmount(e.target.value)}
                                                    className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        {requestedAmount && !isNaN(parseFloat(requestedAmount)) && (
                                            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex flex-col justify-center">
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Projected New Salary</p>
                                                <p className="text-lg font-extrabold text-emerald-700">
                                                    {formatCurrency(currentSalary + parseFloat(requestedAmount))}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Justification / Reason</label>
                                        <textarea
                                            value={incrementReason}
                                            onChange={(e) => setIncrementReason(e.target.value)}
                                            rows={6}
                                            placeholder="Highlight your exceptional performance and value addition to the company..."
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none"
                                        />
                                        <div className="flex items-center justify-between mt-2 px-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Focus on performance metrics</p>
                                            <p className={`text-[10px] font-bold transition-all ${incrementReason.length >= 10 ? 'text-green-500' : 'text-amber-500'}`}>
                                                {incrementReason.length}/10 chars min
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || (activeTab === 'promotion' && availableRoles.length === 0)}
                                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-extrabold text-sm transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25 ${activeTab === 'promotion'
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                    {activeTab === 'promotion' ? 'Submit Promotion Request' : 'Submit Increment Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* History Modals (Styled for match) */}
            {(showPromotionHistory || showIncrementHistory) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col border border-gray-100">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0">
                            <div>
                                <h3 className="text-2xl font-extrabold text-gray-900">
                                    {showPromotionHistory ? 'Promotion History' : 'Increment History'}
                                </h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Timeline of your requests</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowPromotionHistory(false);
                                    setShowIncrementHistory(false);
                                }}
                                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-center transition-colors group"
                            >
                                <XCircle className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 overflow-y-auto bg-gray-50/30 flex-1">
                            {showPromotionHistory && (
                                <div className="space-y-4">
                                    {promotionHistory.length === 0 ? (
                                        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                                            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No promotion requests found</p>
                                        </div>
                                    ) : (
                                        promotionHistory.map((request) => (
                                            <div key={request.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{request.current_role_name}</span>
                                                            <ChevronRight className="w-3 h-3 text-gray-300" />
                                                            <span className="text-sm font-extrabold text-blue-600">{request.requested_role_name}</span>
                                                        </div>
                                                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                                            {formatDate(request.requested_at)}
                                                        </p>
                                                    </div>
                                                    {getStatusBadge(request.status)}
                                                </div>
                                                <div className="bg-gray-50 rounded-2xl p-4">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                        <FileText size={12} className="text-blue-500" />
                                                        Justification
                                                    </p>
                                                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{request.reason}</p>
                                                </div>
                                                {request.admin_feedback && (
                                                    <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Admin Response</p>
                                                        <p className="text-xs font-bold text-emerald-800">{request.admin_feedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {showIncrementHistory && (
                                <div className="space-y-4">
                                    {incrementHistory.length === 0 ? (
                                        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                                            <DollarSign className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No increment requests found</p>
                                        </div>
                                    ) : (
                                        incrementHistory.map((request) => (
                                            <div key={request.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="space-y-1">
                                                        <span className="text-lg font-extrabold text-emerald-600">+{formatCurrency(request.requested_amount)}</span>
                                                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                                            {formatDate(request.requested_at)}
                                                        </p>
                                                    </div>
                                                    {getStatusBadge(request.status)}
                                                </div>
                                                <div className="bg-gray-50 rounded-2xl p-4">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                        <FileText size={12} className="text-emerald-500" />
                                                        Justification
                                                    </p>
                                                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{request.reason}</p>
                                                </div>
                                                {request.admin_feedback && (
                                                    <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Admin Response</p>
                                                        <p className="text-xs font-bold text-emerald-800">{request.admin_feedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

