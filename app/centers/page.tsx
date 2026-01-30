'use client';

import React, { useEffect, useState } from 'react';
import { ViewScheduling } from '../../components/centers/ViewScheduling';
import { authService } from '../../services/auth.service';
import { useRouter } from 'next/navigation';
import BMSLoader from '../../components/common/BMSLoader';

export default function CentersPage() {
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkAccess = () => {
            const hasViewPermission = authService.hasPermission('centers.view');
            const isSuperAdmin = authService.hasRole('super_admin');

            if (!hasViewPermission && !isSuperAdmin) {
                router.push('/');
                return false;
            }
            return true;
        };

        if (typeof window !== 'undefined') {
            const allowed = checkAccess();
            setHasAccess(allowed);
        }
    }, [router]);

    if (hasAccess === false) return null;

    if (hasAccess === null) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <BMSLoader message="Loading schedule..." size="xsmall" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <ViewScheduling />
        </div>
    );
}
