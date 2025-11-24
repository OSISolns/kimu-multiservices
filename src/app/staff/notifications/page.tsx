'use client';

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/UserContext';
import {
  FaBell,
  FaEnvelope,
  FaWhatsapp,
  FaCheck,
  FaTrash,
  FaFilter,
  FaSearch,
  FaEye,
  FaCheckDouble,
  FaInfoCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaCalendarCheck
} from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Notification {
  id: number;
  userId: number | null;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    email?: string;
    phone?: string;
    vehicleId?: number;
    bookingId?: number;
  };
}

export default function NotificationsPage() {
  const { user, isLoading: userLoading, resetInactivityTimer } = useUser();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/notifications?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user && !userLoading) {
      fetchNotifications();
    } else if (!userLoading && !user) {
      router.push('/staff/login');
    }
  }, [user, userLoading, fetchNotifications, router]);

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

  const markAsRead = async (notificationId: number) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      });

      if (!response.ok) {
        // Revert on failure
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id || isMarkingAll) return;

    setIsMarkingAll(true);
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));

      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      fetchNotifications();
    } finally {
      setIsMarkingAll(false);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    if (!user?.username) return;

    try {
      // Optimistic update
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'x-username': user.username // Required by the API
        }
      });

      if (!response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      fetchNotifications();
    }
  };

  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'info': return <FaInfoCircle className="text-blue-500" />;
      case 'warning': return <FaExclamationTriangle className="text-yellow-500" />;
      case 'error': return <FaExclamationCircle className="text-red-500" />;
      case 'success': return <FaCheck className="text-green-500" />;
      case 'booking': return <FaCalendarCheck className="text-purple-500" />;
      default: return <FaBell className="text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || (filter === 'unread' && !notification.read);
    const matchesType = typeFilter === 'all' || notification.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesSearch = notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesType && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (userLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 bg-[url('/subtle-prism.svg')] bg-cover bg-fixed">
      {/* Header with Glassmorphism */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
                  <FaBell className="text-white text-xl" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h1>
                <p className="text-xs text-gray-500 font-medium">Stay updated with latest activities</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm text-sm font-medium"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/50 mb-6 sticky top-24 z-20">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread Only</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hidden sm:block"
              >
                <option value="all">All Types</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="booking">Booking</option>
              </select>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={isMarkingAll}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium whitespace-nowrap"
              >
                {isMarkingAll ? <LoadingSpinner size="sm" inline /> : <FaCheckDouble />}
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`group relative bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${notification.read
                    ? 'border-white/50 bg-opacity-60'
                    : 'border-blue-200 bg-blue-50/30'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-full ${notification.read ? 'bg-gray-100' : 'bg-white shadow-sm'
                    }`}>
                    {getIconForType(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${notification.type === 'error' ? 'bg-red-100 text-red-700' :
                          notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            notification.type === 'booking' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-600'
                        }`}>
                        {notification.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <FaCheck className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete notification"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white/50 rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBell className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No notifications found</h3>
              <p className="text-gray-500 mt-1">
                {searchTerm || filter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'You are all caught up!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}