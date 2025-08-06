"use client";
import StaffSidebar from '../../components/StaffSidebar';
import '../../app/globals.css';
import { usePathname } from 'next/navigation';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide sidebar on login page and other auth-related pages
  let showSidebar = true;
  if (pathname === '/staff/login' || pathname === '/staff/logout') {
    showSidebar = false;
  }
  if (typeof children === 'string' && children.includes('Not Authorized')) showSidebar = false;
  if (typeof children === 'object' && children && 'props' in children && children.props.className && children.props.className.includes('not-authorized')) showSidebar = false;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {showSidebar && <StaffSidebar />}
      <main className="flex-1 max-w-full mx-auto p-8 flex flex-col gap-8">
        {children}
      </main>
    </div>
  );
} 