'use client';

import React, { useEffect, useState } from 'react';
import { ViewGroups } from '../../components/groups/ViewGroups';
import BMSLoader from '@/components/common/BMSLoader';
import { authService } from '../../services/auth.service';
import { useRouter } from 'next/navigation';

export default function GroupsPage() {
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkAccess = () => {
            const hasViewPermission = authService.hasPermission('groups.view');
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
            <div className="p-12 text-center flex flex-col items-center">
                <BMSLoader message="Loading groups..." size="xsmall" />
            </div>
        );
    }

    return <ViewGroups />;
}
