import React from 'react';
import { X, Mail, Phone, MapPin, Calendar, User, Briefcase, Building, Heart, Users as UsersIcon, DollarSign, ShieldCheck, CheckCircle2, MessageSquare, Tag } from 'lucide-react';
import { Customer } from '../../types/customer.types';
import { colors } from '@/themes/colors';

interface CustomerDetailsModalProps {
    customer: Customer;
    onClose: () => void;
}

export function CustomerDetailsModal({ customer, onClose }: CustomerDetailsModalProps) {
    if (!customer) return null;

    const LabelValue = ({ label, value, icon: Icon, color = 'primary' }: { label: string, value: any, icon: any, color?: string }) => {
        const themeColor = colors[color as keyof typeof colors] as any || colors.primary;
        return (
            <div className="flex items-start gap-3">
                <div
                    className="p-2 rounded-lg shrink-0"
                    style={{ backgroundColor: themeColor[50] || `${themeColor}1A` }}
                >
                    <Icon
                        className="w-4 h-4"
                        style={{ color: themeColor[600] || themeColor[500] || themeColor }}
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider blur-[0.2px]">{label}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{value || '-'}</p>
                </div>
            </div>
        );
    };

    const Section = ({ title, children, icon: Icon }: any) => (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700/50">
                {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{title}</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-5xl w-full shadow-2xl border border-gray-200 dark:border-gray-700/50 flex flex-col h-full max-h-[92vh] overflow-hidden transform scale-100 transition-transform">

                {/* Header */}
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between bg-white dark:bg-gray-800 sticky top-0 z-10">
                    <div className="flex items-center gap-5">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl text-white text-2xl font-black"
                            style={{
                                backgroundColor: colors.primary[600],
                                boxShadow: `0 20px 25px -5px ${colors.primary[500]}33`
                            }}
                        >
                            {customer.full_name?.charAt(0) || 'C'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{customer.full_name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${customer.status === 'active'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                    }`}>
                                    {customer.status || 'Active'}
                                </span>
                                {customer.customer_id && (
                                    <span
                                        className="text-xs font-extrabold uppercase tracking-widest ml-4 flex items-center gap-1.5 px-3 py-1 rounded-lg"
                                        style={{
                                            backgroundColor: colors.primary[50],
                                            color: colors.primary[600]
                                        }}
                                    >
                                        <ShieldCheck size={14} />
                                        System ID: {customer.customer_id}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all text-gray-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 md:p-10 space-y-12 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">

                    <Section title="Personal Profile" icon={User}>
                        <LabelValue label="System ID" value={customer.customer_id} icon={ShieldCheck} color="primary" />
                        <LabelValue label="Identity (NIC)" value={customer.customer_code} icon={Tag} color="indigo" />
                        <LabelValue label="Date of Birth" value={customer.date_of_birth ? new Date(customer.date_of_birth).toLocaleDateString(undefined, { dateStyle: 'long' }) : '-'} icon={Calendar} color="purple" />
                        <LabelValue label="Gender" value={customer.gender} icon={User} color="pink" />
                        <LabelValue label="Civil Status" value={customer.civil_status} icon={Heart} color="red" />
                        <LabelValue label="Religion" value={customer.religion} icon={Building} color="orange" />
                        <LabelValue label="Spouse Name" value={customer.spouse_name} icon={UsersIcon} color="indigo" />
                        <LabelValue label="Initials" value={customer.initials} icon={User} color="slate" />
                        <LabelValue label="First Name" value={customer.first_name} icon={User} color="primary" />
                        <LabelValue label="Last Name" value={customer.last_name} icon={User} color="primary" />
                    </Section>

                    <Section title="Contact Channels" icon={Phone}>
                        <LabelValue label="Primary Mobile" value={customer.mobile_no_1} icon={Phone} color="green" />
                        <LabelValue label="Secondary Mobile" value={customer.mobile_no_2} icon={Phone} color="emerald" />
                        <LabelValue label="CCL Mobile" value={customer.ccl_mobile_no} icon={MessageSquare} color="teal" />
                        <LabelValue label="Email" value={customer.business_email} icon={Mail} color="purple" />
                        <LabelValue label="Fixed Line" value={customer.telephone} icon={Phone} color="primary" />
                    </Section>

                    <Section title="Residency & Address" icon={MapPin}>
                        <div className="md:col-span-3 bg-gray-50/50 dark:bg-gray-900/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-relaxed">
                                {customer.address_line_1}
                                {customer.address_line_2 && `, ${customer.address_line_2}`}
                                {customer.address_line_3 && `, ${customer.address_line_3}`}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">City</p>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{customer.city}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">District</p>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{customer.district}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Province</p>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{customer.province}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">GS Division</p>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{customer.gs_division}</p>
                                </div>
                            </div>
                        </div>
                    </Section>

                    <Section title="Business & assignment" icon={Briefcase}>
                        <LabelValue label="Branch" value={customer.branch?.branch_name || customer.branch_name} icon={MapPin} color="blue" />
                        <LabelValue label="Center" value={customer.center?.center_name || customer.center_name} icon={Building} color="indigo" />
                        <LabelValue label="Group" value={customer.group?.group_name || customer.group_name} icon={UsersIcon} color="purple" />
                        <LabelValue label="Business Name" value={customer.business_name} icon={Building} color="amber" />
                        <LabelValue label="Monthly Income" value={customer.monthly_income ? `Rs. ${Number(customer.monthly_income).toLocaleString()}` : '-'} icon={DollarSign} color="green" />
                        <LabelValue label="Sector" value={customer.sector} icon={Briefcase} color="emerald" />
                        <LabelValue label="Ownership" value={customer.ownership_type} icon={Building} color="indigo" />
                        <LabelValue label="Location" value={customer.location} icon={MapPin} color="blue" />
                        <LabelValue label="CSU Code" value={customer.pcsu_csu_code} icon={Building} color="violet" />
                    </Section>

                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 dark:border-gray-700/50 flex justify-end bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-xl">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-3 px-12 py-3.5 text-white rounded-2xl transition-all font-black text-sm uppercase tracking-widest active:scale-95"
                        style={{
                            backgroundColor: colors.primary[600],
                            boxShadow: `0 25px 50px -12px ${colors.primary[500]}40`
                        }}
                    >
                        <CheckCircle2 size={20} />
                        Done Viewing
                    </button>
                </div>
            </div>
        </div>
    );
}
