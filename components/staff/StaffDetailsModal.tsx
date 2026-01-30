import { API_BASE_URL } from '../../services/api.config';
import React from 'react';
import {
    X,
    Mail,
    Phone,
    MapPin,
    Calendar,
    User,
    Briefcase,
    Building
} from 'lucide-react';

interface StaffDetailsModalProps {
    staff: any;
    onClose: () => void;
    publicView?: boolean;
}

export function StaffDetailsModal({
    staff,
    onClose,
    publicView = false
}: StaffDetailsModalProps) {
    if (!staff) return null;

    const roleName = (staff.role_name || staff.role || '').toLowerCase();

    // Construct profile image URL
    const profileImageUrl =
        staff.profile_image_url ||
        (staff.profile_image
            ? staff.profile_image.startsWith('http')
                ? staff.profile_image
                : `${API_BASE_URL.replace('/api', '')}/storage/${staff.profile_image}`
            : null);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full shadow-xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-lg z-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Staff Details
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Profile Section */}
                    <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm">
                            {profileImageUrl ? (
                                <img
                                    src={profileImageUrl}
                                    alt={staff.full_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white text-2xl font-bold">
                                    {staff.full_name?.charAt(0) ||
                                        staff.name?.charAt(0) ||
                                        'S'}
                                </span>
                            )}
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {staff.full_name || staff.name}
                            </h3>

                            <div className="flex items-center gap-2 mt-2">
                                <span
                                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${staff.account_status === 'locked' || staff.is_locked
                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                            : staff.account_status === 'active' || staff.is_active
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    {staff.account_status === 'locked' || staff.is_locked
                                        ? 'Locked'
                                        : staff.account_status === 'active' || staff.is_active
                                            ? 'Active'
                                            : 'Inactive'}
                                </span>

                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                                    {staff.role_name || staff.role || 'Staff'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Role */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {staff.role_name || staff.role || 'Staff'}
                                </p>
                            </div>
                        </div>

                        {/* Email */}
                        {(staff.email_id || staff.email) && (
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                                    <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {staff.email_id || staff.email}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Contact Number */}
                        {staff.contact_no && (
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Contact Number
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {staff.contact_no}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* NIC */}
                        {!publicView && staff.nic && (
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                                    <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">NIC</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {staff.nic}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Age & Gender */}
                        {!publicView && (staff.age || staff.gender) && (
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-pink-50 dark:bg-pink-900/30 rounded-lg">
                                    <User className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Age & Gender
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {staff.age && `${staff.age} years`}
                                        {staff.gender && ` • ${staff.gender}`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Branch */}
                        {!(
                            roleName === 'admin' ||
                            roleName === 'super_admin' ||
                            roleName === 'administrator'
                        ) &&
                            (staff.branch_id || staff.branch) && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                        <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Branch
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {staff.branch?.branch_name ||
                                                staff.branch?.name ||
                                                (typeof staff.branch === 'string'
                                                    ? staff.branch
                                                    : '') ||
                                                `Branch ${staff.branch_id || ''}`}
                                        </p>
                                    </div>
                                </div>
                            )}

                        {/* Centers */}
                        {staff.centers && staff.centers.length > 0 && (
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                                    <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Assigned Centers
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {staff.centers.map((center: any) => (
                                            <span
                                                key={center.id}
                                                className="inline-flex items-center px-2 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs font-medium rounded"
                                            >
                                                {center.center_name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Address */}
                    {!publicView && staff.address && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                                    <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        Address
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {staff.address}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Work Info - FINAL MERGED LOGIC */}
                    {!publicView &&
                        (staff.department ||
                            (staff.work_info &&
                                (staff.work_info.designation ||
                                    staff.work_info.department))) && (
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                                        <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            Employment & Role
                                        </p>
                                        <div className="text-sm text-gray-900 dark:text-gray-100">
                                            <div className="grid grid-cols-2 gap-2">
                                                {staff.department && (
                                                    <p>
                                                        <span className="font-semibold">
                                                            Department:
                                                        </span>{' '}
                                                        {staff.department}
                                                    </p>
                                                )}
                                                {staff.employee_type && (
                                                    <p>
                                                        <span className="font-semibold">
                                                            Type:
                                                        </span>{' '}
                                                        {staff.employee_type}
                                                    </p>
                                                )}
                                                {staff.joining_date && (
                                                    <p>
                                                        <span className="font-semibold">
                                                            Joined:
                                                        </span>{' '}
                                                        {new Date(
                                                            staff.joining_date
                                                        ).toLocaleDateString()}
                                                    </p>
                                                )}
                                                {staff.work_info?.designation && (
                                                    <p>
                                                        <span className="font-semibold">
                                                            Designation:
                                                        </span>{' '}
                                                        {staff.work_info.designation}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    {/* Experience Info */}
                    {staff.experience_info && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg">
                                    <Briefcase className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-bold">
                                        Work Experience
                                    </p>
                                    <div className="space-y-3 mt-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            {staff.experience_info.bms_experience && (
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">
                                                        BMS Capital Exp.
                                                    </p>
                                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                                        {staff.experience_info.bms_experience}
                                                    </p>
                                                </div>
                                            )}
                                            {staff.experience_info.total_experience && (
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">
                                                        Total Experience
                                                    </p>
                                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                                        {staff.experience_info.total_experience}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {staff.experience_info.previous_company && (
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">
                                                        Previous Company
                                                    </p>
                                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                                        {staff.experience_info.previous_company}
                                                    </p>
                                                </div>
                                            )}
                                            {staff.experience_info.last_designation && (
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">
                                                        Last Designation
                                                    </p>
                                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                                        {staff.experience_info.last_designation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {staff.experience_info.responsibilities && (
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">
                                                    Key Responsibilities
                                                </p>
                                                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap mt-1 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                                    {staff.experience_info.responsibilities}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
