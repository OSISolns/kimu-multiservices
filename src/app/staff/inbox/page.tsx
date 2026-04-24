'use client'

import { useState, useEffect } from 'react';
import { FaInbox, FaRegEnvelopeOpen, FaRegEnvelope, FaTrash, FaSpinner, FaCheckDouble, FaExclamationCircle } from 'react-icons/fa';
import { useUser } from '../../UserContext';
import LoadingSpinner from '@/components/LoadingSpinner';

type Notification = {
  id: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

export default function Inbox() {
  const { user, isLoading: userLoading } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await fetch(`/api/notifications?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        setError('Failed to fetch messages');
      }
    } catch (err) {
      setError('An error occurred while fetching your inbox');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const deleteNotification = async (id: number) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'x-username': user.username },
      });
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-username': user.username
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  if (userLoading) return <LoadingSpinner message="Opening Inbox..." fullScreen={true} />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              <FaInbox className="text-blue-600" /> Inbox
            </h1>
            <p className="text-slate-500 font-medium">Manage your system alerts and team notifications</p>
          </div>
          {notifications.some(n => !n.read) && (
            <button 
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <FaCheckDouble /> Mark all as read
            </button>
          )}
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          {isLoading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <FaSpinner className="animate-spin text-4xl text-blue-500" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing your messages...</p>
            </div>
          ) : error ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-red-500">
              <FaExclamationCircle className="text-4xl" />
              <p className="font-bold">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4 text-slate-300">
              <FaRegEnvelopeOpen className="text-7xl" />
              <p className="text-xl font-bold">Your inbox is clear</p>
              <button onClick={fetchNotifications} className="text-blue-500 font-bold hover:underline">Check for updates</button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-6 flex items-start gap-4 hover:bg-slate-50 transition-all duration-300 group ${!n.read ? 'bg-blue-50/30' : ''}`}
                >
                  <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${!n.read ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                    {!n.read ? <FaRegEnvelope className="text-lg" /> : <FaRegEnvelopeOpen className="text-lg" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${!n.read ? 'text-blue-600' : 'text-slate-400'}`}>
                        {n.type || 'System Alert'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${!n.read ? 'text-slate-900 font-bold' : 'text-slate-600 font-medium'}`}>
                      {n.message}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.read && (
                      <button 
                        onClick={() => markAsRead(n.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <FaCheckDouble />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(n.id)}
                      className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                      title="Delete message"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 