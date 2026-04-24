'use client'

import { useState, useEffect } from 'react';
import { FaWhatsapp, FaPhone, FaCheck, FaSpinner, FaTaxi, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import Link from 'next/link';
import { useUser } from '../../UserContext';
import LoadingSpinner from '@/components/LoadingSpinner';

type Booking = {
  id: number;
  name: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  status: string;
  phone: string;
  notes: string;
};

export default function TaxiAgentPage() {
  const { user, isLoading: userLoading } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bookings?type=Taxi Service');
      if (response.ok) {
        const result = await response.json();
        setBookings(result.data || []);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      setError('An error occurred while fetching bookings');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (userLoading) {
    return <LoadingSpinner message="Authenticating..." fullScreen={true} />;
  }

  return (
    <div className="min-h-screen bg-emerald-50/30 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FaTaxi className="text-4xl text-emerald-200" />
              <h1 className="text-3xl font-extrabold tracking-tight">Premium Taxi Service</h1>
            </div>
            <p className="text-emerald-100 font-medium">Manage on-demand transportation requests</p>
          </div>
          <Link href="/staff/sales-dashboard" className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl font-bold transition-all border border-white/20 shadow-lg">&larr; Dashboard</Link>
        </div>

        <div className="p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <FaSpinner className="animate-spin text-5xl text-emerald-600" />
              <p className="text-emerald-800 font-bold animate-pulse">Retrieving Bookings...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center border border-red-100 shadow-sm font-medium">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-32 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <FaTaxi className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-xl font-medium">No active taxi requests at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden">
                  <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex justify-between items-center">
                    <span className="font-black text-emerald-900 truncate">{b.name}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm ${
                      b.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                      b.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <FaMapMarkerAlt className="text-emerald-500 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-400 font-bold uppercase">Pickup & Drop-off</div>
                        <div className="text-sm font-bold text-gray-700">{b.pickupLocation} &rarr; {b.dropoffLocation}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaClock className="text-emerald-500 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-400 font-bold uppercase">Scheduled Time</div>
                        <div className="text-sm font-bold text-gray-700">{b.pickupDate} at {b.pickupTime}</div>
                      </div>
                    </div>
                    {b.notes && (
                      <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 italic border border-gray-100">
                        &quot;{b.notes}&quot;
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <a 
                        href={`https://wa.me/${b.phone?.replace(/[^\d]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-green-100"
                      >
                        <FaWhatsapp /> WhatsApp
                      </a>
                      <a 
                        href={`tel:${b.phone}`} 
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-gray-100"
                      >
                        <FaPhone /> Call
                      </a>
                    </div>
                    {b.status !== 'Completed' && (
                      <button 
                        onClick={() => handleUpdateStatus(b.id, 'Completed')}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-emerald-100 mt-2"
                      >
                        <FaCheck /> MARK AS COMPLETED
                      </button>
                    )}
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