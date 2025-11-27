"use client";

// Force dynamic rendering for all staff pages to prevent prerendering issues
export const dynamic = 'force-dynamic';

import StaffSidebar from '../../components/StaffSidebar';
import '../../app/globals.css';
import { usePathname } from 'next/navigation';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide sidebar on login page, auth-related pages, and admin-specific pages (they have their own layouts)
  let showSidebar = true;
  const adminPages = ['/staff/admin-dashboard', '/staff/system-logs', '/staff/users', '/staff/reports', '/staff/settings', '/staff/sales-dashboard'];
  if (pathname === '/staff/login' || pathname === '/staff/logout' || adminPages.some(page => pathname?.startsWith(page))) {
    showSidebar = false;
  }
  if (typeof children === 'string' && children.includes('Not Authorized')) showSidebar = false;
  if (typeof children === 'object' && children && 'props' in children && (children as any).props?.className?.includes('not-authorized')) showSidebar = false;

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {showSidebar && <StaffSidebar />}
      <main className="flex-1 w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}