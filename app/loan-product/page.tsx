'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Layers } from 'lucide-react';
import { LoanProduct, LoanProductFormData } from '../../types/loan-product.types';
import { loanProductService } from '../../services/loan-product.service';
import { LoanProductTable } from '../../components/loan-product/LoanProductTable';
import { LoanProductForm } from '../../components/loan-product/LoanProductForm';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BMSLoader from '../../components/common/BMSLoader';

export default function LoanProductManagementPage() {
    const [products, setProducts] = useState<LoanProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [termFilter, setTermFilter] = useState<string>('all');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await loanProductService.getLoanProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products:', error);
            toast.error('Failed to load loan products');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setShowModal(true);
    };

    const handleEdit = (product: LoanProduct) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        setProductToDelete(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (productToDelete === null) return;

        try {
            await loanProductService.deleteLoanProduct(productToDelete);
            await loadProducts();
            toast.success('Product deleted successfully!');
        } catch (error: any) {
            console.error('Failed to delete product:', error);
            toast.error(error.message || 'Failed to delete product');
        } finally {
            setShowDeleteConfirm(false);
            setProductToDelete(null);
        }
    };

    const handleSave = async (formData: LoanProductFormData) => {
        try {
            if (editingProduct) {
                await loanProductService.updateLoanProduct(editingProduct.id, formData);
                toast.success('Product updated successfully!');
            } else {
                await loanProductService.createLoanProduct(formData);
                toast.success('Product created successfully!');
            }
            setShowModal(false);
            loadProducts();
        } catch (error: any) {
            console.error('Failed to save product:', error);
            const errorMessage = error.errors ?
                Object.values(error.errors).flat().join(', ') :
                error.message || 'Failed to save product';
            toast.error(errorMessage);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.regacine || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTerm = termFilter === 'all' || product.term_type === termFilter;
        return matchesSearch && matchesTerm;
    });

    if (loading && products.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <BMSLoader message="Loading products..." size="xsmall" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Loan Product Configuration</h1>
                    <p className="text-sm text-gray-500 mt-1">Configure and manage loan product schemes</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-semibold">New Loan Product</span>
                </button>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Layers className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Total Schemes</p>
                            <p className="text-xl font-bold text-gray-900">{products.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search schemes by name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        />
                    </div>
                    <select
                        value={termFilter}
                        onChange={(e) => setTermFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium min-w-[150px] bg-white cursor-pointer"
                    >
                        <option value="all">All Term Types</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Annually">Annually</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <LoanProductTable
                products={filteredProducts}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Product Form Modal */}
            <LoanProductForm
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
                initialData={editingProduct}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Product Scheme"
                message="Are you sure you want to delete this product scheme? This will not affect existing active loans based on this scheme."
                confirmText="Delete Scheme"
                cancelText="Cancel"
                variant="danger"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />

            <ToastContainer />
        </div>
    );
}
