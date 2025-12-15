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
    FaFileAlt,
    FaChartLine,
    FaCog,
    FaSync,
    FaClipboardList,
} from "react-icons/fa";

type Booking = any;
type Payment = any;
type Notification = any;

export default function ManagerDashboardPage() {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [quotes, setQuotes] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    useEffect(() => {
        if (isLoading) return;

        if (!user || (user.role !== "manager" && user.role !== "admin")) {
            router.push("/staff/login");
            return;
        }

        let cancelled = false;
        async function load() {
            setLoading(true);
            setError('');
            try {
                const username = user?.username || "";
                const headers = { "x-username": username };

                const [bookingsRes, paymentsRes, notificationsRes, usersRes, vehiclesRes, quotesRes, leadsRes] = await Promise.allSettled([
                    fetch("/api/bookings", { headers }).then((r) => r.ok ? r.json() : { error: `Bookings API failed: ${r.status}`, data: [] }),
                    fetch("/api/payments", { headers }).then((r) => r.ok ? r.json() : { error: `Payments API failed: ${r.status}`, data: [] }),
                    fetch("/api/notifications", { headers }).then((r) => r.ok ? r.json() : { error: `Notifications API failed: ${r.status}`, data: [] }),
                    fetch("/api/users", { headers }).then((r) => r.ok ? r.json() : { error: `Users API failed: ${r.status}`, users: [] }),
                    fetch("/api/vehicles", { headers }).then((r) => r.ok ? r.json() : { error: `Vehicles API failed: ${r.status}`, data: [] }),
                    fetch("/api/quotes", { headers }).then((r) => r.ok ? r.json() : { error: `Quotes API failed: ${r.status}`, quotes: [] }),
                    fetch("/api/leads", { headers }).then((r) => r.ok ? r.json() : { error: `Leads API failed: ${r.status}`, leads: [] }),
                ]);

                if (cancelled) return;

                const extractData = (result: any, fallback: any = []) => {
                    if (result.status === 'fulfilled') {
                        return result.value;
                    } else {
                        console.warn('API call failed:', result.reason);
                        return fallback;
                    }
                };

                const bookingsData = extractData(bookingsRes, [])?.data || extractData(bookingsRes, [])?.bookings || extractData(bookingsRes, []) || [];
                const paymentsData = Array.isArray(extractData(paymentsRes, [])) ? extractData(paymentsRes, []) : [];
                const notificationsData = Array.isArray(extractData(notificationsRes, [])) ? extractData(notificationsRes, []) : [];
                const usersData = extractData(usersRes, {})?.users || [];
                const vehiclesData = Array.isArray(extractData(vehiclesRes, [])) ? extractData(vehiclesRes, []) : [];

                // Fix quotes data extraction: API returns { success: true, data: { quotes: [...] } }
                const quotesResult = extractData(quotesRes, {});
                const quotesData = quotesResult?.data?.quotes || quotesResult?.quotes || quotesResult?.data || (Array.isArray(quotesResult) ? quotesResult : []);

                const leadsData = extractData(leadsRes, {})?.leads || extractData(leadsRes, {})?.data || (Array.isArray(extractData(leadsRes, [])) ? extractData(leadsRes, []) : []);

                setBookings(bookingsData);
                setPayments(paymentsData);
                setNotifications(notificationsData);
                setUsers(usersData);
                setVehicles(vehiclesData);
                setQuotes(quotesData);
                setLeads(leadsData);
                setLastRefresh(new Date());
            } catch (err) {
                console.error('Manager dashboard error:', err);
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

    const availableVehicles = useMemo(
        () => Array.isArray(vehicles) ? vehicles.filter((v: any) => v.isAvailable && v.status === "available").length : 0,
        [vehicles]
    );

    const pendingBookings = useMemo(
        () => Array.isArray(bookings) ? bookings.filter((b: any) => b.status === "Pending" || b.status === "Active").length : 0,
        [bookings]
    );

    const totalQuotes = useMemo(
        () => Array.isArray(quotes) ? quotes.length : 0,
        [quotes]
    );

    const totalLeads = useMemo(
        () => Array.isArray(leads) ? leads.length : 0,
        [leads]
    );

    const refreshData = () => {
        setLastRefresh(new Date());
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

    if (!user || (user.role !== "manager" && user.role !== "admin")) {
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
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {user.fullName || user.username}</p>
                    <p className="text-xs text-gray-500 mt-1">Last updated: {lastRefresh.toLocaleString()}</p>
                </div>
                <button
                    onClick={refreshData}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <FaSync /> Refresh Data
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-stat group overflow-hidden relative p-6 bg-white rounded-2xl shadow">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-50"></div>
                    <div className="relative flex items-center gap-4">
                        <div className="p-3 bg-blue-500 rounded-xl shadow-lg"><FaUsers className="text-white text-xl" /></div>
                        <div>
                            <div className="text-sm font-medium text-gray-600">Total Staff</div>
                            <div className="text-3xl font-bold text-gray-900">{users.length}</div>
                            <div className="text-xs text-gray-500">Team Members</div>
                        </div>
                    </div>
                </div>

                <div className="glass-stat group overflow-hidden relative p-6 bg-white rounded-2xl shadow">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-50"></div>
                    <div className="relative flex items-center gap-4">
                        <div className="p-3 bg-green-500 rounded-xl shadow-lg"><FaMoneyBillWave className="text-white text-xl" /></div>
                        <div>
                            <div className="text-sm font-medium text-gray-600">Revenue</div>
                            <div className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()} RWF</div>
                            <div className="text-xs text-gray-500">Total Earnings</div>
                        </div>
                    </div>
                </div>

                <div className="glass-stat group overflow-hidden relative p-6 bg-white rounded-2xl shadow">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-50"></div>
                    <div className="relative flex items-center gap-4">
                        <div className="p-3 bg-purple-500 rounded-xl shadow-lg"><FaCalendarAlt className="text-white text-xl" /></div>
                        <div>
                            <div className="text-sm font-medium text-gray-600">Bookings</div>
                            <div className="text-3xl font-bold text-gray-900">{bookings.length}</div>
                            <div className="text-xs text-gray-500">{pendingBookings} Pending</div>
                        </div>
                    </div>
                </div>

                <div className="glass-stat group overflow-hidden relative p-6 bg-white rounded-2xl shadow">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-50"></div>
                    <div className="relative flex items-center gap-4">
                        <div className="p-3 bg-orange-500 rounded-xl shadow-lg"><FaCar className="text-white text-xl" /></div>
                        <div>
                            <div className="text-sm font-medium text-gray-600">Vehicles</div>
                            <div className="text-3xl font-bold text-gray-900">{availableVehicles}</div>
                            <div className="text-xs text-gray-500">Available Now</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow lg:col-span-2">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaCog className="text-blue-500" /> Management Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/staff/users" className="p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FaUsers />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Manage Staff</div>
                                    <div className="text-sm text-gray-500">View and manage team members</div>
                                </div>
                            </div>
                        </Link>

                        <Link href="/staff/vehicles" className="p-4 border border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                    <FaCar />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Fleet Management</div>
                                    <div className="text-sm text-gray-500">Track and manage vehicles</div>
                                </div>
                            </div>
                        </Link>

                        <Link href="/staff/bookings" className="p-4 border border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <FaCalendarAlt />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Bookings</div>
                                    <div className="text-sm text-gray-500">Manage reservations</div>
                                </div>
                            </div>
                        </Link>

                        <Link href="/staff/reports" className="p-4 border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <FaFileAlt />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Reports</div>
                                    <div className="text-sm text-gray-500">View business analytics</div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaBell className="text-yellow-500" /> Recent Notifications</h3>
                    {notifications.length === 0 ? (
                        <div className="text-gray-500 text-sm text-center py-8">No new notifications</div>
                    ) : (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                            {notifications.slice(0, 5).map((n: any) => (
                                <div key={n.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="w-2 h-2 rounded-full mt-2 bg-blue-500 flex-shrink-0"></div>
                                    <div>
                                        <div className="text-sm text-gray-800 font-medium">{n.message}</div>
                                        <div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2"><FaCalendarAlt className="text-blue-500" /> Recent Bookings</h3>
                        <Link href="/staff/bookings" className="text-sm text-blue-600 hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b">
                                    <th className="pb-2">Client</th>
                                    <th className="pb-2">Type</th>
                                    <th className="pb-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {bookings.slice(0, 5).map((b: any) => (
                                    <tr key={b.id}>
                                        <td className="py-3">{b.name || b.guestName || "-"}</td>
                                        <td className="py-3">{b.type}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${b.status === 'Completed' ? 'bg-green-100 text-green-800' :
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
                </div>

                <div className="bg-white rounded-2xl p-6 shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2"><FaChartLine className="text-purple-500" /> Recent Leads</h3>
                        <Link href="/staff/sales-dashboard" className="text-sm text-blue-600 hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b">
                                    <th className="pb-2">Name</th>
                                    <th className="pb-2">Stage</th>
                                    <th className="pb-2">Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {leads.slice(0, 5).map((l: any) => (
                                    <tr key={l.id}>
                                        <td className="py-3">{l.name}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${l.stage === 'Closed' ? 'bg-green-100 text-green-800' :
                                                'bg-blue-100 text-blue-800'
                                                }`}>
                                                {l.stage}
                                            </span>
                                        </td>
                                        <td className="py-3">{l.value?.toLocaleString()} RWF</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
