'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Eraser, AlertCircle } from 'lucide-react';
import { LeaveRequestFormData } from '@/types/leave.types';
import { toast } from 'react-toastify';
import Holidays from 'date-holidays';

interface LeaveRequestModalProps {
    onClose: () => void;
    onSubmit: (data: LeaveRequestFormData) => Promise<void>;
}

interface ValidationErrors {
    dates?: string;
    reason?: string;
    leaveType?: string;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ onClose, onSubmit }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [formData, setFormData] = useState<Partial<LeaveRequestFormData>>({
        leaveType: 'Annual Leave',
        dayType: 'Full Day',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<{ reason?: boolean; dates?: boolean }>({});

    // Initialize Sri Lankan holidays using date-holidays library
    const hd = useMemo(() => {
        const holidays = new Holidays('LK'); // LK = Sri Lanka
        return holidays;
    }, []);

    // Get holidays for current year and next year
    const sriLankanHolidays = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const thisYearHolidays = hd.getHolidays(currentYear) || [];
        const nextYearHolidays = hd.getHolidays(currentYear + 1) || [];
        return [...thisYearHolidays, ...nextYearHolidays];
    }, [hd]);

    // Helpers
    const isWeekend = (date: Date) => {
        const day = date.getDay();
        return day === 0 || day === 6; // Sunday or Saturday
    };

    const getHoliday = (date: Date) => {
        const dateStr = formatDate(date);
        return sriLankanHolidays.find(h => h.date.startsWith(dateStr));
    };

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Real-time validation
    const validate = (): ValidationErrors => {
        const newErrors: ValidationErrors = {};

        if (selectedDates.length === 0) {
            newErrors.dates = 'Please select at least one date';
        }

        if (!formData.reason || formData.reason.trim().length < 3) {
            newErrors.reason = 'Reason must be at least 3 characters';
        }

        if (formData.leaveType === 'Annual Leave' && selectedDates.length > 0) {
            const sorted = [...selectedDates].sort();
            const firstDate = new Date(sorted[0]);
            firstDate.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Calculate difference in full calendar days
            const diffInTime = firstDate.getTime() - today.getTime();
            const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));

            if (diffInDays < 2) {
                newErrors.dates = 'Annual leave must be requested at least 2 days in advance (Earliest allowed: ' +
                    new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ')';
            }
        }

        return newErrors;
    };

    // Run validation whenever form data changes
    useEffect(() => {
        const newErrors = validate();
        setErrors(newErrors);
    }, [selectedDates, formData.reason, formData.leaveType]);

    const toggleDate = (date: Date) => {
        const holiday = getHoliday(date);
        if (isWeekend(date)) {
            toast.warn("Weekends cannot be selected");
            return;
        }
        if (holiday) {
            toast.warn(`${holiday.name} is a public holiday`);
            return;
        }
        if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
            toast.warn("Cannot select past dates");
            return;
        }

        const dateStr = formatDate(date);
        setSelectedDates(prev =>
            prev.includes(dateStr)
                ? prev.filter(d => d !== dateStr)
                : [...prev, dateStr]
        );
        setTouched(prev => ({ ...prev, dates: true }));
    };

    const handleBulkSelect = (type: 'week' | '2weeks' | 'month') => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        let daysToSelect = 0;
        if (type === 'week') daysToSelect = 7;
        else if (type === '2weeks') daysToSelect = 14;
        else if (type === 'month') daysToSelect = 30;

        const newDates = new Set([...selectedDates]);
        for (let i = 0; i < daysToSelect; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            if (!isWeekend(d) && !getHoliday(d)) {
                newDates.add(formatDate(d));
            }
        }
        setSelectedDates(Array.from(newDates));
        setTouched(prev => ({ ...prev, dates: true }));
    };

    const clearSelection = () => {
        setSelectedDates([]);
        setTouched(prev => ({ ...prev, dates: true }));
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        const days = [];
        for (let i = 0; i < (firstDay === 0 ? 0 : firstDay); i++) {
            days.push(null);
        }
        for (let i = 1; i <= lastDay; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({ ...formData, reason: e.target.value });
        setTouched(prev => ({ ...prev, reason: true }));
    };

    const renderCalendar = () => {
        const days = getDaysInMonth(currentMonth);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return (
            <div className="bg-gray-50 dark:bg-gray-900/20 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">
                        {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h4>
                    <div className="flex gap-1">
                        <button
                            type="button"
                            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                            className="p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                            className="p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                    {dayNames.map(d => (
                        <div key={d} className="text-[10px] font-bold text-gray-400 uppercase py-1">{d}</div>
                    ))}
                    {days.map((day, i) => {
                        if (!day) return <div key={`empty-${i}`} className="h-9" />;

                        const isSelected = selectedDates.includes(formatDate(day));
                        const weekend = isWeekend(day);
                        const holiday = getHoliday(day);
                        const isToday = formatDate(day) === formatDate(new Date());
                        const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                        // Disable Jan 11 and Jan 12 if leaveType is Annual Leave and today is Jan 11
                        let isRestricted = false;
                        if (formData.leaveType === 'Annual Leave') {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const checkDate = new Date(day);
                            checkDate.setHours(0, 0, 0, 0);
                            const diffDays = Math.floor((checkDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            if (diffDays < 2 && diffDays >= 0) {
                                isRestricted = true;
                            }
                        }

                        return (
                            <button
                                key={day.getTime()}
                                type="button"
                                disabled={weekend || isPast || !!holiday || isRestricted}
                                onClick={() => toggleDate(day)}
                                title={holiday ? holiday.name : weekend ? 'Weekend' : isRestricted ? 'Annual leave requires 2 days notice' : undefined}
                                className={`
                                    h-9 rounded-lg text-sm flex items-center justify-center transition-all relative group
                                    ${weekend ? 'bg-red-50/50 dark:bg-red-900/10 text-red-300 cursor-not-allowed opacity-50' :
                                        holiday ? 'bg-orange-50/50 dark:bg-orange-900/10 text-orange-400 cursor-not-allowed border-dashed border border-orange-200' :
                                            isRestricted ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 cursor-not-allowed opacity-50' :
                                                isPast ? 'text-gray-300 cursor-not-allowed opacity-50' :
                                                    isSelected ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-200 dark:shadow-none scale-105 z-10' :
                                                        'hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'}
                                    ${isToday && !isSelected ? 'border-2 border-blue-500 text-blue-600 font-bold' : ''}
                                `}
                            >
                                {day.getDate()}
                                {holiday && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full border border-white dark:border-gray-800 shadow-sm" />
                                )}
                                {isToday && !isSelected && (
                                    <span className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full" />
                                )}
                                {holiday && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20">
                                        {holiday.name}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        setTouched({ reason: true, dates: true });

        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const sortedDates = [...selectedDates].sort();
            await onSubmit({
                ...formData,
                leaveDates: sortedDates,
                startDate: sortedDates[0],
                endDate: sortedDates[sortedDates.length - 1],
                totalDays: sortedDates.length,
            } as LeaveRequestFormData);
            onClose();
        } catch (error) {
            console.error("Failed to submit leave request", error);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = Object.keys(errors).length === 0 && selectedDates.length > 0 && (formData.reason?.trim().length || 0) >= 3;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/5">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-3">
                            <span className="p-2 bg-blue-600 rounded-xl text-white">
                                <CalendarIcon className="w-6 h-6" />
                            </span>
                            Request Leave
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 ml-11">Sri Lankan public holidays are automatically disabled</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all group">
                        <X className="w-6 h-6 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Left Column: Calendar & Fast Select */}
                        <div className="space-y-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Select Dates</label>
                                    <button
                                        type="button"
                                        onClick={clearSelection}
                                        className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                                    >
                                        <Eraser className="w-3 h-3" />
                                        Clear Selection
                                    </button>
                                </div>
                                {renderCalendar()}

                                {/* Real-time date validation error */}
                                {touched.dates && errors.dates && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-100 dark:border-red-800">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {errors.dates}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Bulk Selection</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'week', label: '1 Week', icon: '📅' },
                                        { id: '2weeks', label: '2 Weeks', icon: '🗓️' },
                                        { id: 'month', label: '1 Month', icon: '🚀' }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => handleBulkSelect(opt.id as any)}
                                            className="px-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all flex flex-col items-center gap-1"
                                        >
                                            <span className="text-lg">{opt.icon}</span>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Settings & Reason */}
                        <div className="space-y-8">
                            {/* Selected Summary */}
                            <div className={`rounded-[1.5rem] p-6 text-white shadow-xl transition-all ${selectedDates.length > 0 ? 'bg-blue-600 shadow-blue-500/20' : 'bg-gray-400 shadow-gray-300/20'
                                }`}>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">Selection Summary</span>
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                        {formData.dayType}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black">{selectedDates.length}</span>
                                    <span className="text-lg font-bold opacity-80">{selectedDates.length === 1 ? 'Working Day' : 'Working Days'}</span>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2 max-h-24 overflow-y-auto scrollbar-none">
                                    {selectedDates.sort().map(d => {
                                        const [year, month, day] = d.split('-');
                                        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                        const displayDate = `${day} ${monthNames[parseInt(month) - 1]}`;
                                        return (
                                            <span key={d} className="bg-white/10 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                                                {displayDate}
                                            </span>
                                        );
                                    })}
                                    {selectedDates.length === 0 && <span className="text-sm opacity-50 italic">No dates selected yet...</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Leave Type</label>
                                    <select
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                                        value={formData.leaveType}
                                        onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                    >
                                        <option>Annual Leave</option>
                                        <option>Sick Leave</option>
                                        <option>Casual Leave</option>
                                        <option>Maternity Leave</option>
                                        <option>Unpaid Leave</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Day Format</label>
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
                                        {['Full Day', 'Half Day'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, dayType: type as any })}
                                                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${formData.dayType === type
                                                    ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Reason</label>
                                <textarea
                                    required
                                    rows={4}
                                    className={`w-full px-5 py-4 border rounded-2xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm transition-all ${touched.reason && errors.reason
                                        ? 'border-red-400 dark:border-red-600'
                                        : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    placeholder="Tell us why you need this leave..."
                                    value={formData.reason}
                                    onChange={handleReasonChange}
                                ></textarea>

                                {/* Real-time reason validation error */}
                                {touched.reason && errors.reason && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {errors.reason}
                                    </div>
                                )}

                                {/* Character counter */}
                                <div className="text-right text-xs text-gray-400">
                                    {formData.reason?.length || 0} / 500 characters
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/20 flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-4 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-white dark:hover:bg-gray-800 transition-all"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !isFormValid}
                        className="flex-[2] px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Submit Selection
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
