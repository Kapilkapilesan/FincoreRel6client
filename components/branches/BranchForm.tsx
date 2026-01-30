'use client'
import React, { useEffect, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Branch, BranchFormData } from '../../types/branch.types';
import { API_BASE_URL, getHeaders } from '../../services/api.config';
import { customerService } from '../../services/customer.service';

interface BranchFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: BranchFormData) => void;
    initialData?: Branch | null;
}

const defaultFormData: BranchFormData = {
    branch_id: '',
    branch_code: '', // 2-letter code
    branch_name: '',
    address: '',
    district: '',
    province: '',
    postal_code: '',
    phone: '',
    email: '',
    manager_id: '',
    status: 'active'
};

export function BranchForm({ isOpen, onClose, onSave, initialData }: BranchFormProps) {
    const [formData, setFormData] = useState<BranchFormData>(defaultFormData);
    const [managers, setManagers] = useState<{ staff_id: string; full_name: string; branch?: { branch_name: string } }[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [constants, setConstants] = useState<any>(null);
    const [filteredDistricts, setFilteredDistricts] = useState<string[]>([]);

    useEffect(() => {
        const fetchConstants = async () => {
            try {
                const data = await customerService.getConstants();
                setConstants(data);
                if (initialData?.province && data?.province_districts_map) {
                    setFilteredDistricts(data.province_districts_map[initialData.province] || []);
                }
            } catch (error) {
                console.error("Failed to fetch constants", error);
            }
        };

        const fetchManagers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/staffs/by-role/manager`, {
                    headers: getHeaders()
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.data) {
                        setManagers(result.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch managers", error);
            }
        };

        if (isOpen) {
            fetchConstants();
            fetchManagers();
        }

        if (initialData) {
            setFormData({
                branch_id: initialData.branch_id,
                branch_code: initialData.branch_code || '',
                branch_name: initialData.branch_name,
                address: initialData.address || '',
                district: initialData.district || '',
                province: initialData.province || '',
                postal_code: initialData.postal_code || '',
                phone: initialData.phone || '',
                email: initialData.email || '',
                manager_id: initialData.manager_id || '',
                status: initialData.status || 'active'
            });
        } else {
            setFormData(defaultFormData);
        }
    }, [initialData, isOpen]);

    useEffect(() => {
        if (formData.province && constants?.province_districts_map) {
            setFilteredDistricts(constants.province_districts_map[formData.province] || []);
        } else {
            setFilteredDistricts([]);
        }
    }, [formData.province, constants]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.branch_name.trim()) {
            newErrors.branch_name = 'Branch name is required';
        } else if (formData.branch_name.length > 100) {
            newErrors.branch_name = 'Branch name is too long. Please keep it under 100 characters.';
        }

        if (!formData.branch_code.trim()) {
            newErrors.branch_code = 'Branch code is required';
        } else if (!/^[A-Z]{2}$/.test(formData.branch_code.toUpperCase())) {
            newErrors.branch_code = 'Branch code must be exactly 2 letters (A-Z)';
        }

        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.district.trim()) newErrors.district = 'District is required';
        if (!formData.province.trim()) newErrors.province = 'Province is required';
        if (!formData.postal_code.trim()) newErrors.postal_code = 'Postal code is required';

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^(?:\+94|0)?\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Invalid phone format (e.g., 0771234567 or +94771234567)';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        if (!formData.manager_id) newErrors.manager_id = 'Branch manager is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const hasChanges = !initialData || Object.keys(formData).some(key => {
        // We now track manager_id changes as valid changes
        const currentVal = formData[key as keyof BranchFormData];
        const initialVal = initialData[key as keyof Branch];

        return (currentVal || '') !== (initialVal || '');
    });

    const handleSubmit = () => {
        if (validate()) {
            onSave(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">
                            {initialData ? 'Edit Branch' : 'Add New Branch'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Branch Code & Name */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="block font-semibold text-gray-900 mb-2 text-sm">Branch Code *</label>
                            <input
                                type="text"
                                value={formData.branch_code}
                                onChange={(e) => {
                                    const val = e.target.value.toUpperCase().slice(0, 2).replace(/[^A-Z]/g, '');
                                    setFormData({ ...formData, branch_code: val });
                                }}
                                disabled={!!initialData}
                                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${errors.branch_code ? 'border-red-500' : 'border-gray-300'} ${initialData ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                placeholder="CN"
                                maxLength={2}
                            />
                            {errors.branch_code && <p className="text-red-500 text-xs mt-1">{errors.branch_code}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="block font-semibold text-gray-900 mb-2 text-sm">Branch Name *</label>
                            <input
                                type="text"
                                value={formData.branch_name}
                                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${errors.branch_name ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Enter branch name"
                            />
                            {errors.branch_name && <p className="text-red-500 text-xs mt-1">{errors.branch_name}</p>}
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block font-semibold text-gray-900 mb-2 text-sm">Address *</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter address"
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>

                    {/* Province & District */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block font-semibold text-gray-900 text-sm">Province *</label>
                            <div className="relative">
                                <select
                                    value={formData.province}
                                    onChange={(e) => setFormData({ ...formData, province: e.target.value, district: '' })}
                                    className={`w-full pl-4 pr-10 py-2.5 bg-white border ${errors.province ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm text-gray-900 appearance-none cursor-pointer`}
                                >
                                    <option value="">Select Province</option>
                                    {constants?.provinces?.map((p: string) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block font-semibold text-gray-900 text-sm">District *</label>
                            <div className="relative">
                                <select
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    className={`w-full pl-4 pr-10 py-2.5 bg-white border ${errors.district ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm text-gray-900 appearance-none cursor-pointer`}
                                    disabled={!formData.province}
                                >
                                    <option value="">Select District</option>
                                    {filteredDistricts.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                        </div>
                    </div>

                    {/* Postal Code & Phone */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-gray-900 mb-2 text-sm">Postal Code *</label>
                            <input
                                type="text"
                                value={formData.postal_code}
                                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${errors.postal_code ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Enter postal code"
                            />
                            {errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-900 mb-2 text-sm">Phone *</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="+94 XX XXX XXXX"
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                    </div>

                    {/* Email & Manager */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-gray-900 mb-2 text-sm">Email *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="branch@lms.lk"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-900 mb-2 text-sm">Branch Manager *</label>
                            <div className="relative">
                                <select
                                    value={formData.manager_id}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            manager_id: e.target.value
                                        });
                                    }}
                                    className={`w-full pl-4 pr-10 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white appearance-none cursor-pointer ${errors.manager_id ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">Select Manager</option>
                                    {managers.length > 0 ? (
                                        managers.map((manager) => (
                                            <option key={manager.staff_id} value={manager.staff_id}>
                                                {manager.full_name} ({manager.staff_id})
                                                {manager.branch?.branch_name ? ` - Member of ${manager.branch.branch_name}` : ''}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No managers found</option>
                                    )}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            {errors.manager_id && <p className="text-red-500 text-xs mt-1">{errors.manager_id}</p>}
                            {formData.manager_id && managers.find(m => m.staff_id === formData.manager_id)?.branch &&
                                managers.find(m => m.staff_id === formData.manager_id)?.branch?.branch_name !== initialData?.branch_name && (
                                    <p className="text-amber-600 text-[11px] mt-1.5 flex items-center gap-1 bg-amber-50 p-2 rounded-lg border border-amber-100 italic">
                                        <span>⚠️ This manager will be automatically transferred from <strong>{managers.find(m => m.staff_id === formData.manager_id)?.branch?.branch_name}</strong> to this branch.</span>
                                    </p>
                                )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex gap-3 justify-end bg-gray-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-white transition-colors font-semibold text-sm text-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!hasChanges}
                        className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${!hasChanges
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-500/20'
                            }`}
                    >
                        {initialData ? 'Update Branch' : 'Add Branch'}
                    </button>
                </div>
            </div>
        </div>
    );
}
