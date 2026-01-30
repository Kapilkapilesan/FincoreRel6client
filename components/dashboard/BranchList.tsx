'use client'

import { Building2, MapPin, Phone, Users } from 'lucide-react';
import { BranchSummary } from '@/types/dashboard.types';
import { colors } from '@/themes/colors';

interface BranchListProps {
    branches: BranchSummary[];
    onBranchClick: (branchId: number) => void;
    searchQuery: string;
}

export default function BranchList({ branches, onBranchClick, searchQuery }: BranchListProps) {
    // Filter branches based on search query
    const filteredBranches = branches.filter(branch =>
        branch.branch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.branch_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.manager_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBranches.map((branch) => (
                <div
                    key={branch.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="p-3 rounded-lg transition-colors"
                                style={{ backgroundColor: colors.primary[50] }}
                            >
                                <Building2
                                    className="w-6 h-6"
                                    style={{ color: colors.primary[600] }}
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {branch.branch_name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Branch Code: {branch.branch_code}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">Manager:</span>
                            <span>{branch.manager_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>{branch.location}</span>
                        </div>
                        {branch.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="w-4 h-4" />
                                <span>{branch.phone}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex gap-4 text-sm">
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Staff: </span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {branch.total_staff}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Pending: </span>
                                <span className="font-semibold text-orange-600 dark:text-orange-400">
                                    {branch.pending_requests_count}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => onBranchClick(branch.id)}
                            className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-all transform active:scale-95"
                            style={{
                                background: `linear-gradient(to right, ${colors.primary[600]}, ${colors.primary[700]})`,
                                boxShadow: `0 4px 6px -1px ${colors.primary[500]}33`
                            }}
                        >
                            View Performance
                        </button>
                    </div>
                </div>
            ))}

            {filteredBranches.length === 0 && (
                <div className="col-span-2 text-center py-12">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                        No branches found matching your search.
                    </p>
                </div>
            )}
        </div>
    );
}
