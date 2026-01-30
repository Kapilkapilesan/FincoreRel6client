import React, { useState, useEffect } from "react";
import {
    X,
    User,
    MapPin,
    Briefcase,
    Phone,
    MessageSquare,
    Mail,
    Building,
    Landmark,
    ChevronDown,
    CheckCircle2,
    ShieldCheck,
    Heart,
    Calendar,
    Camera,
    FileText,
} from "lucide-react";
import { CustomerFormData } from "../../types/customer.types";
import { customerService } from "../../services/customer.service";
import { authService } from "../../services/auth.service";
import { nicService } from "../../services/nic.service";
import { toast } from "react-toastify";

interface CustomerFormProps {
    onClose: () => void;
    onSubmit: (data: CustomerFormData) => Promise<any>;
    initialData?: Partial<CustomerFormData>;
}

// 📌 Move internal components OUTSIDE to prevent remounting/focus issues
const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100 dark:border-gray-700/50">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
            <Icon size={18} />
        </div>
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest">
            {title}
        </h3>
    </div>
);

const FormInput = ({
    label,
    name,
    type = "text",
    placeholder,
    required,
    error,
    icon: Icon,
    colSpan = 1,
    value,
    onChange,
    readOnly,
    min,
    max,
}: any) => (
    <div
        className={`space-y-1.5 ${colSpan === 2 ? "md:col-span-2" : colSpan === 3 ? "md:col-span-3" : ""
            }`}
    >
        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tight flex items-center gap-1 ml-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    <Icon size={14} />
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value || ""}
                onChange={onChange}
                readOnly={readOnly}
                min={min !== undefined ? min : type === "number" ? "0" : undefined}
                max={max}
                placeholder={placeholder}
                className={`w-full ${Icon ? "pl-9" : "pl-4"
                    } pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/40 border ${error
                        ? "border-red-500 focus:ring-red-500/10"
                        : "border-gray-200 dark:border-gray-700/50 focus:ring-blue-500/10"
                    } rounded-xl focus:outline-none focus:ring-4 focus:border-blue-500 transition-all text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 ${readOnly ? "cursor-not-allowed opacity-70" : ""
                    }`}
            />
        </div>
        {error && (
            <p className="text-[10px] text-red-500 font-bold ml-1 animate-in fade-in slide-in-from-top-1">
                {error}
            </p>
        )}
    </div>
);

const FormSelect = ({
    label,
    name,
    options,
    required,
    error,
    icon: Icon,
    colSpan = 1,
    value,
    onChange,
    disabled,
}: any) => (
    <div
        className={`space-y-1.5 ${colSpan === 2 ? "md:col-span-2" : colSpan === 3 ? "md:col-span-3" : ""
            }`}
    >
        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tight flex items-center gap-1 ml-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    <Icon size={14} />
                </div>
            )}
            <select
                name={name}
                value={value || ""}
                onChange={onChange}
                disabled={disabled}
                className={`w-full ${Icon ? "pl-9" : "pl-4"
                    } pr-10 py-2.5 bg-gray-50 dark:bg-gray-900/40 border ${error
                        ? "border-red-500 focus:ring-red-500/10"
                        : "border-gray-200 dark:border-gray-700/50 focus:ring-blue-500/10"
                    } rounded-xl focus:outline-none focus:ring-4 focus:border-blue-500 transition-all text-sm text-gray-900 dark:text-gray-100 appearance-none ${disabled
                        ? "cursor-not-allowed opacity-70 bg-gray-200 dark:bg-gray-800"
                        : "cursor-pointer"
                    }`}
            >
                <option value="">Select {label}</option>
                {options?.map((opt: any) => (
                    <option key={opt.value || opt} value={opt.value || opt}>
                        {opt.label || opt}
                    </option>
                ))}
            </select>
            {!disabled && (
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            )}
        </div>
        {error && (
            <p className="text-[10px] text-red-500 font-bold ml-1 animate-in fade-in slide-in-from-top-1">
                {error}
            </p>
        )}
    </div>
);

export function CustomerForm({
    onClose,
    onSubmit,
    initialData,
}: CustomerFormProps) {
    const [loading, setLoading] = useState(false);
    const [constants, setConstants] = useState<any>(null);
    const [filteredDistricts, setFilteredDistricts] = useState<string[]>([]);
    const [filteredCenters, setFilteredCenters] = useState<any[]>([]);

    const [formData, setFormData] = useState<Partial<CustomerFormData>>({
        customer_type: "Loan Customer",
        code_type: "NIC",
        address_type: "Home Address",
        country: "Sri Lanka",
        ...initialData,
        date_of_birth: initialData?.date_of_birth
            ? new Date(initialData.date_of_birth).toISOString().split("T")[0]
            : "",
        customer_code_confirmation: initialData?.customer_code || "",
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const isFieldOfficer = authService.hasRole("field_officer");
    const hasActiveLoans = (initialData as any)?.active_loans_count > 0;
    const isEditMode = !!initialData;
    const isExplicitlyUnlocked = (initialData as any)?.is_edit_locked === false;
    const requiresApproval =
        isEditMode && isFieldOfficer && hasActiveLoans && !isExplicitlyUnlocked;
    const isPendingApproval =
        (initialData as any)?.edit_request_status === "pending";

    useEffect(() => {
        loadConstants();
    }, []);

    const loadConstants = async () => {
        try {
            const data = await customerService.getConstants();
            const user = authService.getCurrentUser();
            const isFieldOfficer = authService.hasRole("field_officer");

            if (data) {
                let finalBranches = data.branches || [];
                let finalCenters = data.centers || [];

                // 🎯 If Field Officer, restrict to their assigned centers/branches
                if (isFieldOfficer && user) {
                    // Filter centers where this FO is assigned
                    finalCenters = data.centers.filter(
                        (c: any) => c.staff_id === user.user_name
                    );

                    // Filter branches to only those that have filtered centers
                    const assignedBranchIds = [
                        ...new Set(finalCenters.map((c: any) => c.branch_id)),
                    ];
                    finalBranches = data.branches.filter((b: any) =>
                        assignedBranchIds.includes(b.id)
                    );

                    // Auto-select if there's only one branch
                    if (
                        finalBranches.length === 1 &&
                        !formData.branch_id &&
                        !initialData
                    ) {
                        setFormData((prev) => ({
                            ...prev,
                            branch_id: finalBranches[0].id,
                        }));
                        setFilteredCenters(
                            finalCenters.filter(
                                (c: any) =>
                                    c.branch_id === finalBranches[0].id && c.status === "active"
                            )
                        );
                    }
                }

                setConstants({
                    ...data,
                    branches: finalBranches,
                    centers: data.centers, // Keep all in master constants but filtered in UI state
                });

                if (initialData?.province && data.province_districts_map) {
                    setFilteredDistricts(
                        data.province_districts_map[initialData.province] || []
                    );
                }

                // Initial filtering for centers dropdown
                if (initialData?.branch_id && data.centers) {
                    let centersToFilter = isFieldOfficer ? finalCenters : data.centers;
                    setFilteredCenters(
                        centersToFilter.filter(
                            (c: any) =>
                                c.branch_id === initialData.branch_id && c.status === "active"
                        )
                    );
                } else if (isFieldOfficer && finalBranches.length === 1) {
                    setFilteredCenters(
                        finalCenters.filter(
                            (c: any) =>
                                c.branch_id === finalBranches[0].id && c.status === "active"
                        )
                    );
                }
            }
        } catch (error) {
            console.error("Failed to load constants", error);
        }
    };

    // 🕵️ Real-time Duplicate NIC Checker
    useEffect(() => {
        const checkDuplicate = async () => {
            if (
                formData.customer_code &&
                formData.customer_code.length >= 10 &&
                /^([0-9]{9}[x|X|v|V]|[0-9]{12})$/.test(formData.customer_code)
            ) {
                try {
                    const result = await customerService.checkDuplicateNIC(
                        formData.customer_code,
                        (initialData as any)?.id as unknown as number
                    );

                    if (result.exists) {
                        setFieldErrors(prev => ({
                            ...prev,
                            customer_code: `NIC enrolled to: ${result.customer?.full_name || 'Another Customer'}`
                        }));
                    } else {
                        setFieldErrors(prev => {
                            if (prev.customer_code?.includes("NIC enrolled")) {
                                return { ...prev, customer_code: "" };
                            }
                            return prev;
                        });
                    }
                } catch (error) {
                    console.error("Duplicate check failed", error);
                }
            }
        };

        const timer = setTimeout(checkDuplicate, 600);
        return () => clearTimeout(timer);
    }, [formData.customer_code, (initialData as any)?.id]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = e.target;
        let val: any = value;

        if (
            name === "branch_id" ||
            name === "center_id" ||
            name === "grp_id" ||
            type === "number"
        ) {
            val = value === "" ? undefined : parseInt(value);
        } else if (type === "checkbox") {
            val = (e.target as HTMLInputElement).checked;
        }

        // 🔒 Status Validation: Cannot change status if in a group
        if (name === "status" && val !== "active" && (formData.grp_id || (initialData as any)?.grp_id)) {
            toast.error("Cannot block/disable customer while assigned to a group. Remove from group first.");
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: val }));

        // ✅ Real-time Field Validation
        const errors = { ...fieldErrors };

        if (name === "family_members_count") {
            const count = typeof val === "string" ? parseInt(val, 10) : Number(val);
            if (val !== undefined && val !== null && (isNaN(count) || count < 1 || count > 20)) {
                errors.family_members_count = "1-20 members";
            } else {
                delete errors.family_members_count;
            }
        } else if (name === "full_name") {
            if (val.trim().length < 3) errors.full_name = "Too short";
            else if (!/^[a-zA-Z\s.]+$/.test(val)) errors.full_name = "Letters only";
            else delete errors.full_name;
        } else if (name === "customer_code_confirmation") {
            if (val && val !== formData.customer_code) errors.customer_code_confirmation = "NIC mismatch";
            else delete errors.customer_code_confirmation;
        } else if (["first_name", "last_name", "initials"].includes(name)) {
            if (!val.trim()) errors[name] = "Required";
            else if (!/^[a-zA-Z\s.]+$/.test(val)) errors[name] = "Letters only";
            else delete errors[name];
        } else if (name === "mobile_no_1") {
            if (!/^0\d{9}$/.test(val)) errors.mobile_no_1 = "Invalid format (07XXXXXXXX)";
            else delete errors.mobile_no_1;
        } else if (fieldErrors[name]) {
            delete errors[name];
        }

        setFieldErrors(errors);

        // Dependent logic for Province -> District
        if (name === "province" && constants?.province_districts_map) {
            setFilteredDistricts(constants.province_districts_map[value] || []);
            setFormData((prev) => ({ ...prev, district: "" }));
        }

        // Dependent logic for Branch -> Center
        if (name === "branch_id") {
            const branchId = parseInt(value);
            const user = authService.getCurrentUser();
            const isFieldOfficer = authService.hasRole("field_officer");

            if (constants?.centers) {
                let centersToFilter = constants.centers;
                if (isFieldOfficer && user) {
                    centersToFilter = constants.centers.filter(
                        (c: any) => c.staff_id === user.user_name
                    );
                }
                setFilteredCenters(
                    centersToFilter.filter(
                        (c: any) => c.branch_id === branchId && c.status === "active"
                    )
                );
            } else {
                setFilteredCenters([]);
            }
            setFormData((prev) => ({
                ...prev,
                branch_id: branchId,
                center_id: undefined,
            }));
        }

        // 🧠 Auto-detect Gender, DOB and Age from NIC (Requirement 3)
        if (name === "customer_code" || name === "customer_code_confirmation") {
            const currentCode = name === "customer_code" ? val : formData.customer_code;
            const currentConf = name === "customer_code_confirmation" ? val : formData.customer_code_confirmation;

            if (currentCode && currentCode === currentConf) {
                const extractedData = nicService.parseNIC(currentCode);
                if (extractedData) {
                    setFormData((prev) => ({
                        ...prev,
                        gender: extractedData.gender,
                        date_of_birth: extractedData.dob,
                        age: extractedData.age
                    }));

                    // Clear errors if they were set
                    setFieldErrors(prev => ({
                        ...prev,
                        customer_code: "",
                        customer_code_confirmation: "",
                        gender: "",
                        date_of_birth: ""
                    }));

                    // Validate against customer type
                    const typeValidation = nicService.validateTypeGender(formData.customer_type || "Loan Customer", extractedData.gender);
                    if (!typeValidation.valid) {
                        setFieldErrors(prev => ({ ...prev, customer_type: typeValidation.message || "Invalid Gender for Type" }));
                    } else {
                        setFieldErrors(prev => ({ ...prev, customer_type: "" }));
                    }
                }
            } else if (currentCode && currentConf && currentCode !== currentConf) {
                setFieldErrors(prev => ({ ...prev, customer_code_confirmation: "NIC numbers do not match" }));
            }
        }

        // Re-validate if customer_type changes
        if (name === "customer_type" && formData.customer_code) {
            const extractedData = nicService.parseNIC(formData.customer_code);
            if (extractedData) {
                const typeValidation = nicService.validateTypeGender(val, extractedData.gender);
                if (!typeValidation.valid) {
                    setFieldErrors(prev => ({ ...prev, customer_type: typeValidation.message || "Invalid Gender for Type" }));
                } else {
                    setFieldErrors(prev => ({ ...prev, customer_type: "" }));
                }
            }
        }
    };


    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const validate = () => {
        const errors: Record<string, string> = {};

        // Helper: Alphabetical only (allows spaces, dots, and hyphens)
        const isAlphabetical = (val: string) => /^[a-zA-Z\s.-]+$/.test(val);

        // Helper: Valid SL Phone (starts with 0, 10 digits)
        const isValidPhone = (val: string) => /^0\d{9}$/.test(val);

        // Required Product / Location Details
        if (!formData.branch_id) errors.branch_id = "Branch is required";
        // center_id is now optional as per new requirement

        // Required Personal Details
        if (!formData.customer_type) errors.customer_type = "Required";
        if (!formData.title) errors.title = "Title is required";

        if (!formData.full_name?.trim()) {
            errors.full_name = "Full name is required";
        } else if (!isAlphabetical(formData.full_name)) {
            errors.full_name = "Letters only";
        } else if (formData.full_name.trim().length < 3) {
            errors.full_name = "Too short";
        }

        if (!formData.initials?.trim()) {
            errors.initials = "Initials are required";
        } else if (!isAlphabetical(formData.initials)) {
            errors.initials = "Letters only";
        }

        if (!formData.first_name?.trim()) {
            errors.first_name = "Required";
        } else if (!isAlphabetical(formData.first_name)) {
            errors.first_name = "Letters only";
        }

        if (!formData.last_name?.trim()) {
            errors.last_name = "Required";
        } else if (!isAlphabetical(formData.last_name)) {
            errors.last_name = "Letters only";
        }

        if (!formData.customer_code?.trim()) {
            errors.customer_code = "NIC is required";
        } else {
            const nic = formData.customer_code.trim();
            if (!/^([0-9]{9}[x|X|v|V]|[0-9]{12})$/.test(nic)) {
                errors.customer_code = "Invalid NIC format";
            } else if (formData.customer_code !== formData.customer_code_confirmation) {
                errors.customer_code_confirmation = "NIC numbers must match";
            } else {
                const extracted = nicService.parseNIC(nic);
                if (!extracted) {
                    errors.customer_code = "Could not parse NIC";
                } else {
                    const typeValid = nicService.validateTypeGender(formData.customer_type || "", extracted.gender);
                    if (!typeValid.valid) {
                        errors.customer_type = typeValid.message || "Invalid gender for type";
                    }
                }
            }
        }

        if (!formData.date_of_birth) {
            errors.date_of_birth = "Required";
        } else {
            const dobDate = new Date(formData.date_of_birth);
            const today = new Date();
            if (dobDate > today) {
                errors.date_of_birth = "Cannot be in future";
            } else {
                const age = calculateAge(formData.date_of_birth);
                if (age < 18) errors.date_of_birth = "Min 18 years";
                if (age > 65) errors.date_of_birth = "Max 65 years";
            }
        }

        if (!formData.gender) errors.gender = "Gender is required";
        if (!formData.religion) errors.religion = "Religion is required";
        if (!formData.civil_status) {
            errors.civil_status = "Status is required";
        } else if (formData.civil_status === 'Married' && !formData.spouse_name?.trim()) {
            errors.spouse_name = "Required for Married";
        }

        if (formData.spouse_name?.trim() && !isAlphabetical(formData.spouse_name)) {
            errors.spouse_name = "Letters only";
        }

        // Required Contact
        if (!formData.mobile_no_1?.trim()) {
            errors.mobile_no_1 = "Required";
        } else if (!isValidPhone(formData.mobile_no_1)) {
            errors.mobile_no_1 = "Start with 0 (10 digits)";
        }

        // Optional format validations
        if (formData.mobile_no_2?.trim() && !isValidPhone(formData.mobile_no_2)) {
            errors.mobile_no_2 = "Start with 0 (10 digits)";
        }
        if (formData.telephone?.trim() && !isValidPhone(formData.telephone)) {
            errors.telephone = "Start with 0 (10 digits)";
        }
        if (
            formData.business_email?.trim() &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.business_email)
        ) {
            errors.business_email = "Invalid email";
        }

        // Required Address
        if (!formData.address_line_1?.trim()) {
            errors.address_line_1 = "Required";
        } else if (formData.address_line_1.trim().length < 5) {
            errors.address_line_1 = "Min 5 characters";
        }

        if (!formData.city?.trim()) errors.city = "City is required";
        if (!formData.province) errors.province = "Province is required";
        if (!formData.district) errors.district = "District is required";

        if (!formData.gs_division?.trim()) {
            errors.gs_division = "Required";
        } else if (formData.gs_division.trim().length < 3) {
            errors.gs_division = "Min 3 characters";
        }

        // Numeric Ranges
        if (
            formData.family_members_count !== undefined &&
            formData.family_members_count !== null
        ) {
            const count = Number(formData.family_members_count);
            if (isNaN(count) || !Number.isInteger(count) || count < 1 || count > 20) {
                errors.family_members_count = "1-20 (integer)";
            }
        }

        if (formData.monthly_income !== undefined && formData.monthly_income !== null) {
            const income = Number(formData.monthly_income);
            if (income < 0) {
                errors.monthly_income = "Cannot be negative";
            } else if (income > 10000000) {
                errors.monthly_income = "Max 10 million";
            }
        }

        if (formData.no_of_employees !== undefined && formData.no_of_employees !== null) {
            const empCount = Number(formData.no_of_employees);
            if (empCount < 0) {
                errors.no_of_employees = "Cannot be negative";
            } else if (empCount > 5000) {
                errors.no_of_employees = "Max 5000";
            }
        }

        // Business Register Number format (basic alphanumeric check)
        if (formData.register_number?.trim()) {
            if (!/^[a-zA-Z0-9/-]+$/.test(formData.register_number)) {
                errors.register_number = "Alphanumeric only";
            }
        }

        // Documentation Validation
        if (!formData.nic_copy_image) {
            errors.nic_copy_image = "NIC Copy is required";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error("Please complete all required fields correctly");
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData as CustomerFormData);
            toast.success(
                initialData
                    ? "Customer profile updated successfully!"
                    : "Customer profile finalized successfully!"
            );
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to save customer");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] max-w-5xl w-full shadow-2xl border border-gray-200 dark:border-gray-700/50 flex flex-col h-full max-h-[92vh] overflow-hidden transform transition-all">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl sticky top-0 z-20">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                            {initialData ? "Edit Profile" : "New Customer"}
                            {!initialData && (
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] rounded-full uppercase tracking-widest font-black ring-1 ring-blue-500/20">
                                    Active Draft
                                </span>
                            )}
                            {isPendingApproval && (
                                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-[10px] rounded-full uppercase tracking-widest font-black ring-1 ring-amber-500/20">
                                    Pending Approval
                                </span>
                            )}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold tracking-wider uppercase opacity-70">
                            Core CRM Portal • Registration Workspace
                        </p>
                        {requiresApproval && !isPendingApproval && (
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight bg-blue-50 px-2 py-1 rounded inline-block mt-2">
                                ℹ️ This customer has active loans. Edits will require Manager
                                approval.
                            </p>
                        )}
                        {isPendingApproval && (
                            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-tight bg-amber-50 px-2 py-1 rounded inline-block mt-2 font-mono">
                                ⚠️ A change request is already pending for this customer.
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all text-gray-500 group"
                    >
                        <X
                            size={24}
                            className="group-hover:rotate-90 transition-transform duration-300"
                        />
                    </button>
                </div>

                {/* Main Form Area */}
                <form
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12 scroll-smooth scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800"
                >
                    {/* Main Type & Location Section */}
                    <div className="bg-blue-50/20 dark:bg-blue-900/10 p-6 md:p-8 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 space-y-8">
                        <div>
                            <label className="text-xs font-black text-blue-900/50 dark:text-blue-100/50 uppercase tracking-widest mb-4 block">1. Classification</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <FormSelect
                                    label="Customer Type"
                                    name="customer_type"
                                    options={["Loan Customer", "Investor"]}
                                    required
                                    error={fieldErrors.customer_type}
                                    icon={Briefcase}
                                    value={formData.customer_type}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {!isEditMode && (
                            <div>
                                <label className="text-xs font-black text-blue-900/50 dark:text-blue-100/50 uppercase tracking-widest mb-4 block">2. Location Assignment</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <FormSelect
                                        label="Branch"
                                        name="branch_id"
                                        options={
                                            constants?.branches?.map((b: any) => ({
                                                value: b.id,
                                                label: b.branch_name,
                                            })) || []
                                        }
                                        required
                                        error={fieldErrors.branch_id}
                                        icon={MapPin}
                                        value={formData.branch_id}
                                        onChange={handleChange}
                                    />
                                    {formData.customer_type === "Loan Customer" && (
                                        <FormSelect
                                            label="Center (Optional)"
                                            name="center_id"
                                            options={
                                                filteredCenters?.map((c: any) => ({
                                                    value: c.id,
                                                    label: c.center_name,
                                                })) || []
                                            }
                                            error={fieldErrors.center_id}
                                            icon={Building}
                                            value={formData.center_id}
                                            onChange={handleChange}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Personal Details */}
                    <div>
                        <SectionHeader icon={User} title="Personal Information" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                            <FormSelect
                                label="Title"
                                name="title"
                                options={["Mr", "Mrs", "Miss", "Ms", "Dr", "Rev"]}
                                required
                                error={fieldErrors.title}
                                icon={User}
                                value={formData.title}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="Full Name"
                                name="full_name"
                                placeholder="As per Identity Document"
                                required
                                error={fieldErrors.full_name}
                                value={formData.full_name}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="Initials"
                                name="initials"
                                placeholder="e.g. W.M."
                                required
                                error={fieldErrors.initials}
                                value={formData.initials}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="First Name"
                                name="first_name"
                                placeholder="Primary naming"
                                required
                                error={fieldErrors.first_name}
                                value={formData.first_name}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="Last Name"
                                name="last_name"
                                placeholder="Surname"
                                required
                                error={fieldErrors.last_name}
                                value={formData.last_name}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="NIC Number"
                                name="customer_code"
                                placeholder="9 digits + V/X or 12 digits"
                                required
                                error={fieldErrors.customer_code}
                                icon={ShieldCheck}
                                value={formData.customer_code}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="Confirm NIC Number"
                                name="customer_code_confirmation"
                                placeholder="Re-enter NIC"
                                required
                                error={fieldErrors.customer_code_confirmation}
                                icon={CheckCircle2}
                                value={formData.customer_code_confirmation}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="Date of Birth"
                                name="date_of_birth"
                                type="date"
                                required
                                readOnly
                                error={fieldErrors.date_of_birth}
                                icon={Calendar}
                                value={formData.date_of_birth}
                                onChange={handleChange}
                            />
                            <FormSelect
                                label="Gender"
                                name="gender"
                                options={["Male", "Female", "Other"]}
                                required
                                error={fieldErrors.gender}
                                value={formData.gender}
                                onChange={handleChange}
                                disabled
                            />
                            <FormInput
                                label="Age"
                                name="age"
                                type="number"
                                readOnly
                                placeholder="Auto-calculated"
                                value={formData.age}
                                onChange={handleChange}
                                error={formData.age && (formData.age < 18 || formData.age > 65) ? "Outside loan eligibility range" : ""}
                            />
                            <FormSelect
                                label="Civil Status"
                                name="civil_status"
                                options={["Single", "Married", "Divorced", "Widowed"]}
                                required
                                error={fieldErrors.civil_status}
                                icon={Heart}
                                value={formData.civil_status}
                                onChange={handleChange}
                            />
                            <FormSelect
                                label="Religion"
                                name="religion"
                                options={
                                    constants?.religions || [
                                        "Buddhism",
                                        "Hinduism",
                                        "Islam",
                                        "Christianity",
                                        "Roman Catholic",
                                        "Other",
                                    ]
                                }
                                required
                                error={fieldErrors.religion}
                                value={formData.religion}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="Spouse Name"
                                name="spouse_name"
                                placeholder={formData.civil_status === 'Married' ? "Enter spouse's full name" : "If applicable"}
                                colSpan={2}
                                value={formData.spouse_name}
                                onChange={handleChange}
                                required={formData.civil_status === 'Married'}
                                error={fieldErrors.spouse_name}
                            />
                            <FormInput
                                label="Family Members"
                                name="family_members_count"
                                type="number"
                                placeholder="Count"
                                error={fieldErrors.family_members_count}
                                value={formData.family_members_count}
                                onChange={handleChange}
                                min={1}
                                max={20}
                            />
                            <FormInput
                                label="Monthly Income (LKR)"
                                name="monthly_income"
                                type="number"
                                placeholder="0.00"
                                icon={Landmark}
                                error={fieldErrors.monthly_income}
                                value={formData.monthly_income}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Contact & Address */}
                    <div className="bg-gray-50/50 dark:bg-gray-900/20 p-6 md:p-8 rounded-[1.5rem] border border-gray-100 dark:border-gray-700/50">
                        <SectionHeader icon={MessageSquare} title="Contact & Address" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormInput
                                label="Primary Mobile"
                                name="mobile_no_1"
                                placeholder="077XXXXXXX"
                                icon={Phone}
                                required
                                error={fieldErrors.mobile_no_1}
                                value={formData.mobile_no_1}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="Secondary Mobile"
                                name="mobile_no_2"
                                placeholder="Optional"
                                icon={Phone}
                                error={fieldErrors.mobile_no_2}
                                value={formData.mobile_no_2}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="Fixed Line"
                                name="telephone"
                                placeholder="Optional"
                                icon={Phone}
                                error={fieldErrors.telephone}
                                value={formData.telephone}
                                onChange={handleChange}
                            />
                            <div className="md:col-span-3">
                                <FormInput
                                    label="Address Line 1"
                                    name="address_line_1"
                                    placeholder="House No, Street Name"
                                    required
                                    error={fieldErrors.address_line_1}
                                    value={formData.address_line_1}
                                    onChange={handleChange}
                                />
                            </div>
                            <FormInput
                                label="Address Line 2"
                                name="address_line_2"
                                placeholder="Locality"
                                value={formData.address_line_2}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="Address Line 3"
                                name="address_line_3"
                                placeholder="Additional info"
                                value={formData.address_line_3}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="Grama Sevaka Division"
                                name="gs_division"
                                placeholder="GS Name/No"
                                required
                                error={fieldErrors.gs_division}
                                value={formData.gs_division}
                                onChange={handleChange}
                            />
                            <FormSelect
                                label="Province"
                                name="province"
                                options={constants?.provinces || []}
                                required
                                error={fieldErrors.province}
                                value={formData.province}
                                onChange={handleChange}
                            />
                            <FormSelect
                                label="District"
                                name="district"
                                options={
                                    filteredDistricts.length > 0
                                        ? filteredDistricts
                                        : constants?.districts || []
                                }
                                required
                                error={fieldErrors.district}
                                value={formData.district}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="City"
                                name="city"
                                placeholder="Enter city"
                                required
                                error={fieldErrors.city}
                                value={formData.city}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="Country"
                                name="country"
                                value={formData.country}
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Documentation & Profile */}
                    <div className="bg-gray-50/50 dark:bg-gray-900/20 p-6 md:p-8 rounded-[1.5rem] border border-gray-100 dark:border-gray-700/50">
                        <SectionHeader icon={Camera} title="Documentation & Profile" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Profile Image Upload */}
                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Camera size={14} className="text-blue-500" />
                                    Customer Photo <span className="text-[10px] text-gray-400 font-bold lowercase italic">(Optional)</span>
                                </label>
                                <div className="flex items-center gap-6">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 overflow-hidden flex items-center justify-center transition-all group-hover:border-blue-400">
                                            {formData.customer_profile_image || formData.profile_image_url ? (
                                                <img
                                                    src={formData.customer_profile_image?.startsWith('data:') ? formData.customer_profile_image : (formData.profile_image_url || formData.customer_profile_image)}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User size={32} className="text-gray-300" />
                                            )}
                                        </div>
                                        <label className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-blue-700 transition-all hover:scale-110">
                                            <Camera size={14} />
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setFormData(prev => ({ ...prev, customer_profile_image: reader.result as string }));
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Requirement</p>
                                        <p className="text-[10px] text-gray-500 italic">Clear portrait photo for identity verification. Max 2MB.</p>
                                        {formData.customer_profile_image && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, customer_profile_image: '' }))}
                                                className="text-[10px] text-red-500 font-black uppercase tracking-widest hover:underline"
                                            >
                                                Remove Photo
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* NIC Copy Upload */}
                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={14} className="text-blue-500" />
                                    NIC Front Copy <span className="text-red-500">*</span>
                                </label>
                                <div
                                    className={`relative group h-24 rounded-2xl border-2 border-dashed ${fieldErrors.nic_copy_image ? 'border-red-300 bg-red-50/30' : 'border-gray-300 dark:border-gray-700 bg-gray-50/30'} flex flex-col items-center justify-center transition-all hover:border-blue-400 cursor-pointer overflow-hidden`}
                                    onClick={() => document.getElementById('nic-upload')?.click()}
                                >
                                    {formData.nic_copy_image || formData.nic_image_url ? (
                                        <div className="w-full h-full flex items-center justify-between px-4 bg-blue-50/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                                    <FileText size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">NIC Uploaded</span>
                                                    {formData.nic_image_url && !formData.nic_copy_image?.startsWith('data:') && (
                                                        <a
                                                            href={formData.nic_image_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[9px] text-blue-600 hover:underline font-bold"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            View Document
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <CheckCircle2 size={16} className="text-green-500" />
                                        </div>
                                    ) : (
                                        <>
                                            <FileText size={24} className="text-gray-300 group-hover:text-blue-400 mb-1" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Click to Upload NIC</span>
                                        </>
                                    )}
                                    <input
                                        id="nic-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*,application/pdf"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData(prev => ({ ...prev, nic_copy_image: reader.result as string }));
                                                    setFieldErrors(prev => ({ ...prev, nic_copy_image: '' }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </div>
                                {fieldErrors.nic_copy_image && (
                                    <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.nic_copy_image}</p>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* Extra Status for Edit Mode */}
                    {initialData && (
                        <div className="pt-6 border-t border-gray-100 dark:border-gray-700/50">
                            <FormSelect
                                label="Customer Status"
                                name="status"
                                options={constants?.statuses || ["active", "blocked"]}
                                colSpan={1}
                                value={formData.status}
                                onChange={handleChange}
                            />
                        </div>
                    )}
                </form>

                {/* Sticky Footer */}
                <div className="p-6 md:p-8 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-end gap-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-8 py-3 text-sm font-black text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all uppercase tracking-widest disabled:opacity-50"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || isPendingApproval}
                        className={`flex items-center gap-3 px-12 py-3.5 ${isPendingApproval
                            ? "bg-gray-400"
                            : requiresApproval
                                ? "bg-amber-600 hover:bg-amber-700"
                                : "bg-blue-600 hover:bg-blue-700"
                            } text-white rounded-2xl transition-all font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none`}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>
                                    {requiresApproval ? "Submitting..." : "Verifying..."}
                                </span>
                            </>
                        ) : (
                            <>
                                {requiresApproval ? (
                                    <ShieldCheck size={20} />
                                ) : (
                                    <CheckCircle2 size={20} />
                                )}
                                <span>
                                    {isPendingApproval
                                        ? "Request Pending"
                                        : requiresApproval
                                            ? "Submit for Approval"
                                            : initialData
                                                ? "Update Record"
                                                : "Finalize Profile"}
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
