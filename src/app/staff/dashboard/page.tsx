"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCar, FaCalendarAlt, FaInbox, FaSignOutAlt, FaSave, FaSearch, FaMoneyBillWave, FaFileAlt, FaCarSide, FaCheck, FaClock, FaWhatsapp, FaPhone, FaTimes, FaEdit, FaTaxi, FaPlane, FaHotel, FaHandshake, FaExclamationTriangle, FaBell, FaHistory } from 'react-icons/fa';
import Pagination from '../../../components/Pagination';
import { useUser } from '../../UserContext';

const statusColors: Record<string, string> = {
  'Pending': 'bg-purple-100 text-purple-700',
  'Finished': 'bg-green-100 text-green-700',
  'Canceled': 'bg-red-100 text-red-700',
};

function getPrice(carType: string, vehicles: any[]) {
  const v = vehicles.find(v => v.name === carType);
  if (!v) return 0;
  // Extract number from '120,000 RWF/day'
  const match = v.price.replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

function formatRWF(num: number) {
  return num.toLocaleString('en-US') + ' RWF';
}

export default function AgentDashboard() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [bookings, setBookings] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState<{index: number, open: boolean} | null>(null);
  const [fullTankChecked, setFullTankChecked] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showExtend, setShowExtend] = useState<{index: number, open: boolean} | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    name: '',
    image: '',
    type: '',
    category: '',
    price: '',
    year: '',
    engine: '',
    mileage: '',
    transmission: '',
    fuel: '',
    capacity: '',
    doors: '',
    description: '',
    isAvailable: true,
    power: '',
    fuelEfficiency: '',
  });
  const [vehicleMsg, setVehicleMsg] = useState('');
  const [vehicleList, setVehicleList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchBookings = () => {
      const apiUrl = window.location.origin + '/api/bookings';
      fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-username': user?.username || '',
        },
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data.bookings) && data.bookings.length > 0) {
            setBookings(data.bookings);
          } else {
            setBookings([]);
          }
          setTimeout(() => setIsLoaded(true), 100);
        })
        .catch(error => {
          console.error('Error fetching bookings:', error);
          setBookings([]);
          setIsLoaded(true);
        });
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/staff/login');
    } else if (!isLoading && user) {
      fetchBookings();
    }
  }, [router, user, isLoading]);

  useEffect(() => {
    if (user) {
      fetch('/api/vehicles', {
        headers: {
          'x-username': user.username,
        },
      })
        .then(res => res.json())
        .then(data => {
          setVehicleList(data);
        })
        .catch(err => {
          console.error('Error fetching vehicles:', err);
        });
    }
  }, [user]);

  useEffect(() => {
    fetch('/api/payments')
      .then(res => res.json())
      .then(data => {
        setPayments(data);
        const revenue = Array.isArray(data)
          ? data.filter((p) => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0)
          : 0;
        setTotalRevenue(revenue);
      })
      .catch(() => setPayments([]));
  }, []);

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  // Filter and search logic
  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      (b.name?.toLowerCase().includes(search.toLowerCase()) || b.guestName?.toLowerCase().includes(search.toLowerCase())) ||
      (b.carType?.toLowerCase().includes(search.toLowerCase()) || b.roomType?.toLowerCase().includes(search.toLowerCase())) ||
      (b.phone && b.phone.includes(search)) ||
      (b.email && b.email.includes(search));
    
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Pending' && b.status === 'Pending') ||
      (statusFilter === 'Finished' && b.status === 'Completed') ||
      (statusFilter === 'Active' && b.status === 'Active') ||
      (statusFilter === 'Confirmed' && b.status === 'Confirmed');
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Calculate overdue and today's returns (for car rentals only)
  const overdueCount = bookings.filter(b => {
    if (b.type === 'Car Rental' && !b.returnConfirmed && b.returnDate && b.returnTime) {
      const now = new Date();
      const ret = new Date(`${b.returnDate}T${b.returnTime}`);
      return now > ret;
    }
    return false;
  }).length;

  const todayReturns = bookings.filter(b => {
    if (b.type === 'Car Rental' && b.returnDate && b.returnTime) {
      const today = new Date().toISOString().split('T')[0];
      return b.returnDate === today;
    }
    return false;
  }).length;

  // Calculate stats for different booking types
  const carRentals = bookings.filter(b => b.type === 'Car Rental');
  const hotelBookings = bookings.filter(b => b.type === 'Hotel');
  const activeCarRentals = carRentals.filter(b => !b.returnConfirmed).length;
  const pendingHotelBookings = hotelBookings.filter(b => b.status === 'Pending').length;

  // Calculate turnover (for car rentals only)
  const turnover = carRentals.reduce((sum, b) => sum + getPrice(b.carType, vehicleList), 0);
  const income = turnover;

  const stats = [
    { label: 'Total Turnover', value: formatRWF(turnover), change: '+12%', color: 'purple', trend: 'up' },
    { label: 'Monthly Income', value: formatRWF(income), change: '+8%', color: 'green', trend: 'up' },
    { label: 'Active Vehicles', value: vehicleList.filter(v => v.isAvailable).length.toString(), change: '', color: 'blue', trend: 'up' },
    { label: 'Total Bookings', value: bookings.length.toString(), change: '+15%', color: 'orange', trend: 'up' },
  ];

  const handleVehicleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newValue: string | boolean = value;
    if (
      e.target instanceof HTMLInputElement &&
      e.target.type === 'checkbox'
    ) {
      newValue = e.target.checked;
    }
    setVehicleForm(f => ({
      ...f,
      [name]: newValue,
    }));
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setVehicleMsg('');
    try {
      const res = await fetch('/api/vehicles/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-username': user?.username || '',
        },
        body: JSON.stringify({
          ...vehicleForm,
          year: Number(vehicleForm.year),
          doors: Number(vehicleForm.doors),
        }),
      });
      if (res.ok) {
        const { vehicle } = await res.json();
        setVehicleMsg('Vehicle added!');
        setVehicleForm({
          name: '', image: '', type: '', category: '', price: '', year: '', engine: '', mileage: '', transmission: '', fuel: '', capacity: '', doors: '', description: '', isAvailable: true, power: '', fuelEfficiency: '',
        });
        setShowAddVehicle(false);
        setVehicleList(prev => [...prev, vehicle]);
      } else {
        setVehicleMsg('Failed to add vehicle.');
      }
    } catch {
      setVehicleMsg('Error adding vehicle.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/vehicles/upload', {
      method: 'POST',
      headers: {
        'x-username': user?.username || '',
      },
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      setVehicleForm(f => ({ ...f, image: data.url }));
    }
    setUploading(false);
  };

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

  return (
    <>
      {/* Main Content */}
      <main className="flex-1 max-w-full mx-auto p-8 flex flex-col gap-8">
        {/* Welcome and Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-100 to-blue-50 rounded-2xl p-6 shadow flex flex-col justify-center items-center">
            <h2 className="text-xl font-bold text-orange-700 mb-2">
              Welcome, {user?.fullName || user?.username || (user ? user.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'User')}!
            </h2>
            <p className="text-gray-600 text-center">Here&apos;s a quick overview of your activity and notifications.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow flex flex-col items-center">
            <div className="text-2xl font-bold text-blue-700 mb-1">{activeCarRentals}</div>
            <div className="text-gray-500">Active Rentals</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow flex flex-col items-center">
            <div className="text-2xl font-bold text-green-700 mb-1">{pendingHotelBookings}</div>
            <div className="text-gray-500">Pending Bookings</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow flex flex-col items-center">
            <div className="text-2xl font-bold text-red-700 mb-1">{overdueCount}</div>
            <div className="text-gray-500">Overdue Returns</div>
          </div>
        </div>
        {/* Dynamic Notifications Panel */}
        <div className="bg-blue-50 rounded-2xl p-6 shadow mb-8">
          <h3 className="text-lg font-bold text-blue-700 mb-2 flex items-center gap-2"><FaBell className="text-blue-400" /> Recent Activity & Notifications</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            {overdueCount > 0 && (
              <li><span className="font-semibold text-red-600">⚠️ {overdueCount} overdue return(s)</span> - Action required</li>
            )}
            {todayReturns > 0 && (
              <li><span className="font-semibold text-yellow-600">📅 {todayReturns} return(s) due today</span> - Follow up needed</li>
            )}
            {activeCarRentals > 0 && (
              <li><span className="font-semibold text-blue-600">🚗 {activeCarRentals} active rental(s)</span> - Currently in use</li>
            )}
            {pendingHotelBookings > 0 && (
              <li><span className="font-semibold text-orange-600">🏨 {pendingHotelBookings} pending hotel booking(s)</span> - Review required</li>
            )}
            {bookings.length > 0 && (
              <li><span className="font-semibold text-green-600">📊 {bookings.length} total booking(s)</span> - System overview</li>
            )}
          </ul>
        </div>
        {/* Dynamic Recent Activity Feed */}
        <div className="bg-white rounded-2xl p-6 shadow mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><FaClock className="text-yellow-500" /> Recent Activity</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            {bookings.length > 0 && (
              <li>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - <span className="font-semibold">Dashboard loaded</span> with {bookings.length} booking(s)</li>
            )}
            {activeCarRentals > 0 && (
              <li>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - <span className="font-semibold">{activeCarRentals} active rental(s)</span> currently in progress</li>
            )}
            {overdueCount > 0 && (
              <li>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - <span className="font-semibold text-red-600">{overdueCount} overdue return(s)</span> need attention</li>
            )}
            {todayReturns > 0 && (
              <li>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - <span className="font-semibold text-yellow-600">{todayReturns} return(s) due today</span> - follow up required</li>
            )}
            {vehicleList.length > 0 && (
              <li>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - <span className="font-semibold">Fleet updated</span> with {vehicleList.length} vehicle(s)</li>
            )}
          </ul>
        </div>
        <h2 className={`text-2xl font-bold mb-2 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Dashboard Overview
        </h2>
        
        {/* System Overview */}
        <div className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaCar className="text-blue-600" />
            System Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Vehicles</p>
                  <p className="text-2xl font-bold text-blue-600">{vehicleList.length}</p>
                </div>
                <FaCar className="text-blue-400 text-xl" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Vehicles</p>
                  <p className="text-2xl font-bold text-green-600">{vehicleList.filter(v => v.isAvailable).length}</p>
                </div>
                <FaCheck className="text-green-400 text-xl" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-purple-600">{bookings.length}</p>
                </div>
                <FaCalendarAlt className="text-purple-400 text-xl" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Status</p>
                  <p className="text-2xl font-bold text-green-600">Online</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className={`bg-white rounded-2xl p-8 shadow flex flex-col gap-2 border-t-4 border-${stat.color}-500 max-w-full transition-all duration-700 hover:scale-105 hover:shadow-xl ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="font-semibold text-gray-500">{stat.label}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{stat.change}</div>
            </div>
          ))}
        </div>
        {/* Financial Summary Widget */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <FaMoneyBillWave className="text-green-600 text-2xl" />
              <span className="text-lg font-bold text-green-700">Total Revenue</span>
            </div>
            <div className="text-3xl font-bold text-green-700">{formatRWF(totalRevenue)}</div>
          </div>
          {/* Summary Cards */}
          <div className={`bg-white rounded-2xl shadow p-8 max-w-full transition-all duration-700 hover:scale-105 hover:shadow-xl ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '400ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full animate-pulse">
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className={`bg-white rounded-2xl shadow p-8 max-w-full transition-all duration-700 hover:scale-105 hover:shadow-xl ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '500ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rentals</p>
                <p className="text-3xl font-bold text-gray-900">{activeCarRentals}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full animate-pulse">
                <FaCar className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className={`bg-white rounded-2xl shadow p-8 max-w-full transition-all duration-700 hover:scale-105 hover:shadow-xl ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '600ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Hotels</p>
                <p className="text-3xl font-bold text-orange-600">{pendingHotelBookings}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full animate-pulse">
                <FaHotel className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>

          <div className={`bg-white rounded-2xl shadow p-8 max-w-full transition-all duration-700 hover:scale-105 hover:shadow-xl ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '700ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Returns</p>
                <p className="text-3xl font-bold text-red-600">{overdueCount}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full animate-pulse">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
            </div>
          </div>

          <div className={`bg-white rounded-2xl shadow p-8 max-w-full transition-all duration-700 hover:scale-105 hover:shadow-xl ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '800ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today&apos;s Returns</p>
                <p className="text-3xl font-bold text-gray-900">{todayReturns}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full animate-pulse">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>
        </div>
        {/* More Mock Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Team Members */}
          <div className="bg-white rounded-2xl p-6 shadow flex flex-col items-center">
            <h3 className="text-lg font-bold text-purple-700 mb-2">System Features</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li><span className="font-semibold">🚗 Car Rental Management</span></li>
              <li><span className="font-semibold">🏨 Hotel Accommodation</span></li>
              <li><span className="font-semibold">🚕 Premium Taxi Services</span></li>
              <li><span className="font-semibold">✈️ Airport Transfers</span></li>
              <li><span className="font-semibold">🤝 Automotive Sales</span></li>
              <li><span className="font-semibold">📊 Reports & Analytics</span></li>
            </ul>
          </div>
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-blue-100 to-green-50 rounded-2xl p-6 shadow flex flex-col items-center">
            <h3 className="text-lg font-bold text-green-700 mb-2">Quick Actions</h3>
            <div className="flex flex-col gap-2 w-full">
              {(user && (user.role === 'admin' || user.role === 'staff' || user.role === 'transport-officer')) && (
                <a href="/staff/bookings" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center">+ New Booking</a>
              )}
              {(user && (user.role === 'admin' || user.role === 'staff')) && (
                <a href="/staff/notifications" className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors text-center">Send Notification</a>
              )}
              {(user && (user.role === 'admin' || user.role === 'accountant' || user.role === 'staff')) && (
                <a href="/staff/reports" className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors text-center">View Reports</a>
              )}
              {(user && user.role === 'admin') && (
                <a href="/staff/users" className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center">Manage Users</a>
              )}
              {(user && (user.role === 'admin' || user.role === 'transport-officer')) && (
                <a href="/staff/activity-logs" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-center">Activity Logs</a>
              )}
              {(user && (user.role === 'admin' || user.role === 'staff')) && (
                <a href="/staff/calendar" className="bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors text-center">View Calendar</a>
              )}
            </div>
          </div>
          {/* System Health */}
          <div className="bg-white rounded-2xl p-6 shadow flex flex-col items-center">
            <h3 className="text-lg font-bold text-blue-700 mb-2">System Health</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block animate-pulse"></span>
              <span className="text-green-700 font-semibold">All Systems Operational</span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Last checked: {new Date().toLocaleTimeString()}</p>
              <p>Database: Connected</p>
              <p>API: Responding</p>
              <p>Authentication: Active</p>
            </div>
          </div>
          {/* Motivational Quote */}
          <div className="bg-gradient-to-br from-yellow-100 to-pink-50 rounded-2xl p-6 shadow flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-yellow-700 mb-2">Business Insights</h3>
            <blockquote className="italic text-gray-700 text-center">“Success is not the key to happiness. Happiness is the key to success.”<br /><span className="block mt-2 text-xs text-gray-500">– Albert Schweitzer</span></blockquote>
          </div>
        </div>
        {/* Search and Filter */}
        <div className={`bg-white rounded-2xl shadow p-8 max-w-full mx-auto mb-6 transition-all duration-700 hover:shadow-xl ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '900ms' }}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, phone, email, car type, or room type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Finished">Finished</option>
              </select>
              <button
                onClick={() => { setSearch(''); setStatusFilter('All'); }}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 hover:scale-105"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        {/* Car Listings Table */}
        <div className={`bg-white rounded-2xl shadow p-8 max-w-full mx-auto transition-all duration-700 hover:shadow-xl ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '1000ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">All Bookings</h3>
            <select className="border rounded px-2 py-1 text-sm transition-all duration-300 hover:bg-gray-50">
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left">
                  <th className="py-4 px-6">No</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Client</th>
                  <th className="py-4 px-6">Contact</th>
                  <th className="py-4 px-6">Details</th>
                  <th className="py-4 px-6">Dates</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map((b, i) => {
                  const vehicle = vehicleList.find(v => v.name === b.carType);
                  const isOverdue = b.type === 'Car Rental' && !b.returnConfirmed && b.returnDate && b.returnTime && new Date() > new Date(`${b.returnDate}T${b.returnTime}`);
                  const clientName = b.name || b.guestName;
                  const clientEmail = b.email;
                  
                  return (
                    <tr 
                      key={i} 
                      className={`border-b last:border-0 hover:bg-gray-50 transition-all duration-300 ${
                        isOverdue ? 'bg-red-50' : i % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <td className="py-6 px-6 align-middle font-semibold">{startIndex + i + 1}</td>
                      <td className="py-6 px-6 align-middle">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold gap-1 ${
                          b.type === 'Car Rental' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {b.type === 'Car Rental' ? <FaCar className="text-blue-500" /> : <FaHotel className="text-orange-500" />}
                          {b.type}
                        </span>
                      </td>
                      <td className="py-6 px-6 align-middle">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                            b.type === 'Car Rental' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {getInitials(clientName)}
                          </div>
                          <div>
                            <div className="font-semibold">{clientName}</div>
                            {clientEmail && <div className="text-xs text-gray-500">{clientEmail}</div>}
                            {b.nationality && <div className="text-xs text-gray-500">{b.nationality}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-6 align-middle">
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-gray-400" />
                          <span>{b.phone}</span>
                        </div>
                      </td>
                      <td className="py-6 px-6 align-middle">
                        {b.type === 'Car Rental' ? (
                          <div className="flex items-center gap-2">
                            {vehicleList.filter(v => v.name === b.carType && v.image).map((v, idx) => (
                              <img key={idx} src={v.image} alt={v.name} className="w-16 h-12 object-contain rounded shadow" />
                            ))}
                            <div>
                              <div className="font-semibold">{b.carType}</div>
                              <div className="text-xs text-gray-400">{vehicle?.type}</div>
                              <div className="text-xs text-gray-500">{b.rentalDays || 1} day(s)</div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-semibold">{b.roomType} Room</div>
                            <div className="text-xs text-gray-400">{b.guests} guest(s)</div>
                            {b.specialRequests && <div className="text-xs text-gray-500">Special requests</div>}
                          </div>
                        )}
                      </td>
                      <td className="py-6 px-6 align-middle">
                        {b.type === 'Car Rental' ? (
                          <div>
                            <div className="text-xs text-gray-500">Pickup: {b.pickupDate} {b.pickupTime}</div>
                            <div className="text-xs text-gray-500">Return: {b.returnDate} {b.returnTime || '-'}</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-xs text-gray-500">Check-in: {b.checkInDate}</div>
                            <div className="text-xs text-gray-500">Check-out: {b.checkOutDate}</div>
                          </div>
                        )}
                      </td>
                      <td className="py-6 px-6 align-middle">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold gap-1
                          ${b.status === 'Completed' || b.returnConfirmed ? 'bg-green-100 text-green-800' : 
                            isOverdue ? 'bg-red-200 text-red-800' : 
                            b.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'}`}
                        >
                          {b.status === 'Completed' || b.returnConfirmed ? <FaCheck className="text-green-500" /> : 
                           isOverdue ? <FaClock className="text-red-500" /> : 
                           b.status === 'Confirmed' ? <FaCheck className="text-blue-500" /> :
                           <FaClock className="text-yellow-500" />}
                          {b.status === 'Completed' || b.returnConfirmed ? 'Completed' : 
                           isOverdue ? 'Overdue' : 
                           b.status === 'Confirmed' ? 'Confirmed' :
                           b.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-6 px-6 align-middle">
                          <div className="flex flex-wrap gap-2 mt-2">
                            <button
                              title="Confirm Return"
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-all duration-300 hover:scale-110 shadow-sm"
                              onClick={e => { e.stopPropagation(); setShowConfirm({index: startIndex + i, open: true}); setFullTankChecked(false); }}
                            >
                              <FaCheck />
                            </button>
                            <button
                              title="Extend Rental"
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-all duration-300 hover:scale-110 shadow-sm"
                              onClick={e => { e.stopPropagation(); setShowExtend({index: startIndex + i, open: true}); }}
                            >
                              <FaEdit />
                            </button>
                            <button
                              title="Send WhatsApp"
                              className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs transition-all duration-300 hover:scale-110 shadow-sm"
                              onClick={e => { e.stopPropagation(); window.open(`https://wa.me/${b.phone.replace(/\D/g, '')}?text=Hello ${clientName}, regarding your ${b.type.toLowerCase()}...`, '_blank'); }}
                            >
                              <FaWhatsapp />
                            </button>
                            <button
                              title="Call"
                              className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-all duration-300 hover:scale-110 shadow-sm"
                              onClick={e => { e.stopPropagation(); window.open(`tel:${b.phone}`, '_blank'); }}
                            >
                              <FaPhone />
                            </button>
                          </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredBookings.length}
            itemsPerPage={itemsPerPage}
            showItemsPerPage={true}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </main>

      {/* Confirm Return Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 animate-scale-in">
            <h3 className="text-xl font-bold mb-4">Confirm Return</h3>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={fullTankChecked}
                  onChange={(e) => setFullTankChecked(e.target.checked)}
                  className="rounded"
                />
                <span>Full tank confirmed</span>
              </label>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  // Optimistically update local state
                  const updatedBookings = [...bookings];
                  updatedBookings[showConfirm.index].returnConfirmed = true;
                  updatedBookings[showConfirm.index].status = 'Completed';
                  setBookings(updatedBookings);
                  setShowConfirm(null);
                  
                  // Send return confirmation notification
                  fetch('/api/notifications/status-update', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-username': user?.username || '',
                    },
                    body: JSON.stringify({
                      booking: updatedBookings[showConfirm.index],
                      status: 'Return Confirmed'
                    })
                  }).catch(error => {
                    console.error('Error sending return confirmation notification:', error);
                  });

                  // Re-fetch bookings for consistency
                  fetchBookings();
                }}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 hover:scale-105"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-300 hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Rental Modal */}
      {showExtend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 animate-scale-in">
            <h3 className="text-xl font-bold mb-4">Extend Rental</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">New Return Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">New Return Time</label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  // Optimistically update local state if needed
                  setShowExtend(null);
                  // Re-fetch bookings for consistency
                  fetchBookings();
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105"
              >
                Extend
              </button>
              <button
                onClick={() => setShowExtend(null)}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-300 hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setShowAddVehicle(false)}>
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl" onClick={() => setShowAddVehicle(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Add New Vehicle</h2>
            <form onSubmit={handleAddVehicle} className="flex flex-col gap-2">
              <input name="name" value={vehicleForm.name} onChange={handleVehicleInput} placeholder="Name" required className="p-2 border rounded" />
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Vehicle Image</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="p-2 border rounded" />
                {uploading && <div className="text-sm text-blue-600">Uploading...</div>}
                {vehicleForm.image && (
                  <img src={vehicleForm.image} alt="Preview" className="w-32 h-20 object-contain rounded shadow mb-2" />
                )}
              </div>
              <input name="type" value={vehicleForm.type} onChange={handleVehicleInput} placeholder="Type" className="p-2 border rounded" />
              <input name="category" value={vehicleForm.category} onChange={handleVehicleInput} placeholder="Category" className="p-2 border rounded" />
              <input name="price" value={vehicleForm.price} onChange={handleVehicleInput} placeholder="Price" className="p-2 border rounded" />
              <input name="year" value={vehicleForm.year} onChange={handleVehicleInput} placeholder="Year" type="number" className="p-2 border rounded" />
              <input name="engine" value={vehicleForm.engine} onChange={handleVehicleInput} placeholder="Engine" className="p-2 border rounded" />
              <input name="mileage" value={vehicleForm.mileage} onChange={handleVehicleInput} placeholder="Mileage" className="p-2 border rounded" />
              <input name="transmission" value={vehicleForm.transmission} onChange={handleVehicleInput} placeholder="Transmission" className="p-2 border rounded" />
              <input name="fuel" value={vehicleForm.fuel} onChange={handleVehicleInput} placeholder="Fuel" className="p-2 border rounded" />
              <input name="capacity" value={vehicleForm.capacity} onChange={handleVehicleInput} placeholder="Capacity" className="p-2 border rounded" />
              <input name="doors" value={vehicleForm.doors} onChange={handleVehicleInput} placeholder="Doors" type="number" className="p-2 border rounded" />
              <textarea name="description" value={vehicleForm.description} onChange={handleVehicleInput} placeholder="Description" className="p-2 border rounded" />
              <input name="power" value={vehicleForm.power} onChange={handleVehicleInput} placeholder="Power" className="p-2 border rounded" />
              <input name="fuelEfficiency" value={vehicleForm.fuelEfficiency} onChange={handleVehicleInput} placeholder="Fuel Efficiency" className="p-2 border rounded" />
              <label className="flex items-center gap-2">
                <input type="checkbox" name="isAvailable" checked={vehicleForm.isAvailable} onChange={handleVehicleInput} />
                Available
              </label>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Add Vehicle</button>
              {vehicleMsg && <div className="text-sm text-center text-red-600">{vehicleMsg}</div>}
            </form>
          </div>
        </div>
      )}
    </>
  );
} 