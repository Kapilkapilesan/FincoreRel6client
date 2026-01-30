'use client';

import { useState } from 'react';
import { CreditCard, ChevronDown, DollarSign, HandCoins, TrendingUp, LayoutList, Calendar } from 'lucide-react';
import { LoanFormData } from '@/types/loan.types';
import { LoanProduct } from '@/types/loan-product.types';
import { RENTAL_TYPES, LOAN_LIMITS, SRI_LANKAN_BANKS, BANK_VALIDATION_RULES } from '@/constants/loan.constants';

interface LoanDetailsProps {
    formData: LoanFormData;
    loanProducts: LoanProduct[];
    onFieldChange: (field: keyof LoanFormData, value: string) => void;
    customerActiveLoans?: number[];
    isEditMode?: boolean;
}

export const LoanDetails: React.FC<LoanDetailsProps> = ({ formData, loanProducts, onFieldChange, customerActiveLoans = [], isEditMode = false }) => {
    const selectedProduct = loanProducts.find(p => p.id === Number(formData.loanProduct));
    const isAlreadyTaken = customerActiveLoans.includes(Number(formData.loanProduct));

    const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
    const [accountMismatch, setAccountMismatch] = useState(false);

    const handleConfirmChange = (val: string) => {
        setConfirmAccountNumber(val);
        setAccountMismatch(val !== formData.accountNumber);
    };

    const getAccountValidationError = () => {
        if (!formData.bankName || !formData.accountNumber) return null;
        const rule = BANK_VALIDATION_RULES[formData.bankName] || BANK_VALIDATION_RULES['Default'];
        if (!rule.regex.test(formData.accountNumber)) {
            return rule.error;
        }
        return null;
    };

    const accountError = getAccountValidationError();

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h2>

            <div className="grid grid-cols-2 gap-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="col-span-2 space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
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
                                    {product.product_name} {customerActiveLoans.includes(product.id) && !isEditMode ? '(Already Active)' : ''}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 group-focus-within/select:text-blue-500">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                    {isAlreadyTaken && selectedProduct && !isEditMode && (
                        <p className="text-[10px] font-black text-red-600 mt-2 flex items-center gap-2 uppercase tracking-tighter uppercase px-1">
                            <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                            Active {selectedProduct.product_name} loan detected for this customer.
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                        <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                        Requested Amount (LKR) *
                    </label>
                    <input
                        type="number"
                        value={formData.requestedAmount}
                        onChange={(e) => onFieldChange('requestedAmount', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-bold text-gray-900"
                        placeholder="0.00"
                    />
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                        <HandCoins className="w-3.5 h-3.5 text-green-600" />
                        Approved Amount (LKR) *
                    </label>
                    <div className="space-y-1">
                        <input
                            type="number"
                            value={formData.loanAmount}
                            onChange={(e) => onFieldChange('loanAmount', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all text-sm font-bold text-gray-900"
                            placeholder="0.00"
                        />
                        <p className="text-[10px] text-gray-400 mt-1 px-1 font-medium italic">
                            System maximum: LKR {LOAN_LIMITS.MAX_AMOUNT.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                        Interest Rate (%) *
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.1"
                            value={formData.interestRate}
                            readOnly
                            className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl text-sm font-bold text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-[9px] text-blue-600 mt-1 px-1 font-black uppercase tracking-widest italic opacity-70">Locked to product rate</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                        <LayoutList className="w-3.5 h-3.5 text-blue-600" />
                        Rental Type *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.rentalType}
                            readOnly
                            className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl text-sm font-bold text-gray-500 cursor-not-allowed"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                        <p className="text-[9px] text-blue-600 mt-1 px-1 font-black uppercase tracking-widest italic opacity-70">Locked by product</p>
                    </div>
                </div>

                <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        Tenure (Weeks) *
                    </label>
                    <div className="relative group/select">
                        <select
                            value={formData.tenure}
                            onChange={(e) => onFieldChange('tenure', e.target.value)}
                            className={`w-full pl-4 pr-10 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-semibold appearance-none cursor-pointer ${formData.tenure ? 'border-blue-100 text-blue-900 font-bold' : 'border-gray-100 text-gray-500'}`}
                        >
                            <option value="">Select Tenure</option>
                            <option value="48">48 Weeks</option>
                            <option value="72">72 Weeks</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 group-focus-within/select:text-blue-500">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="col-span-2 flex items-center justify-center pt-4 border-t border-dashed border-gray-200">
                    <button
                        type="button"
                        onClick={() => {
                            const amount = Number(formData.loanAmount);
                            const interest = Number(formData.interestRate);
                            const tenure = Number(formData.tenure);
                            if (amount && interest && tenure) {
                                const total = amount + (amount * (interest / 100));
                                const rental = total / tenure;
                                onFieldChange('calculated_rental', rental.toString());
                            }
                        }}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 active:scale-95 font-black uppercase tracking-widest text-[11px]"
                    >
                        <TrendingUp className="w-4 h-4" />
                        Calculate Rental Amount
                    </button>
                </div>

                {formData.calculated_rental && (
                    <div className="col-span-2 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="p-5 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl shadow-blue-100 text-white relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl" />

                            <div className="relative flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Estimated Weekly Rental</p>
                                    <h3 className="text-3xl font-black tabular-nums">
                                        LKR {Number(formData.calculated_rental).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Payable</p>
                                    <p className="text-lg font-bold">
                                        LKR {(Number(formData.loanAmount) + (Number(formData.loanAmount) * (Number(formData.interestRate) / 100))).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Bank Details *</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Bank Name *
                        </label>
                        <select
                            value={formData.bankName}
                            onChange={(e) => onFieldChange('bankName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            <option value="">Select a Bank</option>
                            {SRI_LANKAN_BANKS.map((bank) => (
                                <option key={bank} value={bank}>
                                    {bank}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Bank Branch *
                        </label>
                        <input
                            type="text"
                            value={formData.bankBranch || ''}
                            onChange={(e) => onFieldChange('bankBranch', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Enter Bank Branch Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Account Number *
                        </label>
                        <input
                            type="text"
                            value={formData.accountNumber}
                            onChange={(e) => {
                                // Only allow numeric input
                                const val = e.target.value.replace(/\D/g, '');
                                onFieldChange('accountNumber', val);
                                if (confirmAccountNumber) setAccountMismatch(val !== confirmAccountNumber);
                            }}
                            className={`w-full px-3 py-2 border ${accountError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                            placeholder="Enter Account Number"
                        />
                        {accountError && (
                            <p className="text-xs text-red-500 mt-1">{accountError}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Confirm Account Number *
                        </label>
                        <input
                            type="text"
                            value={confirmAccountNumber}
                            onChange={(e) => handleConfirmChange(e.target.value)}
                            onPaste={(e) => e.preventDefault()}
                            className={`w-full px-3 py-2 border ${accountMismatch ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                            placeholder="Re-enter Account Number"
                        />
                        {accountMismatch && (
                            <p className="text-xs text-red-500 mt-1">Account numbers do not match!</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Fees & Charges</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Processing Fee (LKR)
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={Number(formData.processingFee).toLocaleString()}
                                readOnly
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 font-semibold"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                                {Number(formData.tenure) === 48 ? '4%' : '6%'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Documentation Fee (LKR)
                        </label>
                        <input
                            type="text"
                            value={formData.documentationFee}
                            readOnly
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 font-semibold"
                        />
                    </div>
                </div>

                {/* Reloan Summary Box */}
                {(formData.reloan_deduction_amount ?? 0) > 0 && (
                    <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
                        <h4 className="text-xs font-bold text-orange-900 uppercase tracking-widest">Net Payout Summary (Reloan)</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total Approved Loan</span>
                                <span className="font-bold text-gray-900">LKR {Number(formData.loanAmount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 text-xs italic">Less: Total Fees</span>
                                <span className="font-medium text-red-600">-(LKR {(Number(formData.processingFee) + Number(formData.documentationFee)).toLocaleString()})</span>
                            </div>
                            <div className="flex justify-between text-sm border-b border-orange-200 pb-2">
                                <span className="text-gray-600 text-xs font-bold">Less: Previous Loan Balance</span>
                                <span className="font-bold text-red-700">-(LKR {Number(formData.reloan_deduction_amount).toLocaleString()})</span>
                            </div>
                            <div className="flex justify-between text-lg font-black pt-1">
                                <span className="text-orange-900">NET DISBURSABLE</span>
                                <span className="text-green-700">LKR {(Number(formData.loanAmount) - (Number(formData.processingFee) + Number(formData.documentationFee) + Number(formData.reloan_deduction_amount))).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Remarks</label>
                <textarea
                    value={formData.remarks}
                    onChange={(e) => onFieldChange('remarks', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    placeholder="Enter any additional remarks..."
                />
            </div>
        </div >
    );
};
