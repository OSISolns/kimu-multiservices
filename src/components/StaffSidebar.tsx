"use client";

import { useUser } from '../app/UserContext';
import {
  FaCar, FaCalendarAlt, FaInbox, FaSignOutAlt, FaSave, FaFileAlt,
  FaMoneyBillWave, FaMapMarkedAlt, FaUsers, FaTachometerAlt, FaCoins,
  FaUserCircle, FaCog, FaBell, FaChevronRight, FaShieldAlt, FaCalculator
} from 'react-icons/fa';
import NotificationBell from './NotificationBell';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

const sidebarLinks = [
  { href: '/staff/admin-dashboard', label: 'Admin Dashboard', icon: FaShieldAlt, roles: ['admin'], category: 'Administration' },
  { href: '/staff/manager-dashboard', label: 'Manager Hub', icon: FaTachometerAlt, roles: ['manager'], category: 'Administration' },
  { href: '/staff/sales-dashboard', label: 'Sales Panel', icon: FaCar, roles: ['staff', 'sales', 'sales-representative'], category: 'Operations' },
  { href: '/staff/transport_officer-dashboard', label: 'Transport Panel', icon: FaMapMarkedAlt, roles: ['transport-officer'], category: 'Operations' },
  { href: '/staff/operations-dashboard', label: 'Operations Center', icon: FaMapMarkedAlt, roles: ['operations', 'admin', 'manager'], category: 'Operations' },
  { href: '/staff/accountant-dashboard', label: 'Finance Board', icon: FaMoneyBillWave, roles: ['accountant'], category: 'Financials' },
  { href: '/staff/client-credit', label: 'Client Credit', icon: FaCoins, roles: ['admin', 'manager', 'accountant', 'operations', 'staff'], category: 'Financials' },
  { href: '/staff/calculator', label: 'Loan Calculator', icon: FaCalculator, roles: ['admin', 'manager', 'accountant', 'operations', 'staff'], category: 'Financials' },
];

const roleColors: Record<string, string> = {
  admin: 'from-rose-500 to-pink-600',
  manager: 'from-violet-500 to-purple-600',
  accountant: 'from-emerald-500 to-teal-600',
  staff: 'from-blue-500 to-indigo-600',
  'transport-officer': 'from-amber-500 to-orange-600',
  operations: 'from-cyan-500 to-blue-600',
};

const roleLabels: Record<string, string> = {
  admin: 'System Admin',
  manager: 'Manager',
  accountant: 'Accountant',
  staff: 'Sales Staff',
  'transport-officer': 'Transport Officer',
  operations: 'Operations',
  agent: 'Field Agent',
};

export default function StaffSidebar() {
  const { user } = useUser();
  const pathname = usePathname();

  const allowedLinks = useMemo(() => {
    return sidebarLinks.filter(link => user && link.roles.includes(user.role));
  }, [user]);

  const groupedLinks = useMemo(() => {
    const groups: Record<string, typeof sidebarLinks> = {};
    allowedLinks.forEach(link => {
      if (!groups[link.category]) groups[link.category] = [];
      groups[link.category].push(link);
    });
    return groups;
  }, [allowedLinks]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const userInitials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
  const roleGradient = roleColors[user?.role || ''] || 'from-slate-500 to-slate-600';

  if (!user) {
    return (
      <aside className="w-[260px] bg-[#3453B7] border-r border-white/5 flex flex-col py-6 px-4 min-h-screen select-none">
        <div className="flex items-center gap-3 mb-8 px-2 animate-pulse">
          <div className="w-10 h-10 rounded-2xl bg-white/5" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-white/5 rounded w-24" />
            <div className="h-2 bg-white/5 rounded w-16" />
          </div>
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-white/5 rounded-2xl mb-2 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </aside>
    );
  }

  return (
    <aside className="w-[260px] bg-[#3453B7] border-r border-white/[0.06] flex flex-col py-0 min-h-screen text-slate-300 select-none relative overflow-hidden">
      {/* Ambient gradient */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top accent bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-orange-500 via-blue-500 to-violet-500 flex-shrink-0" />

      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/[0.06] flex-shrink-0">
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center shadow-lg flex-shrink-0">
          <Image src="/logo.png" alt="KIMU" width={26} height={26} className="object-contain" unoptimized />
        </div>
        <div>
          <div className="text-sm font-black text-white tracking-wider uppercase leading-none">KIMU</div>
          <div className="text-[9px] font-bold text-orange-400/80 uppercase tracking-[0.2em] mt-0.5">Management Portal</div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="mx-3 mt-3 mb-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-3 group hover:bg-white/[0.07] transition-all duration-300 cursor-default flex-shrink-0">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleGradient} flex items-center justify-center text-white font-black text-sm shadow-lg flex-shrink-0`}>
          {userInitials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-white truncate leading-tight">
            {user.fullName?.split(' ')[0] || user.username}
          </div>
          <div className="text-[9px] font-bold text-blue-200/80 uppercase tracking-widest mt-0.5">
            {roleLabels[user.role] || user.role}
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30 flex-shrink-0 animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5 custom-scrollbar">
        {Object.entries(groupedLinks).map(([category, links]) => (
          <div key={category}>
            <div className="px-2 mb-1.5">
              <span className="text-[9px] font-black text-blue-200/80 uppercase tracking-[0.2em]">{category}</span>
            </div>
            <ul className="space-y-0.5">
              {links.map(link => {
                const active = isActive(link.href);
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all duration-200 group relative overflow-hidden ${
                        active
                          ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 text-orange-300 border border-orange-500/20 shadow-sm'
                          : 'text-blue-100 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-orange-400 to-orange-600 rounded-r-full" />
                      )}
                      <span className={`flex-shrink-0 transition-all duration-200 ${active ? 'text-orange-400 scale-110' : 'text-blue-200 group-hover:text-white group-hover:scale-105'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="flex-1">{link.label}</span>
                      {active && <FaChevronRight className="w-2.5 h-2.5 text-orange-400/50 flex-shrink-0" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Communications */}
        {user && ['admin', 'staff', 'accountant', 'transport-officer', 'manager', 'operations'].includes(user.role) && (
          <div>
            <div className="px-2 mb-1.5">
              <span className="text-[9px] font-black text-blue-200/80 uppercase tracking-[0.2em]">Communications</span>
            </div>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/staff/notifications"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all duration-200 group relative overflow-hidden ${
                    isActive('/staff/notifications')
                      ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 text-orange-300 border border-orange-500/20 shadow-sm'
                      : 'text-blue-100 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {isActive('/staff/notifications') && (
                    <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-orange-400 to-orange-600 rounded-r-full" />
                  )}
                  <span className={`flex-shrink-0 transition-all duration-200 ${isActive('/staff/notifications') ? 'text-orange-400 scale-110' : 'text-blue-200 group-hover:text-white group-hover:scale-105'}`}>
                    <NotificationBell size="sm" showCount={false} />
                  </span>
                  <span className="flex-1">Alert Center</span>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/[0.06] space-y-0.5 flex-shrink-0">
        <Link
          href="/staff/profile"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all duration-200 group ${
            isActive('/staff/profile') ? 'bg-white/[0.08] text-white' : 'text-blue-100 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <FaUserCircle className="w-3.5 h-3.5 flex-shrink-0 group-hover:scale-105 transition-transform" />
          <span>Profile</span>
        </Link>
        <Link
          href="/staff/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs tracking-wide text-rose-200/80 hover:text-white hover:bg-rose-500/20 transition-all duration-200 group mt-1"
        >
          <FaSignOutAlt className="w-3.5 h-3.5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}