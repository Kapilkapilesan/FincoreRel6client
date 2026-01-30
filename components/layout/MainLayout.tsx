"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ThemeProvider, useTheme } from "../../contexts/ThemeContext";
import { BranchProvider } from "../../contexts/BranchContext";
import { LoadingProvider } from "../../contexts/LoadingContext";
import { LoadingOverlay } from "../common/LoadingOverlay";
import { NavigationLoader } from "../common/NavigationLoader";
import BMSLoader from "../common/BMSLoader";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "../../services/auth.service";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { PermissionGuard } from "../common/PermissionGuard";




export type Page =
    | 'dashboard' | 'admin-dashboard' | 'branches' | 'centers' | 'groups' | 'customers'
    | 'loan-create' | 'loan-approval' | 'loan-sent-back' | 'loan-list' | 'loan-product'
    | 'due-list' | 'collections' | 'collection-summary'
    | 'reports'
    | 'finance' | 'finance-overview' | 'fund-transactions' | 'branch-transactions' | 'fund-truncation-summary'
    | 'investments' | 'investment-create' | 'investment-list' | 'staff-management' | 'roles-privileges'
    | 'shareholders'
    | 'complaints' | 'system-config' | 'documents' | 'public-website' | 'center-requests'
    | 'receipt-rejections' | 'salary-approval' | 'loan-payment-approval'
    | 'staff-promotion' | 'promotion-approval' | 'temporary-promotion'
    | 'profile' | 'staff-directory'
    | 'staff-loan-create' | 'staff-loan-approval' | 'staff-loan-list'
    | string;

function MainLayoutContent({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { isDarkMode } = useTheme();

    const [user, setUser] = useState<{ name: string; role: string; role_name?: string; branch: string; avatar_url?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            // If on login or public auth pages, we don't need to check auth to render
            if (pathname === '/login' || pathname === '/forgot-password' || pathname === '/reset-password') {
                setIsLoading(false);
                return;
            }

            const isAuthenticated = authService.isAuthenticated();

            if (!isAuthenticated) {
                router.push('/login');
                setIsLoading(false);
                return;
            }

            // Sync profile data
            try {
                // Try to get from local storage first for instant render
                const currentUser = authService.getCurrentUser();
                if (currentUser) {
                    const storedRolesStr = localStorage.getItem('roles');
                    let userRole = currentUser.role;

                    if (storedRolesStr) {
                        try {
                            const roles = JSON.parse(storedRolesStr);
                            if (Array.isArray(roles) && roles.length > 0) {
                                userRole = roles[0].name;
                            }
                        } catch (e) {
                            console.error("Failed to parse roles", e);
                        }
                    }

                    setUser({
                        name: currentUser.full_name || currentUser.name,
                        role: currentUser.role_name || userRole || 'Staff',
                        branch: currentUser.branch?.name || 'Head Office',
                        avatar_url: currentUser.avatar_url
                    });
                } else {
                    // If token exists but no user data, try to refresh
                    await authService.refreshProfile();
                    const refreshedUser = authService.getCurrentUser();
                    if (refreshedUser) {
                        setUser({
                            name: refreshedUser.full_name || refreshedUser.name,
                            role: refreshedUser.role_name || (localStorage.getItem('roles') ? JSON.parse(localStorage.getItem('roles')!)[0]?.name : null) || 'Staff',
                            branch: refreshedUser.branch?.name || 'Head Office',
                            avatar_url: refreshedUser.avatar_url
                        });
                    } else {
                        // Refresh failed, probably invalid token
                        authService.logout();
                        router.push('/login');
                    }
                }
            } catch (error) {
                console.error("Auth check failed", error);
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        // 💓 HEARTBEAT: Check auth status every 60 seconds
        const heartbeat = setInterval(async () => {
            if (authService.isAuthenticated()) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Accept': 'application/json'
                        }
                    });
                    if (response.status === 401) {
                        console.warn("Session invalidated. Logging out...");
                        authService.logout();
                        router.push('/login');
                    }
                } catch (e) {
                    // Ignore network errors for heartbeat
                }
            }
        }, 60000);

        // 🚨 GLOBAL 401 INTERCEPTOR: Catch 401s from any fetch call
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const response = await originalFetch(...args);
            if (response.status === 401 && !pathname.includes('/login')) {
                const token = localStorage.getItem('token');
                if (token) {
                    console.warn("Intercepted 401 error. Logging out...");
                    authService.logout();
                    window.location.href = '/login';
                }
            }
            return response;
        };

        return () => {
            clearInterval(heartbeat);
            window.fetch = originalFetch;
        };
    }, [pathname, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <BMSLoader message="Securing session..." className="text-gray-500 dark:text-gray-400" />
            </div>
        );
    }

    // If we are on the login, forgot-password page (or any other public page), render children directly without the shell
    if (pathname === '/login' || pathname === '/forgot-password' || pathname === '/reset-password' || !user) {
        return (
            <>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    theme={isDarkMode ? "dark" : "light"}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />

                {children}
            </>
        );
    }

    // Route permission mapping (source of truth for route protection)
    const routePermissions: Record<string, { permission?: string; roles?: string[] }> = {
        '/': { permission: 'dashboard.view' },
        '/dashboard': { permission: 'dashboard.view' },
        '/admin-dashboard': { roles: ['super_admin', 'admin'] },
        '/branches': { permission: 'branches.view' },
        '/centers': { permission: 'centers.view' },
        '/meeting-scheduling': { roles: ['super_admin', 'admin', 'manager', 'staff'] },
        '/center-requests': { roles: ['super_admin', 'admin', 'manager'] },
        '/groups': { permission: 'groups.view' },
        '/customers': { permission: 'customers.view' },
        '/customers/requests': { permission: 'customers.approve' },
        '/shareholders': { permission: 'users.roles.manage' },
        '/loan-product': { permission: 'loan_products.view' },
        '/investment-product': { permission: 'investment_products.view' },
        '/loans/create': { permission: 'loans.create' },
        '/loans/approval': { permission: 'loans.approve' },
        '/loans/sent-back': { permission: 'loans.view' },
        '/loans': { permission: 'loans.view' },
        '/collections/due-list': { permission: 'collections.view' },
        '/collections': { permission: 'collections.view' },
        '/collections/summary': { permission: 'collections.view' },
        '/collections/rejections': { permission: 'receipts.approvecancel' },
        '/transaction-approval/salary': { permission: 'leave.approve' },
        '/transaction-approval/loan-payment': { permission: 'receipts.approve' },
        '/finance': { permission: 'finance.view' },
        '/fund-transactions': { permission: 'finance.transactions' },
        '/promotion-approval': { permission: 'users.roles.manage' },
        '/temporary-promotion': { permission: 'users.roles.manage' },
        '/staff-loans/create': { permission: 'staffloans.create' },
        '/staff-loans': { permission: 'staffloans.view' },
        '/staff-loans/approval': { permission: 'staffloans.view' }, // Legacy route
        '/staff-management': { permission: 'staff.view' },
        '/roles-privileges': { permission: 'roles.view' },
        '/investments': { permission: 'investments.view' },
        '/investments/create': { permission: 'investments.create' },
    };

    // Determine current page ID from pathname
    const getCurrentPage = (): Page => {
        // Reverse route map: path -> pageId
        const pathToPageMap: Record<string, Page> = {
            '/': 'dashboard',
            '/dashboard': 'dashboard',
            '/admin-dashboard': 'admin-dashboard',
            '/branches': 'branches',
            '/centers': 'centers',
            '/meeting-scheduling': 'meeting-scheduling',
            '/groups': 'groups',
            '/customers': 'customers',
            '/customers/requests': 'customer-requests',
            '/loans/create': 'loan-create',
            '/loans/approval': 'loan-approval',
            '/loans/sent-back': 'loan-sent-back',
            '/loans': 'loan-list',
            '/loan-product': 'loan-product',
            '/roles-privileges': 'roles-privileges',
            '/collections/rejections': 'receipt-rejections',
            '/collections/due-list': 'due-list',
            '/collections': 'collections',
            '/collections/summary': 'collection-summary',
            '/reports': 'reports',
            '/finance': 'finance-overview',
            '/fund-transactions': 'fund-transactions',
            '/branch-transactions': 'branch-transactions',
            '/fund-truncation-summary': 'fund-truncation-summary',
            '/investment-product': 'investment-product',
            '/investments': 'investment-list',
            '/investments/create': 'investment-create',
            '/staff-management': 'staff-management',
            '/shareholders': 'shareholders',
            '/complaints': 'complaints',
            '/system-config': 'system-config',
            '/documents': 'documents',
            '/public-website': 'public-website',
            '/center-requests': 'center-requests',
            '/transaction-approval/salary': 'salary-approval',
            '/transaction-approval/loan-payment': 'loan-payment-approval',
            '/staff-promotion': 'staff-promotion',
            '/promotion-approval': 'promotion-approval',
            '/temporary-promotion': 'temporary-promotion',
            '/profile': 'profile',
            '/staff-directory': 'staff-directory',
            '/staff-loans/create': 'staff-loan-create',
            '/staff-loans/approval': 'staff-loan-approval',
            '/staff-loans': 'staff-loan-list',
        };

        // Check for exact match first
        if (pathToPageMap[pathname]) {
            return pathToPageMap[pathname];
        }

        // Fallback: Extract last segment for dynamic routes
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length > 0) {
            return segments[segments.length - 1] as Page;
        }

        return 'dashboard';
    };

    const handleNavigate = (pageId: Page) => {
        const routeMap: Record<string, string> = {
            'dashboard': '/',
            'admin-dashboard': '/admin-dashboard',
            'branches': '/branches',
            'centers': '/centers',
            'meeting-scheduling': '/meeting-scheduling',
            'groups': '/groups',
            'customers': '/customers',
            'loan-create': '/loans/create',
            'loan-approval': '/loans/approval',
            'loan-sent-back': '/loans/sent-back',
            'loan-list': '/loans',
            'loan-product': '/loan-product',
            'roles-privileges': '/roles-privileges',
            'customer-requests': '/customers/requests',
            'receipt-rejections': '/collections/rejections',
            'due-list': '/collections/due-list',
            'collections': '/collections',
            'collection-summary': '/collections/summary',
            'salary-approval': '/transaction-approval/salary',
            'loan-payment-approval': '/transaction-approval/loan-payment',
            'staff-promotion': '/staff-promotion',
            'promotion-approval': '/promotion-approval',
            'temporary-promotion': '/temporary-promotion',
            'investment-create': '/investments/create',
            'investment-product': '/investment-product',
            'investment-list': '/investments',
            'finance-overview': '/finance',
            'fund-truncation-summary': '/fund-truncation-summary',
            'staff-directory': '/staff-directory',
            'staff-loan-create': '/staff-loans/create',
            'staff-loan-approval': '/staff-loans/approval',
            'staff-loan-list': '/staff-loans',
        };

        const path = routeMap[pageId as string] || `/${pageId}`;
        router.push(path);
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            // ✅ Show logout success toast
            toast.success('Logout successful', {
                onClose: () => router.push('/login') // redirect after toast
            });
        } catch (error) {
            console.error("Logout failed", error);
            // Force redirect anyway
            router.push('/login');
        }
    };

    const handleProfileSettings = () => {
        router.push('/profile');
    };

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                theme={isDarkMode ? "dark" : "light"}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                <Sidebar
                    currentPage={getCurrentPage()}
                    onNavigate={handleNavigate}
                    isOpen={sidebarOpen}
                    userRole={user.role}
                />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header
                        user={user}
                        onLogout={handleLogout}
                        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                        onProfileSettings={handleProfileSettings}
                    />

                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
                        <PermissionGuard
                            permission={(() => {
                                if (routePermissions[pathname]) return routePermissions[pathname].permission;
                                // Handle dynamic routes (e.g. /loans/123 matching /loans)
                                const match = Object.entries(routePermissions)
                                    .filter(([route]) => route !== '/' && pathname.startsWith(route))
                                    .sort((a, b) => b[0].length - a[0].length)[0];
                                return match ? match[1].permission : undefined;
                            })()}
                            roles={(() => {
                                if (routePermissions[pathname]) return routePermissions[pathname].roles;
                                const match = Object.entries(routePermissions)
                                    .filter(([route]) => route !== '/' && pathname.startsWith(route))
                                    .sort((a, b) => b[0].length - a[0].length)[0];
                                return match ? match[1].roles : undefined;
                            })()}
                        >
                            {children}
                        </PermissionGuard>
                    </main>
                </div>
            </div>
        </>
    );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <LoadingProvider>
                <BranchProvider>
                    <LoadingOverlay />
                    <NavigationLoader />
                    <MainLayoutContent>{children}</MainLayoutContent>
                </BranchProvider>
            </LoadingProvider>
        </ThemeProvider>
    );
}
