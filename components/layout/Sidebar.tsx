import React from 'react';
import { authService } from '../../services/auth.service';
import {
    LayoutDashboard,
    Building2,
    Users,
    UsersRound,
    User,
    FileText,
    DollarSign,
    ClipboardList,
    BarChart3,
    Wallet,
    TrendingUp,
    Settings,
    ChevronDown,
    Globe,
    Shield,
    AlertCircle,
    ArrowLeftRight,
    Receipt,
    ChevronLeft,
    ChevronRight,
    Download,
    Calendar,
    Package,
    MessageSquare,
    PieChart,
    ShieldCheck,
    RotateCcw,
    UserPlus,
    Bell,
    Clock
} from 'lucide-react';
import { Page } from './MainLayout';
import { notificationService } from '../../services/notification.service';
import { colors } from '@/themes/colors';

interface SidebarProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
    isOpen: boolean;
    userRole: string;
}

interface MenuItem {
    id: Page;
    label: string;
    icon: React.ReactNode;
    submenu?: MenuItem[];
    roles?: string[];
    permission?: string;
}

export function Sidebar({ currentPage, onNavigate, isOpen, userRole }: SidebarProps) {
    const [expandedMenus, setExpandedMenus] = React.useState<string[]>(['loans', 'collections-section', 'finance']);
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);
    const [counts, setCounts] = React.useState<Record<string, number>>({});

    React.useEffect(() => {
        setIsMounted(true);
        fetchCounts();

        // Refresh counts every 2 minutes
        const interval = setInterval(fetchCounts, 120000);
        return () => clearInterval(interval);
    }, []);

    const fetchCounts = async () => {
        try {
            const response = await notificationService.getSidebarCounts();
            if (response.status === 'success') {
                setCounts(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch sidebar counts:', error);
        }
    };

    const menuItems: MenuItem[] = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
            permission: 'dashboard.view'
        },
        {
            id: 'admin-dashboard',
            label: 'Admin Dashboard',
            icon: <BarChart3 className="w-5 h-5" />,
            roles: ['super_admin', 'admin']
        },
        {
            id: 'branches',
            label: 'Branches',
            icon: <Building2 className="w-5 h-5" />,
            permission: 'branches.view'
        },
        {
            id: 'centers-section' as Page,
            label: 'Centers (CSU)',
            icon: <Users className="w-5 h-5" />,
            submenu: [
                {
                    id: 'centers',
                    label: 'Schedule',
                    icon: <ClipboardList className="w-4 h-4" />
                },
                {
                    id: 'meeting-scheduling',
                    label: 'Meeting Schedule',
                    icon: <ClipboardList className="w-4 h-4" />,
                    roles: ['super_admin', 'admin', 'manager', 'staff']
                },
                {
                    id: 'center-requests',
                    label: 'Transfer Requests',
                    icon: <ArrowLeftRight className="w-4 h-4" />,
                    roles: ['super_admin', 'admin', 'manager']
                }
            ],
            permission: 'centers.view'
        },
        {
            id: 'groups',
            label: 'Groups',
            icon: <UsersRound className="w-5 h-5" />,
            permission: 'groups.view'
        },
        {
            id: 'customers-section' as Page,
            label: 'Customers',
            icon: <User className="w-5 h-5" />,
            submenu: [
                {
                    id: 'customers',
                    label: 'Customer List',
                    icon: <ClipboardList className="w-4 h-4" />
                },
                {
                    id: 'customer-requests' as Page,
                    label: 'Edit Approvals',
                    icon: <ShieldCheck className="w-4 h-4" />,
                    permission: 'customers.approve'
                }
            ],
            permission: 'customers.view'
        },
        {
            id: 'shareholders',
            label: 'Shareholders',
            icon: <PieChart className="w-5 h-5" />,
            permission: 'users.roles.manage' // Restricted to Admin-level access
        }
    ];

    const productMenuItems: MenuItem[] = [
        { id: 'loan-product' as Page, label: 'Loan', icon: <DollarSign className="w-4 h-4" />, permission: 'loan_products.view' },
        { id: 'investment-product' as Page, label: 'Investment', icon: <TrendingUp className="w-4 h-4" />, permission: 'investment_products.view' }
    ];

    const loanMenuItems: MenuItem[] = [
        { id: 'loan-create' as Page, label: 'Create Loan', icon: <FileText className="w-4 h-4" />, permission: 'loans.create' },
        { id: 'loan-approval' as Page, label: 'Loan Approval', icon: <Shield className="w-4 h-4" />, permission: 'loans.approve' },
        { id: 'loan-sent-back' as Page, label: 'Sent Back Loans', icon: <AlertCircle className="w-4 h-4" />, permission: 'loans.view' },
        { id: 'loan-list' as Page, label: 'Loan List', icon: <ClipboardList className="w-4 h-4" />, permission: 'loans.view' }
    ];

    const collectionMenuItems: MenuItem[] = [
        { id: 'due-list' as Page, label: 'Due List', icon: <ClipboardList className="w-4 h-4" />, permission: 'collections.view' },
        { id: 'collections' as Page, label: 'Collections', icon: <DollarSign className="w-4 h-4" />, permission: 'collections.view' },
        { id: 'receipt-rejections' as Page, label: 'Cancellation Requests', icon: <RotateCcw className="w-4 h-4" />, permission: 'receipts.approvecancel' },
        { id: 'collection-summary' as Page, label: 'Collection Summary', icon: <Receipt className="w-4 h-4" />, permission: 'collections.view' }
    ];

    const approvalMenuItems: MenuItem[] = [
        { id: 'salary-approval' as Page, label: 'Salary Approval', icon: <ShieldCheck className="w-4 h-4" />, permission: 'leave.approve' },
        { id: 'loan-payment-approval' as Page, label: 'Loan Payment Approval', icon: <ShieldCheck className="w-4 h-4" />, permission: 'receipts.approve' }
    ];

    const financeMenuItems: MenuItem[] = [
        { id: 'finance-overview' as Page, label: 'Finance Overview', icon: <Wallet className="w-4 h-4" />, permission: 'finance.view' },
        { id: 'fund-transactions' as Page, label: 'Fund Truncation', icon: <ArrowLeftRight className="w-4 h-4" />, permission: 'finance.transactions' },
        { id: 'fund-truncation-summary' as Page, label: 'Truncation Summary', icon: <FileText className="w-4 h-4" />, permission: 'finance.view' },
        { id: 'branch-transactions' as Page, label: 'Branch Truncation', icon: <Building2 className="w-4 h-4" />, permission: 'finance.view' }
    ];

    const promotionMenuItems: MenuItem[] = [
        { id: 'staff-promotion' as Page, label: 'Staff Promotion', icon: <UserPlus className="w-4 h-4" />, permission: 'dashboard.view' }, // Available to all staff
        { id: 'promotion-approval' as Page, label: 'Promotion Approval', icon: <ShieldCheck className="w-4 h-4" />, permission: 'users.roles.manage' },
        { id: 'temporary-promotion' as Page, label: 'Temporary Promotion', icon: <Clock className="w-4 h-4" />, permission: 'users.roles.manage' }
    ];

    const staffLoanMenuItems: MenuItem[] = [
        { id: 'staff-loan-create' as Page, label: 'Create Staff Loan', icon: <FileText className="w-4 h-4" />, permission: 'staffloans.create' }, // Only staff without admin role
        { id: 'staff-loan-list' as Page, label: 'Staff Loan Approvals', icon: <ShieldCheck className="w-4 h-4" />, permission: 'staffloans.view' }, // Admin only
    ];

    const toggleMenu = (menuId: string) => {
        if (!isCollapsed) {
            setExpandedMenus(prev =>
                prev.includes(menuId)
                    ? prev.filter(id => id !== menuId)
                    : [...prev, menuId]
            );
        }
    };

    const getBadgeCount = (id: string): number => {
        switch (id) {
            case 'centers': return counts.centers || 0;
            case 'center-requests': return counts.center_transfers || 0;
            case 'centers-section': return (counts.centers || 0) + (counts.center_transfers || 0);

            case 'loan-approval': return counts.loans || 0;
            case 'loan-sent-back': return counts.sent_back_loans || 0;
            case 'loans': return (counts.loans || 0) + (counts.sent_back_loans || 0);

            case 'salary-approval': return counts.salaries || 0;
            case 'fund-transactions': return (counts.salaries || 0) + (counts.disbursements || 0);
            case 'finance-overview': return 0;
            case 'finance': return (counts.salaries || 0) + (counts.disbursements || 0);

            case 'complaints': return counts.complaints || 0;
            case 'receipt-rejections': return counts.receipt_cancellations || 0;
            case 'customer-requests': return counts.customer_edits || 0;
            case 'customers-section': return counts.customer_edits || 0;

            case 'staff-promotion': return 0;
            case 'promotion-approval': return (counts.promotions || 0) + (counts.salary_increments || 0);
            case 'temporary-promotion': return 0;
            case 'promotion-section': return (counts.promotions || 0) + (counts.salary_increments || 0);

            case 'staff-management': return counts.attendance || 0;
            case 'approvals-section': return 0;
            case 'salary-approval': return 0;
            case 'loan-payment-approval': return 0;

            default: return 0;
        }
    };

    const renderBadge = (id: string, isSmall = false) => {
        const count = getBadgeCount(id);
        if (count <= 0) return null;

        return (
            <span className={`inline-flex items-center justify-center bg-red-600 text-white rounded-full font-bold shadow-md transform transition-all duration-300 ${isSmall ? 'min-w-[18px] h-[18px] text-[10px] px-1' : 'min-w-[22px] h-[22px] text-[11px] px-1.5'
                } ${isCollapsed ? 'absolute -top-1 -right-1 border-2 border-white dark:border-gray-800' : 'relative ml-auto'} hover:scale-110`}>
                {count > 99 ? '99+' : count}
                {!isCollapsed && (
                    <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25"></span>
                )}
            </span>
        );
    };

    const renderMenuItem = (item: MenuItem) => {
        // Role-based filtering (legacy support)
        if (item.roles && !item.roles.includes(userRole)) {
            return null;
        }

        const hasSubmenu = item.submenu && item.submenu.length > 0;
        // const isActive = currentPage === item.id || (hasSubmenu && item.submenu?.some(sub => currentPage === sub.id));
        const isExpanded = expandedMenus.includes(item.id as string);
        // Permission-based filtering (preferred)
        // During hydration (isMounted = false), we return null for any item requiring a permission
        // to match the server-side render where hasPermission always returns false.
        if (item.permission && (!isMounted || !authService.hasPermission(item.permission))) {
            return null;
        }

        const isActive = currentPage === item.id;

        if (hasSubmenu) {
            return (
                <div key={item.id}>
                    {isCollapsed ? (
                        <button
                            onClick={() => toggleMenu(item.id as string)}
                            className={`w-full flex items-center justify-center px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group relative`}
                            style={isActive ? { backgroundColor: `${colors.primary[50]}`, color: colors.primary[600] } : {}}
                            title={item.label}
                        >
                            <div className={`group-hover:text-gray-700 dark:group-hover:text-gray-300`} style={isActive ? { color: colors.primary[600] } : {}}>
                                {item.icon}
                            </div>
                            {renderBadge(item.id as string)}
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                {item.label}
                            </div>
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => toggleMenu(item.id as string)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group`}
                                style={isActive ? { backgroundColor: `${colors.primary[50]}`, color: colors.primary[600] } : {}}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`group-hover:text-gray-700 dark:group-hover:text-gray-300`} style={isActive ? { color: colors.primary[600] } : {}}>
                                        {item.icon}
                                    </div>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {renderBadge(item.id as string, true)}
                                    <div className="w-4 h-4 flex items-center justify-center">
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                        />
                                    </div>
                                </div>
                            </button>
                            {isExpanded && (
                                <div className="ml-8 mt-1 space-y-0.5 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
                                    {item.submenu?.map(subItem => {
                                        if (subItem.roles && !subItem.roles.includes(userRole)) return null;
                                        if (subItem.permission && (!isMounted || !authService.hasPermission(subItem.permission))) return null;
                                        const isSubActive = currentPage === subItem.id;
                                        return (
                                            <button
                                                key={subItem.id}
                                                onClick={() => onNavigate(subItem.id)}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all text-sm ${isSubActive
                                                    ? 'font-medium'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                                                    }`}
                                                style={isSubActive ? { backgroundColor: `${colors.primary[50]}`, color: colors.primary[600] } : {}}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {subItem.icon}
                                                    <span>{subItem.label}</span>
                                                </div>
                                                {renderBadge(subItem.id as string, true)}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            );
        }

        // Regular menu item
        return (
            <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${isActive
                    ? 'text-white shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                style={isActive ? { backgroundColor: colors.primary[600] } : {}}
                title={isCollapsed ? item.label : ''}
            >
                <div className={`${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}>
                    {item.icon}
                </div>
                {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between overflow-hidden">
                        <span className="text-sm font-medium truncate">{item.label}</span>
                        {renderBadge(item.id as string, true)}
                    </div>
                )}
                {isCollapsed && (
                    <>
                        {renderBadge(item.id as string)}
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                            {item.label}
                        </div>
                    </>
                )}
            </button>
        );
    };

    return (
        <aside className={`
      fixed lg:static inset-y-0 left-0 z-50
      ${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-800 flex flex-col border-r border-gray-200 dark:border-gray-700
      transform transition-all duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0
    `}>
            {/* Logo */}
            <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'px-3' : 'px-4'}`}>
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0"
                        style={{ background: `linear-gradient(to bottom right, ${colors.primary[600]}, ${colors.primary[700]})` }}
                    >
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">LMS</h2>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Microfinance</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {/* Main Section */}
                {!isCollapsed && (
                    <div className="px-3 mb-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Main</p>
                    </div>
                )}

                {/* Main Menu Items */}
                {menuItems.map(renderMenuItem)}

                {/* Products Section */}
                <div className="pt-3">
                    {!isCollapsed && (
                        <div className="px-3 mb-2">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Product</p>
                        </div>
                    )}

                    {isCollapsed ? (
                        <button
                            onClick={() => toggleMenu('products')}
                            className="w-full flex items-center justify-center px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group relative"
                            title="Product"
                        >
                            <Package className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                Product
                            </div>
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => toggleMenu('products')}
                                className="w-full flex items-center justify-between px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <Package className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                                    <span className="text-sm font-medium">Product</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {renderBadge('products', true)}
                                    <ChevronDown
                                        className={`w-4 h-4 transition-transform ${expandedMenus.includes('products') ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </button>
                            {expandedMenus.includes('products') && (
                                <div className="ml-8 mt-1 space-y-0.5 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
                                    {productMenuItems.map(item => {
                                        const isActive = currentPage === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => onNavigate(item.id)}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all text-sm ${isActive
                                                    ? 'font-medium'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                                                    }`}
                                                style={isActive ? { backgroundColor: `${colors.primary[50]}`, color: colors.primary[600] } : {}}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {item.icon}
                                                    <span>{item.label}</span>
                                                </div>
                                                {renderBadge(item.id as string, true)}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Loans Section */}
                <div className="pt-3">
                    {!isCollapsed && (
                        <div className="px-3 mb-2">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Loans</p>
                        </div>
                    )}

                    {isCollapsed ? (
                        // Collapsed view - show icon only
                        <button
                            onClick={() => toggleMenu('loans')}
                            className="w-full flex items-center justify-center px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group relative"
                            title="Loans"
                        >
                            <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                Loans
                            </div>
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => toggleMenu('loans')}
                                className="w-full flex items-center justify-between px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                                    <span className="text-sm font-medium">Loans</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {renderBadge('loans', true)}
                                    <ChevronDown
                                        className={`w-4 h-4 transition-transform ${expandedMenus.includes('loans') ? 'rotate-180' : ''
                                            }`}
                                    />
                                </div>
                            </button>
                            {expandedMenus.includes('loans') && (
                                <div className="ml-8 mt-1 space-y-0.5 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
                                    {loanMenuItems.map(item => {
                                        if (item.roles && !item.roles.includes(userRole)) return null;
                                        if (item.permission && (!isMounted || !authService.hasPermission(item.permission))) return null;
                                        const isActive = currentPage === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => onNavigate(item.id)}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all text-sm ${isActive
                                                    ? 'font-medium'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                                                    }`}
                                                style={isActive ? { backgroundColor: `${colors.primary[50]}`, color: colors.primary[600] } : {}}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {item.icon}
                                                    <span>{item.label}</span>
                                                </div>
                                                {renderBadge(item.id as string, true)}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Collections Section */}
                <div className="pt-3">
                    {!isCollapsed && (
                        <div className="px-3 mb-2">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Collections</p>
                        </div>
                    )}
                    {renderMenuItem({
                        id: 'collections-section' as Page,
                        label: 'Collections',
                        icon: <DollarSign className="w-5 h-5" />,
                        submenu: collectionMenuItems
                    })}
                </div>

                {/* Investments Section */}
                <div className="pt-3">
                    {!isCollapsed && (
                        <div className="px-3 mb-2">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Investments</p>
                        </div>
                    )}
                    {renderMenuItem({
                        id: 'investments-section' as Page,
                        label: 'Investments',
                        icon: <TrendingUp className="w-5 h-5" />,
                        permission: 'investments.view',
                        submenu: [
                            { id: 'investment-create' as Page, label: 'Create Investment', icon: <FileText className="w-4 h-4" />, permission: 'investments.create' },
                            { id: 'investment-list' as Page, label: 'Investment List', icon: <ClipboardList className="w-4 h-4" />, permission: 'investments.view' }
                        ]
                    })}
                </div>

                {/* Reports */}
                {!isCollapsed && (
                    <div className="px-3 mb-2 pt-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Analytics</p>
                    </div>
                )}

                <button
                    onClick={() => onNavigate('reports')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${currentPage === 'reports'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    style={currentPage === 'reports' ? { backgroundColor: colors.primary[600] } : {}}
                    title={isCollapsed ? 'Reports' : ''}
                >
                    <div className={`${currentPage === 'reports' ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}>
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    {!isCollapsed && <span className="text-sm font-medium">Reports</span>}
                    {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                            Reports
                        </div>
                    )}
                </button>

                {/* Approvals Section */}
                <div className="pt-3">
                    {!isCollapsed && (
                        <div className="px-3 mb-2">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Approvals</p>
                        </div>
                    )}
                    {renderMenuItem({
                        id: 'approvals-section' as Page,
                        label: 'Transaction Approval',
                        icon: <ShieldCheck className="w-5 h-5" />,
                        submenu: approvalMenuItems
                    })}
                </div>

                {/* Finance Section */}
                <div className="pt-3">
                    {!isCollapsed && (
                        <div className="px-3 mb-2">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance</p>
                        </div>
                    )}

                    {isCollapsed ? (
                        <button
                            onClick={() => toggleMenu('finance')}
                            className="w-full flex items-center justify-center px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-all group relative"
                            title="Finance"
                        >
                            <Wallet className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                Finance
                            </div>
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => toggleMenu('finance')}
                                className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <Wallet className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                                    <span className="text-sm font-medium">Finance</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {renderBadge('finance', true)}
                                    <div className="w-4 h-4 flex items-center justify-center">
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform ${expandedMenus.includes('finance') ? 'rotate-180' : ''}`}
                                        />
                                    </div>
                                </div>
                            </button>
                            {expandedMenus.includes('finance') && (
                                <div className="ml-8 mt-1 space-y-0.5 border-l-2 border-gray-200 pl-2">
                                    {financeMenuItems.map(item => {
                                        if (item.roles && !item.roles.includes(userRole)) return null;
                                        if (item.permission && (!isMounted || !authService.hasPermission(item.permission))) return null;
                                        const isActive = currentPage === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => onNavigate(item.id)}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all text-sm ${isActive
                                                    ? 'font-medium'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                    }`}
                                                style={isActive ? { backgroundColor: `${colors.primary[50]}`, color: colors.primary[600] } : {}}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {item.icon}
                                                    <span>{item.label}</span>
                                                </div>
                                                {renderBadge(item.id as string, true)}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Promotion Section */}
                <div className="pt-3">
                    {!isCollapsed && (
                        <div className="px-3 mb-2">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Promotion</p>
                        </div>
                    )}
                    {renderMenuItem({
                        id: 'promotion-section' as Page,
                        label: 'Promotion',
                        icon: <TrendingUp className="w-5 h-5" />,
                        submenu: promotionMenuItems
                    })}
                </div>

                {/* Staff Loans Section */}
                <div className="pt-3">
                    {!isCollapsed && (
                        <div className="px-3 mb-2">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Staff Loans</p>
                        </div>
                    )}
                    {renderMenuItem({
                        id: 'staff-loan-section' as Page,
                        label: 'Staff Loan',
                        icon: <DollarSign className="w-5 h-5" />,
                        submenu: staffLoanMenuItems
                    })}
                </div>

                {/* Staff Management */}

                {/* Staff Directory - All Users */}
                <button
                    onClick={() => onNavigate('staff-directory')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${currentPage === 'staff-directory'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    style={currentPage === 'staff-directory' ? { backgroundColor: colors.primary[600] } : {}}
                    title={isCollapsed ? 'Staff Directory' : ''}
                >
                    <div className={`${currentPage === 'staff-directory' ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}>
                        <Users className="w-5 h-5" />
                    </div>
                    {!isCollapsed && <span className="text-sm font-medium">Staff Directory</span>}
                    {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                            Staff Directory
                        </div>
                    )}
                </button>

                {/* Staff Management */}
                {isMounted && authService.hasPermission('staff.view') && (
                    <button
                        onClick={() => onNavigate('staff-management')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${currentPage === 'staff-management'
                            ? 'text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        style={currentPage === 'staff-management' ? { backgroundColor: colors.primary[600] } : {}}
                        title={isCollapsed ? 'Staff Management' : ''}
                    >
                        <div className={`${currentPage === 'staff-management' ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}>
                            <Users className="w-5 h-5" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 flex items-center justify-between">
                                <span className="text-sm font-medium">Staff Management</span>
                                {renderBadge('staff-management', true)}
                            </div>
                        )}
                        {isCollapsed && (
                            <>
                                {renderBadge('staff-management')}
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                    Staff Management
                                </div>
                            </>
                        )}
                    </button>
                )}

                {/* Roles & Privileges */}
                {isMounted && authService.hasPermission('roles.view') && (
                    <button
                        onClick={() => onNavigate('roles-privileges')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${currentPage === 'roles-privileges'
                            ? 'text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        style={currentPage === 'roles-privileges' ? { backgroundColor: colors.primary[600] } : {}}
                        title={isCollapsed ? 'Roles & Privileges' : ''}
                    >
                        <div className={`${currentPage === 'roles-privileges' ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}>
                            <Shield className="w-5 h-5" />
                        </div>
                        {!isCollapsed && <span className="text-sm font-medium">Roles</span>}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                Roles & Privileges
                            </div>
                        )}
                    </button>
                )}

                {/* Complaints */}
                <button
                    onClick={() => onNavigate('complaints')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${currentPage === 'complaints'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    style={currentPage === 'complaints' ? { backgroundColor: colors.primary[600] } : {}}
                    title={isCollapsed ? 'Complaints' : ''}
                >
                    <div className={`${currentPage === 'complaints' ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}>
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between">
                            <span className="text-sm font-medium">Complaints</span>
                            {renderBadge('complaints', true)}
                        </div>
                    )}
                    {isCollapsed && (
                        <>
                            {renderBadge('complaints')}
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                Complaints
                            </div>
                        </>
                    )}
                </button>

                {/* System Config */}
                {isMounted && authService.hasPermission('settings.view') && (
                    <>
                        {!isCollapsed && (
                            <div className="px-3 mb-2 pt-3">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Settings</p>
                            </div>
                        )}

                        <button
                            onClick={() => onNavigate('system-config')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${currentPage === 'system-config'
                                ? 'text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            style={currentPage === 'system-config' ? { backgroundColor: colors.primary[600] } : {}}
                            title={isCollapsed ? 'System Config' : ''}
                        >
                            <div className={`${currentPage === 'system-config' ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}>
                                <Settings className="w-5 h-5" />
                            </div>
                            {!isCollapsed && <span className="text-sm font-medium">System Config</span>}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                    System Config
                                </div>
                            )}
                        </button>
                    </>
                )}

                {/* Public Website */}
                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                    {/* Documents */}
                    <button
                        onClick={() => onNavigate('documents')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative mb-1 ${currentPage === 'documents'
                            ? 'text-white shadow-sm'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        style={currentPage === 'documents' ? { backgroundColor: colors.primary[600] } : {}}
                        title={isCollapsed ? 'Documents & Downloads' : ''}
                    >
                        <div className={`${currentPage === 'documents' ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}>
                            <Download className="w-5 h-5" />
                        </div>
                        {!isCollapsed && <span className="text-sm font-medium">Documents</span>}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                Documents & Downloads
                            </div>
                        )}
                    </button>

                    {/* Public Website */}
                    <button
                        onClick={() => onNavigate('public-website')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${currentPage === 'public-website'
                            ? 'text-white shadow-sm'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        style={currentPage === 'public-website' ? { backgroundColor: colors.primary[600] } : {}}
                        title={isCollapsed ? 'Public Website' : ''}
                    >
                        <div className={`${currentPage === 'public-website' ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}>
                            <Globe className="w-5 h-5" />
                        </div>
                        {!isCollapsed && <span className="text-sm font-medium">Public Website</span>}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                Public Website
                            </div>
                        )}
                    </button>
                </div>
            </nav>

            {/* Collapse Toggle Button */}
            <div className="hidden lg:block border-t border-gray-200 dark:border-gray-700 p-3">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all group"
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <>
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm font-medium">Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
