"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/UserContext';
import { FaCar, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaCheckCircle, FaTimesCircle, FaEye, FaRoute, FaTimes, FaCog, FaGasPump, FaUsers, FaDoorOpen, FaTachometerAlt } from 'react-icons/fa';
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
  name: string;
  type: string;
  category: string;
  year: number;
  licensePlate?: string;
  status: string;
  isAvailable: boolean;
  maintenanceDate?: string;
  currentLocation?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  engine?: string;
  transmission?: string;
  fuel?: string;
  power?: string;
  fuelEfficiency?: string;
  capacity?: string;
  doors?: number;
  mileage?: string;
  quantity?: number;
  description?: string;
  price?: string;
  image?: string;
}

interface TransportAggregate {
  totalVehicles: number
  availableVehicles: number
  inUseVehicles: number
  maintenanceVehicles: number
  totalMileage: number
  averageFuelEfficiency: number
  mostUsedVehicle: string
  leastUsedVehicle: string
  maintenanceDue: number
  upcomingMaintenance: { vehicleName: string; maintenanceDate: string; type: string }[];
  recentActiveVehicles?: { id: number; name: string; status: string }[];
  activeBookings?: number;
}



export default function TransportOfficerPage() {
  const { user, isLoading: userLoading, resetInactivityTimer } = useUser();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showFleetModal, setShowFleetModal] = useState(false);
  const [aggregate, setAggregate] = useState<TransportAggregate | null>(null);

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
        setVehicles(data || []);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  }, [user?.username]);

  const fetchAggregate = useCallback(async () => {
    try {
      const res = await fetch('/api/reports/transport?days=30&type=overview');
      if (!res.ok) return;
      const data = await res.json();
      setAggregate(data);
    } catch (_) { }
  }, []);

  useEffect(() => {
    if (user && !userLoading) {
      fetchBookings();
      fetchVehicles();
      fetchAggregate();
      setLoading(false);
    }
  }, [user, userLoading, fetchBookings, fetchVehicles, fetchAggregate]);

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
    switch (status.toLowerCase()) {
      case 'active': return 'bg-blue-100 text-blue-800';
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
    switch (status.toLowerCase()) {
      case 'active': return <FaCheckCircle className="text-blue-600" />;
      case 'completed': return <FaCheckCircle className="text-green-600" />;
      case 'cancelled': return <FaTimesCircle className="text-red-600" />;
      case 'confirmed': return <FaCheckCircle className="text-green-600" />;
      default: return <FaClock className="text-blue-600" />;
    }
  };

  const openFleetModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowFleetModal(true);
  };

  const closeFleetModal = () => {
    setSelectedVehicle(null);
    setShowFleetModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 bg-[url('/subtle-prism.svg')] bg-cover bg-fixed">
      {/* Premium Header with Glassmorphism */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3 animate-fade-in-up">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg shadow-blue-500/30">
                <FaCar className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Transport Operations</h1>
                <p className="text-sm text-gray-500 font-medium">Manage vehicles, bookings & fleet status</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/staff/vehicles/new')}
                className="btn-primary hover-lift animate-bounce-gentle flex items-center gap-2"
              >
                <FaCar className="text-sm" />
                Add Vehicle
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 group animate-fade-in-up animation-delay-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-soft">
                <FaCalendarAlt className="text-blue-600 text-2xl" />
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                Active
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Active Bookings</h3>
            <p className="text-3xl font-bold text-gradient">
              {aggregate?.activeBookings ?? bookings.filter(b => ['active', 'pending', 'confirmed', 'in-progress'].includes(b.status.toLowerCase())).length}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 group animate-fade-in-up animation-delay-400">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-soft">
                <FaCar className="text-green-600 text-2xl" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                Ready
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Available Vehicles</h3>
            <p className="text-3xl font-bold text-gradient">
              {aggregate?.availableVehicles ?? vehicles.filter(v => v.isAvailable && v.status === 'available').length}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 group animate-fade-in-up animation-delay-2000">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-soft">
                <FaGasPump className="text-red-600 text-2xl" />
              </div>
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                Attention
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Maintenance Due</h3>
            <p className="text-3xl font-bold text-gradient">
              {aggregate?.maintenanceDue ?? 0}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 group animate-fade-in-up animation-delay-4000">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-soft">
                <FaRoute className="text-purple-600 text-2xl" />
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">
                In Transit
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">In Use</h3>
            <p className="text-3xl font-bold text-gradient">
              {aggregate?.inUseVehicles ?? bookings.filter(b => b.status === 'in-progress').length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Active Vehicles (from aggregate) */}
          {aggregate?.recentActiveVehicles && aggregate.recentActiveVehicles.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 animate-fade-in-up">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
                <h2 className="text-lg font-bold text-gray-900">Recently Active Vehicles</h2>
              </div>
              <div className="p-6">
                <ul className="divide-y divide-gray-100">
                  {aggregate.recentActiveVehicles.map(v => (
                    <li key={v.id} className="py-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg px-2">
                      <span className="text-gray-800 font-medium">{v.name}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getVehicleStatusColor(v.status)}`}>{v.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {/* Active Bookings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Active Bookings</h2>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white shadow-sm hover:shadow-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
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
                    <div key={booking.id} className="p-4 border border-gray-100 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
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
                        <span className="text-sm font-bold text-gray-900">
                          RWF {booking.totalAmount?.toLocaleString()}
                        </span>
                        <button
                          onClick={() => router.push(`/staff/bookings/${booking.id}`)}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-xs font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Fleet Status</h2>
                <select
                  value={vehicleFilter}
                  onChange={(e) => setVehicleFilter(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white shadow-sm hover:shadow-md"
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
                    <div key={vehicle.id} className="p-4 border border-gray-100 rounded-2xl hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">
                          {vehicle.year} {vehicle.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVehicleStatusColor(vehicle.status)}`}>
                          {vehicle.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <p>Type: {vehicle.type} - {vehicle.category}</p>
                        {vehicle.licensePlate && (
                          <p>License: {vehicle.licensePlate}</p>
                        )}
                        {vehicle.maintenanceDate && (
                          <p>Maintenance Date: {new Date(vehicle.maintenanceDate).toLocaleDateString()}</p>
                        )}
                        <p>Status: {vehicle.isAvailable ? 'Available' : 'Not Available'}</p>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-gray-500 font-medium">Vehicle ID: {vehicle.id}</span>
                        <button
                          onClick={() => openFleetModal(vehicle)}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-xs font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
      </div>

      {/* Fleet Details Modal */}
      {showFleetModal && selectedVehicle && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <FaCar className="text-blue-600 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedVehicle.year} {selectedVehicle.name}
                    </h3>
                    <p className="text-gray-600">{selectedVehicle.type} - {selectedVehicle.category}</p>
                  </div>
                </div>
                <button
                  onClick={closeFleetModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Vehicle Status Badge (single, non-redundant) */}
              <div className="mb-6">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getVehicleStatusColor(selectedVehicle.status)}`}>
                  {(selectedVehicle.isAvailable ? 'Available' : 'Not Available').toUpperCase()}
                </span>
              </div>

              {/* Vehicle Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FaCog className="mr-2 text-blue-600" />
                    Basic Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle ID:</span>
                      <span className="font-medium">{selectedVehicle.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year:</span>
                      <span className="font-medium">{selectedVehicle.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{selectedVehicle.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{selectedVehicle.category}</span>
                    </div>
                    {selectedVehicle.licensePlate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">License Plate:</span>
                        <span className="font-medium">{selectedVehicle.licensePlate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FaTachometerAlt className="mr-2 text-green-600" />
                    Technical Specs
                  </h4>
                  <div className="space-y-3">
                    {(() => {
                      const isElectric = (selectedVehicle.fuel || '').toLowerCase() === 'electric' || (selectedVehicle.type || '').toLowerCase() === 'electric';
                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{isElectric ? 'Motor' : 'Engine'}:</span>
                            <span className="font-medium">{selectedVehicle.engine || (isElectric ? 'Electric Motor' : 'N/A')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transmission:</span>
                            <span className="font-medium">{selectedVehicle.transmission || (isElectric ? 'Single-Speed' : 'N/A')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{isElectric ? 'Energy Source' : 'Fuel Type'}:</span>
                            <span className="font-medium">{selectedVehicle.fuel || (isElectric ? 'Electric' : 'N/A')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Power:</span>
                            <span className="font-medium">{selectedVehicle.power || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{isElectric ? 'Energy Consumption' : 'Fuel Efficiency'}:</span>
                            <span className="font-medium">{selectedVehicle.fuelEfficiency || (isElectric ? 'N/A' : 'N/A')}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Capacity & Features */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FaUsers className="mr-2 text-purple-600" />
                    Capacity & Features
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{selectedVehicle.capacity || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Doors:</span>
                      <span className="font-medium">{selectedVehicle.doors || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mileage:</span>
                      <span className="font-medium">{selectedVehicle.mileage || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{selectedVehicle.quantity || 1}</span>
                    </div>
                  </div>
                </div>

                {/* Maintenance Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FaGasPump className="mr-2 text-yellow-600" />
                    Maintenance
                  </h4>
                  <div className="space-y-3">
                    {selectedVehicle.maintenanceDate ? (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Maintenance:</span>
                        <span className="font-medium">
                          {new Date(selectedVehicle.maintenanceDate).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Maintenance:</span>
                        <span className="font-medium text-gray-400">No record</span>
                      </div>
                    )}
                    {/* Status rows removed to avoid redundancy with the badge above */}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedVehicle.description && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                  <p className="text-gray-600 leading-relaxed">{selectedVehicle.description}</p>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeFleetModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeFleetModal();
                    router.push(`/staff/vehicles/${selectedVehicle.id}`);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
