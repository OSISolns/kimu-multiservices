"use client";

import SalesSidebar from './components/SalesSidebar';

export default function SalesDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
