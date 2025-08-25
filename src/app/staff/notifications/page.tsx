'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/UserContext';
import { FaBell, FaEnvelope, FaWhatsapp, FaCheck, FaTrash, FaFilter, FaSearch, FaEye } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';
import Image from 'next/image';

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
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
    }
  }, [user, userLoading, fetchNotifications]);

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
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Image src="/logo.png" alt="KIMU Transport Logo" width={80} height={80} className="w-20 h-20 mx-auto mb-4 animate-pulse"/>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/staff/login');
    return null;
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || (filter === 'unread' ? !notification.read : notification.read);
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesSearch = 
      notification.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesType && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <FaEnvelope className="text-blue-600" />;
      case 'whatsapp': return <FaWhatsapp className="text-green-600" />;
      case 'system': return <FaBell className="text-purple-600" />;
      default: return <FaBell className="text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'whatsapp': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-2">
                Stay updated with all your system notifications and messages.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaBell className="text-2xl text-blue-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                  type="text"
                  placeholder="Search by type or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
                        <select
                value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
                <option value="system">System</option>
              </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Notifications ({filteredNotifications.length})
            </h2>
          </div>
          
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div key={notification.id} className={`p-6 transition-colors ${
                  notification.read ? 'bg-gray-50' : 'bg-white hover:bg-blue-50'
                }`}>
                  <div className="flex items-start space-x-4">
                    {/* Notification Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getTypeIcon(notification.type)}
            </div>
            </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                      <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`text-lg font-semibold ${
                              notification.read ? 'text-gray-700' : 'text-gray-900'
                            }`}>
                              {notification.type}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                          
                          <p className={`text-sm ${
                            notification.read ? 'text-gray-500' : 'text-gray-700'
                          } mb-3`}>
                          {notification.message}
                        </p>
                          
                          {/* Metadata */}
                          {notification.metadata && (
                            <div className="text-xs text-gray-400 space-y-1">
                              {notification.metadata.email && (
                                <p>Email: {notification.metadata.email}</p>
                              )}
                              {notification.metadata.phone && (
                                <p>Phone: {notification.metadata.phone}</p>
                              )}
                              {notification.metadata.vehicleId && (
                                <p>Vehicle ID: {notification.metadata.vehicleId}</p>
                              )}
                              {notification.metadata.bookingId && (
                                <p>Booking ID: {notification.metadata.bookingId}</p>
                              )}
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          title="Mark as read"
                        >
                          <FaCheck className="mr-2" />
                          Read
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        title="Delete notification"
                      >
                        <FaTrash className="mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaBell className="text-gray-400 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {searchTerm || filter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No notifications have been created yet.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 