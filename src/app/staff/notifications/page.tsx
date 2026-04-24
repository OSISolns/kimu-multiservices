'use client';

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/UserContext';
import {
  FaBell, FaEnvelope, FaWhatsapp, FaCheck, FaTrash,
  FaFilter, FaSearch, FaEye, FaCheckDouble, FaInfoCircle,
  FaExclamationTriangle, FaExclamationCircle, FaCalendarCheck,
  FaClock, FaShare, FaTasks, FaChartBar
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
  const [activeTab, setActiveTab] = useState('All');
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
    if (user && !userLoading) fetchNotifications();
    else if (!userLoading && !user) router.push('/staff/login');
  }, [user, userLoading, fetchNotifications, router]);

  const markAsRead = async (notificationId: number) => {
    try {
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id || isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    if (!user?.username) return;
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'x-username': user.username }
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesFilter = filter === 'all' || (filter === 'unread' && !notification.read);
      const matchesTab = activeTab === 'All' || 
                         (activeTab === 'Alerts' && ['error', 'warning'].includes(notification.type.toLowerCase())) ||
                         (activeTab === 'Bookings' && notification.type.toLowerCase() === 'booking') ||
                         (activeTab === 'System' && notification.type.toLowerCase() === 'info');
      const matchesSearch = notification.message.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesTab && matchesSearch;
    });
  }, [notifications, filter, activeTab, searchTerm]);

  // Group by Time
  const groupedNotifications = useMemo(() => {
    const today = new Date();
    const groups: { [key: string]: Notification[] } = {
      'Today': [],
      'Yesterday': [],
      'Older': []
    };

    filteredNotifications.forEach(n => {
      const date = new Date(n.createdAt);
      if (date.toDateString() === today.toDateString()) {
        groups['Today'].push(n);
      } else {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) groups['Yesterday'].push(n);
        else groups['Older'].push(n);
      }
    });
    return groups;
  }, [filteredNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.type.toLowerCase() === 'error' && !n.read).length;

  if (userLoading || loading) return <LoadingSpinner />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 bg-[url('/subtle-prism.svg')] bg-cover bg-fixed pb-12">
      
      {/* Dynamic Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/30">
                  <FaBell className="text-white text-2xl" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Alert Command Center</h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live System Notifications</p>
                  {criticalCount > 0 && (
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <FaExclamationCircle /> {criticalCount} Critical
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={isMarkingAll}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors text-xs font-black uppercase tracking-wider shadow-sm"
                >
                  {isMarkingAll ? <LoadingSpinner size="sm" inline /> : <FaCheckDouble />} Mark All Read
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* MAIN ALERTS FEED */}
          <div className="lg:col-span-3 space-y-6">
            {/* Advanced Controls */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-2 shadow-xl shadow-gray-200/50 border border-white/60 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-28 z-20">
              
              <div className="flex gap-1 p-1 bg-gray-50 rounded-2xl w-full md:w-auto overflow-x-auto custom-scrollbar">
                {['All', 'Alerts', 'Bookings', 'System'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white shadow-md text-blue-600 border border-gray-100' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto px-2">
                <div className="relative flex-1 md:w-64">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search inside alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                >
                  <option value="all">All States</option>
                  <option value="unread">Unread Only</option>
                </select>
              </div>
            </div>

            {/* Clustered Notification List */}
            {['Today', 'Yesterday', 'Older'].map((group) => {
              if (groupedNotifications[group].length === 0) return null;
              return (
                <div key={group} className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                    {group === 'Today' ? <FaClock className="text-blue-400" /> : <FaCalendarCheck className="text-gray-300" />} 
                    {group}
                  </h3>
                  <div className="space-y-3">
                    {groupedNotifications[group].map((notification) => (
                      <NotificationCard 
                        key={notification.id} 
                        notification={notification} 
                        onRead={() => markAsRead(notification.id)}
                        onDelete={() => deleteNotification(notification.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-20 bg-white/60 backdrop-blur-md rounded-3xl border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-50">
                  <FaBell className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-black text-gray-400 uppercase tracking-tight">Zero Activity Detected</h3>
                <p className="text-gray-400 mt-2 text-sm font-bold">Try adjusting filters or check back later.</p>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR ANALYTICS */}
          <div className="space-y-6">
             <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-white/60">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <FaChartBar className="text-indigo-500" /> Alert Diagnostics
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                      <span>Total Unread Volume</span>
                      <span>{unreadCount} / {notifications.length}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${notifications.length > 0 ? (unreadCount / notifications.length) * 100 : 0}%` }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                    <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 text-center">
                       <span className="block text-2xl font-black text-rose-600">{criticalCount}</span>
                       <span className="block text-[10px] font-black tracking-wider uppercase text-rose-400 mt-1">Errors Requires Action</span>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center">
                       <span className="block text-2xl font-black text-blue-600">{notifications.filter(n => n.type === 'booking' && !n.read).length}</span>
                       <span className="block text-[10px] font-black tracking-wider uppercase text-blue-400 mt-1">New Deal Alerts</span>
                    </div>
                  </div>
                </div>
             </div>

             {/* Quick Links */}
             <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 shadow-xl shadow-blue-500/30 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <h3 className="text-xl font-black tracking-tight mb-2">Need to escalate?</h3>
                <p className="text-sm text-blue-100 mb-6">Forward critical unresolved items directly to management or dispatch support.</p>
                <button onClick={() => alert("Forwarding Protocol Initiated")} className="w-full bg-white text-indigo-600 font-black uppercase tracking-wider py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all text-xs flex items-center justify-center gap-2">
                  <FaShare /> Contact Admin Dispatch
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Subcomponent for richer individual Notifications
function NotificationCard({ notification, onRead, onDelete }: { notification: Notification, onRead: () => void, onDelete: () => void }) {
  const isRead = notification.read;
  const t = notification.type.toLowerCase();

  const styling = {
    info: { bg: "bg-blue-50/50", border: "border-blue-200", iconBg: "bg-blue-500", icon: <FaInfoCircle className="text-white box-content p-2" /> },
    warning: { bg: "bg-amber-50/50", border: "border-amber-300", iconBg: "bg-amber-500", icon: <FaExclamationTriangle className="text-white box-content p-2" /> },
    error: { bg: "bg-rose-50/50", border: "border-rose-300", iconBg: "bg-rose-500", icon: <FaExclamationCircle className="text-white box-content p-2" /> },
    success: { bg: "bg-emerald-50/50", border: "border-emerald-200", iconBg: "bg-emerald-500", icon: <FaCheck className="text-white box-content p-2" /> },
    booking: { bg: "bg-purple-50/50", border: "border-purple-200", iconBg: "bg-purple-500", icon: <FaCalendarCheck className="text-white box-content p-2" /> },
  }[t] || { bg: "bg-gray-50/50", border: "border-gray-200", iconBg: "bg-gray-500", icon: <FaBell className="text-white box-content p-2" /> };

  return (
    <div className={`group relative backdrop-blur-md rounded-2xl p-4 sm:p-5 transition-all duration-300 border-2
      ${isRead ? 'bg-white/60 border-white shadow-sm grayscale-[0.2]' : `${styling.bg} ${styling.border} shadow-lg shadow-${styling.iconBg.split('-')[1]}-500/10`}
    `}>
      <div className="flex items-start gap-4">
        {/* Glow effect for unread */}
        {!isRead && <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-10 rounded-r-lg ${styling.iconBg}`}></div>}
        
        <div className={`shrink-0 rounded-2xl shadow-md overflow-hidden ${isRead ? 'bg-gray-300' : styling.iconBg}`}>
           {styling.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-1">
             <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isRead ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-900 border border-gray-100 shadow-sm'}`}>
               {t} Alert
             </span>
             <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
               <FaClock /> {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </span>
          </div>
          
          <p className={`text-sm sm:text-base font-bold ${isRead ? 'text-gray-600' : 'text-gray-900'} pr-8 sm:pr-0`}>
            {notification.message}
          </p>

          {/* Action Buttons for non-read items */}
          {!isRead && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
               <button onClick={onRead} className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-black transition-colors flex items-center gap-1.5 shadow-md">
                 <FaCheckDouble /> Acknowledge
               </button>
               {t === 'booking' && (
                 <button onClick={() => alert("Opening Bookings UI")} className="px-3 py-1.5 bg-white border-2 border-gray-200 text-gray-700 rounded-lg text-[10px] font-black uppercase tracking-wider hover:border-gray-900 transition-colors flex items-center gap-1.5 shadow-sm">
                   <FaEye /> View Deal
                 </button>
               )}
            </div>
          )}
        </div>

        {/* Delete Icon */}
        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onDelete} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
}