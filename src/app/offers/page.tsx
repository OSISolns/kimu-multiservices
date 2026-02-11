'use client'
import Link from 'next/link'
import Image from 'next/image'
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCar,
  FaTaxi,
  FaPlane,
  FaHotel,
  FaHandshake,
  FaSearch,
  FaFilter,
  FaStar,
  FaUsers,
  FaCog,
  FaGasPump,
  FaCalendar,
  FaRoad,
  FaEye
} from 'react-icons/fa'
import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import CarListModal from '@/components/CarListModal'
import Auto24Integration from '@/components/auto24/Auto24Integration'

const tabs = [
  { id: 'car-rental', name: 'Car Rental', icon: FaCar, color: 'blue' },
  { id: 'taxi', name: 'Taxi Services', icon: FaTaxi, color: 'yellow' },
  { id: 'airport', name: 'Airport Transfers', icon: FaPlane, color: 'green' },
  { id: 'hotel', name: 'Hotel Accommodation', icon: FaHotel, color: 'orange' },
  { id: 'sales', name: 'Automotive Sales', icon: FaHandshake, color: 'purple' },
];

function getActiveTabClass(color: string) {
  switch (color) {
    case 'blue': return 'bg-blue-500';
    case 'yellow': return 'bg-yellow-500';
    case 'green': return 'bg-green-500';
    case 'orange': return 'bg-orange-500';
    case 'purple': return 'bg-purple-500';
    default: return 'bg-blue-500';
  }
}

// Separate component to handle search params
function TabSelector({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.some(t => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams, setActiveTab]);

  return null;
}

function OffersContent() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('car-rental');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [selectedTransmission, setSelectedTransmission] = useState('');
  const [selectedFuelType, setSelectedFuelType] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Modal state
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Client-side rendering state
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch vehicles
  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {

        setVehicles(data);
      })
      .catch(err => {
        console.error('Error fetching vehicles:', err);
      });
  }, []);

  // Group vehicles by model (brand + name)
  const groupedVehicles = useMemo(() => {
    const groups: { [key: string]: any[] } = {};

    vehicles.forEach(vehicle => {
      // Create a unique key for each model (brand + name combination)
      const modelKey = `${vehicle.name}`;

      if (!groups[modelKey]) {
        groups[modelKey] = [];
      }
      groups[modelKey].push(vehicle);
    });

    // Convert to array and add metadata
    return Object.entries(groups).map(([modelKey, cars]) => {
      const firstCar = cars[0];
      // In this schema, one record represents a model with a quantity count
      const totalCars = typeof firstCar.quantity === 'number' ? firstCar.quantity : cars.length;
      const availableCarsCount = firstCar.isAvailable ? totalCars : 0;

      return {
        modelKey,
        modelName: firstCar.name,
        category: firstCar.category,
        type: firstCar.type,
        price: firstCar.price,
        year: firstCar.year,
        image: firstCar.image,
        description: firstCar.description,
        transmission: firstCar.transmission,
        fuel: firstCar.fuel,
        totalCars,
        availableCars: availableCarsCount,
        cars: cars, // Underlying records fetched for this model
        isAvailable: availableCarsCount > 0
      };
    });
  }, [vehicles]);

  // Filter and sort grouped vehicles
  const filteredVehicles = useMemo(() => {
    let filtered = groupedVehicles.filter(v => v.isAvailable);

    if (searchTerm) {
      filtered = filtered.filter(v =>
        v.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) filtered = filtered.filter(v => v.category === selectedCategory);
    if (selectedType) filtered = filtered.filter(v => v.type === selectedType);
    if (selectedTransmission) filtered = filtered.filter(v => v.transmission === selectedTransmission);
    if (selectedFuelType) filtered = filtered.filter(v => v.fuel === selectedFuelType);

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'price':
          aValue = parseInt(a.price.replace(/[^\d]/g, '')) || 0;
          bValue = parseInt(b.price.replace(/[^\d]/g, '')) || 0;
          break;
        case 'year': aValue = a.year; bValue = b.year; break;
        case 'availableCars': aValue = a.availableCars; bValue = b.availableCars; break;
        default: aValue = a.modelName.toLowerCase(); bValue = b.modelName.toLowerCase();
      }
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    return filtered;
  }, [groupedVehicles, searchTerm, selectedCategory, selectedType, selectedTransmission, selectedFuelType, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedType, selectedTransmission, selectedFuelType, sortBy, sortOrder]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedType('');
    setPriceRange({ min: 0, max: 1000000 });
    setSelectedTransmission('');
    setSelectedFuelType('');
    setSortBy('name');
    setSortOrder('asc');
  }, []);

  // Modal handlers
  const openModelModal = useCallback((model: any) => {
    setSelectedModel(model);
    setIsModalOpen(true);
  }, []);

  const closeModelModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedModel(null);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'car-rental':
        return (
          <div>
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-3xl font-bold text-blue-900">Available <span className="text-orange-500">Cars</span></h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <FaFilter className="text-sm" />
                    {showFilters ? 'Hide' : 'Show'} Filters
                  </button>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="year">Year</option>
                    <option value="availableCars">Available Cars</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-2 py-2 text-gray-500 hover:text-gray-700"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All Categories</option>
                    <option value="Economy">Economy</option>
                    <option value="Compact">Compact</option>
                    <option value="SUV">SUV</option>
                    <option value="Luxury">Luxury</option>
                  </select>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Van">Van</option>
                  </select>

                  <select
                    value={selectedTransmission}
                    onChange={(e) => setSelectedTransmission(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All Transmissions</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>

                  <select
                    value={selectedFuelType}
                    onChange={(e) => setSelectedFuelType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All Fuel Types</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>

                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              <div className="text-center text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredVehicles.length)} of {filteredVehicles.length} car models
              </div>
            </div>

            {/* Vehicles Grid */}
            {filteredVehicles.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCar className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No car models found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {currentVehicles.map((model) => (
                  <div key={model.modelKey} className="bg-white rounded-3xl shadow-xl border border-blue-50 hover:scale-105 transition-transform duration-300">
                    <div className="relative h-56 w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-white rounded-t-3xl">
                      <Image
                        src={model.image}
                        alt={model.modelName}
                        fill
                        className="object-contain p-6"
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {model.category}
                      </span>
                      <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {model.availableCars} Available
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-blue-900">{model.modelName}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold text-orange-500">{model.price}</span>
                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-semibold">
                          {model.type}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4 text-sm line-clamp-2">{model.description}</p>

                      <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <FaCalendar className="text-gray-400" />
                          <span>{model.year}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaCar className="text-gray-400" />
                          <span>{model.totalCars} in fleet</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openModelModal(model)}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <FaEye className="text-sm" />
                          View {model.availableCars} Cars
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        );

      case 'taxi':
        return (
          <div className="text-center py-16">
            <div className="max-w-4xl mx-auto">
              {/* Hero Section with Shimmer */}
              <div className="relative mb-12">
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                  <FaTaxi className="text-5xl text-white animate-bounce" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent animate-pulse rounded-full blur-xl"></div>
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Premium Taxi Services
              </h2>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                Professional taxi services with experienced drivers. Available 24/7 for your convenience.
              </p>

              {/* Service Cards with Animations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-all duration-500"></div>
                  <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-yellow-100 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <FaMapMarkerAlt className="text-2xl text-yellow-600" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-900">City Rides</h3>
                    <p className="text-gray-600 leading-relaxed">Quick and reliable city transportation with GPS tracking</p>
                    <div className="mt-4 flex items-center text-yellow-600 text-sm">
                      <span className="animate-pulse">🚗</span>
                      <span className="ml-2">Available Now</span>
                    </div>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-all duration-500"></div>
                  <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-blue-100 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <FaPlane className="text-2xl text-blue-600" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-900">Airport Transfer</h3>
                    <p className="text-gray-600 leading-relaxed">Comfortable airport pickups and drop-offs with flight monitoring</p>
                    <div className="mt-4 flex items-center text-blue-600 text-sm">
                      <span className="animate-pulse">✈️</span>
                      <span className="ml-2">24/7 Service</span>
                    </div>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-all duration-500"></div>
                  <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-green-100 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <FaRoad className="text-2xl text-green-600" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-900">Long Distance</h3>
                    <p className="text-gray-600 leading-relaxed">Inter-city travel with comfort and professional drivers</p>
                    <div className="mt-4 flex items-center text-green-600 text-sm">
                      <span className="animate-pulse">🛣️</span>
                      <span className="ml-2">Premium Service</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button with Shimmer */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Link
                  href="/contact"
                  className="relative bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 inline-flex items-center gap-3"
                >
                  <span>Book Taxi Service</span>
                  <FaTaxi className="text-xl animate-bounce" />
                </Link>
              </div>
            </div>
          </div>
        );

      case 'airport':
        return (
          <div className="text-center py-16">
            <div className="max-w-4xl mx-auto">
              {/* Hero Section with Floating Plane Animation */}
              <div className="relative mb-12">
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                  <FaPlane className="text-5xl text-white animate-bounce" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200/30 to-transparent animate-pulse rounded-full blur-xl"></div>

                {/* Floating Elements */}
                <div className="absolute top-0 left-1/4 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute top-8 right-1/4 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-16 left-1/3 w-2 h-2 bg-teal-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }}></div>
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Airport Transfer Services
              </h2>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                Seamless airport transportation with flight tracking and professional service.
              </p>

              {/* Service Cards with Hover Effects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-all duration-500"></div>
                  <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-green-100 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <FaCalendarAlt className="text-2xl text-green-600" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-900">Airport Pickup</h3>
                    <p className="text-gray-600 leading-relaxed">Meet & greet service with flight monitoring and real-time updates</p>
                    <div className="mt-4 flex items-center text-green-600 text-sm">
                      <span className="animate-pulse">🛬</span>
                      <span className="ml-2">Flight Tracking</span>
                    </div>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-all duration-500"></div>
                  <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-teal-100 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <FaMapMarkerAlt className="text-2xl text-teal-600" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-900">Airport Drop-off</h3>
                    <p className="text-gray-600 leading-relaxed">Reliable departure transportation with punctual service</p>
                    <div className="mt-4 flex items-center text-teal-600 text-sm">
                      <span className="animate-pulse">🛫</span>
                      <span className="ml-2">On-Time Guarantee</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button with Shimmer */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Link
                  href="/contact"
                  className="relative bg-gradient-to-r from-green-500 to-emerald-500 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 inline-flex items-center gap-3"
                >
                  <span>Book Airport Transfer</span>
                  <FaPlane className="text-xl animate-bounce" />
                </Link>
              </div>
            </div>
          </div>
        );

      case 'hotel':
        return (
          <div className="text-center py-16">
            <div className="max-w-6xl mx-auto">
              {/* Hero Section with Glowing Effect */}
              <div className="relative mb-12">
                <div className="w-32 h-32 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                  <FaHotel className="text-5xl text-white animate-bounce" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200/30 to-transparent animate-pulse rounded-full blur-xl"></div>

                {/* Glowing Orbs */}
                <div className="absolute top-0 left-1/4 w-6 h-6 bg-orange-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute top-8 right-1/4 w-4 h-4 bg-red-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute top-16 left-1/3 w-5 h-5 bg-pink-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.7s' }}></div>
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Hotel Accommodation
              </h2>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                Partner hotels and accommodation options for your stay in Rwanda.
              </p>

              {/* Hotel Categories with Staggered Animations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="group relative transform transition-all duration-700 hover:scale-105" style={{ animationDelay: '0.1s' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-all duration-500"></div>
                  <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-orange-100 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">🏨</span>
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-900">Budget Hotels</h3>
                    <p className="text-gray-600 leading-relaxed">Comfortable and affordable options with essential amenities</p>
                    <div className="mt-4 flex items-center text-orange-600 text-sm">
                      <span className="animate-pulse">💰</span>
                      <span className="ml-2">Best Value</span>
                    </div>
                    <div className="mt-2 flex items-center text-orange-600 text-sm">
                      <span className="animate-pulse">⭐</span>
                      <span className="ml-2">3-Star Quality</span>
                    </div>
                  </div>
                </div>

                <div className="group relative transform transition-all duration-700 hover:scale-105" style={{ animationDelay: '0.2s' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-all duration-500"></div>
                  <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-red-100 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">🏢</span>
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-900">Mid-Range Hotels</h3>
                    <p className="text-gray-600 leading-relaxed">Quality accommodation with premium amenities and services</p>
                    <div className="mt-4 flex items-center text-red-600 text-sm">
                      <span className="animate-pulse">✨</span>
                      <span className="ml-2">Premium Features</span>
                    </div>
                    <div className="mt-2 flex items-center text-red-600 text-sm">
                      <span className="animate-pulse">⭐</span>
                      <span className="ml-2">4-Star Quality</span>
                    </div>
                  </div>
                </div>

                <div className="group relative transform transition-all duration-700 hover:scale-105" style={{ animationDelay: '0.3s' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-all duration-500"></div>
                  <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-pink-100 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">🏰</span>
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-900">Luxury Hotels</h3>
                    <p className="text-gray-600 leading-relaxed">Premium hotels and resorts with world-class amenities</p>
                    <div className="mt-4 flex items-center text-pink-600 text-sm">
                      <span className="animate-pulse">👑</span>
                      <span className="ml-2">Luxury Experience</span>
                    </div>
                    <div className="mt-2 flex items-center text-pink-600 text-sm">
                      <span className="animate-pulse">⭐</span>
                      <span className="ml-2">5-Star Quality</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button with Shimmer */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Link
                  href="/contact"
                  className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 inline-flex items-center gap-3"
                >
                  <span>Book Hotel</span>
                  <FaHotel className="text-xl animate-bounce" />
                </Link>
              </div>
            </div>
          </div>
        );

      case 'sales':
        return <Auto24Integration />;

      default:
        return (
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Select a Service</h2>
            <p className="text-lg text-gray-600">Choose a service from the tabs above to get started.</p>
          </div>
        );
    }
  };

  // Show loading state during hydration to prevent mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50">
        <section className="relative flex flex-col md:flex-row items-center justify-between px-4 py-20 md:py-32 max-w-7xl mx-auto">
          <div className="max-w-xl z-10">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-blue-900 leading-tight">
              Discover Our <span className="text-orange-500">Services</span>
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Choose from a wide range of premium services for every occasion. Professional service and the best rates in Rwanda.
            </p>
            <div className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg">
              Book Now
            </div>
          </div>
          <div className="flex-1 flex justify-end items-center mt-12 md:mt-0">
            <div className="w-[500px] h-[320px] bg-gray-200 rounded-2xl animate-pulse"></div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-8">
            <div className="flex flex-wrap justify-center gap-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <div
                    key={tab.id}
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold min-w-[160px] bg-gray-100 text-gray-400"
                  >
                    <Icon className="text-lg" />
                    <span className="whitespace-nowrap">{tab.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="min-h-[600px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading services...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center justify-between px-4 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="max-w-xl z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-blue-900 leading-tight">
            Discover Our <span className="text-orange-500">Services</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Choose from a wide range of premium services for every occasion. Professional service and the best rates in Rwanda.
          </p>
          <Link href="/rent-a-car" className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg">
            Book Now
          </Link>
        </div>
        <div className="flex-1 flex justify-end items-center mt-12 md:mt-0">
          <Image
            src="/vehicles/TXL.png"
            alt="Hero Car"
            width={500}
            height={320}
            className="object-contain rounded-2xl shadow-2xl border-4 border-white"
            priority
          />
        </div>
      </section>

      {/* Service Tabs */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 min-w-[160px] ${isActive
                    ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-100 hover:shadow-md'
                    }`}
                >
                  <Icon className="text-lg flex-shrink-0" />
                  <span className="whitespace-nowrap">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">


          {renderTabContent()}
        </div>
      </section>

      {/* Car List Modal */}
      {selectedModel && (
        <CarListModal
          isOpen={isModalOpen}
          onClose={closeModelModal}
          modelName={selectedModel.modelName}
          cars={selectedModel.cars}
        />
      )}

      {/* Tab Selector in Suspense */}
      <Suspense fallback={null}>
        <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
      </Suspense>
    </div>
  )
}

export default function Offers() {
  return <OffersContent />;
}
