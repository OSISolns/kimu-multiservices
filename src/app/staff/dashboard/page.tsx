"use client"

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/UserContext';
import { FaCar, FaCalendarAlt, FaBell, FaUsers, FaChartLine, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Booking {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  returnDate: string;
  vehicleId: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
}

interface Notification {
  id: number;
  userId: number | null;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function StaffDashboard() {
  const { user, isLoading: userLoading, resetInactivityTimer } = useUser();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    unreadNotifications: 0
  });

  const fetchBookings = useCallback(async () => {
    if (!user?.username) return;
    
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
        
        // Calculate stats
        const total = data.bookings?.length || 0;
        const pending = data.bookings?.filter((b: Booking) => b.status === 'pending').length || 0;
        const completed = data.bookings?.filter((b: Booking) => b.status === 'completed').length || 0;
        const revenue = data.bookings?.reduce((sum: number, b: Booking) => sum + (b.totalAmount || 0), 0) || 0;
        
        setStats({
          totalBookings: total,
          pendingBookings: pending,
          completedBookings: completed,
          totalRevenue: revenue,
          unreadNotifications: stats.unreadNotifications
        });
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  }, [user?.username, stats.unreadNotifications]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/notifications?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data || []);
        
        // Update unread count
        const unread = data?.filter((n: Notification) => !n.read).length || 0;
        setStats(prev => ({ ...prev, unreadNotifications: unread }));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user && !userLoading) {
      fetchBookings();
      fetchNotifications();
      setLoading(false);
    }
  }, [user, userLoading, fetchBookings, fetchNotifications]);

  // Reset inactivity timer on user activity
  useEffect(() => {
    const handleActivity = () => {
      if (user) {
        resetInactivityTimer();
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, resetInactivityTimer]);

  if (userLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    router.push('/staff/login');
    return null;
  }

  const recentBookings = bookings.slice(0, 5);
  const recentNotifications = notifications.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.fullName || user.username}!
              </h1>
          <p className="text-gray-600 mt-2">
            Here&apos;s what&apos;s happening with your transport services today.
          </p>
      </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaCar className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaChartLine className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">RWF {stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaBell className="text-red-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Notifications</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.unreadNotifications}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                <button
                  onClick={() => router.push('/staff/bookings')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </button>
              </div>
                              </div>
            <div className="p-6">
              {recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <FaMapMarkerAlt className="text-gray-400" />
                            <div>
                            <p className="font-medium text-gray-900">{booking.customerName}</p>
                            <p className="text-sm text-gray-500">
                              {booking.pickupLocation} → {booking.dropoffLocation}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(booking.pickupDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          RWF {booking.totalAmount?.toLocaleString()}
                        </p>
                      </div>
                          </div>
                    ))}
              </div>
              ) : (
                <div className="text-center py-8">
                  <FaCalendarAlt className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-500">No bookings yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
                <button
                  onClick={() => router.push('/staff/notifications')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentNotifications.length > 0 ? (
                <div className="space-y-4">
                  {recentNotifications.map((notification) => (
                    <div key={notification.id} className={`p-4 border rounded-lg ${
                      notification.read ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <FaBell className={`mt-1 ${notification.read ? 'text-gray-400' : 'text-blue-500'}`} />
                        <div className="flex-1">
                          <p className={`font-medium ${notification.read ? 'text-gray-700' : 'text-blue-900'}`}>
                            {notification.type}
                          </p>
                          <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-blue-700'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaBell className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-500">No notifications</p>
                </div>
              )}
          </div>
        </div>
      </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
              onClick={() => router.push('/staff/bookings')}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
              <FaCalendarAlt className="text-blue-600 text-xl mr-3" />
              <span className="font-medium">Manage Bookings</span>
              </button>
            
              <button
              onClick={() => router.push('/staff/vehicles')}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
              <FaCar className="text-green-600 text-xl mr-3" />
              <span className="font-medium">View Vehicles</span>
              </button>
            
              <button
              onClick={() => router.push('/staff/users')}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaUsers className="text-purple-600 text-xl mr-3" />
              <span className="font-medium">User Management</span>
              </button>
            </div>
          </div>
        </div>
    </div>
  );
} 