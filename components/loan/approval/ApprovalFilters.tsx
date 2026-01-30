import React from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';

interface ApprovalFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterStatus: string;
    onStatusChange: (value: string) => void;
}

export const ApprovalFilters: React.FC<ApprovalFiltersProps> = ({
    searchTerm,
    onSearchChange,
    filterStatus,
    onStatusChange
}) => {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-5">
                {/* Search Bar */}
                <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by contract no, customer name, or NIC..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                    />
                </div>

                {/* Status Filter */}
                <div className="md:w-64 relative group/select">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Filter className="w-4 h-4 text-gray-400 group-focus-within/select:text-blue-500 transition-colors" />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className={`w-full pl-11 pr-10 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-semibold appearance-none cursor-pointer ${filterStatus !== 'all' ? 'border-blue-100 text-blue-900 font-bold' : 'border-gray-100 text-gray-500'}`}
                    >
                        <option value="all">All Pending</option>
                        <option value="Pending 1st">Pending 1st Approval</option>
                        <option value="Pending 2nd">Pending 2nd Approval</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};
