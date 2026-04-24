'use client'

import { useState, useEffect } from 'react';
import { FaWhatsapp, FaPhone, FaCheck, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';

type Booking = {
  id: number;
  name: string;
  flightNumber: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  status: string;
  phone: string;
};

export default function AirportTransfersAgentPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bookings?type=Airport Transfer');
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
    <div className="min-h-screen bg-blue-50 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Airport Transfers Dashboard</h1>
          <Link href="/staff/sales-dashboard" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors">&larr; Back to Dashboard</Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No airport transfer bookings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left border-b">
                  <th className="py-4 px-4 font-semibold">Client</th>
                  <th className="py-4 px-4 font-semibold">Flight</th>
                  <th className="py-4 px-4 font-semibold">Date & Time</th>
                  <th className="py-4 px-4 font-semibold">Pickup</th>
                  <th className="py-4 px-4 font-semibold">Drop-off</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                  <th className="py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-900">{b.name}</td>
                    <td className="py-4 px-4 text-gray-600">{b.flightNumber || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-600">{b.pickupDate} at {b.pickupTime}</td>
                    <td className="py-4 px-4 text-gray-600">{b.pickupLocation}</td>
                    <td className="py-4 px-4 text-gray-600">{b.dropoffLocation}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        b.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        b.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 flex gap-2">
                      <a 
                        title="WhatsApp" 
                        href={`https://wa.me/${b.phone?.replace(/[^\d]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      >
                        <FaWhatsapp />
                      </a>
                      <a 
                        title="Call" 
                        href={`tel:${b.phone}`} 
                        className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        <FaPhone />
                      </a>
                      {b.status !== 'Completed' && (
                        <button 
                          onClick={() => handleUpdateStatus(b.id, 'Completed')}
                          title="Mark as Complete" 
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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