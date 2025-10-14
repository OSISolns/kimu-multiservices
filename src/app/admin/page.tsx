"use client";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "../UserContext";
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
  FaRefresh,
} from "react-icons/fa";

type Booking = any;
type Payment = any;
type Notification = any;

export default function AdminDashboardPage() {
  const { user, isLoading } = useUser();
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
    if (!user || user.role !== "admin") return;

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const username = user?.username || "";
        console.log('Admin dashboard loading data for user:', username);
        
        const [bookingsRes, paymentsRes, notificationsRes, usersRes, vehiclesRes, quotesRes, leadsRes, systemLogsRes, activityLogsRes] = await Promise.all([
          fetch("/api/bookings").then((r) => {
            console.log('Bookings API status:', r.status);
            return r.ok ? r.json() : Promise.reject(`Bookings API failed: ${r.status}`);
          }),
          fetch("/api/payments").then((r) => {
            console.log('Payments API status:', r.status);
            return r.ok ? r.json() : Promise.reject(`Payments API failed: ${r.status}`);
          }),
          fetch("/api/notifications").then((r) => {
            console.log('Notifications API status:', r.status);
            return r.ok ? r.json() : Promise.reject(`Notifications API failed: ${r.status}`);
          }),
          fetch("/api/users", { headers: { "x-username": username } }).then((r) => {
            console.log('Users API status:', r.status);
            return r.ok ? r.json() : Promise.reject(`Users API failed: ${r.status}`);
          }),
          fetch("/api/vehicles").then((r) => {
            console.log('Vehicles API status:', r.status);
            return r.ok ? r.json() : Promise.reject(`Vehicles API failed: ${r.status}`);
          }),
          fetch("/api/quotes").then((r) => {
            console.log('Quotes API status:', r.status);
            return r.ok ? r.json() : Promise.reject(`Quotes API failed: ${r.status}`);
          }),
          fetch("/api/leads").then((r) => {
            console.log('Leads API status:', r.status);
            return r.ok ? r.json() : Promise.reject(`Leads API failed: ${r.status}`);
          }),
          fetch("/api/system-logs").then((r) => {
            console.log('System Logs API status:', r.status);
            return r.ok ? r.json() : Promise.reject(`System Logs API failed: ${r.status}`);
          }),
          fetch("/api/activity-log").then((r) => {
            console.log('Activity Logs API status:', r.status);
            return r.ok ? r.json() : Promise.reject(`Activity Logs API failed: ${r.status}`);
          }),
        ]);
        
        if (cancelled) return;
        
        console.log('API Responses:', { bookingsRes, paymentsRes, notificationsRes, usersRes });
        
        // Handle different response structures
        const bookingsData = bookingsRes?.data || bookingsRes?.bookings || bookingsRes || [];
        const paymentsData = Array.isArray(paymentsRes) ? paymentsRes : [];
        const notificationsData = Array.isArray(notificationsRes) ? notificationsRes : [];
        const usersData = usersRes?.users || [];
        const vehiclesData = Array.isArray(vehiclesRes) ? vehiclesRes : [];
        const quotesData = quotesRes?.quotes || quotesRes?.data || (Array.isArray(quotesRes) ? quotesRes : []);
        const leadsData = leadsRes?.leads || leadsRes?.data || (Array.isArray(leadsRes) ? leadsRes : []);
        const systemLogsData = Array.isArray(systemLogsRes) ? systemLogsRes : [];
        const activityLogsData = Array.isArray(activityLogsRes) ? activityLogsRes : [];
        
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
        console.error('Admin dashboard error:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isLoading, user]);

  const totalRevenue = useMemo(
    () => payments.filter((x) => x.status === "completed").reduce((s, x) => s + (x.amount || 0), 0),
    [payments]
  );

  const activeRentals = useMemo(
    () => (bookings || []).filter((b: any) => b.type === "Car Rental" && !b.returnConfirmed).length,
    [bookings]
  );

  const availableVehicles = useMemo(
    () => vehicles.filter((v: any) => v.isAvailable && v.status === "available").length,
    [vehicles]
  );

  const pendingBookings = useMemo(
    () => bookings.filter((b: any) => b.status === "Pending" || b.status === "Active").length,
    [bookings]
  );

  const completedBookings = useMemo(
    () => bookings.filter((b: any) => b.status === "Completed").length,
    [bookings]
  );

  const totalQuotes = useMemo(
    () => quotes.length,
    [quotes]
  );

  const pendingQuotes = useMemo(
    () => quotes.filter((q: any) => q.status === "draft" || q.status === "sent").length,
    [quotes]
  );

  const acceptedQuotes = useMemo(
    () => quotes.filter((q: any) => q.status === "accepted").length,
    [quotes]
  );

  const totalLeads = useMemo(
    () => leads.length,
    [leads]
  );

  const activeLeads = useMemo(
    () => leads.filter((l: any) => l.stage !== "Closed").length,
    [leads]
  );

  const recentActivity = useMemo(
    () => activityLogs.slice(0, 10).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [activityLogs]
  );

  const systemHealth = useMemo(() => {
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
          <p className="text-gray-600">Loading admin dashboard...</p>
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
    <div className="space-y-8">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Last updated: {lastRefresh.toLocaleString()}</p>
        </div>
        <button
          onClick={refreshData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FaRefresh /> Refresh Data
        </button>
      </div>

      {/* Enhanced stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full"><FaUsers className="text-blue-600" /></div>
          <div>
            <div className="text-sm text-gray-500">Total Users</div>
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-xs text-gray-400">Active: {users.filter((u: any) => u.status === 'active').length}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full"><FaMoneyBillWave className="text-green-600" /></div>
          <div>
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} RWF</div>
            <div className="text-xs text-gray-400">Completed: {payments.filter((p: any) => p.status === 'completed').length}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-full"><FaCalendarAlt className="text-purple-600" /></div>
          <div>
            <div className="text-sm text-gray-500">Total Bookings</div>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <div className="text-xs text-gray-400">Pending: {pendingBookings}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-full"><FaCar className="text-orange-600" /></div>
          <div>
            <div className="text-sm text-gray-500">Available Vehicles</div>
            <div className="text-2xl font-bold">{availableVehicles}</div>
            <div className="text-xs text-gray-400">Total: {vehicles.length}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-full"><FaFileAlt className="text-indigo-600" /></div>
          <div>
            <div className="text-sm text-gray-500">Total Quotes</div>
            <div className="text-2xl font-bold">{totalQuotes}</div>
            <div className="text-xs text-gray-400">Pending: {pendingQuotes}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow flex items-center gap-4">
          <div className="p-3 bg-pink-100 rounded-full"><FaChartLine className="text-pink-600" /></div>
          <div>
            <div className="text-sm text-gray-500">Total Leads</div>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <div className="text-xs text-gray-400">Active: {activeLeads}</div>
          </div>
        </div>
      </div>

      {/* System Health and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaShieldAlt className={`text-${systemHealth.status === 'healthy' ? 'green' : systemHealth.status === 'warning' ? 'yellow' : 'red'}-500`} />
            System Health
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Overall Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                systemHealth.status === 'healthy' ? 'bg-green-100 text-green-800' :
                systemHealth.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {systemHealth.status.toUpperCase()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  systemHealth.status === 'healthy' ? 'bg-green-500' :
                  systemHealth.status === 'warning' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${systemHealth.percentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">{systemHealth.percentage}% operational</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaCog className="text-blue-500" /> Quick Actions</h3>
          <div className="space-y-2">
            <a href="/staff/users" className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <FaUsers /> Manage Users
            </a>
            <a href="/staff/vehicles" className="block w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <FaCar /> Manage Vehicles
            </a>
            <a href="/staff/bookings" className="block w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
              <FaCalendarAlt /> View Bookings
            </a>
          </div>
        </div>

        {/* Booking Types Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaChartLine className="text-indigo-500" /> Booking Types</h3>
          <div className="space-y-2">
            {Object.entries(bookingTypes).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{type}</span>
                <span className="font-bold">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity and System Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaClock className="text-blue-500" /> Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <div className="text-gray-500 text-sm">No recent activity</div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                  <div className="w-2 h-2 rounded-full mt-2 bg-blue-500"></div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-800">{activity.action}</div>
                    <div className="text-xs text-gray-500">{activity.details}</div>
                    <div className="text-xs text-gray-400">{new Date(activity.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaExclamationTriangle className="text-orange-500" /> System Alerts</h3>
          {systemLogs.length === 0 ? (
            <div className="text-gray-500 text-sm">No system alerts</div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {systemLogs.slice(0, 5).map((log: any) => (
                <div key={log.id} className={`p-3 rounded-lg ${
                  log.action.includes('error') ? 'bg-red-50 border-l-4 border-red-400' :
                  log.action.includes('warning') ? 'bg-yellow-50 border-l-4 border-yellow-400' :
                  'bg-green-50 border-l-4 border-green-400'
                }`}>
                  <div className="text-sm font-medium">{log.action}</div>
                  <div className="text-xs text-gray-600 mt-1">{log.details}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(log.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Notifications and Latest Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaBell className="text-blue-500" /> Recent Notifications</h3>
          {notifications.length === 0 ? (
            <div className="text-gray-500 text-sm">No notifications</div>
          ) : (
            <ul className="space-y-3 max-h-64 overflow-y-auto">
              {notifications.slice(0, 6).map((n: any) => (
                <li key={n.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                  <span className="w-2 h-2 rounded-full mt-2 bg-blue-500"></span>
                  <div className="flex-1">
                    <div className="text-sm text-gray-800">{n.message}</div>
                    <div className="text-xs text-gray-500">{n.type}</div>
                    <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaCalendarAlt className="text-green-600" /> Latest Bookings</h3>
          {bookings.length === 0 ? (
            <div className="text-gray-500 text-sm">No bookings</div>
          ) : (
            <div className="overflow-x-auto max-h-64">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="text-gray-500 text-left">
                    <th className="py-2 px-4">Type</th>
                    <th className="py-2 px-4">Client</th>
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 8).map((b: any) => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          b.type === 'Car Rental' ? 'bg-blue-100 text-blue-800' :
                          b.type === 'Airport Transfer' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {b.type}
                        </span>
                      </td>
                      <td className="py-2 px-4">{b.name || b.guestName || "-"}</td>
                      <td className="py-2 px-4">{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          b.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          b.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {b.status || (b.returnConfirmed ? "Completed" : "Pending")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Quotes and Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaFileAlt className="text-indigo-500" /> Recent Quotes</h3>
          {quotes.length === 0 ? (
            <div className="text-gray-500 text-sm">No quotes available</div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {quotes.slice(0, 6).map((quote: any) => (
                <div key={quote.id} className="p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{quote.customer?.name || 'Unknown Customer'}</div>
                      <div className="text-xs text-gray-500">{quote.serviceType}</div>
                      <div className="text-xs text-gray-400">{quote.customer?.company || ''}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">{quote.amount?.toLocaleString()} {quote.currency || 'RWF'}</div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        quote.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {quote.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaChartLine className="text-pink-500" /> Recent Leads</h3>
          {leads.length === 0 ? (
            <div className="text-gray-500 text-sm">No leads available</div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {leads.slice(0, 6).map((lead: any) => (
                <div key={lead.id} className="p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{lead.name}</div>
                      <div className="text-xs text-gray-500">{lead.company}</div>
                      <div className="text-xs text-gray-400">{lead.email || lead.contact || ''}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">{lead.value?.toLocaleString()} RWF</div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        lead.stage === 'Contacted' ? 'bg-blue-100 text-blue-800' :
                        lead.stage === 'Qualified' ? 'bg-green-100 text-green-800' :
                        lead.stage === 'Proposal' ? 'bg-yellow-100 text-yellow-800' :
                        lead.stage === 'Closed' ? 'bg-gray-100 text-gray-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {lead.stage}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Last contact: {new Date(lead.lastContact).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Advanced Management Tools */}
      <div className="bg-white rounded-2xl p-6 shadow">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><FaDatabase className="text-gray-600" /> Advanced Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <a href="/admin/system-logs" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <FaDatabase className="text-gray-600" />
              <div>
                <div className="font-medium">System Logs</div>
                <div className="text-sm text-gray-500">{systemLogs.length} entries</div>
              </div>
            </div>
          </a>
          <a href="/staff/reports" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <FaFileAlt className="text-gray-600" />
              <div>
                <div className="font-medium">Reports</div>
                <div className="text-sm text-gray-500">Analytics & Reports</div>
              </div>
            </div>
          </a>
          <a href="/staff/vehicles" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <FaCar className="text-gray-600" />
              <div>
                <div className="font-medium">Vehicle Management</div>
                <div className="text-sm text-gray-500">{vehicles.length} vehicles</div>
              </div>
            </div>
          </a>
          <a href="/staff/users" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <FaUsers className="text-gray-600" />
              <div>
                <div className="font-medium">User Management</div>
                <div className="text-sm text-gray-500">{users.length} users</div>
              </div>
            </div>
          </a>
          <a href="/staff/sales-management" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <FaFileAlt className="text-indigo-600" />
              <div>
                <div className="font-medium">Quotes & Leads</div>
                <div className="text-sm text-gray-500">{quotes.length} quotes, {leads.length} leads</div>
              </div>
            </div>
          </a>
          <a href="/staff/bookings" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-purple-600" />
              <div>
                <div className="font-medium">Bookings</div>
                <div className="text-sm text-gray-500">{bookings.length} total</div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}


