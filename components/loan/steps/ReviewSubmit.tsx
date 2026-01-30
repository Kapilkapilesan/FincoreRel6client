'use client';

import React, { useState } from 'react';
import { CheckCircle, Eye, Maximize2, X, Download } from 'lucide-react';
import { LoanFormData, CustomerRecord } from '@/types/loan.types';
import { Staff } from '@/types/staff.types';
import { calculateTotalFees, calculateNetDisbursement, formatCurrency, getDocumentUrl } from '@/utils/loan.utils';

interface ReviewSubmitProps {
    formData: LoanFormData;
    selectedCustomerRecord?: CustomerRecord | null;
    staffs: Staff[];
    isEditMode?: boolean;
}

export const ReviewSubmit: React.FC<ReviewSubmitProps> = ({ formData, selectedCustomerRecord, staffs, isEditMode = false }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<string>('');

    React.useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const totalFees = calculateTotalFees(formData);
    const netDisbursement = calculateNetDisbursement(formData);

    const getStaffName = (id: string) => {
        const staff = staffs.find(s => s.staff_id === id);
        return staff ? staff.full_name : id || 'Not selected';
    };

    const openPreview = (type: string, file: File | null, existingUrl: string | null, e: React.MouseEvent) => {
        e.stopPropagation();
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            setPreviewType(type);
        } else if (existingUrl) {
            setPreviewUrl(getDocumentUrl(existingUrl));
            setPreviewType(type);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Review & Submit</h2>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Information</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Center:</span>
                            <span className="font-medium text-gray-900">{formData.center || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Group:</span>
                            <span className="font-medium text-gray-900">{formData.group || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">NIC:</span>
                            <span className="font-medium text-gray-900">{formData.nic || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Customer:</span>
                            <span className="font-medium text-gray-900">
                                {selectedCustomerRecord?.displayName || 'Not selected'}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                            <span className="text-gray-600">Monthly Income:</span>
                            <span className="font-bold text-green-700">LKR {Number(formData.monthly_income || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Monthly Expenses:</span>
                            <span className="font-bold text-red-700">LKR {Number(formData.monthly_expenses || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Loan Details</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Requested Amount:</span>
                            <span className="font-medium text-gray-900">
                                {formatCurrency(Number(formData.requestedAmount || 0))}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Approved Amount:</span>
                            <span className="font-medium text-gray-900">
                                {formatCurrency(Number(formData.loanAmount || 0))}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Interest Rate:</span>
                            <span className="font-medium text-gray-900">{formData.interestRate || '0'}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tenure:</span>
                            <span className="font-medium text-gray-900">{formData.tenure || '0'} Weeks</span>
                        </div>
                        {formData.calculated_rental && (
                            <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                                <span className="text-blue-600 font-bold">Weekly Rental:</span>
                                <span className="font-bold text-blue-900">
                                    {formatCurrency(Number(formData.calculated_rental))}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Fees & Charges</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Processing Fee:</span>
                            <span className="font-medium text-gray-900">
                                {formatCurrency(Number(formData.processingFee || 0))}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Documentation Fee:</span>
                            <span className="font-medium text-gray-900">
                                {formatCurrency(Number(formData.documentationFee || 0))}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-900 mb-3">Total Summary</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-blue-700">Loan Amount:</span>
                            <span className="font-medium text-blue-900">
                                {formatCurrency(Number(formData.loanAmount || 0))}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-blue-700">Total Fees:</span>
                            <span className="font-medium text-blue-900">{formatCurrency(totalFees)}</span>
                        </div>
                        {Number(formData.reloan_deduction_amount ?? 0) > 0 && (
                            <div className="flex justify-between">
                                <span className="text-blue-700 font-medium">Reloan Deduction:</span>
                                <span className="font-medium text-red-600">({formatCurrency(Number(formData.reloan_deduction_amount))})</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-blue-300">
                            <span className="text-blue-700 font-bold">Net Disbursable Cash:</span>
                            <span className="font-black text-blue-900">{formatCurrency(Number(formData.loanAmount) - totalFees - Number(formData.reloan_deduction_amount || 0))}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 col-span-2">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Bank Details</h3>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Bank Name:</span>
                            <span className="font-medium text-gray-900">{formData.bankName || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Account Number:</span>
                            <span className="font-medium text-gray-900">{formData.accountNumber || 'Not provided'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 col-span-2">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Guarantors & Witnesses</h3>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Guarantor 01:</span>
                                <span className="font-medium text-gray-900">{formData.guarantor1_name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Guarantor 02:</span>
                                <span className="font-medium text-gray-900">{formData.guarantor2_name || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Witness 01 (Staff):</span>
                                <span className="font-medium text-gray-900">{getStaffName(formData.witness1_id)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Witness 02 (Staff):</span>
                                <span className="font-medium text-gray-900">{getStaffName(formData.witness2_id)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 col-span-2">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Guardian Information</h3>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium text-gray-900">{formData.guardian_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Relationship:</span>
                            <span className="font-medium text-gray-900">{formData.guardian_relationship || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">NIC:</span>
                            <span className="font-medium text-gray-900">{formData.guardian_nic || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Primary Phone:</span>
                            <span className="font-medium text-gray-900">{formData.guardian_phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Secondary Phone:</span>
                            <span className="font-medium text-gray-900">{formData.guardian_secondary_phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between col-span-2">
                            <span className="text-gray-600">Address:</span>
                            <span className="font-medium text-gray-900 text-right">{formData.guardian_address || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 col-span-2">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Uploaded Documents</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {/* Newly Uploaded Documents */}
                        {Object.entries(formData.documents || {}).map(([type, file]) => (
                            file && (
                                <button
                                    key={`new-${type}`}
                                    type="button"
                                    onClick={(e) => openPreview(type, file, null, e)}
                                    className="flex items-center justify-between gap-2 text-xs bg-white border border-gray-200 p-2.5 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all group"
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                                        <span className="text-gray-600 font-bold shrink-0">{type}:</span>
                                        <span className="text-gray-900 truncate font-medium italic">{file.name}</span>
                                    </div>
                                    <Eye className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 shrink-0" />
                                </button>
                            )
                        ))}

                        {/* Existing Documents */}
                        {formData.existingDocuments?.map((doc: any) => (
                            <button
                                key={`existing-${doc.id}`}
                                type="button"
                                onClick={(e) => openPreview(doc.document_type || doc.type, null, doc.url || doc.file_path, e)}
                                className="flex items-center justify-between gap-2 text-xs bg-white border border-gray-200 p-2.5 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all group"
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                    <span className="text-gray-600 font-bold shrink-0">{doc.document_type || doc.type}:</span>
                                    <span className="text-gray-900 truncate font-medium">{doc.file_name || 'View Document'}</span>
                                </div>
                                <Eye className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 shrink-0" />
                            </button>
                        ))}

                        {Object.values(formData.documents || {}).filter(f => !!f).length === 0 &&
                            (!formData.existingDocuments || formData.existingDocuments.length === 0) && (
                                <div className="text-sm text-gray-400 italic col-span-full py-4 text-center bg-white/50 rounded-xl border border-dashed border-gray-200">
                                    No documents attached to this application
                                </div>
                            )}
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {previewUrl && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setPreviewUrl(null)}
                >
                    <div
                        className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col scale-in-center"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Maximize2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{previewType}</h3>
                                    <p className="text-[10px] text-gray-500 font-bold">DOCUMENT PREVIEW</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={previewUrl}
                                    download
                                    target="_blank"
                                    className="p-2 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors flex items-center gap-2 text-xs font-bold"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </a>
                                <button
                                    onClick={() => setPreviewUrl(null)}
                                    className="p-2 bg-gray-200 hover:bg-red-100 hover:text-red-600 rounded-xl text-gray-600 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-8">
                            {previewUrl.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-full min-h-[70vh] rounded-lg shadow-inner"
                                    title="PDF Preview"
                                />
                            ) : (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-300"
                                />
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-center">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Press ESC or click outside to close</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-green-900">Ready to {isEditMode ? 'Resubmit' : 'Submit'}</p>
                        <p className="text-xs text-green-800 mt-1">
                            Please review all information carefully. Once {isEditMode ? 'resubmitted' : 'submitted'}, the loan application will be
                            sent for approval.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
