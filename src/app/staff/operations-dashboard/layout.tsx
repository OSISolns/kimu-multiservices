"use client";

import { useUser } from '../../UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function OperationsDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/staff/login');
        } else if (!isLoading && user && !['operations', 'admin', 'manager'].includes(user.role)) {
            router.push('/staff/profile');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user || !['operations', 'admin', 'manager'].includes(user.role)) {
        return <div className="min-h-screen bg-gray-50/50 bg-[url('/subtle-prism.svg')] bg-cover bg-fixed flex items-center justify-center"><LoadingSpinner /></div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-50/50 bg-[url('/subtle-prism.svg')] bg-cover bg-fixed font-sans">
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
                <div className="max-w-[1400px] mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
