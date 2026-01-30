'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Building, MapPin, Users, Filter, X, Eye, Phone, Mail } from 'lucide-react';
import { User } from '../../types/staff.types';
import { Branch } from '../../types/branch.types';
import { Center } from '../../types/center.types';
import { staffService } from '../../services/staff.service';
import { branchService } from '../../services/branch.service';
import { centerService } from '../../services/center.service';
import { StaffDetailsModal } from './StaffDetailsModal';
import BMSLoader from '@/components/common/BMSLoader';

export function StaffDirectory() {
    const [users, setUsers] = useState<User[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [centers, setCenters] = useState<Center[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStaffUser, setSelectedStaffUser] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [selectedCenterId, setSelectedCenterId] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [usersData, branchesData, centersData] = await Promise.all([
                staffService.getUsers('staff', { ignore_hierarchy: 'true' }), // Get all staff users
                branchService.getBranchesAll(),
                centerService.getCenters()
            ]);

            const adminsData = await staffService.getUsers('admins', { ignore_hierarchy: 'true' });

            // Merge and dedup by ID
            const allUsers = [...usersData, ...adminsData].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

            setUsers(allUsers);
            setBranches((branchesData || []).filter(b => b.status === 'active' || !b.status));
            setCenters((centersData || []).filter(c => c.status === 'active'));
        } catch (error) {
            console.error('Failed to load directory data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter Logic
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            // Exclude Super Admin role from the directory
            const role = (user.roleName || user.role || '').toLowerCase();
            if (role === 'super_admin' || role === 'super admin') return false;

            // 1. Search Query (Name, Email, StaffID)
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                (user.name?.toLowerCase() || '').includes(query) ||
                (user.email?.toLowerCase() || '').includes(query) ||
                (user.staffId?.toLowerCase() || '').includes(query);

            if (!matchesSearch) return false;

            // 2. Branch Filter
            if (selectedBranchId) {
                // user.branchId might be number or string
                if (String(user.branchId) !== String(selectedBranchId)) return false;
            }

            // 3. Center Filter
            if (selectedCenterId) {
                const center = centers.find(c => String(c.id) === String(selectedCenterId));
                if (center) {
                    // Check if this user is the staff assigned to this center
                    if (String(center.staff_id) !== String(user.staffId)) return false;
                }
            }

            // 4. Status Filter (Only Active)
            if (user.status !== 'Active') return false;

            return true;
        });
    }, [users, searchQuery, selectedBranchId, selectedCenterId, centers]);

    const handleViewDetails = async (user: User) => {
        if (user.staffId) {
            try {
                const details = await staffService.getStaffDetails(user.staffId);
                if (details) {
                    setSelectedStaffUser(details);
                    setIsDetailsOpen(true);
                    return;
                }
            } catch (error) {
                console.error("Failed to fetch staff details", error);
            }
        }

        // Fallback for admins or if staff fetch fails
        setSelectedStaffUser({
            ...user,
            full_name: user.name,
            role_name: user.roleName || user.role,
            is_active: user.status === 'Active',
            is_locked: user.is_locked
        });
        setIsDetailsOpen(true);
    };

    // Derived lists for dropdowns
    const filteredCenters = useMemo(() => {
        if (!selectedBranchId) return centers;
        return centers.filter(c => String(c.branch_id) === String(selectedBranchId));
    }, [centers, selectedBranchId]);

    // Helper to find assigned center name nicely
    const getAssignedCenterInfo = (user: User) => {
        const assignedCenters = centers.filter(c => String(c.staff_id) === String(user.staffId));
        if (assignedCenters.length > 0) {
            return assignedCenters.length === 1
                ? assignedCenters[0].center_name
                : `${assignedCenters.length} Centers`;
        }
        return '-';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Staff Directory</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Browse and view details of all staff members across branches.
                    </p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative col-span-1 md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900/50 dark:text-white"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Branch Select */}
                    <div>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                                value={selectedBranchId}
                                onChange={(e) => {
                                    setSelectedBranchId(e.target.value);
                                    setSelectedCenterId(''); // Reset center when branch changes
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900/50 dark:text-white appearance-none"
                            >
                                <option value="">All Branches</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.branch_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Center Select */}
                    <div>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                                value={selectedCenterId}
                                onChange={(e) => setSelectedCenterId(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900/50 dark:text-white appearance-none"
                            >
                                <option value="">All Centers</option>
                                {filteredCenters.map(center => (
                                    <option key={center.id} value={center.id}>
                                        {center.center_name} ({center.CSU_id})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* List View Table */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <BMSLoader message="Loading staff directory..." size="xsmall" />
                </div>
            ) : filteredUsers.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold">
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Branch / Center</th>
                                    <th className="px-6 py-4">Contacts</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredUsers.map(user => {
                                    const centerInfo = getAssignedCenterInfo(user);

                                    return (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${!user.avatar ? (user.status === 'Active' ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white') : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                        {user.avatar ? (
                                                            <img
                                                                src={user.avatar}
                                                                alt={user.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    // Fallback if image fails to load
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                    (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="font-bold text-sm">${user.name.charAt(0)}</span>`;
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="font-bold text-sm">{user.name.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                                            {user.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-md">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                                        <Building className="w-3.5 h-3.5 text-gray-400" />
                                                        {user.branch || '-'}
                                                    </span>
                                                    {centerInfo !== '-' && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 pt-0.5">
                                                            <MapPin className="w-3 h-3 text-gray-400" />
                                                            {centerInfo}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="truncate max-w-[150px]" title={user.email}>{user.email}</span>
                                                    </div>
                                                    {user.phone && user.phone !== 'N/A' && (
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                            <span>{user.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.status === 'Active'
                                                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                                                        }`} />
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleViewDetails(user)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors shadow-sm"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer (Simple version for list view) */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Showing <span className="font-medium text-gray-900 dark:text-gray-100">{filteredUsers.length}</span> entries
                        </p>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No staff found</h3>
                    <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters to see more results.</p>
                </div>
            )}

            {/* Read-Only Details Modal */}
            {selectedStaffUser && (
                <StaffDetailsModal
                    staff={selectedStaffUser}
                    publicView={true}
                    onClose={() => {
                        setIsDetailsOpen(false);
                        setSelectedStaffUser(null);
                    }}
                />
            )}
        </div>
    );
}
