'use client'

import React, { useState } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { DuePayment } from './DueListTable';
import { dueListService } from '@/services/dueList.service';

interface ExtendDueDateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    payment: DuePayment | null;
    originalDate: string;
}

export function ExtendDueDateModal({
    isOpen,
    onClose,
    onSuccess,
    payment,
    originalDate,
}: ExtendDueDateModalProps) {
    const [newDate, setNewDate] = useState('');
    const [reason, setReason] = useState('');
    const [actionType, setActionType] = useState<'move' | 'skip'>('skip');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !payment) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!reason.trim()) {
            setError('Please provide a reason for the extension');
            return;
        }

        try {
            setIsLoading(true);
            await dueListService.extendDueDate(
                payment.id,
                originalDate,
                null, // No newDate for skip
                reason,
                'skip'
            );
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to skip due date');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Skip Due Date</h3>
                        <p className="text-xs text-gray-500 mt-1">
                            {payment.customer} - {payment.contractNo}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Info Alert */}
                    <div className="border rounded-lg p-3 flex items-start gap-3 bg-rose-50 border-rose-100">
                        <Calendar className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                        <div>
                            <p className="text-sm font-medium text-rose-900">
                                Skipping Due Date
                            </p>
                            <p className="text-sm text-rose-700">
                                Payment for {new Date(originalDate).toLocaleDateString()} will be waived and moved to the end of the term.
                            </p>
                            <p className="text-xs text-rose-600 mt-1 font-medium">
                                No penalty will be applied. Loan term will extend by one cycle.
                            </p>
                        </div>
                    </div>

                    {/* Reason Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason for Skipping
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please explain why the due date is being skipped..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-lg text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center bg-rose-600 hover:bg-rose-700"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Confirm Skip'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
