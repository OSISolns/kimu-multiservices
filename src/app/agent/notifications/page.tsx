"use client"
import { useState, useEffect } from 'react';
import { FaBell, FaWhatsapp, FaFlask, FaEye, FaEyeSlash, FaTrash } from 'react-icons/fa';

interface Notification {
  id: number;
  userId: number | null;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === 'unread') params.append('read', 'false');
      if (filter === 'read') params.append('read', 'true');
      
      const response = await fetch(`/api/notifications?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAsUnread = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: false })
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const testNotification = async (type: 'booking' | 'urgent') => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type,
          message: type === 'urgent' ? 'This is a test urgent notification from the agent panel' : undefined
        })
      });
      
      const result = await response.json();
      setTestResult(result);
      if (result.success) {
        fetchNotifications(); // Refresh notifications after successful test
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to send test notification'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return '📋';
      case 'payment': return '💰';
      case 'system': return '⚙️';
      case 'maintenance': return '🔧';
      case 'inventory': return '🚗';
      case 'feedback': return '💬';
      case 'cancellation': return '❌';
      case 'weather': return '🌦️';
      case 'modification': return '✏️';
      case 'damage': return '⚠️';
      case 'review': return '⭐';
      case 'report': return '📊';
      case 'security': return '🔒';
      case 'return': return '🔄';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking': return 'bg-blue-100 text-blue-800';
      case 'payment': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'inventory': return 'bg-purple-100 text-purple-800';
      case 'feedback': return 'bg-cyan-100 text-cyan-800';
      case 'cancellation': return 'bg-red-100 text-red-800';
      case 'weather': return 'bg-yellow-100 text-yellow-800';
      case 'modification': return 'bg-indigo-100 text-indigo-800';
      case 'damage': return 'bg-red-100 text-red-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'report': return 'bg-blue-100 text-blue-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'return': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <FaBell className="text-3xl text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">Manage and test your notification system</p>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'read' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Read
              </button>
            </div>
            <button
              onClick={fetchNotifications}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* Notifications List */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Notification History</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <FaBell className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No notifications found</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-blue-50 border-blue-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getNotificationColor(notification.type)}`}>
                              {notification.type}
                            </span>
                            {!notification.read && (
                              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {notification.read ? (
                          <button
                            onClick={() => markAsUnread(notification.id)}
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Mark as unread"
                          >
                            <FaEyeSlash />
                          </button>
                        ) : (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                            title="Mark as read"
                          >
                            <FaEye />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete notification"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Test Notifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaWhatsapp className="text-green-600" />
                Test Booking Notification
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Send a test booking notification to verify your WhatsApp integration
              </p>
              <button
                onClick={() => testNotification('booking')}
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FaFlask className="text-sm" />
                {isLoading ? 'Sending...' : 'Test Booking Notification'}
              </button>
            </div>

            <div className="p-6 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaBell className="text-red-600" />
                Test Urgent Notification
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Send a test urgent notification to verify urgent alerts
              </p>
              <button
                onClick={() => testNotification('urgent')}
                disabled={isLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FaFlask className="text-sm" />
                {isLoading ? 'Sending...' : 'Test Urgent Notification'}
              </button>
            </div>
          </div>

          {testResult && (
            <div className={`mt-8 p-4 rounded-lg ${
              testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.success ? '✅ Success' : '❌ Error'}
              </h4>
              <p className={`text-sm ${
                testResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {testResult.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 