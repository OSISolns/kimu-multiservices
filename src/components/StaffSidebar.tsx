"use client";
import { useUser } from '../app/UserContext';
import { FaCar, FaCalendarAlt, FaInbox, FaSignOutAlt, FaSave, FaFileAlt, FaMoneyBillWave, FaMapMarkedAlt, FaUsers, FaTachometerAlt } from 'react-icons/fa';
import NotificationBell from './NotificationBell';
import Image from 'next/image';
import Link from 'next/link';

const sidebarLinks = [
  { href: '/staff/admin-dashboard', label: 'Dashboard', icon: <FaTachometerAlt />, roles: ['admin'] },
  { href: '/staff/manager-dashboard', label: 'Dashboard', icon: <FaTachometerAlt />, roles: ['manager'] },
  { href: '/staff/sales-dashboard', label: 'Dashboard', icon: <FaCar />, roles: ['staff', 'sales'] },
  { href: '/staff/transport_officer-dashboard', label: 'Transport Officer', icon: <FaMapMarkedAlt />, roles: ['transport-officer'] },
  { href: '/staff/accountant-dashboard', label: 'Finance Dashboard', icon: <FaMoneyBillWave />, roles: ['accountant'] },
  { href: '/staff/bookings', label: 'Bookings', icon: <FaCalendarAlt />, roles: ['admin', 'manager', 'staff', 'transport-officer'] },
  { href: '/staff/vehicles', label: 'Vehicles', icon: <FaCar />, roles: ['admin', 'manager', 'transport-officer', 'staff'] },
  { href: '/staff/sales-dashboard', label: 'Sales Management', icon: <FaUsers />, roles: ['admin', 'manager', 'staff', 'sales'] },
  { href: '/staff/reports', label: 'Reports', icon: <FaFileAlt />, roles: ['admin', 'manager', 'accountant'] },
  { href: '/staff/users', label: 'Users', icon: <FaInbox />, roles: ['admin', 'manager'] },
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
                <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 font-semibold" href={link.href}>
                  {link.icon} {link.label}
                </Link>
              </li>
            ))}

            {/* Special Notifications Item with Bell */}
            {user && ['admin', 'staff', 'accountant', 'transport-officer', 'manager'].includes(user.role) && (
              <li>
                <Link
                  href="/staff/notifications"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 font-semibold"
                >
                  <NotificationBell size="sm" className="flex-shrink-0" />
                  <span>Notifications</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>
      <div className="mt-auto pt-8 flex flex-col gap-2">
        <Link href="/staff/settings" className="flex items-center gap-3 text-gray-700 font-semibold hover:underline transition-all duration-300 hover:scale-105"><FaSave /> Settings</Link>
        <Link href="/staff/logout" className="flex items-center gap-3 text-red-500 font-semibold hover:underline transition-all duration-300 hover:scale-105"><FaSignOutAlt /> Logout</Link>
      </div>
    </aside>
  );
}