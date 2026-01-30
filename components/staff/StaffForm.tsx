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
import { useStaffDraftManager } from '../../hooks/staff/useStaffDraftManager';
import { StaffDraftModal } from './StaffDraftModal';
import { Save, History } from 'lucide-react';

interface StaffFormProps {
    onClose: () => void;
    onSubmit: (data: any) => Promise<any>;
    roles: Role[];
}

type TabType = 'basic' | 'employment' | 'education' | 'experience' | 'salary' | 'emergency';

export function StaffForm({ onClose, onSubmit, roles }: StaffFormProps) {
    const [currentTab, setCurrentTab] = useState<TabType>('basic');
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [profileFile, setProfileFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        // Authentication & Role
        roleId: '',
        email: '',
        password: '',
        isActive: true,

        // Basic Info
        name: '',
        name_with_initial: '',
        nic: '',
        gender: 'Male',
        date_of_birth: '',
        age: '',
        nationality: 'Sri Lankan',
        marital_status: 'Single',
        preferred_language: 'Sinhala',
        profile_image: '',

        // Contact Details
        address: '',
        mailing_address: '',
        contactKey: '',
        personal_mobile: '',
        personal_email: '',

        // Employment Details
        department: '',
        employee_type: 'Permanent',
        joinedDate: '',
        permanent_date: '',
        confirmation_date: '',
        is_blacklisted: false,
        bond_signed: false,
        bond_period_from: '',
        bond_period_to: '',
        branch: '',
        branch_code: '',
        office_mobile: '',
        office_email: '',

        // Education
        highest_qualification: '',
        professional_certifications: '',
        special_skills: '',
        languages_known: '',

        // Work Experience
        bms_experience: '',
        total_experience: '',
        previous_company: '',
        last_designation: '',
        key_responsibilities: '',

        // Salary & Bank
        basic_salary: '',
        allowances: '',
        incentives: '',
        other_benefits: '',
        bank_name: '',
        account_holder_name: '',
        bank_account_number: '',
        confirm_account_number: '',
        bank_branch: '',

        // Emergency & Attendance
        emergency_contact_name: '',
        emergency_relationship: '',
        emergency_contact_number: '',
        previous_leave_data: '',
        leave_balance: '',
    });

    const selectedRole = roles.find(r => r.id.toString() === formData.roleId);
    const isAdminRole = selectedRole?.name === 'admin' || selectedRole?.name === 'super_admin';

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

    const handleLoadDraft = useCallback((data: any, tab: any) => {
        setFormData(data);
        setCurrentTab(tab);
        if (data.profile_image) {
            setPreviewImage(data.profile_image);
        }
    }, []);

    const {
        drafts,
        isDraftModalOpen,
        setIsDraftModalOpen,
        saveDraft,
        loadDraft,
        deleteDraft,
    } = useStaffDraftManager(formData, currentTab, handleLoadDraft);

    // Automatic NIC Parsing & Availability Check
    useEffect(() => {
        const checkNIC = async () => {
            if (formData.nic && (formData.nic.length === 10 || formData.nic.length === 12)) {
                // Parse NIC
                const parsed = nicService.parseNIC(formData.nic);
                if (parsed) {
                    setFormData(prev => ({
                        ...prev,
                        gender: parsed.gender,
                        date_of_birth: parsed.dob,
                        age: parsed.age.toString()
                    }));
                }

                // Check Duplication
                const isAvailable = await staffService.checkAvailability('nic', formData.nic);
                if (!isAvailable) {
                    setFieldErrors(prev => ({ ...prev, nic: 'This NIC is already registered to another staff member' }));
                } else {
                    setFieldErrors(prev => ({ ...prev, nic: '' }));
                }
            } else if (formData.nic && formData.nic.length > 0) {
                // Basic format check
                const nicRegex = /^([0-9]{9}[x|X|v|V]|[0-9]{12})$/;
                if (!nicRegex.test(formData.nic)) {
                    setFieldErrors(prev => ({ ...prev, nic: 'Invalid NIC format' }));
                } else {
                    setFieldErrors(prev => ({ ...prev, nic: '' }));
                }
            }
        };

        const timer = setTimeout(checkNIC, 500);
        return () => clearTimeout(timer);
    }, [formData.nic]);

    // Email Availability Check (Login & Personal)
    useEffect(() => {
        const checkEmail = async () => {
            // Check login email
            if (formData.email && formData.email.includes('@')) {
                const isAvailable = await staffService.checkAvailability('email', formData.email);
                if (!isAvailable) {
                    setFieldErrors(prev => ({ ...prev, email: 'This login email is already registered' }));
                } else {
                    setFieldErrors(prev => ({ ...prev, email: '' }));
                }
            }

            // Check personal email (independent check)
            if (formData.personal_email && formData.personal_email.includes('@')) {
                const isAvailable = await staffService.checkAvailability('personal_email', formData.personal_email);
                if (!isAvailable) {
                    setFieldErrors(prev => ({ ...prev, personal_email: 'Personal email already registered' }));
                } else {
                    setFieldErrors(prev => ({ ...prev, personal_email: '' }));
                }
            }
        };
        const timer = setTimeout(checkEmail, 600);
        return () => clearTimeout(timer);
    }, [formData.email, formData.personal_email]);

    // Contact Availability Check (Login & Personal)
    useEffect(() => {
        const checkContact = async () => {
            // Check login mobile
            if (formData.contactKey && formData.contactKey.length === 10) {
                const isAvailable = await staffService.checkAvailability('contact', formData.contactKey);
                if (!isAvailable) {
                    setFieldErrors(prev => ({ ...prev, contactKey: 'This login mobile is already in use' }));
                } else {
                    setFieldErrors(prev => ({ ...prev, contactKey: '' }));
                }
            } else if (formData.contactKey && formData.contactKey.length > 0) {
                if (!/^0[0-9]{9}$/.test(formData.contactKey)) {
                    setFieldErrors(prev => ({ ...prev, contactKey: 'Must be 10 digits starting with 0' }));
                } else {
                    setFieldErrors(prev => ({ ...prev, contactKey: '' }));
                }
            }

            // Check personal mobile (independent)
            if (formData.personal_mobile && formData.personal_mobile.length === 10) {
                const isAvailable = await staffService.checkAvailability('personal_mobile', formData.personal_mobile);
                if (!isAvailable) {
                    setFieldErrors(prev => ({ ...prev, personal_mobile: 'Personal mobile already registered' }));
                } else {
                    setFieldErrors(prev => ({ ...prev, personal_mobile: '' }));
                }
            }
        };
        const timer = setTimeout(checkContact, 500);
        return () => clearTimeout(timer);
    }, [formData.contactKey, formData.personal_mobile]);

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
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else if (name === 'email') {
            // Mirror login email to office email
            setFormData(prev => ({ ...prev, email: value, office_email: value }));
        } else if (name === 'contactKey') {
            // Mirror login mobile to office mobile
            setFormData(prev => ({ ...prev, contactKey: value, office_mobile: value }));
        } else {
            setFormData(prev => ({ ...prev, [name]: val }));
        }

        // Immediate simple validation on change
        if (name === 'bank_account_number' || name === 'confirm_account_number') {
            const acc = name === 'bank_account_number' ? value : formData.bank_account_number;
            const confirm = name === 'confirm_account_number' ? value : formData.confirm_account_number;
            if (acc !== confirm && confirm.length > 0) {
                setFieldErrors(prev => ({ ...prev, confirm_account_number: 'Account numbers do not match' }));
            } else {
                setFieldErrors(prev => ({ ...prev, confirm_account_number: '' }));
            }
        }

        if (name === 'bank_name') {
            const rule = BANK_VALIDATION_RULES[value] || BANK_VALIDATION_RULES['Default'];
            if (formData.bank_account_number && !rule.regex.test(formData.bank_account_number)) {
                setFieldErrors(prev => ({ ...prev, bank_account_number: rule.error }));
            } else {
                setFieldErrors(prev => ({ ...prev, bank_account_number: '' }));
            }
        }

        if (name === 'bank_account_number') {
            const rule = BANK_VALIDATION_RULES[formData.bank_name] || BANK_VALIDATION_RULES['Default'];
            if (value && !rule.regex.test(value)) {
                setFieldErrors(prev => ({ ...prev, bank_account_number: rule.error }));
            } else {
                setFieldErrors(prev => ({ ...prev, bank_account_number: '' }));
            }
        }

        if (name === 'basic_salary') {
            if (parseFloat(value) < 0) {
                setFieldErrors(prev => ({ ...prev, basic_salary: 'Salary cannot be negative' }));
            } else {
                setFieldErrors(prev => ({ ...prev, basic_salary: '' }));
            }
        }

        // Clear general errors if field is modified (except duplication errors)
        if (fieldErrors[name] && !['nic', 'email', 'contactKey', 'personal_email', 'personal_mobile'].includes(name)) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateTab = (tab: TabType): string | null => {
        const errors: Record<string, string> = {};

        if (tab === 'basic') {
            if (!formData.name.trim()) errors.name = 'Full Name is required';
            if (!formData.name_with_initial.trim()) errors.name_with_initial = 'Name with Initials is required';
            if (!formData.nic.trim()) errors.nic = 'NIC is required';
            if (!formData.gender) errors.gender = 'Gender is required';
            if (!formData.age || parseInt(formData.age) < 18) errors.age = 'Must be 18 or older';
            if (!formData.address.trim()) errors.address = 'Permanent Address is required';

            if (!formData.contactKey.trim()) {
                errors.contactKey = 'Personal Mobile (Login) is required';
            } else if (!/^0[0-9]{9}$/.test(formData.contactKey)) {
                errors.contactKey = 'Mobile must be 10 digits starting with 0';
            }

            // NIC Format
            const nicRegex = /^([0-9]{9}[x|X|v|V]|[0-9]{12})$/;
            if (formData.nic && !nicRegex.test(formData.nic)) {
                errors.nic = 'Invalid NIC format';
            }
        }

        if (tab === 'employment') {
            if (!formData.roleId) errors.roleId = 'Role is required';
            if (!formData.email.trim()) errors.email = 'Login Email (Office) is required';
            if (!formData.email.includes('@')) errors.email = 'Invalid email format';
            if (!formData.password.trim() && isAdminRole) {
                errors.password = 'Password is required for admin roles';
            }
        }

        if (tab === 'salary') {
            if (!formData.basic_salary) {
                errors.basic_salary = 'Basic salary is required';
            } else if (parseFloat(formData.basic_salary) < 0) {
                errors.basic_salary = 'Salary cannot be negative';
            }

            if (!formData.bank_name) {
                errors.bank_name = 'Bank Name is required';
            }

            if (!formData.bank_account_number.trim()) {
                errors.bank_account_number = 'Account number is required';
            } else {
                const rule = BANK_VALIDATION_RULES[formData.bank_name] || BANK_VALIDATION_RULES['Default'];
                if (!rule.regex.test(formData.bank_account_number)) {
                    errors.bank_account_number = rule.error;
                }
            }

            if (formData.bank_account_number !== formData.confirm_account_number) {
                errors.confirm_account_number = 'Account numbers do not match';
            }
        }

        // Check for duplication errors (NIC, Email, Contact) if they've been set by useEffect
        const duplicationFields: Record<string, string> = {
            nic: 'NIC',
            email: 'Login Email',
            contactKey: 'Contact Number'
        };

        Object.keys(duplicationFields).forEach(field => {
            if (fieldErrors[field] && fieldErrors[field].toLowerCase().includes('already')) {
                errors[field] = fieldErrors[field];
            }
        });

        if (Object.keys(errors).length > 0) {
            setFieldErrors(prev => ({ ...prev, ...errors }));
            return Object.values(errors)[0]; // Return the first error message
        }

        return null;
    };

    const handleTabChange = (nextTabId: TabType) => {
        const tabOrder: TabType[] = ['basic', 'employment', 'education', 'experience', 'salary', 'emergency'];
        const currentIndex = tabOrder.indexOf(currentTab);
        const nextIndex = tabOrder.indexOf(nextTabId);

        if (nextIndex <= currentIndex) {
            setCurrentTab(nextTabId);
            return;
        }

        // Sequentially validate tabs when trying to jump forward
        for (let i = currentIndex; i < nextIndex; i++) {
            const error = validateTab(tabOrder[i]);
            if (error) {
                toast.warning(`Please complete the ${tabOrder[i].charAt(0).toUpperCase() + tabOrder[i].slice(1)} section: ${error}`);
                setCurrentTab(tabOrder[i]);
                return;
            }
        }

        setCurrentTab(nextTabId);
    };

    const validate = () => {
        const tabOrder: TabType[] = ['basic', 'employment', 'education', 'experience', 'salary', 'emergency'];
        for (const tab of tabOrder) {
            const error = validateTab(tab);
            if (error) {
                toast.error(`${tab.charAt(0).toUpperCase() + tab.slice(1)}: ${error}`);
                setCurrentTab(tab);
                return false;
            }
        }
        return true;
    };

    const handleSubmitClick = async () => {
        if (!validate()) {
            toast.error('Please fix the errors before submitting.');
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();

            data.append('staffId', '');

            // Map flat formData to the structured backend payload
            data.append('role_name', selectedRole?.name || '');
            data.append('roleId', formData.roleId);
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

            // JSON fields (PHP Laravel will decode them automatically in Staff model if cast)
            // But we send them as individual appends if multipart, or a stringified JSON
            // For multipart/form-data, we can send as arrays: education_info[skill] etc
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

            // Regular fields
            data.append('basic_salary', formData.basic_salary);
            data.append('bank_name', formData.bank_name);
            data.append('account_holder_name', formData.account_holder_name);
            data.append('bank_account_number', formData.bank_account_number);
            data.append('bank_branch', formData.bank_branch);

            // Work info for backend compatibility
            data.append('work_info', JSON.stringify({
                designation: selectedRole?.display_name || '',
                department: formData.department
            }));

            if (profileFile) {
                data.append('profile_image_file', profileFile);
            }

            await onSubmit(data);
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to save staff member');
        } finally {
            setLoading(false);
        }
    };

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'basic', label: 'Basic & Contact', icon: <User className="w-4 h-4" /> },
        { id: 'employment', label: 'Employment', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'education', label: 'Qualifications', icon: <Award className="w-4 h-4" /> },
        { id: 'experience', label: 'Experience', icon: <FileText className="w-4 h-4" /> },
        { id: 'salary', label: 'Salary & Bank', icon: <DollarSign className="w-4 h-4" /> },
        { id: 'emergency', label: 'Others', icon: <Heart className="w-4 h-4" /> },
    ];

    const renderField = (label: string, name: string, type: string = 'text', placeholder: string = '', options?: { value: string; label: string }[], isRequired: boolean = false, isReadOnly: boolean = false, autoComplete: string = 'off') => (
        <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            {type === 'select' ? (
                <select
                    name={name}
                    value={(formData as any)[name]}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 ${isReadOnly ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 cursor-not-allowed' : 'bg-white dark:bg-gray-800'} border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                >
                    <option value="">Select {label}</option>
                    {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            ) : type === 'textarea' ? (
                <textarea
                    name={name}
                    value={(formData as any)[name]}
                    onChange={handleChange}
                    rows={3}
                    placeholder={placeholder}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 ${isReadOnly ? 'bg-gray-50 text-gray-500' : 'bg-white dark:bg-gray-800'} border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none`}
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
                        onPaste={name === 'confirm_account_number' ? (e) => e.preventDefault() : undefined}
                        autoComplete={autoComplete}
                        className={`w-full px-3 py-2 ${isReadOnly ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 cursor-not-allowed font-medium' : 'bg-white dark:bg-gray-800'} border ${fieldErrors[name] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                    />
                    {fieldErrors[name] && <p className="text-[10px] text-red-500 mt-1">{fieldErrors[name]}</p>}
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[95vh]">

                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Register New Employee
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Complete all sections to maintain accurate records</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsDraftModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm font-semibold border border-gray-200 dark:border-gray-700"
                        >
                            <History className="w-4 h-4" />
                            Drafts
                        </button>
                        <button
                            onClick={() => {
                                const result = saveDraft();
                                if (result.success) toast.success(result.message);
                                else toast.info(result.message);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all text-sm font-semibold border border-blue-200 dark:border-blue-800"
                        >
                            <Save className="w-4 h-4" />
                            Save Draft
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex overflow-x-auto no-scrollbar bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${currentTab === tab.id
                                ? 'border-blue-600 text-blue-600 bg-white dark:bg-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {/* Fake inputs to prevent Chrome autofill */}
                    <input type="text" style={{ display: 'none' }} aria-hidden="true" />
                    <input type="password" style={{ display: 'none' }} aria-hidden="true" />

                    {currentTab === 'basic' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Profile Picture Upload */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                                            {previewImage ? (
                                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-12 h-12 text-gray-300" />
                                            )}
                                        </div>
                                        <label className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg cursor-pointer shadow-lg transition-transform hover:scale-110">
                                            <Camera className="w-4 h-4" />
                                            <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                                        </label>
                                    </div>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Profile Photo</span>
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                    <div className="col-span-1 md:col-span-2">
                                        {renderField('Full Name', 'name', 'text', 'As per NIC', [], true)}
                                    </div>
                                    {renderField('Name with Initials', 'name_with_initial', 'text', 'e.g., A.B.C. Perera', [], true)}
                                    {renderField('NIC Number', 'nic', 'text', 'Old or New Format', [], true)}
                                    <div className="grid grid-cols-2 gap-4">
                                        {renderField('Gender', 'gender', 'select', '', [
                                            { value: 'Male', label: 'Male' },
                                            { value: 'Female', label: 'Female' },
                                            { value: 'Other', label: 'Other' }
                                        ], true)}
                                        {renderField('Age', 'age', 'number', '', [], true)}
                                    </div>
                                    {renderField('Date of Birth', 'date_of_birth', 'date')}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" /> Identity & Contact
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {renderField('Nationality', 'nationality')}
                                    {renderField('Marital Status', 'marital_status', 'select', '', [
                                        { value: 'Single', label: 'Single' },
                                        { value: 'Married', label: 'Married' },
                                        { value: 'Widowed', label: 'Widowed' },
                                        { value: 'Separated', label: 'Separated' }
                                    ])}
                                    {renderField('Preferred Language', 'preferred_language', 'select', '', [
                                        { value: 'Sinhala', label: 'Sinhala' },
                                        { value: 'Tamil', label: 'Tamil' },
                                        { value: 'English', label: 'English' }
                                    ])}
                                    <div className="col-span-1 md:col-span-3">
                                        {renderField('Permanent Address', 'address', 'textarea', 'Complete residential address', [], true)}
                                    </div>
                                    <div className="col-span-1 md:col-span-3">
                                        {renderField('Mailing Address', 'mailing_address', 'textarea', 'If different from permanent')}
                                    </div>
                                    {renderField('Personal Mobile (Login)', 'contactKey', 'tel', 'e.g., 0771234567', [], true, false, 'new-password')}
                                    <div className="col-span-1 md:col-span-2">
                                        {renderField('Email Personal', 'personal_email', 'email')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentTab === 'employment' && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="col-span-1 md:col-span-3">
                                    {renderField('System Access Role', 'roleId', 'select', '', roles.map(r => ({ value: r.id.toString(), label: r.display_name })), true)}
                                </div>
                                {renderField('Department', 'department')}
                                {renderField('Employee Type', 'employee_type', 'select', '', [
                                    { value: 'Permanent', label: 'Permanent' },
                                    { value: 'Contract', label: 'Contract' },
                                    { value: 'Part-Time', label: 'Part-Time' },
                                    { value: 'Probation', label: 'Probation' }
                                ])}
                                {renderField('Login Email (Office)', 'email', 'email', 'Used for system login', [], true, false, 'new-email')}
                                {renderField('Date of Joining', 'joinedDate', 'date')}
                                {renderField('Permanent Date', 'permanent_date', 'date')}
                                {renderField('Confirmation Date', 'confirmation_date', 'date')}

                                <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/50 col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" name="bond_signed" checked={formData.bond_signed} onChange={handleChange} className="w-4 h-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500" />
                                        <label className="text-sm font-semibold text-orange-900 dark:text-orange-200">Bond Signed</label>
                                    </div>
                                    {renderField('Bond Period From', 'bond_period_from', 'date')}
                                    {renderField('Bond Period To', 'bond_period_to', 'date')}
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 col-span-1 md:col-span-3">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-gray-400" /> Location & Contact
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="col-span-1 md:col-span-2">
                                            {renderField('Branch / Location', 'branch', 'select', '', branches.map(b => ({ value: b.id.toString(), label: b.branch_name })), false)}
                                        </div>
                                        {renderField('Branch Code', 'branch_code', 'text', '', [], false, !!formData.branch)}
                                        {renderField('Office Mobile', 'office_mobile', 'text', '', [], false, !!formData.branch)}
                                        <div className="col-span-1 md:col-span-2">
                                            {renderField('Office Mail Address', 'office_email', 'text', '', [], false, !!formData.branch)}
                                        </div>
                                        <div className="flex items-center gap-3 pt-6">
                                            <input type="checkbox" name="is_blacklisted" checked={formData.is_blacklisted} onChange={handleChange} className="w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500" />
                                            <label className="text-sm font-bold text-red-700">Blacklisted</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentTab === 'education' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            {renderField('Highest Qualification', 'highest_qualification')}
                            {renderField('Professional Certifications', 'professional_certifications', 'textarea', 'e.g., CIMA, ACA, etc')}
                            {renderField('Special Skills', 'special_skills', 'textarea')}
                            {renderField('Languages Known', 'languages_known')}
                        </div>
                    )}

                    {currentTab === 'experience' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {renderField('BMS Capital Experience', 'bms_experience', 'text', 'e.g., 2 Years')}
                                {renderField('Total Experience', 'total_experience', 'text', 'Total career experience')}
                            </div>
                            {renderField('Previous Company', 'previous_company')}
                            {renderField('Last Designation', 'last_designation')}
                            {renderField('Key Responsibilities', 'key_responsibilities', 'textarea')}
                        </div>
                    )}

                    {currentTab === 'salary' && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {renderField('Basic Salary (LKR)', 'basic_salary', 'number', '0.00')}
                                {renderField('Allowances', 'allowances')}
                                {renderField('Incentives / Commission', 'incentives')}
                                <div className="col-span-1 md:col-span-3">
                                    {renderField('EPF / ETF / Other Benefits', 'other_benefits', 'textarea')}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100 dark:border-gray-800 bg-blue-50/30 dark:bg-blue-950/10 -mx-6 px-6 py-8">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-widest">Bank Details (Verified)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {renderField('Bank Name', 'bank_name', 'select', '', SRI_LANKAN_BANKS.map(b => ({ value: b, label: b })), true)}
                                    {renderField('Account Holder Name', 'account_holder_name', 'text', '', [], true)}
                                    {renderField('Account Number', 'bank_account_number', 'password', 'Enter account number', [], true, false, 'new-password')}
                                    {renderField('Confirm Account Number', 'confirm_account_number', 'text', 'Re-enter account number', [], true)}
                                    <div className="col-span-1 md:col-span-2">
                                        {renderField('Bank Branch', 'bank_branch', 'text', '', [], true)}
                                    </div>
                                    <div className="col-span-1 md:col-span-2 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg text-[11px] text-blue-700 dark:text-blue-400 italic">
                                        * No copy-paste allowed for account number confirmation. Please type manually to ensure accuracy.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentTab === 'emergency' && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-widest">Emergency Contact</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {renderField('Contact Person Name', 'emergency_contact_name')}
                                    {renderField('Relationship', 'emergency_relationship')}
                                    {renderField('Contact Number', 'emergency_contact_number')}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-widest">Attendance & Leave</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {renderField('Previous Leave Data', 'previous_leave_data', 'textarea')}
                                    {renderField('Initial Leave Balance', 'leave_balance', 'text', 'e.g., 14 Annual / 7 Casual')}
                                </div>
                            </div>

                            {/* Logic for Super Admin to toggle status during edit */}
                            {authService.hasRole('Admin') && (
                                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Account Status:</span>
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${formData.isActive
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-red-100 text-red-700 border border-red-200 text-gray-500'
                                            }`}
                                    >
                                        {formData.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
                    <div className="flex gap-2">
                        {currentTab !== 'basic' && (
                            <button
                                onClick={() => {
                                    const index = tabs.findIndex(t => t.id === currentTab);
                                    if (index > 0) setCurrentTab(tabs[index - 1].id);
                                }}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
                            Cancel
                        </button>
                        {currentTab === 'emergency' ? (
                            <button
                                onClick={handleSubmitClick}
                                disabled={loading}
                                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center gap-3"
                            >
                                Complete Registration
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    const index = tabs.findIndex(t => t.id === currentTab);
                                    if (index < tabs.length - 1) handleTabChange(tabs[index + 1].id as TabType);
                                }}
                                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                            >
                                Next Step <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <StaffDraftModal
                isOpen={isDraftModalOpen}
                drafts={drafts}
                onClose={() => setIsDraftModalOpen(false)}
                onLoad={(id) => loadDraft(id)}
                onDelete={(id) => deleteDraft(id)}
            />
        </div>
    );
}
