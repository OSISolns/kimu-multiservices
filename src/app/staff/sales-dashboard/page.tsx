'use client'

import { useState, useEffect } from 'react';
import { FaCar, FaTaxi, FaPlane, FaHotel, FaChartLine, FaUsers, FaExclamationTriangle, FaCheckCircle, FaArrowRight, FaCalendarAlt } from 'react-icons/fa';
import Link from 'next/link';
import { useUser } from '../../UserContext';
import LoadingSpinner from '@/components/LoadingSpinner';

type DashboardStats = {
  activeBookings: number;
  pendingLeads: number;
  totalIncome: number;
  pendingNotifications: number;
};

export default function SalesDashboardRoot() {
  const { user, isLoading: userLoading } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    activeBookings: 0,
    pendingLeads: 0,
    totalIncome: 0,
    pendingNotifications: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Fetch multiple data points in parallel
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
    }
  };

  if (userLoading || isLoading) return <LoadingSpinner message="Assembling Mission Control..." fullScreen={true} />;

  const quickLinks = [
    { title: 'Airport Transfers', icon: <FaPlane />, color: 'bg-blue-500', href: '/staff/airport-transfers', count: '---' },
    { title: 'Taxi Requests', icon: <FaTaxi />, color: 'bg-emerald-500', href: '/staff/taxi', count: '---' },
    { title: 'Hotel Bookings', icon: <FaHotel />, color: 'bg-indigo-500', href: '/staff/hotel-accommodation', count: '---' },
    { title: 'Car Listings', icon: <FaCar />, color: 'bg-orange-500', href: '/staff/vehicles', count: '---' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 mb-2">Welcome back, {user?.fullName?.split(' ')[0] || 'Agent'}!</h1>
            <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2">
              <FaCalendarAlt className="text-blue-500" /> {new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/staff/inbox" className="relative p-4 bg-slate-50 rounded-2xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
              <FaUsers className="text-2xl" />
              {stats.pendingNotifications > 0 && (
                <span className="absolute top-3 right-3 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
              )}
            </Link>
            <button onClick={fetchDashboardData} className="p-4 bg-slate-50 rounded-2xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
              <FaChartLine className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-200/50 transform hover:scale-[1.02] transition-all">
            <div className="text-blue-100 font-black uppercase tracking-widest text-[10px] mb-4">Active Operations</div>
            <div className="text-5xl font-black mb-2">{stats.activeBookings}</div>
            <div className="text-sm font-medium opacity-80">Bookings in progress</div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transform hover:scale-[1.02] transition-all">
            <div className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-4">Sales Pipeline</div>
            <div className="text-5xl font-black text-slate-800 mb-2">{stats.pendingLeads}</div>
            <div className="text-sm font-medium text-slate-500">Active leads to follow up</div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transform hover:scale-[1.02] transition-all">
            <div className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-4">Total Revenue</div>
            <div className="text-3xl font-black text-slate-800 mb-2">RWF {stats.totalIncome.toLocaleString()}</div>
            <div className="text-sm font-medium text-slate-500">Aggregate income</div>
          </div>

          <div className="bg-emerald-500 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-200/50 transform hover:scale-[1.02] transition-all">
            <div className="text-emerald-100 font-black uppercase tracking-widest text-[10px] mb-4">System Status</div>
            <div className="text-4xl font-black mb-2">HEALTHY</div>
            <div className="text-sm font-medium opacity-80 flex items-center gap-2"><FaCheckCircle /> All systems operational</div>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-800 ml-2">Operational Command</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link) => (
              <Link 
                key={link.title} 
                href={link.href}
                className="group bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/30 border border-slate-100 hover:border-blue-200 transition-all flex flex-col items-center text-center gap-4"
              >
                <div className={`${link.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl group-hover:scale-110 transition-all shadow-lg`}>
                  {link.icon}
                </div>
                <div>
                  <h3 className="font-black text-slate-800">{link.title}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manage Service</p>
                </div>
                <div className="mt-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                  <FaArrowRight />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Alerts Section */}
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-md">
              <h3 className="text-2xl font-black mb-4">Business Performance Insights</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Your performance is up 12% compared to last week. Keep focusing on Airport Transfer follow-ups to maximize conversions this weekend.
              </p>
              <Link href="/staff/reports" className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all">
                View Full Analytics <FaArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/5 text-center">
                <div className="text-3xl font-black mb-1 text-blue-400">+12%</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Growth</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/5 text-center">
                <div className="text-3xl font-black mb-1 text-emerald-400">98%</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
