'use client';

import React from 'react';
import { Search, Building2, Users2, User, ChevronDown, X } from 'lucide-react';
import { CustomerRecord, LoanFormData } from '@/types/loan.types';
import { Center } from '@/types/center.types';
import { Group } from '@/types/group.types';
import { Staff } from '@/types/staff.types';
import { LoanProduct } from '@/types/loan-product.types';
import { isValidNIC, extractGenderFromNIC } from '@/utils/loan.utils';

interface CustomerSelectionProps {
    formData: LoanFormData;
    centers: Center[];
    groups: Group[];
    filteredCustomers: CustomerRecord[];
    selectedCustomerRecord?: CustomerRecord | null;
    onNicChange: (value: string, isGuardian?: boolean) => void;
    onCenterChange: (value: string) => void;
    onGroupChange: (value: string) => void;
    onCustomerChange: (value: string) => void;
    onFieldChange: (field: keyof LoanFormData, value: string) => void;
    staffs: Staff[];
    loanProducts: LoanProduct[];
    customerActiveLoans?: number[];
    isAutoFilling?: boolean;
    nicError?: string | null;
}

export const CustomerSelection: React.FC<CustomerSelectionProps> = ({
    formData,
    centers,
    groups,
    filteredCustomers,
    selectedCustomerRecord,
    onNicChange,
    onCenterChange,
    onGroupChange,
    onCustomerChange,
    onFieldChange,
    staffs,
    loanProducts,
    customerActiveLoans = [],
    isAutoFilling = false,
    nicError = null,
}) => {
    const selectedProduct = loanProducts.find(p => p.id === Number(formData.loanProduct));
    const isAlreadyTaken = customerActiveLoans.includes(Number(formData.loanProduct));
    const isReloanBlocked = !!(isAlreadyTaken && selectedCustomerRecord?.reloan_eligibility && !selectedCustomerRecord.reloan_eligibility.isEligible);
    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Customer</h2>

            {/* Product Selection Section - NEW REQUIREMENT: FIRST SELECT PRODUCT */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        Select Loan Product *
                    </label>
                    <div className="relative group/select">
                        <select
                            value={formData.loanProduct}
                            onChange={(e) => onFieldChange('loanProduct', e.target.value)}
                            className={`w-full pl-4 pr-10 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-semibold appearance-none cursor-pointer ${formData.loanProduct ? 'border-blue-100 text-blue-900 font-bold' : 'border-gray-100 text-gray-500'}`}
                        >
                            <option value="">Choose a product</option>
                            {loanProducts.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.product_name} {customerActiveLoans.includes(product.id) ? '(Already Active)' : ''}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 group-focus-within/select:text-blue-500">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {isAlreadyTaken && selectedProduct && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping shrink-0" />
                            <p className="text-[11px] font-black text-red-600 uppercase tracking-widest">
                                Active {selectedProduct.product_name} loan detected for this customer.
                            </p>
                        </div>

                        {selectedCustomerRecord?.reloan_eligibility && (
                            <div className="space-y-2.5 pt-3 border-t border-red-200/50">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-red-700 uppercase tracking-widest">
                                        Term Progress: {selectedCustomerRecord.reloan_eligibility.progress}%
                                        ({selectedCustomerRecord.reloan_eligibility.paid_weeks} / {selectedCustomerRecord.reloan_eligibility.total_weeks} Weeks)
                                    </span>
                                    <span className="text-red-600">Min. Target: 70%</span>
                                </div>
                                <div className="w-full bg-red-200/30 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${selectedCustomerRecord.reloan_eligibility.isEligible ? 'bg-green-500' : 'bg-red-500'}`}
                                        style={{ width: `${selectedCustomerRecord.reloan_eligibility.progress}%` }}
                                    ></div>
                                </div>
                                <p className={`text-[10px] font-bold leading-tight ${selectedCustomerRecord.reloan_eligibility.isEligible ? 'text-green-700' : 'text-red-700'}`}>
                                    {selectedCustomerRecord.reloan_eligibility.isEligible
                                        ? `✓ ELIGIBLE FOR RELOAN: Customer has completed ${selectedCustomerRecord.reloan_eligibility.paid_weeks} out of ${selectedCustomerRecord.reloan_eligibility.total_weeks} weeks. The outstanding balance of LKR ${selectedCustomerRecord.reloan_eligibility.balance?.toLocaleString()} will be deducted from the new loan.`
                                        : `⚠ INELIGIBLE FOR RELOAN: Customer has only completed ${selectedCustomerRecord.reloan_eligibility.paid_weeks} weeks (${selectedCustomerRecord.reloan_eligibility.progress}%). A minimum of 70% (${Math.ceil(selectedCustomerRecord.reloan_eligibility.total_weeks! * 0.7)} weeks) must be completed to apply for a reloan.`
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Search and Core Filters Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-8">
                {/* NIC Search - Main Action */}
                <div className="max-w-xl mx-auto">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 text-center">
                        Quick Auto-Fill by NIC
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className={`w-5 h-5 transition-colors ${isAutoFilling ? 'text-blue-500 animate-pulse' : 'text-gray-400 group-focus-within:text-blue-600'}`} />
                        </div>
                        <input
                            type="text"
                            value={formData.nic}
                            onChange={(e) => onNicChange(e.target.value)}
                            placeholder="Type NIC here (e.g. 199XXXXX or 9XXXXXXX)"
                            className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-base font-medium placeholder:text-gray-400 ${nicError ? 'border-red-200 bg-red-50 text-red-900' : 'border-transparent focus:border-blue-500 focus:bg-white'}`}
                        />
                        {isAutoFilling && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                </span>
                            </div>
                        )}
                        {formData.nic && !isAutoFilling && (
                            <button
                                onClick={() => onNicChange('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {nicError ? (
                        <p className="text-xs mt-2 text-red-500 font-bold flex items-center gap-1.5 justify-center">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            {nicError}
                        </p>
                    ) : (
                        <p className="text-[10px] mt-2 text-gray-400 text-center font-medium italic">
                            System will automatically detect Center, Group, and Customer data
                        </p>
                    )}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />

                {/* Manual Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Center Selection */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">
                            <Building2 className="w-3.5 h-3.5 text-blue-600" />
                            Select Center *
                        </label>
                        <div className="relative group/select">
                            <select
                                value={formData.center}
                                onChange={(e) => onCenterChange(e.target.value)}
                                className={`w-full pl-4 pr-10 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-semibold appearance-none cursor-pointer ${formData.center ? 'border-blue-100 text-blue-900 font-bold' : 'border-gray-100 text-gray-500'}`}
                            >
                                <option value="">Choose a center</option>
                                {centers.map((center) => (
                                    <option key={center.id} value={center.id}>
                                        {center.center_name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 group-focus-within/select:text-blue-500">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    {/* Group Selection */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">
                            <Users2 className="w-3.5 h-3.5 text-blue-600" />
                            Select Group *
                        </label>
                        <div className="relative group/select">
                            <select
                                value={formData.group}
                                onChange={(e) => onGroupChange(e.target.value)}
                                className={`w-full pl-4 pr-10 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-semibold appearance-none cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed ${formData.group ? 'border-blue-100 text-blue-900 font-bold' : 'border-gray-100 text-gray-500'}`}
                                disabled={!formData.center}
                            >
                                <option value="">Choose a group</option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.group_name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    {/* Customer Selection */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            Select Customer *
                        </label>
                        <div className="relative group/select">
                            <select
                                value={formData.customer}
                                onChange={(e) => onCustomerChange(e.target.value)}
                                className={`w-full pl-4 pr-10 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-semibold appearance-none cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed ${formData.customer ? 'border-blue-100 text-blue-900 font-bold' : 'border-gray-100 text-gray-500'}`}
                                disabled={!formData.center}
                            >
                                <option value="">{formData.group ? 'Group Members Only' : 'Select from Center'}</option>
                                {filteredCustomers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.displayName}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedCustomerRecord && !isReloanBlocked && (
                <>
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-tight">Customer Profile Preview</h3>
                                <p className="text-[10px] text-blue-500 font-medium">REAL-TIME DATA FROM SYSTEM</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedCustomerRecord.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                Status: {selectedCustomerRecord.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 text-sm">
                            <div className="space-y-1">
                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Customer Name</p>
                                <p className="font-semibold text-gray-900">{selectedCustomerRecord.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">NIC Number</p>
                                <p className="font-semibold text-gray-900">{selectedCustomerRecord.nic}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Gender / Age</p>
                                <p className="font-semibold text-gray-900">{selectedCustomerRecord.gender || 'N/A'} ({selectedCustomerRecord.age ?? 'N/A'} yrs)</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Mobile Number</p>
                                <p className="font-semibold text-gray-900">{selectedCustomerRecord.phone || 'N/A'}</p>
                            </div>

                            <div className="md:col-span-2 p-3 bg-white/50 rounded-lg border border-blue-100/50">
                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1.5">Financial Review</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 italic">Monthly Income</p>
                                        <p className="font-bold text-green-700 tracking-tight">LKR {(selectedCustomerRecord.monthly_income || 0).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 italic">Loan Exposure</p>
                                        <p className="font-bold text-red-700 tracking-tight">LKR {(selectedCustomerRecord.activeLoanAmount || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>


                    <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Assessment</h3>
                        <div className="grid md:grid-cols-2 gap-4 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Income (LKR) *</label>
                                <input
                                    type="number"
                                    value={formData.monthly_income}
                                    onChange={(e) => onFieldChange('monthly_income', e.target.value)}
                                    disabled={isAlreadyTaken && !selectedCustomerRecord.reloan_eligibility?.isEligible}
                                    placeholder="Enter monthly income"
                                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Expenses (LKR) *</label>
                                <input
                                    type="number"
                                    value={formData.monthly_expenses}
                                    onChange={(e) => onFieldChange('monthly_expenses', e.target.value)}
                                    disabled={isAlreadyTaken && !selectedCustomerRecord.reloan_eligibility?.isEligible}
                                    placeholder="Enter monthly expenses"
                                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Guardian Information</h3>
                        <div className="grid md:grid-cols-2 gap-4 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Guardian NIC *</label>
                                <input
                                    type="text"
                                    value={formData.guardian_nic}
                                    onChange={(e) => onNicChange(e.target.value, true)}
                                    disabled={isAlreadyTaken && !selectedCustomerRecord.reloan_eligibility?.isEligible}
                                    placeholder="Enter Guardian NIC"
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${formData.guardian_nic && !isValidNIC(formData.guardian_nic) ? 'border-red-500 bg-red-50' :
                                        formData.guardian_nic && extractGenderFromNIC(formData.guardian_nic) !== 'Male' ? 'border-orange-500 bg-orange-50' :
                                            'border-gray-200 bg-white'
                                        }`}
                                    required
                                />
                                {formData.guardian_nic && isValidNIC(formData.guardian_nic) && (
                                    <div className="flex items-center gap-2 mt-1.5 ml-1">
                                        <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${extractGenderFromNIC(formData.guardian_nic) === 'Male' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            Gender: {extractGenderFromNIC(formData.guardian_nic)}
                                        </div>
                                        {extractGenderFromNIC(formData.guardian_nic) !== 'Male' && (
                                            <p className="text-[10px] text-red-600 font-bold">Must be Male</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Relationship to Customer *</label>
                                <select
                                    value={formData.guardian_relationship}
                                    onChange={(e) => onFieldChange('guardian_relationship', e.target.value)}
                                    disabled={isAlreadyTaken && !selectedCustomerRecord.reloan_eligibility?.isEligible}
                                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    required
                                >
                                    <option value="">Select Relationship</option>
                                    <option value="Spouse">Spouse</option>
                                    <option value="Father">Father</option>
                                    <option value="Brother">Brother</option>
                                    <option value="Son">Son</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Guardian Name *</label>
                                <input
                                    type="text"
                                    value={formData.guardian_name}
                                    onChange={(e) => onFieldChange('guardian_name', e.target.value)}
                                    disabled={isAlreadyTaken && !selectedCustomerRecord.reloan_eligibility?.isEligible}
                                    placeholder="Enter Guardian Full Name"
                                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth (Legacy Auto)</label>
                                <input
                                    type="text"
                                    value={formData.guardian_nic ? 'Derived from NIC' : 'Enter NIC first'}
                                    readOnly
                                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 italic"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary Phone *</label>
                                <input
                                    type="text"
                                    value={formData.guardian_phone}
                                    onChange={(e) => onFieldChange('guardian_phone', e.target.value)}
                                    disabled={isAlreadyTaken && !selectedCustomerRecord.reloan_eligibility?.isEligible}
                                    placeholder="Primary Phone (07XXXXXXXX)"
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${formData.guardian_phone && !/^\d{10}$/.test(formData.guardian_phone) ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Secondary Phone (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.guardian_secondary_phone}
                                    onChange={(e) => onFieldChange('guardian_secondary_phone', e.target.value)}
                                    disabled={isAlreadyTaken && !selectedCustomerRecord.reloan_eligibility?.isEligible}
                                    placeholder="Alternative Number"
                                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Guardian Address *</label>
                                <textarea
                                    value={formData.guardian_address}
                                    onChange={(e) => onFieldChange('guardian_address', e.target.value)}
                                    disabled={isAlreadyTaken && !selectedCustomerRecord.reloan_eligibility?.isEligible}
                                    placeholder="Enter Permanent Address"
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-6 mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Guarantor Information</h3>
                            {!formData.group && (
                                <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-orange-100 italic">
                                    ⚠ Manual Entry (No Group Selected)
                                </span>
                            )}
                        </div>
                        {!formData.group && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                                <p className="text-xs text-red-700 leading-relaxed font-medium">
                                    <strong>Access Restricted:</strong> This customer is not assigned to a group. Guarantors can only be auto-filled from group members. Please assign this customer to a group first to proceed.
                                </p>
                            </div>
                        )}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
                                <p className="text-sm font-medium text-gray-700">Guarantor 01 (Auto-filled)</p>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={formData.guarantor1_name}
                                        readOnly
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500 font-medium cursor-not-allowed"
                                        placeholder="Waiting for group selection..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">NIC</label>
                                    <input
                                        type="text"
                                        value={formData.guarantor1_nic}
                                        readOnly
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500 font-medium cursor-not-allowed"
                                        placeholder="Waiting for group selection..."
                                    />
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
                                <p className="text-sm font-medium text-gray-700">Guarantor 02 (Auto-filled)</p>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={formData.guarantor2_name}
                                        readOnly
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500 font-medium cursor-not-allowed"
                                        placeholder="Waiting for group selection..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">NIC</label>
                                    <input
                                        type="text"
                                        value={formData.guarantor2_nic}
                                        readOnly
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500 font-medium cursor-not-allowed"
                                        placeholder="Waiting for group selection..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Witness Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 mb-2">
                                    Witness 01 (Creator) *
                                </label>
                                <div className="relative group/select">
                                    <select
                                        value={formData.witness1_id}
                                        disabled
                                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-bold text-blue-900 appearance-none cursor-not-allowed"
                                    >
                                        <option value="">{formData.witness1_id || 'System Assigning...'}</option>
                                        {staffs.map((staff) => (
                                            <option key={staff.staff_id} value={staff.staff_id}>
                                                {staff.full_name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>
                                <p className="text-[9px] text-blue-600 mt-1.5 px-1 font-black uppercase tracking-widest italic opacity-70">
                                    ✓ Auto-assigned to loan creator
                                </p>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 mb-2">
                                    Witness 02 (Staff) *
                                </label>
                                <div className="relative group/select">
                                    <select
                                        value={formData.witness2_id}
                                        onChange={(e) => onFieldChange('witness2_id', e.target.value)}
                                        disabled={isAlreadyTaken && !selectedCustomerRecord.reloan_eligibility?.isEligible}
                                        className={`w-full pl-4 pr-10 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-semibold appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed ${formData.witness2_id ? 'border-blue-100 text-blue-900 font-bold' : 'border-gray-100 text-gray-500'}`}
                                    >
                                        <option value="">Select Witness 02</option>
                                        {staffs.filter(s => s.staff_id !== formData.witness1_id).map((staff) => (
                                            <option key={staff.staff_id} value={staff.staff_id}>
                                                {staff.full_name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
