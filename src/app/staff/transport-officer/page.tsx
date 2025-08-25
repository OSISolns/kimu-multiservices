"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/UserContext';
import { FaCar, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaCheckCircle, FaTimesCircle, FaEye, FaRoute } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Booking {
  id: number;
  customerName: string;
  customerPhone: string;
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
  };
}

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  status: string;
  currentLocation?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
}

export default function TransportOfficerPage() {
  const { user, isLoading: userLoading, resetInactivityTimer } = useUser();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');

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
    }
  }, [user?.username]);

  const fetchVehicles = useCallback(async () => {
    if (!user?.username) return;
    
    try {
      const response = await fetch('/api/vehicles');
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles || []);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  }, [user?.username]);

  useEffect(() => {
    if (user && !userLoading) {
      fetchBookings();
      fetchVehicles();
      setLoading(false);
    }
  }, [user, userLoading, fetchBookings, fetchVehicles]);

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
    return <LoadingSpinner />;
  }

  if (!user) {
    router.push('/staff/login');
    return null;
  }

  const filteredBookings = bookings.filter(booking => 
    filter === 'all' || booking.status === filter
  );

  const filteredVehicles = vehicles.filter(vehicle => 
    vehicleFilter === 'all' || vehicle.status === vehicleFilter
  );

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

  const getVehicleStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-service': return 'bg-red-100 text-red-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Transport Operations</h1>
          <p className="text-gray-600 mt-2">
            Manage vehicle operations, track bookings, and monitor fleet status.
          </p>
      </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaCalendarAlt className="text-blue-600 text-xl" />
            </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookings.filter(b => ['pending', 'confirmed', 'in-progress'].includes(b.status)).length}
            </p>
          </div>
        </div>
      </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaCar className="text-green-600 text-xl" />
            </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Vehicles</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {vehicles.filter(v => v.status === 'available').length}
                </p>
            </div>
          </div>
        </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaClock className="text-yellow-600 text-xl" />
            </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Pickups</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
            </div>
          </div>
        </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaRoute className="text-purple-600 text-xl" />
            </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookings.filter(b => b.status === 'in-progress').length}
                </p>
            </div>
          </div>
        </div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Bookings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Active Bookings</h2>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
        </div>
      </div>

            <div className="p-6">
              {filteredBookings.length > 0 ? (
                <div className="space-y-4">
                  {filteredBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{booking.customerName}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1">{booking.status}</span>
                        </span>
              </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <FaMapMarkerAlt className="text-green-500" />
                          <span>{booking.pickupLocation}</span>
            </div>
                        <div className="flex items-center space-x-2">
                          <FaMapMarkerAlt className="text-red-500" />
                          <span>{booking.dropoffLocation}</span>
              </div>
                        <div className="flex items-center space-x-2">
                          <FaCalendarAlt className="text-blue-500" />
                          <span>Pickup: {new Date(booking.pickupDate).toLocaleDateString()}</span>
            </div>
          </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          RWF {booking.totalAmount?.toLocaleString()}
                        </span>
                <button
                          onClick={() => router.push(`/staff/bookings/${booking.id}`)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                          <FaEye className="mr-1" />
                          View
                </button>
              </div>
                          </div>
                  ))}
                            </div>
                          ) : (
                <div className="text-center py-8">
                  <FaCalendarAlt className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-500">No active bookings found</p>
                </div>
              )}
              
              {filteredBookings.length > 5 && (
                <div className="mt-4 text-center">
                            <button
                    onClick={() => router.push('/staff/bookings')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                    View All Bookings →
                            </button>
              </div>
            )}
          </div>
        </div>

          {/* Fleet Status */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Fleet Status</h2>
              <select
                  value={vehicleFilter}
                  onChange={(e) => setVehicleFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="in-use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="out-of-service">Out of Service</option>
              </select>
            </div>
          </div>

            <div className="p-6">
              {filteredVehicles.length > 0 ? (
                <div className="space-y-4">
                  {filteredVehicles.slice(0, 5).map((vehicle) => (
                    <div key={vehicle.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVehicleStatusColor(vehicle.status)}`}>
                          {vehicle.status}
                          </span>
                        </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>License: {vehicle.licensePlate}</p>
                        {vehicle.currentLocation && (
                          <p>Location: {vehicle.currentLocation}</p>
                        )}
                        {vehicle.lastMaintenance && (
                          <p>Last Maintenance: {new Date(vehicle.lastMaintenance).toLocaleDateString()}</p>
                        )}
                        {vehicle.nextMaintenance && (
                          <p>Next Maintenance: {new Date(vehicle.nextMaintenance).toLocaleDateString()}</p>
                        )}
            </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-gray-500">Vehicle ID: {vehicle.id}</span>
              <button
                          onClick={() => router.push(`/staff/vehicles/${vehicle.id}`)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FaEye className="mr-1" />
                          Details
              </button>
            </div>
          </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaCar className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-500">No vehicles found</p>
        </div>
      )}

              {filteredVehicles.length > 5 && (
                <div className="mt-4 text-center">
              <button
                    onClick={() => router.push('/staff/vehicles')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All Vehicles →
              </button>
        </div>
      )}
            </div>
              </div>
              </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
              onClick={() => router.push('/staff/bookings/new')}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
              <FaCalendarAlt className="text-blue-600 text-xl mr-3" />
              <span className="font-medium">Create Booking</span>
              </button>
            
              <button
              onClick={() => router.push('/staff/vehicles/new')}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
              <FaCar className="text-green-600 text-xl mr-3" />
              <span className="font-medium">Add Vehicle</span>
              </button>
            
              <button
              onClick={() => router.push('/staff/reports/transport')}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaRoute className="text-purple-600 text-xl mr-3" />
              <span className="font-medium">Transport Report</span>
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}