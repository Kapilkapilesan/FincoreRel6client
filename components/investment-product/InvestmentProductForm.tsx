'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X, Calculator, Info, AlertCircle, CheckCircle2, Plus, Trash2, Save, ShieldAlert } from 'lucide-react';
import { InvestmentProduct, InvestmentProductFormData, InterestRateTier } from '../../types/investment-product.types';
import { investmentProductService } from '../../services/investment-product.service';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: InvestmentProductFormData) => void;
    initialData?: InvestmentProduct | null;
}

interface ValidationErrors {
    [key: string]: string;
}

export function InvestmentProductForm({ isOpen, onClose, onSave, initialData }: Props) {
    const [formData, setFormData] = useState<InvestmentProductFormData>({
        product_code: '',
        name: '',
        age_limited: 18,
        min_amount: 1000,
        max_amount: 1000000,
        interest_rates_json: [
            { term_months: 12, interest_monthly: 10, interest_maturity: 11, breakdown_monthly: 0.5, breakdown_maturity: 0.5 }
        ],
        negotiation_rates_json: { monthly: 0, maturity: 0 }
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [isLoadingCode, setIsLoadingCode] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    product_code: initialData.product_code || '',
                    name: initialData.name || '',
                    age_limited: initialData.age_limited || 18,
                    min_amount: initialData.min_amount || 0,
                    max_amount: initialData.max_amount || 0,
                    interest_rates_json: initialData.interest_rates_json || [],
                    negotiation_rates_json: initialData.negotiation_rates_json || { monthly: 0, maturity: 0 }
                });
            } else {
                setFormData({
                    product_code: 'Loading...',
                    name: '',
                    age_limited: 18,
                    min_amount: 1000,
                    max_amount: 1000000,
                    interest_rates_json: [
                        { term_months: 12, interest_monthly: 0, interest_maturity: 0, breakdown_monthly: 0, breakdown_maturity: 0 }
                    ],
                    negotiation_rates_json: { monthly: 0, maturity: 0 }
                });

                const fetchNextCode = async () => {
                    setIsLoadingCode(true);
                    try {
                        const code = await investmentProductService.getNextCode();
                        setFormData(prev => ({ ...prev, product_code: code }));
                    } catch (error) {
                        console.error('Error fetching next code:', error);
                        setFormData(prev => ({ ...prev, product_code: '' }));
                    } finally {
                        setIsLoadingCode(false);
                    }
                };
                fetchNextCode();
            }
            setErrors({});
            setTouched({});
        }
    }, [initialData, isOpen]);

    const addRateRow = () => {
        setFormData(prev => ({
            ...prev,
            interest_rates_json: [
                ...prev.interest_rates_json,
                { term_months: 0, interest_monthly: 0, interest_maturity: 0, breakdown_monthly: 0, breakdown_maturity: 0 }
            ]
        }));
    };

    const removeRateRow = (index: number) => {
        setFormData(prev => ({
            ...prev,
            interest_rates_json: prev.interest_rates_json.filter((_, i) => i !== index)
        }));
    };

    const updateRateRow = (index: number, field: keyof InterestRateTier, value: any) => {
        setFormData(prev => {
            const newRates = [...prev.interest_rates_json];
            // If the value is NaN (e.g. from empty input), store it as 0 or empty to prevent rendering issues
            const numericValue = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
            const intValue = isNaN(parseInt(value)) ? 0 : parseInt(value);

            const finalValue = field === 'term_months' ? intValue : numericValue;

            newRates[index] = { ...newRates[index], [field]: finalValue };
            return { ...prev, interest_rates_json: newRates };
        });
    };

    const handleSubmit = () => {
        // Simple validaton for now
        if (!formData.name || !formData.product_code) {
            alert("Please fill in basic info");
            return;
        }
        if (formData.interest_rates_json.length === 0) {
            alert("Please add at least one rate row");
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-2xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                            <Calculator className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{initialData ? 'Edit' : 'Add'} Investment Product</h2>
                            <p className="text-blue-100 text-sm opacity-90">Configure financial parameters and rules</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors group">
                        <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    {/* Identification */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 flex items-center gap-2 border-b pb-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Product Identification</h3>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Code</label>
                            <input
                                type="text"
                                value={formData.product_code}
                                readOnly
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. Fixed Deposit - 12 Months"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Age Limit (Min Years)</label>
                            <input
                                type="number"
                                value={formData.age_limited || ''}
                                onChange={e => {
                                    const val = parseInt(e.target.value);
                                    setFormData(prev => ({ ...prev, age_limited: isNaN(val) ? 18 : val }));
                                }}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Rate Configuration Table */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-blue-600" />
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Rate Configuration</h3>
                            </div>
                            <button
                                onClick={addRateRow}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add Row
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3 border-b font-bold" rowSpan={2}>Months</th>
                                        <th className="px-4 py-3 border-b text-center font-bold" colSpan={2}>Interest Rate (%)</th>
                                        <th className="px-4 py-3 border-b text-center font-bold text-purple-600" colSpan={2}>Interest Breakdown (%)</th>
                                        <th className="px-4 py-3 border-b text-right font-bold" rowSpan={2}>Actions</th>
                                    </tr>
                                    <tr>
                                        <th className="px-4 py-2 border-b text-center">Monthly</th>
                                        <th className="px-4 py-2 border-b text-center">Maturity</th>
                                        <th className="px-4 py-2 border-b text-center text-purple-600">Monthly</th>
                                        <th className="px-4 py-2 border-b text-center text-purple-600">Maturity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {formData.interest_rates_json.map((rate, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    value={rate.term_months || ''}
                                                    onChange={e => updateRateRow(idx, 'term_months', e.target.value)}
                                                    className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={rate.interest_monthly || ''}
                                                    onChange={e => updateRateRow(idx, 'interest_monthly', e.target.value)}
                                                    className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={rate.interest_maturity || ''}
                                                    onChange={e => updateRateRow(idx, 'interest_maturity', e.target.value)}
                                                    className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={rate.breakdown_monthly || ''}
                                                    onChange={e => updateRateRow(idx, 'breakdown_monthly', e.target.value)}
                                                    className="w-24 px-2 py-1.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-center text-purple-700 font-medium"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={rate.breakdown_maturity || ''}
                                                    onChange={e => updateRateRow(idx, 'breakdown_maturity', e.target.value)}
                                                    className="w-24 px-2 py-1.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-center text-purple-700 font-medium"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <button onClick={() => removeRateRow(idx)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Negotiation Config */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 flex items-center gap-2 border-b pb-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Negotiation Configuration</h3>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Negotiation Interest (Monthly) %</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.negotiation_rates_json?.monthly || 0}
                                    onChange={e => {
                                        const val = parseFloat(e.target.value);
                                        setFormData(prev => ({
                                            ...prev,
                                            negotiation_rates_json: {
                                                ...prev.negotiation_rates_json!,
                                                monthly: isNaN(val) ? 0 : val
                                            }
                                        }));
                                    }}
                                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Negotiation Interest (Annually) %</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.negotiation_rates_json?.maturity || 0}
                                    onChange={e => {
                                        const val = parseFloat(e.target.value);
                                        setFormData(prev => ({
                                            ...prev,
                                            negotiation_rates_json: {
                                                ...prev.negotiation_rates_json!,
                                                maturity: isNaN(val) ? 0 : val
                                            }
                                        }));
                                    }}
                                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Limits */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Min Investment (LKR)</label>
                            <input
                                type="number"
                                value={formData.min_amount || ''}
                                onChange={e => {
                                    const val = parseFloat(e.target.value);
                                    setFormData(prev => ({ ...prev, min_amount: isNaN(val) ? 0 : val }));
                                }}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Max Investment (LKR)</label>
                            <input
                                type="number"
                                value={formData.max_amount || ''}
                                onChange={e => {
                                    const val = parseFloat(e.target.value);
                                    setFormData(prev => ({ ...prev, max_amount: isNaN(val) ? 0 : val }));
                                }}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4 rounded-b-2xl">
                    <button onClick={onClose} className="px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all active:scale-95">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 active:scale-95 flex items-center gap-2">
                        {initialData ? <Save className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        {initialData ? 'Update Product' : 'Create Product'}
                    </button>
                </div>
            </div>
        </div>
    );
}
