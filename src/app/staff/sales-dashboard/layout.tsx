"use client";

import SalesSidebar from './components/SalesSidebar';
import { useUser } from '../../UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SalesDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/staff/login');
        } else if (!isLoading && user && !['sales', 'staff'].includes(user.role)) {
            // Redirect based on role to enforce 'own pages'
            if (user.role === 'admin') router.push('/staff/admin-dashboard');
            else if (user.role === 'accountant') router.push('/staff/accountant-dashboard');
            else if (user.role === 'manager') router.push('/staff/manager-dashboard');
            else if (user.role === 'transport-officer') router.push('/staff/transport_officer-dashboard');
            else router.push('/staff/login');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user || !['sales', 'staff'].includes(user.role)) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><LoadingSpinner /></div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <SalesSidebar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
                <div className="max-w-7xl mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
