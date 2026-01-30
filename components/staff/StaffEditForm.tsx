import React, { useState, useEffect, useCallback } from 'react';
import { X, Eye, EyeOff, Camera, User, Phone, Mail, Award, Briefcase, DollarSign, Heart, FileText, ChevronRight, ChevronLeft, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Role } from '../../types/staff.types';
import { staffService } from '../../services/staff.service';
import { branchService } from '../../services/branch.service';
import { Branch } from '../../types/branch.types';
import { authService } from '../../services/auth.service';
import { nicService } from '../../services/nic.service';
import { SRI_LANKAN_BANKS, BANK_VALIDATION_RULES } from '../../constants/loan.constants';
import { API_BASE_URL } from '../../services/api.config';

interface StaffEditFormProps {
    onClose: () => void;
    onSubmit: (data: any) => Promise<any>;
    roles: Role[];
    initialData: any;
}

type TabType = 'basic' | 'employment' | 'education' | 'experience' | 'salary' | 'emergency';

export function StaffEditForm({ onClose, onSubmit, roles, initialData }: StaffEditFormProps) {
    const [currentTab, setCurrentTab] = useState<TabType>('basic');
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [previewImage, setPreviewImage] = useState<string | null>(() => {
        if (initialData?.profile_image_url) return initialData.profile_image_url;
        if (initialData?.avatar) return initialData.avatar;
        if (initialData?.profile_image) {
            return initialData.profile_image.startsWith('http')
                ? initialData.profile_image
                : `${API_BASE_URL.replace('/api', '')}/storage/${initialData.profile_image}`;
        }
        return null;
    });
    const [profileFile, setProfileFile] = useState<File | null>(null);

    // Ensure we have a consistent ID for exclusion in duplication checks
    const currentStaffId = initialData?.staff_id || initialData?.staffId || (initialData?.id && /^ST\d+/.test(initialData.id) ? initialData.id : initialData?.id);

    // Helper to format date for input fields (YYYY-MM-DD)
    const formatDate = (dateVal: any) => {
        if (!dateVal) return '';
        try {
            const date = new Date(dateVal);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    };

    const [formData, setFormData] = useState({
        // Authentication & Role
        roleId: initialData?.roleId?.toString() || '',
        email: initialData?.email || '',
        password: '',
        isActive: initialData?.status === 'Active' || initialData?.is_active === true,

        // Basic Info
        name: initialData?.name || initialData?.full_name || '',
        name_with_initial: initialData?.name_with_initial || '',
        nic: initialData?.nic || '',
        gender: initialData?.gender || 'Male',
        date_of_birth: formatDate(initialData?.date_of_birth),
        age: initialData?.age?.toString() || '',
        nationality: initialData?.nationality || 'Sri Lankan',
        marital_status: initialData?.marital_status || 'Single',
        preferred_language: initialData?.preferred_language || 'Sinhala',
        profile_image: initialData?.profile_image || '',

        // Contact Details
        address: initialData?.address || '',
        mailing_address: initialData?.mailing_address || '',
        contactKey: initialData?.contact_no || '',
        personal_mobile: initialData?.personal_mobile || '',
        personal_email: initialData?.personal_email || '',

        // Employment Details
        department: initialData?.department || '',
        employee_type: initialData?.employee_type || 'Permanent',
        joinedDate: formatDate(initialData?.joinedDate || initialData?.joining_date),
        permanent_date: formatDate(initialData?.permanent_date),
        confirmation_date: formatDate(initialData?.confirmation_date),
        is_blacklisted: initialData?.is_blacklisted || false,
        bond_signed: initialData?.bond_signed || false,
        bond_period_from: formatDate(initialData?.bond_period_from),
        bond_period_to: formatDate(initialData?.bond_period_to),
        branch: initialData?.branchId?.toString() || initialData?.branch_id?.toString() || '',
        branch_code: initialData?.branch_code || '',
        office_mobile: initialData?.office_mobile || '',
        office_email: initialData?.office_email || '',

        // Education
        highest_qualification: initialData?.education_info?.highest_qualification || '',
        professional_certifications: initialData?.education_info?.certifications || '',
        special_skills: initialData?.education_info?.skills || '',
        languages_known: initialData?.education_info?.languages || '',

        // Work Experience
        bms_experience: initialData?.experience_info?.bms_experience || '',
        total_experience: initialData?.experience_info?.total_experience || '',
        previous_company: initialData?.experience_info?.previous_company || '',
        last_designation: initialData?.experience_info?.last_designation || '',
        key_responsibilities: initialData?.experience_info?.responsibilities || '',

        // Salary & Bank
        basic_salary: initialData?.basic_salary?.toString() || '',
        allowances: initialData?.benefits_info?.allowances || '',
        incentives: initialData?.benefits_info?.incentives || '',
        other_benefits: initialData?.benefits_info?.benefits || '',
        bank_name: initialData?.bank_name || '',
        account_holder_name: initialData?.account_holder_name || '',
        bank_account_number: initialData?.bank_account_number || '',
        confirm_account_number: initialData?.bank_account_number || '',
        bank_branch: initialData?.bank_branch || '',

        // Emergency & Attendance
        emergency_contact_name: initialData?.emergency_contact?.name || '',
        emergency_relationship: initialData?.emergency_contact?.relationship || '',
        emergency_contact_number: initialData?.emergency_contact?.phone || '',
        previous_leave_data: initialData?.leave_balance_info?.previous_leave || '',
        leave_balance: initialData?.leave_balance_info?.balance || '',
    });

    const selectedRole = roles.find(r => r.id.toString() === formData.roleId);

    const fetchBranches = async () => {
        try {
            const data = await branchService.getBranchesAll();
            setBranches(data);
        } catch (error) {
            console.error("Failed to fetch branches", error);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    // Load detailed staff data if needed
    useEffect(() => {
        const loadStaffDetails = async () => {
            if (currentStaffId) {
                try {
                    const details = await staffService.getStaffDetails(currentStaffId);
                    if (details) {
                        setFormData(prev => ({
                            ...prev,
                            // Basic
                            name: details.full_name || prev.name,
                            name_with_initial: details.name_with_initial || prev.name_with_initial,
                            nic: details.nic || prev.nic,
                            gender: details.gender || prev.gender,
                            date_of_birth: formatDate(details.date_of_birth),
                            age: details.age?.toString() || prev.age,
                            nationality: details.nationality || prev.nationality,
                            marital_status: details.marital_status || prev.marital_status,
                            preferred_language: details.preferred_language || prev.preferred_language,
                            profile_image: details.profile_image || prev.profile_image,

                            // Contact
                            address: details.address || prev.address,
                            mailing_address: details.mailing_address || prev.mailing_address,
                            contactKey: details.contact_no || prev.contactKey,
                            personal_mobile: details.personal_mobile || prev.personal_mobile,
                            personal_email: details.personal_email || prev.personal_email,

                            // Employment
                            department: details.department || prev.department,
                            employee_type: details.employee_type || prev.employee_type,
                            joinedDate: formatDate(details.joining_date),
                            permanent_date: formatDate(details.permanent_date),
                            confirmation_date: formatDate(details.confirmation_date),
                            is_blacklisted: details.is_blacklisted === 1 || details.is_blacklisted === true,
                            bond_signed: details.bond_signed === 1 || details.bond_signed === true,
                            bond_period_from: formatDate(details.bond_period_from),
                            bond_period_to: formatDate(details.bond_period_to),
                            branch: details.branch_id?.toString() || prev.branch,
                            branch_code: details.branch_code || prev.branch_code,
                            office_mobile: details.office_mobile || prev.office_mobile,
                            office_email: details.office_email || prev.office_email,

                            // Education
                            highest_qualification: details.education_info?.highest_qualification || prev.highest_qualification,
                            professional_certifications: details.education_info?.certifications || prev.professional_certifications,
                            special_skills: details.education_info?.skills || prev.special_skills,
                            languages_known: details.education_info?.languages || prev.languages_known,

                            // Experience
                            bms_experience: details.experience_info?.bms_experience || prev.bms_experience,
                            total_experience: details.experience_info?.total_experience || prev.total_experience,
                            previous_company: details.experience_info?.previous_company || prev.previous_company,
                            last_designation: details.experience_info?.last_designation || prev.last_designation,
                            key_responsibilities: details.experience_info?.responsibilities || prev.key_responsibilities,

                            // Salary
                            basic_salary: details.basic_salary?.toString() || prev.basic_salary,
                            allowances: details.benefits_info?.allowances || prev.allowances,
                            incentives: details.benefits_info?.incentives || prev.incentives,
                            other_benefits: details.benefits_info?.benefits || prev.other_benefits,
                            bank_name: details.bank_name || prev.bank_name,
                            account_holder_name: details.account_holder_name || prev.account_holder_name,
                            bank_account_number: details.bank_account_number || prev.bank_account_number,
                            confirm_account_number: details.bank_account_number || prev.confirm_account_number,
                            bank_branch: details.bank_branch || prev.bank_branch,

                            // Emergency
                            emergency_contact_name: details.emergency_contact?.name || prev.emergency_contact_name,
                            emergency_relationship: details.emergency_contact?.relationship || prev.emergency_relationship,
                            emergency_contact_number: details.emergency_contact?.phone || prev.emergency_contact_number,
                            previous_leave_data: details.leave_balance_info?.previous_leave || prev.previous_leave_data,
                            leave_balance: details.leave_balance_info?.balance || prev.leave_balance,
                        }));
                        if (details.profile_image_url) {
                            setPreviewImage(details.profile_image_url);
                        } else if (details.profile_image) {
                            const url = details.profile_image.startsWith('http')
                                ? details.profile_image
                                : `${API_BASE_URL.replace('/api', '')}/storage/${details.profile_image}`;
                            setPreviewImage(url);
                        }
                    }
                } catch (err) {
                    console.error("Failed to load staff details", err);
                }
            }
        };
        loadStaffDetails();
    }, [currentStaffId]);

    // Real-time Validations with EXCLUSION OF CURRENT USER
    useEffect(() => {
        const checkNIC = async () => {
            if (formData.nic && (formData.nic.length === 10 || formData.nic.length === 12)) {
                // Parse for HR data info
                const parsed = nicService.parseNIC(formData.nic);
                if (parsed) {
                    setFormData(prev => ({
                        ...prev,
                        gender: parsed.gender,
                        date_of_birth: parsed.dob,
                        age: parsed.age.toString()
                    }));
                }

                // CHECK DUPLICATION (Exclude current user)
                const isAvailable = await staffService.checkAvailability('nic', formData.nic, currentStaffId);
                if (!isAvailable) {
                    setFieldErrors(prev => ({ ...prev, nic: 'This NIC belongs to another staff member' }));
                } else {
                    setFieldErrors(prev => ({ ...prev, nic: '' }));
                }
            }
        };
        const timer = setTimeout(checkNIC, 500);
        return () => clearTimeout(timer);
    }, [formData.nic, currentStaffId]);

    useEffect(() => {
        const checkEmail = async () => {
            // Login Email Check
            if (formData.email && formData.email.includes('@')) {
                const isAvailable = await staffService.checkAvailability('email', formData.email, currentStaffId);
                if (!isAvailable) {
                    setFieldErrors(prev => ({ ...prev, email: 'This login email is already taken by another user' }));
                } else {
                    setFieldErrors(prev => ({ ...prev, email: '' }));
                }
            }
            // Personal Email Check
            if (formData.personal_email && formData.personal_email.includes('@')) {
                const isAvailable = await staffService.checkAvailability('personal_email', formData.personal_email, currentStaffId);
                if (!isAvailable) {
                    setFieldErrors(prev => ({ ...prev, personal_email: 'This personal email is registered to someone else' }));
                } else {
                    setFieldErrors(prev => ({ ...prev, personal_email: '' }));
                }
            }
        };
        const timer = setTimeout(checkEmail, 600);
        return () => clearTimeout(timer);
    }, [formData.email, formData.personal_email, currentStaffId]);

    useEffect(() => {
        const checkContact = async () => {
            // Login Mobile Check
            if (formData.contactKey && formData.contactKey.length === 10) {
                const isAvailable = await staffService.checkAvailability('contact', formData.contactKey, currentStaffId);
                if (!isAvailable) {
                    setFieldErrors(prev => ({ ...prev, contactKey: 'This login mobile is already used by another staff' }));
                } else {
                    setFieldErrors(prev => ({ ...prev, contactKey: '' }));
                }
            }
            // Personal Mobile Check
            if (formData.personal_mobile && formData.personal_mobile.length === 10) {
                const isAvailable = await staffService.checkAvailability('personal_mobile', formData.personal_mobile, currentStaffId);
                if (!isAvailable) {
                    setFieldErrors(prev => ({ ...prev, personal_mobile: 'This personal mobile is already registered' }));
                } else {
                    setFieldErrors(prev => ({ ...prev, personal_mobile: '' }));
                }
            }
        };
        const timer = setTimeout(checkContact, 500);
        return () => clearTimeout(timer);
    }, [formData.contactKey, formData.personal_mobile, currentStaffId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        if (name === 'branch') {
            const selectedBranch = branches.find(b => b.id.toString() === value);
            if (selectedBranch) {
                setFormData(prev => ({
                    ...prev,
                    branch: value,
                    branch_code: selectedBranch.branch_id || '',
                    office_mobile: selectedBranch.phone || '',
                    office_email: selectedBranch.email || ''
                }));
            } else {
                setFormData(prev => ({ ...prev, [name]: val }));
            }
        } else if (name === 'email') {
            setFormData(prev => ({ ...prev, email: value, office_email: value }));
        } else if (name === 'contactKey') {
            setFormData(prev => ({ ...prev, contactKey: value, office_mobile: value }));
        } else {
            setFormData(prev => ({ ...prev, [name]: val }));
        }

        // Field-specific validation resets
        if (fieldErrors[name] && !['nic', 'email', 'contactKey', 'personal_email', 'personal_mobile'].includes(name)) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const validateTab = (tab: TabType): string | null => {
        const errors: Record<string, string> = {};

        if (tab === 'basic') {
            if (!formData.name.trim()) errors.name = 'Full Name is required';
            if (!formData.nic.trim()) errors.nic = 'NIC is required';
            if (!formData.contactKey.trim()) errors.contactKey = 'Login Mobile is required';

            const nicRegex = /^([0-9]{9}[x|X|v|V]|[0-9]{12})$/;
            if (formData.nic && !nicRegex.test(formData.nic)) errors.nic = 'Invalid NIC format';
        }

        if (tab === 'employment') {
            if (!formData.roleId) errors.roleId = 'Role is required';
            if (!formData.email.trim()) errors.email = 'Login Email is required';
        }

        // Check for duplication block errors
        const blockingErrors = ['nic', 'email', 'contactKey', 'personal_email', 'personal_mobile'];
        for (const field of blockingErrors) {
            if (fieldErrors[field]) {
                errors[field] = fieldErrors[field];
            }
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(prev => ({ ...prev, ...errors }));
            return Object.values(errors)[0];
        }

        return null;
    };

    const handleSubmitClick = async () => {
        const error = validateTab(currentTab);
        if (error) {
            toast.error(error);
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append('staffId', currentStaffId);
            data.append('role_name', selectedRole?.name || '');
            data.append('email_id', formData.email);
            data.append('account_status', formData.isActive ? 'active' : 'inactive');
            if (formData.password) data.append('password', formData.password);

            data.append('full_name', formData.name);
            data.append('name_with_initial', formData.name_with_initial);
            data.append('nic', formData.nic);
            data.append('gender', formData.gender);
            data.append('date_of_birth', formData.date_of_birth);
            data.append('age', formData.age);
            data.append('nationality', formData.nationality);
            data.append('marital_status', formData.marital_status);
            data.append('preferred_language', formData.preferred_language);
            data.append('address', formData.address);
            data.append('mailing_address', formData.mailing_address);
            data.append('contact_no', formData.contactKey);
            data.append('personal_mobile', formData.personal_mobile);
            data.append('personal_email', formData.personal_email);
            data.append('department', formData.department);
            data.append('employee_type', formData.employee_type);
            data.append('joining_date', formData.joinedDate);
            data.append('permanent_date', formData.permanent_date);
            data.append('confirmation_date', formData.confirmation_date);
            data.append('is_blacklisted', formData.is_blacklisted ? '1' : '0');
            data.append('bond_signed', formData.bond_signed ? '1' : '0');
            data.append('bond_period_from', formData.bond_period_from);
            data.append('bond_period_to', formData.bond_period_to);
            data.append('branch_id', formData.branch);
            data.append('branch_code', formData.branch_code);
            data.append('office_mobile', formData.office_mobile);
            data.append('office_email', formData.office_email);

            data.append('education_info', JSON.stringify({
                highest_qualification: formData.highest_qualification,
                certifications: formData.professional_certifications,
                skills: formData.special_skills,
                languages: formData.languages_known
            }));

            data.append('experience_info', JSON.stringify({
                bms_experience: formData.bms_experience,
                total_experience: formData.total_experience,
                previous_company: formData.previous_company,
                last_designation: formData.last_designation,
                responsibilities: formData.key_responsibilities
            }));

            data.append('benefits_info', JSON.stringify({
                allowances: formData.allowances,
                incentives: formData.incentives,
                benefits: formData.other_benefits
            }));

            data.append('emergency_contact', JSON.stringify({
                name: formData.emergency_contact_name,
                relationship: formData.emergency_relationship,
                phone: formData.emergency_contact_number
            }));

            data.append('leave_balance_info', JSON.stringify({
                previous_leave: formData.previous_leave_data,
                balance: formData.leave_balance
            }));

            data.append('basic_salary', formData.basic_salary);
            data.append('bank_name', formData.bank_name);
            data.append('account_holder_name', formData.account_holder_name);
            data.append('bank_account_number', formData.bank_account_number);
            data.append('bank_branch', formData.bank_branch);

            if (profileFile) {
                data.append('profile_image_file', profileFile);
            }

            await onSubmit(data);
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'basic', label: 'Identity & Contact', icon: <User className="w-4 h-4" /> },
        { id: 'employment', label: 'Employment', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'education', label: 'Qualifications', icon: <Award className="w-4 h-4" /> },
        { id: 'experience', label: 'Experience', icon: <FileText className="w-4 h-4" /> },
        { id: 'salary', label: 'Salary & Bank', icon: <DollarSign className="w-4 h-4" /> },
        { id: 'emergency', label: 'HR Others', icon: <Heart className="w-4 h-4" /> },
    ];

    const renderField = (label: string, name: string, type: string = 'text', placeholder: string = '', options?: { value: string; label: string }[], isRequired: boolean = false, isReadOnly: boolean = false, autoComplete: string = 'off') => (
        <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            {type === 'select' ? (
                <select
                    name={name}
                    value={(formData as any)[name]}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                    <option value="">Select {label}</option>
                    {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            ) : type === 'textarea' ? (
                <textarea
                    name={name}
                    value={(formData as any)[name]}
                    onChange={handleChange}
                    rows={2}
                    placeholder={placeholder}
                    readOnly={isReadOnly}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                />
            ) : (
                <div className="relative">
                    <input
                        name={name}
                        value={(formData as any)[name]}
                        onChange={handleChange}
                        type={type}
                        placeholder={placeholder}
                        readOnly={isReadOnly}
                        autoComplete={autoComplete}
                        className={`w-full px-3 py-2 ${isReadOnly ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-400' : 'bg-white dark:bg-gray-800'} border ${fieldErrors[name] ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                    />
                    {fieldErrors[name] && <p className="text-[10px] text-red-500 mt-1 font-medium">{fieldErrors[name]}</p>}
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4 backdrop-blur-md">
            <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                UPDATE PROFILE <span className="text-blue-600 text-sm">{currentStaffId}</span>
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">Review and modify staff information securely</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex px-6 bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800 overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setCurrentTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${currentTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab.icon} {tab.label.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Fake inputs to prevent Chrome autofill */}
                    <input type="text" style={{ display: 'none' }} aria-hidden="true" />
                    <input type="password" style={{ display: 'none' }} aria-hidden="true" />

                    {currentTab === 'basic' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                            <div className="flex flex-col md:flex-row gap-10 items-start">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative group">
                                        <div className="w-36 h-36 rounded-3xl bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden ring-4 ring-white dark:ring-gray-800">
                                            {previewImage ? (
                                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-16 h-16 text-gray-300" />
                                            )}
                                        </div>
                                        <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl cursor-pointer shadow-xl hover:scale-110 transition-transform">
                                            <Camera className="w-5 h-5" />
                                            <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                    <div className="col-span-1 md:col-span-2">
                                        {renderField('Full Name', 'name', 'text', '', [], true)}
                                    </div>
                                    {renderField('Name with Initials', 'name_with_initial', 'text', '', [], true)}
                                    {renderField('NIC Number', 'nic', 'text', '', [], true)}
                                    {renderField('Date of Birth', 'date_of_birth', 'date')}
                                    <div className="grid grid-cols-2 gap-4">
                                        {renderField('Gender', 'gender', 'select', '', [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }])}
                                        {renderField('Age', 'age', 'number')}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                                {renderField('Personal Mobile (Login)', 'contactKey', 'tel', '', [], true, false, 'new-password')}
                                <div className="col-span-1 md:col-span-2">
                                    {renderField('Personal Email', 'personal_email', 'email')}
                                </div>
                                <div className="col-span-1 md:col-span-3">
                                    {renderField('Permanent Address', 'address', 'textarea', '', [], true)}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentTab === 'employment' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {renderField('Role', 'roleId', 'select', '', roles.map(r => ({ value: r.id.toString(), label: r.display_name })), true)}
                                {renderField('Login Email (System)', 'email', 'email', '', [], true, false, 'new-email')}
                                {renderField('Department', 'department')}
                                {renderField('Employee Type', 'employee_type', 'select', '', [
                                    { value: 'Permanent', label: 'Permanent' },
                                    { value: 'Contract', label: 'Contract' },
                                    { value: 'Probation', label: 'Probation' }
                                ])}
                                {renderField('Date of Joining', 'joinedDate', 'date')}
                                {renderField('Permanent Date', 'permanent_date', 'date')}
                                {renderField('Confirmation Date', 'confirmation_date', 'date')}
                            </div>

                            <div className="bg-orange-50/50 dark:bg-orange-950/10 p-6 rounded-3xl border border-orange-100 dark:border-orange-900/50 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="bond_signed"
                                        checked={formData.bond_signed}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                                    />
                                    <label className="text-sm font-bold text-orange-900 dark:text-orange-300">Bond Signed</label>
                                </div>
                                {renderField('Bond Period From', 'bond_period_from', 'date')}
                                {renderField('Bond Period To', 'bond_period_to', 'date')}
                            </div>

                            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/50">
                                <h4 className="text-xs font-black text-blue-900 dark:text-blue-300 mb-4 uppercase tracking-widest">Office & Location</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {renderField('Branch', 'branch', 'select', '', branches.map(b => ({ value: b.id.toString(), label: b.branch_name })), true)}
                                    {renderField('Branch Code', 'branch_code', 'text', '', [], false, true)}
                                    {renderField('Office Mobile', 'office_mobile', 'text', '', [], false, true)}
                                    {renderField('Office Email', 'office_email', 'text', '', [], false, true)}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentTab === 'salary' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {renderField('Basic Salary', 'basic_salary', 'number')}
                                {renderField('Allowances', 'allowances')}
                                {renderField('Incentives / Commission', 'incentives')}
                            </div>
                            <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-3xl space-y-6">
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Bank Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {renderField('Bank Name', 'bank_name', 'select', '', SRI_LANKAN_BANKS.map(b => ({ value: b, label: b })), true)}
                                    {renderField('Account Holder', 'account_holder_name')}
                                    {renderField('Account Number', 'bank_account_number', 'text', '', [], true)}
                                    {renderField('Confirm Account Number', 'confirm_account_number', 'text', '', [], true)}
                                    <div className="col-span-1 md:col-span-2">
                                        {renderField('Bank Branch', 'bank_branch')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Simple rendering for other HR tabs */}
                    {(currentTab === 'education' || currentTab === 'experience' || currentTab === 'emergency') && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {currentTab === 'education' && (
                                <>
                                    {renderField('Highest Qualification', 'highest_qualification')}
                                    {renderField('Special Skills', 'special_skills', 'textarea')}
                                    {renderField('Languages', 'languages_known')}
                                </>
                            )}
                            {currentTab === 'experience' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {renderField('BMS Capital Experience', 'bms_experience', 'text', 'e.g., 2 Years')}
                                        {renderField('Total Experience', 'total_experience', 'text', 'Total career experience')}
                                    </div>
                                    {renderField('Previous Company', 'previous_company')}
                                    {renderField('Last Designation', 'last_designation')}
                                    {renderField('Key Responsibilities', 'key_responsibilities', 'textarea')}
                                </div>
                            )}
                            {currentTab === 'emergency' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {renderField('Emergency Contact Name', 'emergency_contact_name')}
                                    {renderField('Relationship', 'emergency_relationship')}
                                    {renderField('Emergency Number', 'emergency_contact_number')}

                                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                                        <div className="col-span-1 md:col-span-2">
                                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Attendance & Leave</h4>
                                        </div>
                                        {renderField('Previous Leave Data', 'previous_leave_data', 'textarea')}
                                        {renderField('Initial Leave Balance', 'leave_balance', 'text')}
                                    </div>

                                    <div className="col-span-2 p-6 bg-red-50 dark:bg-red-950/10 rounded-3xl border border-red-100 dark:border-red-900/50 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-red-900 dark:text-red-300">Account Active Status</p>
                                            <p className="text-[10px] text-red-600 font-medium">Toggle account access for this staff member</p>
                                        </div>
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                            className={`px-6 py-2 rounded-2xl text-xs font-black transition-all ${formData.isActive
                                                ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                                                : 'bg-gray-400 text-white'}`}
                                        >
                                            {formData.isActive ? 'ACTIVE' : 'LOCKED'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end gap-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                    <button onClick={onClose} className="px-8 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                        DISCARD
                    </button>
                    <button
                        onClick={handleSubmitClick}
                        disabled={loading}
                        className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                    >
                        {loading ? 'PROCESSING...' : 'SAVE CHANGES'}
                        {!loading && <FileText className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
