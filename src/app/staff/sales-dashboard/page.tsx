'use client'

import { useState, useEffect } from 'react';
import {
  FaCar, FaTaxi, FaPlane, FaHotel, FaChartLine, FaUsers, FaCheckCircle,
  FaArrowRight, FaCalendarAlt, FaBell, FaSync, FaShoppingCart,
  FaLightbulb, FaArrowUp
} from 'react-icons/fa';
import Link from 'next/link';
import { useUser } from '../../UserContext';
import LoadingSpinner from '@/components/LoadingSpinner';

type DashboardStats = {
  activeBookings: number;
  pendingLeads: number;
  totalIncome: number;
  pendingNotifications: number;
};

const quickLinks = [
  { title: 'Airport Transfers', icon: FaPlane, color: 'from-sky-500 to-blue-600', glow: 'shadow-sky-500/25', href: '/staff/airport-transfers', badge: 'Priority' },
  { title: 'Taxi Requests', icon: FaTaxi, color: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/25', href: '/staff/taxi', badge: 'Live' },
  { title: 'Hotel Bookings', icon: FaHotel, color: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/25', href: '/staff/hotel-accommodation', badge: 'Available' },
  { title: 'Fleet Management', icon: FaCar, color: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/25', href: '/staff/vehicles', badge: 'Active' },
];

export default function SalesDashboardRoot() {
  const { user, isLoading: userLoading } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    activeBookings: 0,
    pendingLeads: 0,
    totalIncome: 0,
    pendingNotifications: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setRefreshing(true);
      setIsLoading(true);
      const [bookingsRes, leadsRes, incomeRes, notificationsRes] = await Promise.all([
        fetch('/api/bookings?status=Active'),
        fetch('/api/leads'),
        fetch('/api/accounting/income'),
        fetch(`/api/notifications?userId=${user.id}&read=false`)
      ]);

      const [bookings, leads, income, notifications] = await Promise.all([
        bookingsRes.json(),
        leadsRes.json(),
        incomeRes.json(),
        notificationsRes.json()
      ]);

      setStats({
        activeBookings: bookings.data?.length || 0,
        pendingLeads: leads.data?.filter((l: any) => l.stage !== 'Closed').length || 0,
        totalIncome: income.reduce((sum: number, t: any) => sum + t.amount, 0),
        pendingNotifications: notifications.length || 0
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  if (userLoading || isLoading) return <LoadingSpinner message="Loading dashboard..." fullScreen={true} />;
  if (!user) return null;

  const today = new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const firstName = user?.fullName?.split(' ')[0] || 'Agent';

  const kpiCards = [
    {
      label: 'Active Bookings',
      value: stats.activeBookings,
      sub: 'In progress now',
      icon: FaShoppingCart,
      color: 'from-blue-600 to-indigo-700',
      textColor: 'text-blue-100',
      badge: '+3 today',
      badgeColor: 'bg-blue-500/30 text-blue-200',
    },
    {
      label: 'Sales Pipeline',
      value: stats.pendingLeads,
      sub: 'Leads to follow up',
      icon: FaUsers,
      color: 'from-violet-600 to-purple-700',
      textColor: 'text-violet-100',
      badge: 'Active',
      badgeColor: 'bg-violet-500/30 text-violet-200',
    },
    {
      label: 'Total Revenue',
      value: `${stats.totalIncome.toLocaleString()}`,
      sub: 'RWF aggregate income',
      icon: FaChartLine,
      color: 'from-emerald-600 to-teal-700',
      textColor: 'text-emerald-100',
      badge: '+12%',
      badgeColor: 'bg-emerald-500/30 text-emerald-200',
    },
    {
      label: 'System Health',
      value: '100%',
      sub: 'All systems operational',
      icon: FaCheckCircle,
      color: 'from-orange-500 to-amber-600',
      textColor: 'text-orange-100',
      badge: 'Healthy',
      badgeColor: 'bg-orange-500/30 text-orange-200',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f8] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
              <FaCalendarAlt className="text-blue-400" />
              <span>{today}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{firstName}</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Here&apos;s what&apos;s happening across your operations today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/staff/notifications" className="relative p-2.5 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 shadow-sm">
              <FaBell className="w-4 h-4" />
              {stats.pendingNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </Link>
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 text-xs font-semibold shadow-sm disabled:opacity-50"
            >
              <FaSync className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/staff/bookings"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-200"
            >
              <FaShoppingCart className="w-3 h-3" />
              All Bookings
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpiCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="relative bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${card.color} rounded-2xl rotate-12 opacity-10 group-hover:opacity-15 transition-opacity`} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${card.badgeColor} bg-slate-100 text-slate-500`}>
                      {card.badge}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mb-0.5">{card.value}</div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{card.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{card.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Access Services */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-slate-800 uppercase tracking-wide">Operational Services</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Quick access to all service management modules</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.title}
                  href={link.href}
                  className="group relative bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-4 shadow-lg ${link.glow} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 leading-tight">{link.title}</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">{link.badge}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-50 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all duration-300">
                        <FaArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Performance + Sales Navigator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Performance Banner */}
          <div className="lg:col-span-2 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-20 w-48 h-48 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <FaLightbulb className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Performance Insight</span>
              </div>
              <h3 className="text-xl font-black text-white mb-2">Business on an upward trajectory</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-md">
                Your performance is up <span className="text-emerald-400 font-bold">12%</span> compared to last week. Focus on Airport Transfer follow-ups to maximize weekend conversions.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/staff/reports"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-black hover:bg-blue-50 transition-all duration-200 shadow-sm"
                >
                  View Full Analytics <FaArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  href="/staff/sales-dashboard/overview"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold hover:bg-white/15 transition-all duration-200"
                >
                  Sales Overview
                </Link>
              </div>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-3 hidden lg:grid">
              {[{ val: '+12%', label: 'Growth', color: 'text-emerald-400' }, { val: '98%', label: 'Satisfaction', color: 'text-blue-400' }, { val: '47', label: 'Bookings', color: 'text-orange-400' }, { val: '2.4h', label: 'Avg Response', color: 'text-violet-400' }].map(item => (
                <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center min-w-[72px]">
                  <div className={`text-xl font-black ${item.color}`}>{item.val}</div>
                  <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Navigator */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FaChartLine className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">Sales Navigator</h3>
                <p className="text-[10px] text-slate-400 font-medium">Drill into your pipeline</p>
              </div>
            </div>
            <div className="space-y-1">
              {[
                { label: 'Overview', href: '/staff/sales-dashboard/overview', icon: FaChartLine, color: 'text-blue-500' },
                { label: 'Customers', href: '/staff/sales-dashboard/customers', icon: FaUsers, color: 'text-violet-500' },
                { label: 'Pipeline', href: '/staff/sales-dashboard/pipeline', icon: FaChartLine, color: 'text-emerald-500' },
                { label: 'Campaigns', href: '/staff/sales-dashboard/campaigns', icon: FaLightbulb, color: 'text-amber-500' },
                { label: 'Inventory', href: '/staff/sales-dashboard/inventory', icon: FaCar, color: 'text-orange-500' },
                { label: 'Financials', href: '/staff/sales-dashboard/financials', icon: FaArrowUp, color: 'text-rose-500' },
              ].map(item => {
                const Icon = item.icon;
                const active = typeof window !== 'undefined' ? false : false; // simplified
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 flex-1">{item.label}</span>
                    <FaArrowRight className="w-2.5 h-2.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
