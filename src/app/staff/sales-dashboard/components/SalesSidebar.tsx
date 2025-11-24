"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    FaChartPie,
    FaFilter,
    FaUsers,
    FaCar,
    FaCalendarCheck,
    FaBullhorn,
    FaFileInvoiceDollar,
    FaSignOutAlt,
    FaCog
} from 'react-icons/fa';
import Image from 'next/image';

const menuItems = [
    { name: 'Overview', icon: FaChartPie, href: '/staff/sales-dashboard/overview' },
    { name: 'Pipeline', icon: FaFilter, href: '/staff/sales-dashboard/pipeline' },
    { name: 'Customers', icon: FaUsers, href: '/staff/sales-dashboard/customers' },
    { name: 'Inventory', icon: FaCar, href: '/staff/sales-dashboard/inventory' },
    { name: 'Activities', icon: FaCalendarCheck, href: '/staff/sales-dashboard/activities' },
    { name: 'Campaigns', icon: FaBullhorn, href: '/staff/sales-dashboard/campaigns' },
    { name: 'Financials', icon: FaFileInvoiceDollar, href: '/staff/sales-dashboard/financials' },
];

export default function SalesSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
            <div className="p-6 flex items-center gap-3 border-b border-gray-100">
                <Image src="/logo.png" alt="KIMU Logo" width={40} height={40} className="w-10 h-10" />
                <div>
                    <h1 className="font-bold text-gray-900 leading-tight">Sales Portal</h1>
                    <p className="text-xs text-gray-500">KIMU Multiservices</p>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname?.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100 space-y-1">
                <Link
                    href="/staff/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                    <FaCog className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">Settings</span>
                </Link>
                <Link
                    href="/staff/logout"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                    <FaSignOutAlt className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </Link>
            </div>
        </aside>
    );
}
