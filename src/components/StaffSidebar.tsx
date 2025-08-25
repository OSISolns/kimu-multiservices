"use client";
import { useUser } from '../app/UserContext';
import { FaCar, FaCalendarAlt, FaInbox, FaSignOutAlt, FaSave, FaFileAlt, FaBell, FaMoneyBillWave, FaMapMarkedAlt, FaUsers } from 'react-icons/fa';
import NotificationBell from './NotificationBell';
import Image from 'next/image';

const sidebarLinks = [
  { href: '/staff/dashboard', label: 'Dashboard', icon: <FaCar />, roles: ['admin', 'staff', 'sales'] },
  { href: '/staff/transport-officer', label: 'Transport Officer', icon: <FaMapMarkedAlt />, roles: ['transport-officer'] },
  { href: '/staff/accountant-dashboard', label: 'Finance Dashboard', icon: <FaMoneyBillWave />, roles: ['accountant'] },
  { href: '/staff/bookings', label: 'Bookings', icon: <FaCalendarAlt />, roles: ['admin', 'staff', 'transport-officer'] },
      { href: '/staff/sales-management', label: 'Sales Management', icon: <FaUsers />, roles: ['admin', 'staff', 'sales'] },
  { href: '/staff/reports', label: 'Reports', icon: <FaFileAlt />, roles: ['admin', 'accountant'] },
  { href: '/staff/users', label: 'Users', icon: <FaInbox />, roles: ['admin'] },
];

export default function StaffSidebar() {
  const { user } = useUser();
  return (
    <aside className="w-64 bg-white border-r flex flex-col py-8 px-6 min-h-screen">
      <div className="flex items-center gap-3 mb-10">
        <Image src="/logo.png" alt="KIMU Transport Logo" width={48} height={48} className="w-12 h-12" />
        <span className="font-bold text-xl text-orange-700">KIMU Transport & Multiservices</span>
      </div>
      <nav className="flex-1 flex flex-col justify-between">
        <div>
          <ul className="space-y-2">
            {sidebarLinks.filter(link => user && link.roles.includes(user.role)).map(link => (
              <li key={link.href}>
                <a className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 font-semibold" href={link.href}>
                  {link.icon} {link.label}
                </a>
              </li>
            ))}
            
            {/* Special Notifications Item with Bell */}
            {user && ['admin', 'staff', 'accountant', 'transport-officer'].includes(user.role) && (
              <li>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 font-semibold cursor-pointer">
                  <NotificationBell size="sm" className="flex-shrink-0" />
                  <span>Notifications</span>
                </div>
              </li>
            )}
          </ul>
        </div>
      </nav>
      <div className="mt-auto pt-8 flex flex-col gap-2">
        <a href="/staff/settings" className="flex items-center gap-3 text-gray-700 font-semibold hover:underline transition-all duration-300 hover:scale-105"><FaSave /> Settings</a>
        <a href="/staff/logout" className="flex items-center gap-3 text-red-500 font-semibold hover:underline transition-all duration-300 hover:scale-105"><FaSignOutAlt /> Logout</a>
      </div>
    </aside>
  );
} 