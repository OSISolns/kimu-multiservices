'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/UserContext';
import { FaCar, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCheckCircle, FaTimesCircle, FaEye, FaUsers } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';
import Image from 'next/image';

interface Booking {
  id: number;
  type: string;
  name: string;
  email: string | null;
  phone: string;
  nationality: string;
  idOrPassport: string;
  carType: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  rentalDays: number;
  returnConfirmed: boolean;
  fullTank: boolean;
  status: string;
  createdAt: string;
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

    setLoading(true);
    try {
      const params = new URLSearchParams();
      // Map frontend filter values to backend PascalCase statuses
      if (filter !== 'all') {
        const statusMap: Record<string, string> = {
          'active': 'Active',
          'pending': 'Pending',
          'confirmed': 'Confirmed',
          'in-progress': 'In Progress',
          'completed': 'Completed',
          'cancelled': 'Cancelled'
        };
        params.append('status', statusMap[filter] || filter);
      }

      const response = await fetch(`/api/bookings?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Bookings API response:', data); // Debug log
        setBookings(data.bookings || data.data || []); // Handle both response structures
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.username, filter]);

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
          <Image src="/logo.png" alt="KIMU Transport Logo" width={80} height={80} className="w-20 h-20 mx-auto mb-4 animate-pulse" unoptimized />
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
    const matchesFilter = filter === 'all' || booking.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm) ||
      (booking.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.carType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.nationality.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return <FaCheckCircle className="text-blue-600" />;
      case 'completed': return <FaCheckCircle className="text-gray-600" />;
      case 'cancelled': return <FaTimesCircle className="text-red-600" />;
      case 'confirmed': return <FaCheckCircle className="text-green-600" />;
      default: return <FaClock className="text-yellow-600" />;
    }
  };

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const openBookingModal = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const closeBookingModal = () => {
    setSelectedBooking(null);
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
                placeholder="Search by customer name, phone, email, car type, or nationality..."
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
              <option value="active">Active</option>
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
                            {booking.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center">
                              <FaPhone className="mr-2" />
                              {booking.phone}
                            </span>
                            {booking.email && (
                              <span className="flex items-center">
                                <FaEnvelope className="mr-2" />
                                {booking.email}
                              </span>
                            )}
                            <span className="flex items-center">
                              <FaCar className="mr-2" />
                              {booking.carType}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Trip Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="text-green-500" />
                            <span className="text-sm font-medium text-gray-700">Pickup:</span>
                            <span className="text-sm text-gray-600">
                              {new Date(booking.pickupDate).toLocaleDateString()} at {booking.pickupTime}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="text-red-500" />
                            <span className="text-sm font-medium text-gray-700">Return:</span>
                            <span className="text-sm text-gray-600">
                              {new Date(booking.returnDate).toLocaleDateString()} at {booking.returnTime}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <FaCar className="text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">Duration:</span>
                            <span className="text-sm text-gray-600">
                              {booking.rentalDays} day{booking.rentalDays !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaCheckCircle className="text-green-500" />
                            <span className="text-sm font-medium text-gray-700">Status:</span>
                            <span className="text-sm text-gray-600">
                              {booking.returnConfirmed ? 'Return Confirmed' : 'Return Pending'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FaCar className="text-blue-500" />
                          <span className="text-sm font-medium text-gray-700">Car Type:</span>
                          <span className="text-sm text-gray-600">{booking.carType}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaCheckCircle className="text-green-500" />
                          <span className="text-sm font-medium text-gray-700">Full Tank:</span>
                          <span className="text-sm text-gray-600">{booking.fullTank ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaCar className="text-blue-500" />
                          <span className="text-sm font-medium text-gray-700">Nationality:</span>
                          <span className="text-sm text-gray-600">{booking.nationality}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end space-y-4 mt-4 lg:mt-0">
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-2">{booking.status}</span>
                        </span>
                        <p className="text-lg font-bold text-gray-900 mt-2">
                          {booking.type}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => openBookingModal(booking)}
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

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <FaCar className="text-blue-600 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Booking #{selectedBooking.id}
                    </h3>
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-gray-500 text-sm">{selectedBooking.type}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeBookingModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                >
                  <FaTimesCircle className="text-2xl" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Customer Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaUsers className="mr-2 text-blue-500" />
                    Customer Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-gray-500">Name:</span>
                      <span className="text-sm text-gray-900 col-span-2 font-medium">{selectedBooking.name}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-gray-500">Phone:</span>
                      <span className="text-sm text-gray-900 col-span-2">{selectedBooking.phone}</span>
                    </div>
                    {selectedBooking.email && (
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-medium text-gray-500">Email:</span>
                        <span className="text-sm text-gray-900 col-span-2">{selectedBooking.email}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-gray-500">Nationality:</span>
                      <span className="text-sm text-gray-900 col-span-2">{selectedBooking.nationality}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-gray-500">ID/Passport:</span>
                      <span className="text-sm text-gray-900 col-span-2">{selectedBooking.idOrPassport}</span>
                    </div>
                  </div>
                </div>

                {/* Vehicle & Trip Info */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaCar className="mr-2 text-green-500" />
                    Trip Details
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-gray-500">Vehicle Type:</span>
                      <span className="text-sm text-gray-900 col-span-2 font-medium">{selectedBooking.carType}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-gray-500">Duration:</span>
                      <span className="text-sm text-gray-900 col-span-2">{selectedBooking.rentalDays} days</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-gray-500">Created:</span>
                      <span className="text-sm text-gray-900 col-span-2">{new Date(selectedBooking.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="md:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaCalendarAlt className="mr-2 text-purple-500" />
                    Schedule
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <h5 className="text-sm font-bold text-blue-800 mb-2 uppercase tracking-wide">Pickup</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-blue-600">Date:</span>
                          <span className="text-sm font-medium text-gray-900">{new Date(selectedBooking.pickupDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-blue-600">Time:</span>
                          <span className="text-sm font-medium text-gray-900">{selectedBooking.pickupTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                      <h5 className="text-sm font-bold text-red-800 mb-2 uppercase tracking-wide">Return</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-red-600">Date:</span>
                          <span className="text-sm font-medium text-gray-900">{new Date(selectedBooking.returnDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-red-600">Time:</span>
                          <span className="text-sm font-medium text-gray-900">{selectedBooking.returnTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={closeBookingModal}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 