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
} from "react-icons/fa";

type Booking = any;
type Payment = any;
type Notification = any;

export default function AdminDashboardPage() {
  const { user, isLoading } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

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
        
        const [bookingsRes, paymentsRes, notificationsRes, usersRes] = await Promise.all([
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
        ]);
        
        if (cancelled) return;
        
        console.log('API Responses:', { bookingsRes, paymentsRes, notificationsRes, usersRes });
        
        // Handle different response structures
        const bookingsData = bookingsRes?.data || bookingsRes?.bookings || bookingsRes || [];
        const paymentsData = Array.isArray(paymentsRes) ? paymentsRes : [];
        const notificationsData = Array.isArray(notificationsRes) ? notificationsRes : [];
        const usersData = usersRes?.users || [];
        
        console.log('Parsed data:', { 
          bookings: bookingsData.length, 
          payments: paymentsData.length, 
          notifications: notificationsData.length, 
          users: usersData.length 
        });
        
        setBookings(bookingsData);
        setPayments(paymentsData);
        setNotifications(notificationsData);
        setUsersCount(usersData.length);
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
      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full"><FaUsers className="text-blue-600" /></div>
          <div>
            <div className="text-sm text-gray-500">Users</div>
            <div className="text-2xl font-bold">{usersCount}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full"><FaMoneyBillWave className="text-green-600" /></div>
          <div>
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} RWF</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-full"><FaCalendarAlt className="text-purple-600" /></div>
          <div>
            <div className="text-sm text-gray-500">Bookings</div>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-full"><FaCar className="text-orange-600" /></div>
          <div>
            <div className="text-sm text-gray-500">Active Rentals</div>
            <div className="text-2xl font-bold">{activeRentals}</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/staff/users" className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center">
          <FaUsers /> Manage Users
        </a>
        <a href="/admin/system-logs" className="bg-gray-800 text-white px-4 py-3 rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 justify-center">
          <FaDatabase /> View System Logs
        </a>
        <a href="/staff/reports" className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 justify-center">
          <FaFileAlt /> Reports
        </a>
      </div>

      {/* Recent notifications and latest bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaBell className="text-blue-500" /> Recent Notifications</h3>
          {notifications.length === 0 ? (
            <div className="text-gray-500 text-sm">No notifications</div>
          ) : (
            <ul className="space-y-3">
              {notifications.slice(0, 6).map((n: any) => (
                <li key={n.id} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full mt-2 bg-blue-500"></span>
                  <div>
                    <div className="text-sm text-gray-800">{n.message}</div>
                    <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
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
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-left">
                    <th className="py-2 px-4">Type</th>
                    <th className="py-2 px-4">Client</th>
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 8).map((b: any) => (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="py-2 px-4">{b.type}</td>
                      <td className="py-2 px-4">{b.name || b.guestName || "-"}</td>
                      <td className="py-2 px-4">{new Date(b.createdAt).toLocaleString()}</td>
                      <td className="py-2 px-4">{b.status || (b.returnConfirmed ? "Completed" : "Pending")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Revenue by method */}
      <div className="bg-white rounded-2xl p-6 shadow">
        <h3 className="text-lg font-bold mb-4">Payments Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: "MTN Momo", label: "MTN Momo" },
            { key: "Equity Bank", label: "Equity Bank" },
            { key: "BK Bank", label: "BK Bank" },
          ].map((m) => {
            const total = payments
              .filter((p: any) => p.paymentMethod === m.key && p.status === "completed")
              .reduce((s: number, x: any) => s + (x.amount || 0), 0);
            return (
              <div key={m.key} className="rounded-xl border p-4">
                <div className="text-sm text-gray-500">{m.label}</div>
                <div className="text-2xl font-bold">{total.toLocaleString()} RWF</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


