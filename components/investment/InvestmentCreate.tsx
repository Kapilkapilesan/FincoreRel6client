'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, TrendingUp, UserCheck, ShieldAlert, Clock, Wallet, BarChart3, Tag, Plus, CheckCircle2, Info, AlertCircle, Search, ChevronRight, User, DollarSign, Save, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { investmentService } from '@/services/investment.service';
import { Nominee } from '@/types/investment.types';
import { InvestmentProduct, InterestRateTier } from '@/types/investment-product.types';
import { customerService } from '@/services/customer.service';
import { Customer } from '@/types/customer.types';

export function InvestmentCreate() {
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState<InvestmentProduct[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    const [formData, setFormData] = useState({
        product_id: '',
        customer_id: '',
        amount: '',
        policy_term: '',
        start_date: new Date().toISOString().split('T')[0],
        nominees: [] as Nominee[],
        negotiation_rate: '0',
        payout_type: 'MATURITY'
    });

    const [selectedProduct, setSelectedProduct] = useState<InvestmentProduct | null>(null);
    const [selectedTier, setSelectedTier] = useState<InterestRateTier | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const productsRes = await investmentService.getProducts();
                setProducts(productsRes);
            } catch (error) {
                toast.error('Failed to load products');
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        // Set searching to true immediately when typing starts (if >= 3 chars)
        if (searchTerm.trim().length >= 3) {
            setIsSearching(true);
        } else {
            setIsSearching(false);
            setCustomers([]);
        }

        const delayDebounceFn = setTimeout(async () => {
            const trimmedTerm = searchTerm.trim();
            if (trimmedTerm.length >= 3) {
                try {
                    const results = await customerService.getCustomers({
                        search: trimmedTerm
                    });
                    setCustomers(results);
                } catch (error) {
                    console.error('Search failed', error);
                } finally {
                    setIsSearching(false);
                }
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const filteredCustomers = customers; // Already filtered by API

    const handleCustomerSelect = (customer: Customer) => {
        setSelectedCustomer(customer);
        setFormData(prev => ({ ...prev, customer_id: String(customer.id) }));
        setSearchTerm('');
        setIsSearching(false);
    };

    const handleProductChange = (productId: string) => {
        const product = products.find(p => p.id === Number(productId));
        setSelectedProduct(product || null);
        setSelectedTier(null);
        setFormData(prev => ({ ...prev, product_id: productId, policy_term: '' }));
    };

    const handleTermChange = (termMonths: string) => {
        const tier = selectedProduct?.interest_rates_json.find(t => t.term_months === Number(termMonths));
        setSelectedTier(tier || null);
        setFormData(prev => ({ ...prev, policy_term: termMonths }));
    };

    const addNominee = () => {
        setFormData(prev => ({
            ...prev,
            nominees: [...prev.nominees, { name: '', nic: '', relationship: '' }]
        }));
    };

    const removeNominee = (index: number) => {
        setFormData(prev => ({
            ...prev,
            nominees: prev.nominees.filter((_, i) => i !== index)
        }));
    };

    const updateNominee = (index: number, field: keyof Nominee, value: any) => {
        const newNominees = [...formData.nominees];
        newNominees[index] = { ...newNominees[index], [field]: value };
        setFormData(prev => ({ ...prev, nominees: newNominees }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!formData.customer_id || !formData.product_id || !formData.amount || !formData.policy_term) {
            toast.error('Please fill in all required fields');
            setIsLoading(false);
            return;
        }

        try {
            await investmentService.createInvestment({
                product_id: formData.product_id,
                customer_id: formData.customer_id,
                amount: formData.amount,
                policy_term: formData.policy_term,
                start_date: formData.start_date,
                nominees: formData.nominees,
                negotiation_rate: formData.negotiation_rate,
                payout_type: formData.payout_type
            });
            toast.success('Investment created with snapshot');
            // Reset
            setFormData({
                product_id: '',
                customer_id: '',
                amount: '',
                policy_term: '',
                start_date: new Date().toISOString().split('T')[0],
                nominees: [],
                negotiation_rate: '0',
                payout_type: 'MATURITY'
            });
            setSelectedCustomer(null);
            setSelectedProduct(null);
            setSelectedTier(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create investment');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-8 h-8 text-blue-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Investment</h1>
                    <p className="text-gray-500 text-sm">Create a bank-direct investment with immutable snapshot logic</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Investor Selection */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        Investor Selection
                    </h2>
                    {!selectedCustomer ? (
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Search by Name or NIC (Min 3 chars)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {isSearching && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                            {searchTerm.length >= 3 && customers.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto overflow-x-hidden p-2 space-y-1">
                                    {customers.map(customer => (
                                        <button
                                            key={customer.id} type="button"
                                            className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-xl flex items-center justify-between group transition-all"
                                            onClick={() => handleCustomerSelect(customer)}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">{customer.full_name}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-1.5 py-0.5 rounded">NIC: {customer.customer_code}</span>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${customer.customer_type === 'Investor' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                                                        {customer.customer_type}
                                                    </span>
                                                </div>
                                            </div>
                                            <Plus className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110" />
                                        </button>
                                    ))}
                                </div>
                            )}
                            {searchTerm.length >= 3 && customers.length === 0 && !isSearching && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl p-8 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <ShieldAlert className="w-8 h-8 text-gray-200" />
                                        <p className="text-sm font-bold text-gray-400">No customer found with this NIC/Name</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-blue-900">{selectedCustomer.full_name}</p>
                                <p className="text-xs text-blue-700">NIC: {selectedCustomer.customer_code}</p>
                            </div>
                            <button type="button" onClick={() => setSelectedCustomer(null)} className="text-sm text-blue-600 font-bold hover:underline">Change</button>
                        </div>
                    )}
                </div>

                {/* Investment Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        Investment Configuration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Product</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={formData.product_id}
                                onChange={(e) => handleProductChange(e.target.value)}
                            >
                                <option value="">Select Investment Product</option>
                                {Array.isArray(products) && products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedProduct && (
                            <div className="col-span-2 space-y-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase text-indigo-600">Choose Interest Payout Method</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'MATURITY', label: 'At Maturity', sub: 'Lump sum at end', icon: Calendar },
                                        { id: 'MONTHLY', label: 'Monthly Interest', sub: 'Regular monthly income', icon: Info }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, payout_type: opt.id as any }))}
                                            className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all text-left ${formData.payout_type === opt.id
                                                ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-600/5'
                                                : 'border-gray-100 bg-white hover:border-gray-200'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-xl ${formData.payout_type === opt.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                <opt.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className={`font-black text-sm ${formData.payout_type === opt.id ? 'text-indigo-900' : 'text-gray-900'}`}>{opt.label}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">{opt.sub}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedProduct && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Available Terms (Months)</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={formData.policy_term}
                                        onChange={(e) => handleTermChange(e.target.value)}
                                    >
                                        <option value="">Select Term</option>
                                        {selectedProduct.interest_rates_json.map(tier => (
                                            <option key={tier.term_months} value={tier.term_months}>{tier.term_months} Months</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                    />
                                </div>
                                <div className="col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className={`flex flex-col p-2 rounded-lg transition-all ${formData.payout_type === 'MONTHLY' ? 'bg-indigo-600 text-white shadow-lg' : ''}`}>
                                        <span className={`text-[10px] font-bold uppercase ${formData.payout_type === 'MONTHLY' ? 'text-indigo-200' : 'text-gray-400'}`}>Monthly Rate</span>
                                        <span className={`font-black ${formData.payout_type === 'MONTHLY' ? 'text-white text-xl' : 'text-gray-900'}`}>{selectedTier?.interest_monthly ?? '--'}%</span>
                                    </div>
                                    <div className={`flex flex-col p-2 rounded-lg transition-all ${formData.payout_type === 'MATURITY' ? 'bg-green-600 text-white shadow-lg' : ''}`}>
                                        <span className={`text-[10px] font-bold uppercase ${formData.payout_type === 'MATURITY' ? 'text-green-200' : 'text-gray-400'}`}>Maturity Rate</span>
                                        <span className={`font-black ${formData.payout_type === 'MATURITY' ? 'text-white text-xl' : 'text-gray-900'}`}>{selectedTier?.interest_maturity ?? '--'}%</span>
                                    </div>
                                    <div className="flex flex-col p-2">
                                        <span className="text-[10px] text-purple-400 font-bold uppercase">Break Monthly</span>
                                        <span className="text-purple-600 font-bold">{selectedTier?.breakdown_monthly ?? '--'}%</span>
                                    </div>
                                    <div className="flex flex-col p-2">
                                        <span className="text-[10px] text-purple-400 font-bold uppercase">Break Maturity</span>
                                        <span className="text-purple-600 font-bold">{selectedTier?.breakdown_maturity ?? '--'}%</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Investment Amount (LKR)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter amount..."
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1 font-medium">Min: LKR {selectedProduct.min_amount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Negotiation Rate (%)</label>
                                    <input
                                        type="number" step="0.01"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.negotiation_rate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, negotiation_rate: e.target.value }))}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Nominees */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4 border-b pb-2">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            Nominees
                        </h2>
                        <button type="button" onClick={addNominee} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                            <Plus className="w-3 h-3" /> Add Nominee
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.nominees.map((nominee, idx) => (
                            <div key={idx} className="flex gap-4 items-end bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Full Name</label>
                                    <input type="text" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" value={nominee.name} onChange={e => updateNominee(idx, 'name', e.target.value)} />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">NIC</label>
                                    <input type="text" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" value={nominee.nic} onChange={e => updateNominee(idx, 'nic', e.target.value)} />
                                </div>
                                <button type="button" onClick={() => removeNominee(idx)} className="p-2 text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="submit" disabled={isLoading} className="px-10 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50">
                        {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
                        {isLoading ? 'Processing Snapshot...' : 'Create Investment'}
                    </button>
                </div>
            </form>
        </div>
    );
}
