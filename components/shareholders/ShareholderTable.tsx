import React from 'react';
import { Eye, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { Shareholder } from '@/types/shareholder.types';

interface ShareholderTableProps {
    shareholders: Shareholder[];
    onViewDetails: (shareholder: Shareholder) => void;
    onEdit: (shareholder: Shareholder) => void;
    onDelete: (shareholder: Shareholder) => void;
}

export function ShareholderTable({ shareholders, onViewDetails, onEdit, onDelete }: ShareholderTableProps) {
    const total_investment = shareholders.reduce((sum, s) => sum + s.total_investment, 0);
    const totalShares = shareholders.reduce((sum, s) => sum + s.shares, 0);
    const totalPercentage = shareholders.reduce((sum, s) => sum + s.percentage, 0);

    if (shareholders.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">No Shareholders Yet</h3>
                <p className="text-gray-500 text-sm">Add your first shareholder to get started.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Shareholder List</h3>
                <span className="text-sm text-gray-500">{shareholders.length} shareholders</span>
            </div>

            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 uppercase">
                    <div className="col-span-3">Shareholder Name</div>
                    <div className="col-span-2">Investment (LKR)</div>
                    <div className="col-span-2">Shares</div>
                    <div className="col-span-2">Percentage</div>
                    <div className="col-span-3 text-right">Actions</div>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {shareholders.map((shareholder) => (
                    <div key={shareholder.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="grid grid-cols-12 gap-4 items-center">
                            {/* Name */}
                            <div className="col-span-3 flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <span className="text-white text-sm font-semibold">{shareholder.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{shareholder.name}</p>
                                    {shareholder.nic && (
                                        <p className="text-xs text-gray-500">NIC: {shareholder.nic}</p>
                                    )}
                                </div>
                            </div>

                            {/* Investment - THE KEY INPUT FIELD */}
                            <div className="col-span-2">
                                <p className="text-sm font-semibold text-gray-900">
                                    LKR {shareholder.total_investment.toLocaleString()}
                                </p>
                            </div>

                            {/* Shares - Auto Calculated */}
                            <div className="col-span-2">
                                <div className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
                                    <span className="text-sm font-medium">{shareholder.shares}</span>
                                    <span className="text-xs ml-1 text-blue-500">shares</span>
                                </div>
                            </div>

                            {/* Percentage - Auto Calculated */}
                            <div className="col-span-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[60px]">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${shareholder.percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">{shareholder.percentage.toFixed(2)}%</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-3 flex items-center justify-end gap-2">
                                <button
                                    onClick={() => onViewDetails(shareholder)}
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="View Details"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onEdit(shareholder)}
                                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(shareholder)}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer with totals */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 px-6 py-4">
                <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                        <p className="text-sm font-bold text-gray-900">Total ({shareholders.length} shareholders)</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-sm font-bold text-gray-900">LKR {total_investment.toLocaleString()}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-sm font-bold text-blue-600">{totalShares} shares</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-sm font-bold text-indigo-600">{totalPercentage.toFixed(2)}%</p>
                    </div>
                    <div className="col-span-3"></div>
                </div>
            </div>
        </div>
    );
}
