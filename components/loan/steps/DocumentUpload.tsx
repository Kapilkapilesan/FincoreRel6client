import React from 'react';
import { Upload, AlertCircle, CheckCircle, X, Eye, Maximize2, Download } from 'lucide-react';
import { DOCUMENT_TYPES, REQUIRED_DOCUMENTS } from '@/constants/loan.constants';
import { LoanFormData } from '@/types/loan.types';
import { getDocumentUrl } from '@/utils/loan.utils';

interface DocumentUploadProps {
    formData: LoanFormData;
    onDocumentChange: (type: string, file: File | null) => void;
    showErrors?: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ formData, onDocumentChange, showErrors }) => {
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [previewType, setPreviewType] = React.useState<string>('');

    React.useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit');
                return;
            }
        }
        onDocumentChange(type, file);
    };

    const removeFile = (type: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onDocumentChange(type, null);
    };

    const openPreview = (type: string, file: File | null, existing: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            setPreviewType(type);
        } else if (existing) {
            setPreviewUrl(getDocumentUrl(existing.url || existing.file_path));
            setPreviewType(type);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h2>

            <div className="grid grid-cols-2 gap-4">
                {DOCUMENT_TYPES.map((type) => {
                    const selectedFile = formData.documents?.[type];
                    const existingDoc = [...(formData.existingDocuments || [])].reverse().find(doc => doc.type === type);
                    const isRequired = REQUIRED_DOCUMENTS.includes(type as any);

                    const hasDocument = selectedFile || existingDoc;

                    return (
                        <div
                            key={type}
                            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${hasDocument
                                ? 'border-green-500 bg-green-50/30'
                                : (isRequired && showErrors)
                                    ? 'border-red-500 bg-red-50/50 ring-2 ring-red-500/20'
                                    : isRequired
                                        ? 'border-amber-300 bg-amber-50/30 w-full'
                                        : 'border-gray-200 hover:border-blue-400 bg-gray-50/50'
                                }`}
                            onClick={() => document.getElementById(`file-${type}`)?.click()}
                        >
                            <input
                                id={`file-${type}`}
                                type="file"
                                className="hidden"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => handleFileChange(type, e)}
                            />

                            {selectedFile ? (
                                <div className="space-y-2">
                                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                                    <p className="text-sm font-bold text-gray-900">
                                        {type} {isRequired && <span className="text-red-500">*</span>}
                                    </p>
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={(e) => openPreview(type, selectedFile, null, e)}
                                            className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-md max-w-[150px] truncate hover:bg-green-200 transition-colors flex items-center gap-1"
                                        >
                                            <Eye className="w-3 h-3" />
                                            {selectedFile.name}
                                        </button>
                                        <button
                                            onClick={removeFile.bind(null, type)}
                                            className="p-1 hover:bg-green-200 rounded-full text-green-700 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ) : existingDoc ? (
                                <div className="space-y-2">
                                    <CheckCircle className="w-8 h-8 text-blue-500 mx-auto" />
                                    <p className="text-sm font-bold text-gray-900">
                                        {type} {isRequired && <span className="text-red-500">*</span>}
                                    </p>
                                    <div className="flex flex-col items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={(e) => openPreview(type, null, existingDoc, e)}
                                            className={`text-xs ${(existingDoc as any).is_from_profile ? 'text-amber-700 bg-amber-100 ring-1 ring-amber-500/30' : 'text-blue-700 bg-blue-100'} px-3 py-1.5 rounded-lg max-w-[150px] truncate hover:opacity-80 transition-all flex items-center gap-1.5 font-bold shadow-sm`}
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            {(existingDoc as any).is_from_profile ? 'From Profile' : 'View Existing'}
                                        </button>
                                        <span className="text-[10px] text-gray-500 mt-1">
                                            {(existingDoc as any).is_from_profile ? 'Automatically linked' : 'Click box to replace'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload className={`w-8 h-8 mx-auto ${(isRequired && showErrors) ? 'text-red-500 animate-bounce' : isRequired ? 'text-amber-400' : 'text-gray-400'}`} />
                                    <p className={`text-sm font-bold ${(isRequired && showErrors) ? 'text-red-700' : 'text-gray-900'}`}>
                                        {type} {isRequired && <span className="text-red-500">*</span>}
                                    </p>
                                    <p className={`text-xs ${(isRequired && showErrors) ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                        {isRequired ? (showErrors ? 'MISSING REQUIRED DOCUMENT' : 'Required') : 'Click to upload'}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
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
        </div>
    );
};
