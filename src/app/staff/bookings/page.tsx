'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/UserContext';
import { FaCar, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';
import Image from 'next/image';

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
    imageUrl?: string;
  };
}

export default function BookingsPage() {
  const { user, isLoading: userLoading, resetInactivityTimer } = useUser();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBookings = useCallback(async () => {
    if (!user?.username) return;
    
    try {
      const response = await fetch('/api/bookings');
        if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
        }
      } catch (error) {
      console.error('Error fetching bookings:', error);
      } finally {
      setLoading(false);
    }
  }, [user?.username]);

  useEffect(() => {
    if (user && !userLoading) {
      fetchBookings();
    }
  }, [user, userLoading, fetchBookings]);

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
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Image src="/logo.png" alt="KIMU Transport Logo" width={80} height={80} className="w-20 h-20 mx-auto mb-4 animate-pulse"/>
          <p className="text-gray-600">Loading bookings...</p>
      </div>
    </div>
  );
}

  if (!user) {
    router.push('/staff/login');
    return null;
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
      const matchesSearch = 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerPhone.includes(searchTerm) ||
      booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.vehicle?.licensePlate || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FaCheckCircle className="text-green-600" />;
      case 'cancelled': return <FaTimesCircle className="text-red-600" />;
      default: return <FaClock className="text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all vehicle rental bookings and customer requests.
          </p>
          </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by customer name, phone, email, or license plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Bookings ({filteredBookings.length})
            </h2>
              </div>
          
          {filteredBookings.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Booking Details */}
                    <div className="flex-1 space-y-4">
                      {/* Customer Info */}
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaCar className="text-blue-600 text-xl" />
                </div>
              </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.customerName}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center">
                              <FaPhone className="mr-2" />
                              {booking.customerPhone}
                        </span>
                            <span className="flex items-center">
                              <FaEnvelope className="mr-2" />
                              {booking.customerEmail}
                          </span>
                        </div>
                        </div>
        </div>

                      {/* Trip Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <FaMapMarkerAlt className="text-green-500" />
                            <span className="text-sm font-medium text-gray-700">Pickup:</span>
                            <span className="text-sm text-gray-600">{booking.pickupLocation}</span>
          </div>
                          <div className="flex items-center space-x-2">
                            <FaMapMarkerAlt className="text-red-500" />
                            <span className="text-sm font-medium text-gray-700">Dropoff:</span>
                            <span className="text-sm text-gray-600">{booking.dropoffLocation}</span>
              </div>
                  </div>
                        <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">Pickup Date:</span>
                            <span className="text-sm text-gray-600">
                              {new Date(booking.pickupDate).toLocaleDateString()}
                            </span>
                    </div>
                          <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">Return Date:</span>
                            <span className="text-sm text-gray-600">
                              {new Date(booking.returnDate).toLocaleDateString()}
                    </span>
                  </div>
                  </div>
                </div>

                      {/* Vehicle Info */}
                      {booking.vehicle && (
                        <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            {booking.vehicle.imageUrl ? (
                              <Image
                                src={booking.vehicle.imageUrl}
                                alt={`${booking.vehicle.make} ${booking.vehicle.model}`}
                                width={60}
                                height={40}
                                className="rounded object-cover"
                              />
                            ) : (
                              <div className="w-15 h-10 bg-gray-200 rounded flex items-center justify-center">
                                <FaCar className="text-gray-400" />
                      </div>
                    )}
                      </div>
                      <div>
                            <p className="font-medium text-gray-900">
                              {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                            </p>
                            <p className="text-sm text-gray-500">
                              License: {booking.vehicle.licensePlate}
                            </p>
                      </div>
                        </div>
                      )}
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end space-y-4 mt-4 lg:mt-0">
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-2">{booking.status}</span>
                        </span>
                        <p className="text-lg font-bold text-gray-900 mt-2">
                          RWF {booking.totalAmount?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
              </div>
              
                      <div className="flex space-x-2">
                  <button
                          onClick={() => router.push(`/staff/bookings/${booking.id}`)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FaEye className="mr-2" />
                          View
                  </button>
                </div>
              </div>
            </div>
          </div>
              ))}
                </div>
          ) : (
            <div className="text-center py-12">
              <FaCalendarAlt className="text-gray-400 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No bookings have been created yet.'
                }
              </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
} 