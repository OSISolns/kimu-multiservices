"use client"
import { useState, useEffect } from 'react';
import { FaBell, FaWhatsapp, FaFlask, FaEye, FaEyeSlash, FaTrash, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { useUser } from '../../UserContext';
import { useRouter } from 'next/navigation';
import StaffSidebar from '../../../components/StaffSidebar';

interface Notification {
  id: number;
  userId: number | null;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [modalNotification, setModalNotification] = useState<Notification | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === 'unread') params.append('read', 'false');
      if (filter === 'read') params.append('read', 'true');
      if (typeFilter !== 'all') params.append('type', typeFilter);
      const response = await fetch(`/api/notifications?${params.toString()}`, {
        headers: {
          'x-username': user?.username || '',
        },
      });
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
    if (!isLoading && !user) {
      router.push('/staff/login');
    } else if (!isLoading && user) {
      fetchNotifications();
    }
  }, [user, isLoading, router, filter, typeFilter]);

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-username': user?.username || '',
        },
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
        headers: { 
          'Content-Type': 'application/json',
          'x-username': user?.username || '',
        },
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
        method: 'DELETE',
        headers: {
          'x-username': user?.username || '',
        },
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    await Promise.all(unreadIds.map(id => fetch(`/api/notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-username': user?.username || '' },
      body: JSON.stringify({ read: true })
    })));
    fetchNotifications();
  };

  const filteredNotifications = notifications.filter(n =>
    n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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

  // Open modal and mark as read if unread
  const openModal = async (notification: Notification) => {
    setModalNotification(notification);
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };
  const closeModal = () => setModalNotification(null);

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    router.push('/staff/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <StaffSidebar />
      <main className="flex-1 max-w-full mx-auto p-8 flex flex-col gap-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <FaBell className="text-3xl text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">View and manage your notifications</p>
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
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="booking">Booking</option>
                <option value="payment">Payment</option>
                <option value="system">System</option>
                <option value="maintenance">Maintenance</option>
                <option value="inventory">Inventory</option>
                <option value="feedback">Feedback</option>
                <option value="cancellation">Cancellation</option>
                <option value="weather">Weather</option>
                <option value="modification">Modification</option>
                <option value="damage">Damage</option>
                <option value="review">Review</option>
                <option value="report">Report</option>
                <option value="security">Security</option>
                <option value="return">Return</option>
              </select>
            <button
              onClick={fetchNotifications}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Refresh
            </button>
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={notifications.every(n => n.read)}
              >
                Mark All as Read
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
              ) : paginatedNotifications.length === 0 ? (
              <div className="text-center py-8">
                <FaBell className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No notifications found</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                  {paginatedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                      className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-blue-50 border-blue-200 shadow-sm'
                    }`}
                      onClick={() => openModal(notification)}
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
                              onClick={e => { e.stopPropagation(); markAsUnread(notification.id); }}
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Mark as unread"
                          >
                            <FaEyeSlash />
                          </button>
                        ) : (
                          <button
                              onClick={e => { e.stopPropagation(); markAsRead(notification.id); }}
                            className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                            title="Mark as read"
                          >
                            <FaEye />
                          </button>
                        )}
                        <button
                            onClick={e => { e.stopPropagation(); deleteNotification(notification.id); }}
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

            {/* Modal for notification details */}
            {modalNotification && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={closeModal}>
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full relative animate-scale-in" onClick={e => e.stopPropagation()}>
                  <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl" onClick={closeModal}>
                    <FaTimes />
                  </button>
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    {getNotificationIcon(modalNotification.type)}
                    {modalNotification.type.charAt(0).toUpperCase() + modalNotification.type.slice(1)} Notification
                  </h2>
                  <p className="text-gray-700 mb-4">{modalNotification.message}</p>
                  <div className="text-sm text-gray-500 mb-2">Created: {new Date(modalNotification.createdAt).toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mb-2">Status: {modalNotification.read ? 'Read' : 'Unread'}</div>
                  {modalNotification.userId && (
                    <div className="text-sm text-gray-500 mb-2">User ID: {modalNotification.userId}</div>
                  )}
                  <button onClick={closeModal} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full">Close</button>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-4">
              <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  <FaChevronLeft />
              </button>
                <span className="font-semibold">Page {page} of {totalPages}</span>
              <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  <FaChevronRight />
              </button>
            </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 