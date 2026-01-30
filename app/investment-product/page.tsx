'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, TrendingUp, UserCheck, ShieldAlert, Clock, Wallet, BarChart3, Tag } from 'lucide-react';
import { InvestmentProduct, InvestmentProductFormData } from '../../types/investment-product.types';
import { investmentProductService } from '../../services/investment-product.service';
import { InvestmentProductForm } from '../../components/investment-product/InvestmentProductForm';
import { InvestmentProductDetailModal } from '../../components/investment-product/InvestmentProductDetailModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BMSLoader from '../../components/common/BMSLoader';

export default function InvestmentProductManagementPage() {
    const [products, setProducts] = useState<InvestmentProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [viewingProduct, setViewingProduct] = useState<InvestmentProduct | null>(null);
    const [editingProduct, setEditingProduct] = useState<InvestmentProduct | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await investmentProductService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load investment products');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: InvestmentProductFormData) => {
        try {
            if (editingProduct) {
                await investmentProductService.updateProduct(editingProduct.id, data);
                toast.success('Product updated successfully');
            } else {
                await investmentProductService.createProduct(data);
                toast.success('Product created successfully');
            }
            setShowModal(false);
            loadProducts();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save product');
        }
    };

    const handleDelete = (id: number) => {
        setProductToDelete(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (productToDelete === null) return;
        try {
            await investmentProductService.deleteProduct(productToDelete);
            toast.success('Product deleted successfully');
            loadProducts();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete product');
        } finally {
            setShowDeleteConfirm(false);
            setProductToDelete(null);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.product_code?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                        <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Investment Product Schemes</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Configure and manage financial investment products</p>
                    </div>
                </div>
                <button
                    onClick={() => { setEditingProduct(null); setShowModal(true); }}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95 font-bold"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create New Product</span>
                </button>
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 gap-6">
                {/* Search and Filters Bar */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by product name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-gray-700 dark:text-gray-300 font-medium"
                        />
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Product Info</th>
                                    <th className="px-6 py-5 text-center text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Returns</th>
                                    <th className="px-6 py-5 text-center text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Term</th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Limits</th>
                                    <th className="px-6 py-5 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <BMSLoader message="Synchronizing products..." size="xsmall" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredProducts.length > 0 ? (
                                    filteredProducts.map(p => {
                                        const rates = p.interest_rates_json || [];
                                        const minMo = rates.length > 0 ? Math.min(...rates.map(r => r.term_months)) : 0;
                                        const maxMo = rates.length > 0 ? Math.max(...rates.map(r => r.term_months)) : 0;

                                        const allInterestValues = rates.flatMap(r => [r.interest_monthly, r.interest_maturity]);
                                        const minInt = allInterestValues.length > 0 ? Math.min(...allInterestValues) : 0;
                                        const maxInt = allInterestValues.length > 0 ? Math.max(...allInterestValues) : 0;

                                        return (
                                            <tr key={p.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group border-b border-gray-50 dark:border-gray-700 last:border-0">
                                                <td className="px-6 py-6 cursor-pointer" onClick={() => { setViewingProduct(p); setShowDetailModal(true); }}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                                                            <Tag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-mono tracking-tighter uppercase">{p.product_code || 'N/A'}</span>
                                                                <p className="font-black text-gray-900 dark:text-gray-100 text-lg group-hover:text-indigo-600 transition-colors">{p.name}</p>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-1.5">
                                                                <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                    <UserCheck className="w-3.5 h-3.5" />
                                                                    <span>Min Age: {p.age_limited}+ Years</span>
                                                                </div>
                                                                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                                                <div className="flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                                                                    <ShieldAlert className="w-3.5 h-3.5" />
                                                                    <span>{rates.length} Tiers Configured</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <div className="inline-flex flex-col items-center">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xl font-black text-green-600 dark:text-green-400">
                                                                {minInt === maxInt ? `${minInt}%` : `${minInt}% - ${maxInt}%`}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Yield Range</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-200">
                                                            <Clock className="w-4 h-4 text-indigo-500" />
                                                            <span className="text-base font-black uppercase">
                                                                {minMo === maxMo ? `${minMo} Mo` : `${minMo} to ${maxMo} Mo`}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter mt-0.5 italic">Dynamic Term Options</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-left">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-tighter">Min:</span>
                                                            <span className="text-xs font-black text-gray-900 dark:text-gray-200 tracking-tight">LKR {Number(p.min_amount).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-tighter">Max:</span>
                                                            <span className="text-xs font-black text-gray-900 dark:text-gray-200 tracking-tight">LKR {Number(p.max_amount).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setEditingProduct(p); setShowModal(true); }}
                                                            className="p-3 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-blue-100 shadow-sm"
                                                            title="Edit Product"
                                                        >
                                                            <Edit2 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                                                            className="p-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-red-100 shadow-sm"
                                                            title="Delete Product"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-4 bg-gray-50 rounded-full">
                                                    <Search className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-500 font-bold max-w-xs mx-auto">We couldn't find any products matching your search criteria.</p>
                                                <button
                                                    onClick={() => { setSearchTerm(''); }}
                                                    className="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                                >
                                                    Clear filters
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <InvestmentProductForm
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
                initialData={editingProduct}
            />

            <InvestmentProductDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                product={viewingProduct}
            />

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Deactivate Product Scheme"
                message="Are you sure you want to delete this investment product? This action will prevent new accounts from using this scheme, but will not affect existing active investments."
                confirmText="Permanently Delete"
                cancelText="Cancel"
                variant="danger"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
            <ToastContainer />
        </div>
    );
}
