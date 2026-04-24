'use client'

import { useState, useEffect } from 'react';
import { FaWhatsapp, FaPhone, FaCheck, FaSpinner, FaHotel } from 'react-icons/fa';
import Link from 'next/link';

type Booking = {
  id: number;
  name: string;
  notes: string; // Used for Hotel Name
  pickupDate: string; // Used for Check-in
  returnDate: string; // Used for Check-out
  status: string;
  phone: string;
  email: string;
};

export default function HotelAccommodationAgentPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bookings?type=Hotel');
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

  return (
    <div className="min-h-screen bg-indigo-50 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <FaHotel className="text-3xl text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">Hotel Accommodation Management</h1>
          </div>
          <Link href="/staff/sales-dashboard" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors shadow-md">&larr; Back to Dashboard</Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="animate-spin text-4xl text-indigo-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center shadow-sm">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">No hotel bookings found.</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left border-b bg-gray-50">
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider">Client Details</th>
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider">Hotel / Notes</th>
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider">Check-in</th>
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider">Check-out</th>
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{b.name}</div>
                      <div className="text-xs text-gray-500">{b.email || 'No email'}</div>
                      <div className="text-xs text-indigo-600 font-medium">{b.phone}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-medium">{b.notes || 'N/A'}</td>
                    <td className="py-4 px-6 text-gray-600">{b.pickupDate}</td>
                    <td className="py-4 px-6 text-gray-600">{b.returnDate}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        b.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                        b.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 flex gap-2">
                      <a 
                        title="WhatsApp" 
                        href={`https://wa.me/${b.phone?.replace(/[^\d]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all shadow-sm hover:scale-110"
                      >
                        <FaWhatsapp />
                      </a>
                      <a 
                        title="Call" 
                        href={`tel:${b.phone}`} 
                        className="p-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all shadow-sm hover:scale-110"
                      >
                        <FaPhone />
                      </a>
                      {b.status !== 'Completed' && (
                        <button 
                          onClick={() => handleUpdateStatus(b.id, 'Completed')}
                          title="Mark as Completed" 
                          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-sm hover:scale-110"
                        >
                          <FaCheck />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 