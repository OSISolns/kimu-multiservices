"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../../UserContext";
import {
  FaUsers,
  FaCalendarAlt,
  FaCar,
  FaBell,
  FaMoneyBillWave,
  FaDatabase,
  FaFileAlt,
  FaChartLine,
  FaCog,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaPlane,
  FaHotel,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaDownload,
  FaSync,
  FaArrowUp,
} from "react-icons/fa";

type Booking = any;
type Payment = any;
type Notification = any;

export default function AdminDashboardPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/staff/login');
      return;
    }

    if (user.role !== "admin") {
      // Redirect non-admin users to their appropriate dashboard
      if (user.role === 'accountant') {
        router.push('/staff/accountant-dashboard');
      } else if (user.role === 'sales') {
        router.push('/staff/sales-dashboard');
      } else {
        router.push('/staff/sales-dashboard');
      }
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const username = user?.username || "";
        console.log('Admin dashboard loading data for user:', username);

        const [bookingsRes, paymentsRes, notificationsRes, usersRes, vehiclesRes, quotesRes, leadsRes, systemLogsRes, activityLogsRes] = await Promise.allSettled([
          fetch("/api/bookings").then((r) => {
            console.log('Bookings API status:', r.status);
            return r.ok ? r.json() : { error: `Bookings API failed: ${r.status}`, data: [] };
          }),
          fetch("/api/payments").then((r) => {
            console.log('Payments API status:', r.status);
            return r.ok ? r.json() : { error: `Payments API failed: ${r.status}`, data: [] };
          }),
          fetch("/api/notifications").then((r) => {
            console.log('Notifications API status:', r.status);
            return r.ok ? r.json() : { error: `Notifications API failed: ${r.status}`, data: [] };
          }),
          fetch("/api/users", { headers: { "x-username": username } }).then((r) => {
            console.log('Users API status:', r.status);
            return r.ok ? r.json() : { error: `Users API failed: ${r.status}`, users: [] };
          }),
          fetch("/api/vehicles").then((r) => {
            console.log('Vehicles API status:', r.status);
            return r.ok ? r.json() : { error: `Vehicles API failed: ${r.status}`, data: [] };
          }),
          fetch("/api/quotes").then((r) => {
            console.log('Quotes API status:', r.status);
            return r.ok ? r.json() : { error: `Quotes API failed: ${r.status}`, quotes: [] };
          }),
          fetch("/api/leads").then((r) => {
            console.log('Leads API status:', r.status);
            return r.ok ? r.json() : { error: `Leads API failed: ${r.status}`, leads: [] };
          }),
          fetch("/api/system-logs").then((r) => {
            console.log('System Logs API status:', r.status);
            return r.ok ? r.json() : { error: `System Logs API failed: ${r.status}`, data: [] };
          }),
          fetch("/api/activity-log").then((r) => {
            console.log('Activity Logs API status:', r.status);
            return r.ok ? r.json() : { error: `Activity Logs API failed: ${r.status}`, data: [] };
          }),
        ]);

        if (cancelled) return;

        console.log('API Responses:', { bookingsRes, paymentsRes, notificationsRes, usersRes });

        // Extract data from Promise.allSettled results
        const extractData = (result: any, fallback: any = []) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            console.warn('API call failed:', result.reason);
            return fallback;
          }
        };

        // Handle different response structures
        const bookingsData = extractData(bookingsRes, [])?.data || extractData(bookingsRes, [])?.bookings || extractData(bookingsRes, []) || [];
        const paymentsData = Array.isArray(extractData(paymentsRes, [])) ? extractData(paymentsRes, []) : [];
        const notificationsData = Array.isArray(extractData(notificationsRes, [])) ? extractData(notificationsRes, []) : [];
        const usersData = extractData(usersRes, {})?.users || [];
        const vehiclesData = Array.isArray(extractData(vehiclesRes, [])) ? extractData(vehiclesRes, []) : [];
        const quotesData = extractData(quotesRes, {})?.quotes || extractData(quotesRes, {})?.data || (Array.isArray(extractData(quotesRes, [])) ? extractData(quotesRes, []) : []);
        const leadsData = extractData(leadsRes, {})?.leads || extractData(leadsRes, {})?.data || (Array.isArray(extractData(leadsRes, [])) ? extractData(leadsRes, []) : []);
        const systemLogsData = Array.isArray(extractData(systemLogsRes, [])) ? extractData(systemLogsRes, []) : [];
        const activityLogsData = Array.isArray(extractData(activityLogsRes, [])) ? extractData(activityLogsRes, []) : [];

        console.log('Parsed data:', {
          bookings: bookingsData.length,
          payments: paymentsData.length,
          notifications: notificationsData.length,
          users: usersData.length,
          vehicles: vehiclesData.length,
          quotes: quotesData.length,
          leads: leadsData.length,
          systemLogs: systemLogsData.length,
          activityLogs: activityLogsData.length
        });

        setBookings(bookingsData);
        setPayments(paymentsData);
        setNotifications(notificationsData);
        setUsers(usersData);
        setVehicles(vehiclesData);
        setQuotes(quotesData);
        setLeads(leadsData);
        setSystemLogs(systemLogsData);
        setActivityLogs(activityLogsData);
        setLastRefresh(new Date());
      } catch (err) {
        console.error('Staff dashboard error:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isLoading, user, router]);

  const totalRevenue = useMemo(
    () => Array.isArray(payments) ? payments.filter((x) => x.status === "completed").reduce((s, x) => s + (x.amount || 0), 0) : 0,
    [payments]
  );

  const activeRentals = useMemo(
    () => (bookings || []).filter((b: any) => b.type === "Car Rental" && !b.returnConfirmed).length,
    [bookings]
  );

  const availableVehicles = useMemo(
    () => Array.isArray(vehicles) ? vehicles.filter((v: any) => v.isAvailable && v.status === "available").length : 0,
    [vehicles]
  );

  const pendingBookings = useMemo(
    () => Array.isArray(bookings) ? bookings.filter((b: any) => b.status === "Pending" || b.status === "Active").length : 0,
    [bookings]
  );

  const completedBookings = useMemo(
    () => Array.isArray(bookings) ? bookings.filter((b: any) => b.status === "Completed").length : 0,
    [bookings]
  );

  const totalQuotes = useMemo(
    () => Array.isArray(quotes) ? quotes.length : 0,
    [quotes]
  );

  const pendingQuotes = useMemo(
    () => Array.isArray(quotes) ? quotes.filter((q: any) => q.status === "draft" || q.status === "sent").length : 0,
    [quotes]
  );

  const acceptedQuotes = useMemo(
    () => Array.isArray(quotes) ? quotes.filter((q: any) => q.status === "accepted").length : 0,
    [quotes]
  );

  const totalLeads = useMemo(
    () => Array.isArray(leads) ? leads.length : 0,
    [leads]
  );

  const activeLeads = useMemo(
    () => Array.isArray(leads) ? leads.filter((l: any) => l.stage !== "Closed").length : 0,
    [leads]
  );

  const recentActivity = useMemo(
    () => Array.isArray(activityLogs) ? activityLogs.slice(0, 10).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [],
    [activityLogs]
  );

  const systemHealth = useMemo(() => {
    if (!Array.isArray(systemLogs)) return { status: 'healthy', percentage: 100 };
    const errorLogs = systemLogs.filter((log: any) => log.action.includes('error') || log.action.includes('Error')).length;
    const totalLogs = systemLogs.length;
    if (totalLogs === 0) return { status: 'healthy', percentage: 100 };
    const percentage = Math.max(0, ((totalLogs - errorLogs) / totalLogs) * 100);
    return {
      status: percentage > 90 ? 'healthy' : percentage > 70 ? 'warning' : 'critical',
      percentage: Math.round(percentage)
    };
  }, [systemLogs]);

  const bookingTypes = useMemo(() => {
    if (!Array.isArray(bookings)) return {};
    const types = bookings.reduce((acc: any, booking: any) => {
      acc[booking.type] = (acc[booking.type] || 0) + 1;
      return acc;
    }, {});
    return types;
  }, [bookings]);

  const refreshData = () => {
    setLastRefresh(new Date());
    // Trigger useEffect to reload data
    window.location.reload();
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <div className="min-h-screen flex items-center justify-center">Not authorized</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 bg-[url('/subtle-prism.svg')] bg-cover bg-fixed">
      {/* Sticky Header with Glassmorphism */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm print:hidden mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl shadow-lg shadow-orange-500/30">
                <FaShieldAlt className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Admin Dashboard</h1>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest opacity-60">System Overview & Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
              <button
                onClick={refreshData}
                className="bg-white border-2 border-gray-100 text-gray-600 px-4 py-2 rounded-xl hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all flex items-center gap-2 shadow-sm font-bold text-xs uppercase tracking-wider active:scale-95"
              >
                <FaSync className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {/* Users Stat */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FaUsers className="text-xl" />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                +{users.filter((u: any) => u.status === 'active').length} Active
              </span>
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tight mb-1">{users.length}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Users</div>
          </div>

          {/* Revenue Stat */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FaMoneyBillWave className="text-xl" />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                {payments.filter((p: any) => p.status === 'completed').length} Paid
              </span>
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tight mb-1">{totalRevenue.toLocaleString()}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Revenue (RWF)</div>
          </div>

          {/* Bookings Stat */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FaCalendarAlt className="text-xl" />
              </div>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                {pendingBookings} Pending
              </span>
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tight mb-1">{bookings.length}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Bookings</div>
          </div>

          {/* Vehicles Stat */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FaCar className="text-xl" />
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                {availableVehicles} Ready
              </span>
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tight mb-1">{vehicles.length}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fleet Size</div>
          </div>

          {/* Quotes Stat */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FaFileAlt className="text-xl" />
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                {pendingQuotes} Open
              </span>
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tight mb-1">{totalQuotes}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Quotes</div>
          </div>

          {/* Leads Stat */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FaChartLine className="text-xl" />
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                {activeLeads} Active
              </span>
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tight mb-1">{totalLeads}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Leads</div>
          </div>
        </div>

        {/* System Health and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Health */}
          <div className="bg-white/80 backdrop-blur-sm rounded-[32px] p-8 border border-white/50 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-xl ${systemHealth.status === 'healthy' ? 'bg-green-100 text-green-600' : systemHealth.status === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                <FaShieldAlt className="text-lg" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">System Health</h3>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-4xl font-black text-gray-900 tracking-tighter">{systemHealth.percentage}%</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Operational</div>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${systemHealth.status === 'healthy' ? 'bg-green-100 text-green-700' :
                  systemHealth.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                  {systemHealth.status}
                </span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${systemHealth.status === 'healthy' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    systemHealth.status === 'warning' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      'bg-gradient-to-r from-red-500 to-rose-600'
                    }`}
                  style={{ width: `${systemHealth.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-[32px] p-8 border border-white/50 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                <FaCog className="text-lg" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <Link href="/staff/users" className="group flex items-center justify-between p-4 bg-white border-2 border-transparent hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/10 rounded-2xl transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FaUsers />
                  </div>
                  <span className="font-bold text-gray-700 group-hover:text-blue-700">Manage Users</span>
                </div>
                <FaArrowUp className="text-gray-300 rotate-45 group-hover:rotate-90 group-hover:text-blue-500 transition-all" />
              </Link>
              <Link href="/staff/vehicles" className="group flex items-center justify-between p-4 bg-white border-2 border-transparent hover:border-orange-100 hover:shadow-lg hover:shadow-orange-500/10 rounded-2xl transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <FaCar />
                  </div>
                  <span className="font-bold text-gray-700 group-hover:text-orange-700">Manage Vehicles</span>
                </div>
                <FaArrowUp className="text-gray-300 rotate-45 group-hover:rotate-90 group-hover:text-orange-500 transition-all" />
              </Link>
              <Link href="/staff/bookings" className="group flex items-center justify-between p-4 bg-white border-2 border-transparent hover:border-purple-100 hover:shadow-lg hover:shadow-purple-500/10 rounded-2xl transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <FaCalendarAlt />
                  </div>
                  <span className="font-bold text-gray-700 group-hover:text-purple-700">View Bookings</span>
                </div>
                <FaArrowUp className="text-gray-300 rotate-45 group-hover:rotate-90 group-hover:text-purple-500 transition-all" />
              </Link>
            </div>
          </div>

          {/* Booking Types Breakdown */}
          <div className="bg-white/80 backdrop-blur-sm rounded-[32px] p-8 border border-white/50 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                <FaChartLine className="text-lg" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Booking Types</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(bookingTypes).map(([type, count]) => (
                <div key={type} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-600 group-hover:text-indigo-600 transition-colors">{type}</span>
                    <span className="text-sm font-black text-gray-900">{count as number}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full group-hover:from-indigo-400 group-hover:to-blue-400 transition-all"
                      style={{ width: `${((count as number) / bookings.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity and System Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-sm rounded-[32px] p-8 border border-white/50 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                <FaClock className="text-lg" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Recent Activity</h3>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                No recent activity
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {recentActivity.map((activity: any) => (
                  <div key={activity.id} className="group flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all">
                    <div className="w-2 h-2 rounded-full mt-2.5 bg-blue-400 group-hover:scale-150 transition-transform"></div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 text-sm">{activity.action}</div>
                      <div className="text-xs font-medium text-gray-500 mt-0.5">{activity.details}</div>
                      <div className="text-[10px] font-bold text-blue-400 mt-2 uppercase tracking-wide">
                        {new Date(activity.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Alerts */}
          <div className="bg-white/80 backdrop-blur-sm rounded-[32px] p-8 border border-white/50 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                <FaExclamationTriangle className="text-lg" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">System Alerts</h3>
            </div>

            {systemLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                System is healthy. No alerts.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {Array.isArray(systemLogs) ? systemLogs.slice(0, 10).map((log: any) => (
                  <div key={log.id} className={`p-4 rounded-2xl border transition-all ${log.action.includes('error') ? 'bg-red-50 border-red-100 hover:border-red-300' :
                    log.action.includes('warning') ? 'bg-yellow-50 border-yellow-100 hover:border-yellow-300' :
                      'bg-green-50 border-green-100 hover:border-green-300'
                    }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-black uppercase tracking-wider ${log.action.includes('error') ? 'text-red-700' :
                        log.action.includes('warning') ? 'text-yellow-700' :
                          'text-green-700'
                        }`}>{log.action}</span>
                      <span className="text-[10px] font-bold opacity-60">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-xs font-medium text-gray-600">{log.details}</div>
                  </div>
                )) : []}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Notifications and Latest Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notifications */}
          <div className="bg-white/80 backdrop-blur-sm rounded-[32px] p-8 border border-white/50 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                <FaBell className="text-lg" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Notifications</h3>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                No notifications
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {Array.isArray(notifications) ? notifications.slice(0, 6).map((n: any) => (
                  <div key={n.id} className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 transition-all">
                    <span className="w-2 h-2 rounded-full mt-2 bg-blue-500 shrink-0"></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 break-words">{n.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-lg">{n.type}</span>
                        <span className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )) : []}
              </div>
            )}
          </div>

          {/* Bookings Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-[32px] p-8 border border-white/50 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                <FaCalendarAlt className="text-lg" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Latest Bookings</h3>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                No bookings found
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-100">
                <table className="min-w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="py-3 px-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                      <th className="py-3 px-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
                      <th className="py-3 px-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {Array.isArray(bookings) ? bookings.slice(0, 6).map((b: any) => (
                      <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${b.type === 'Car Rental' ? 'bg-blue-50 text-blue-700' :
                            b.type === 'Airport Transfer' ? 'bg-green-50 text-green-700' :
                              'bg-purple-50 text-purple-700'
                            }`}>
                            {b.type === 'Car Rental' ? <FaCar /> : b.type === 'Airport Transfer' ? <FaPlane /> : <FaHotel />}
                            {b.type.split(' ')[0]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs font-bold text-gray-900">{b.name || b.guestName || "-"}</div>
                          <div className="text-[10px] text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${b.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                            b.status === 'Active' ? 'bg-blue-50 text-blue-700' :
                              'bg-amber-50 text-amber-700'
                            }`}>
                            {b.status || (b.returnConfirmed ? "Completed" : "Pending")}
                          </span>
                        </td>
                      </tr>
                    )) : []}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Management Tools */}
        <div className="bg-white/80 backdrop-blur-sm rounded-[32px] p-8 border border-white/50 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-900 text-white rounded-xl">
              <FaDatabase className="text-lg" />
            </div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Advanced Management</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/staff/system-logs" className="group rounded-2xl border-2 border-gray-100 hover:border-gray-900 p-6 transition-all duration-300 bg-white hover:shadow-lg">
              <div className="flex flex-col gap-4">
                <div className="self-start p-3 bg-gray-100 text-gray-600 rounded-xl group-hover:bg-gray-900 group-hover:text-white transition-colors">
                  <FaDatabase className="text-xl" />
                </div>
                <div>
                  <h4 className="border-l-2 border-transparent group-hover:border-gray-900 pl-0 group-hover:pl-3 font-bold text-gray-900 transition-all">System Logs</h4>
                  <p className="text-xs font-medium text-gray-500 mt-1">{systemLogs.length} entries recorded</p>
                </div>
              </div>
            </Link>

            <Link href="/staff/vehicles" className="group rounded-2xl border-2 border-gray-100 hover:border-orange-500 p-6 transition-all duration-300 bg-white hover:shadow-lg hover:shadow-orange-500/10">
              <div className="flex flex-col gap-4">
                <div className="self-start p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <FaCar className="text-xl" />
                </div>
                <div>
                  <h4 className="border-l-2 border-transparent group-hover:border-orange-500 pl-0 group-hover:pl-3 font-bold text-gray-900 transition-all">Vehicle Fleet</h4>
                  <p className="text-xs font-medium text-gray-500 mt-1">{vehicles.length} vehicles managed</p>
                </div>
              </div>
            </Link>

            <Link href="/staff/users" className="group rounded-2xl border-2 border-gray-100 hover:border-blue-600 p-6 transition-all duration-300 bg-white hover:shadow-lg hover:shadow-blue-600/10">
              <div className="flex flex-col gap-4">
                <div className="self-start p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FaUsers className="text-xl" />
                </div>
                <div>
                  <h4 className="border-l-2 border-transparent group-hover:border-blue-600 pl-0 group-hover:pl-3 font-bold text-gray-900 transition-all">User Access</h4>
                  <p className="text-xs font-medium text-gray-500 mt-1">{users.length} active users</p>
                </div>
              </div>
            </Link>

            <Link href="/staff/bookings" className="group rounded-2xl border-2 border-gray-100 hover:border-purple-600 p-6 transition-all duration-300 bg-white hover:shadow-lg hover:shadow-purple-600/10">
              <div className="flex flex-col gap-4">
                <div className="self-start p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <FaCalendarAlt className="text-xl" />
                </div>
                <div>
                  <h4 className="border-l-2 border-transparent group-hover:border-purple-600 pl-0 group-hover:pl-3 font-bold text-gray-900 transition-all">All Bookings</h4>
                  <p className="text-xs font-medium text-gray-500 mt-1">{bookings.length} total bookings</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
