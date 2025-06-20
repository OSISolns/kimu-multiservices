'use client'
import Link from 'next/link'
import Image from 'next/image'
import { vehicles, getVehiclesWithAvailability } from '../../data/vehicles'
import { FaMapMarkerAlt, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaCar, FaTaxi, FaPlane, FaHotel, FaHandshake } from 'react-icons/fa'
import { useState, useEffect, useRef } from 'react'

function getCarSpecs(vehicleId: number) {
  return {
    seats: [4, 5, 6, 7][vehicleId % 4],
    transmission: ['Automatic', 'Manual'][vehicleId % 2],
    fuelType: ['Petrol', 'Diesel', 'Hybrid', 'Full-Electric'][vehicleId % 3],
    year: 2020 + (vehicleId % 4),
    mileage: 10000 + (vehicleId * 3500) % 50000,
    engine: ['1.6L', '2.0L', '2.5L', '3.0L'][vehicleId % 4],
    power: 120 + (vehicleId % 4) * 30,
    fuelEfficiency: 15 + (vehicleId % 5),
  };
}
function getFeatures(vehicleId: number) {
  const allFeatures = ['AC', 'Bluetooth', 'GPS', 'Backup Camera', 'Leather Seats', 'Sunroof', 'Cruise Control', 'USB Charging'];
  return allFeatures.slice(0, 3 + (vehicleId % 4));
}
function getRating(vehicleId: number) {
  return (3.5 + (vehicleId % 15) * 0.1).toFixed(1);
}
function getReviews(vehicleId: number) {
  return 12 + (vehicleId * 7) % 40;
}

function CarDetailsModal({ vehicle, onClose }: { vehicle: any, onClose: () => void }) {
  if (!vehicle) return null;
  const specs = getCarSpecs(vehicle.id);
  const features = getFeatures(vehicle.id);
  const rating = getRating(vehicle.id);
  const reviews = getReviews(vehicle.id);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-2 p-4 sm:p-8 relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Close details"
        >
          ×
        </button>
        <div className="flex flex-col items-center">
          <div className="w-full h-40 sm:h-56 relative mb-4">
            <Image
              src={vehicle.image}
              alt={vehicle.name}
              fill
              className="object-contain rounded-xl bg-gradient-to-br from-blue-50 to-white"
              sizes="(max-width: 640px) 100vw, 400px"
            />
          </div>
          <h2 className="text-2xl font-bold text-blue-900 mb-2 text-center">{vehicle.name}</h2>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-semibold">{vehicle.type}</span>
            <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">{vehicle.category}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-500 text-lg">★</span>
            <span className="font-semibold text-gray-700">{rating}</span>
            <span className="text-xs text-gray-500">({reviews} reviews)</span>
          </div>
          <div className="text-xl font-bold text-orange-600 mb-2">{vehicle.price}</div>
          <div className="grid grid-cols-2 gap-3 w-full mb-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-600">{specs.seats}</div>
              <div className="text-xs text-gray-500">Seats</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-blue-600">{specs.transmission}</div>
              <div className="text-xs text-gray-500">Transmission</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-blue-600">{specs.fuelType}</div>
              <div className="text-xs text-gray-500">Fuel</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-blue-600">{specs.year}</div>
              <div className="text-xs text-gray-500">Year</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-blue-600">{specs.engine}</div>
              <div className="text-xs text-gray-500">Engine</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-blue-600">{specs.mileage.toLocaleString()} km</div>
              <div className="text-xs text-gray-500">Mileage</div>
            </div>
          </div>
          <div className="w-full mb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">Features:</div>
            <div className="flex flex-wrap gap-2">
              {features.map((feature, idx) => (
                <span key={idx} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                  {feature}
                </span>
              ))}
            </div>
          </div>
          <p className="text-gray-700 text-center mb-4 text-sm">{vehicle.description}</p>
          <div className="flex flex-col gap-2 w-full">
            <Link href={`/rent-a-car?vehicle=${vehicle.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center">Rent This Car</Link>
            <button onClick={onClose} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const tabs = [
  { id: 'car-rental', name: 'Car Rental', icon: FaCar, color: 'blue' },
  { id: 'taxi', name: 'Taxi Services', icon: FaTaxi, color: 'yellow' },
  { id: 'airport', name: 'Airport Transfers', icon: FaPlane, color: 'green' },
  { id: 'hotel', name: 'Hotel Accommodation', icon: FaHotel, color: 'orange' },
  { id: 'sales', name: 'Automotive Sales', icon: FaHandshake, color: 'purple' },
];

export default function Offers() {
  const [vehiclesWithAvailability, setVehiclesWithAvailability] = useState<any[]>([]);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [activeTab, setActiveTab] = useState('car-rental');
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        const vehiclesWithAvail = getVehiclesWithAvailability(data);
        setVehiclesWithAvailability(vehiclesWithAvail);
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
        setVehiclesWithAvailability(vehicles.map(v => ({ ...v, isAvailable: true })));
      });
  }, []);

  const availableVehicles = vehiclesWithAvailability.filter(v => v.isAvailable);
  
  // Pagination logic
  const totalPages = Math.ceil(availableVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = availableVehicles.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'car-rental':
        return (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-blue-900">Available <span className="text-orange-500">Cars</span></h2>
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, availableVehicles.length)} of {availableVehicles.length} vehicles
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {currentVehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-3xl shadow-xl border border-blue-50 flex flex-col hover:scale-105 transition-transform duration-300 relative">
                  <div className="relative h-56 w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-white rounded-t-3xl">
                    <Image
                      src={vehicle.image}
                      alt={vehicle.name}
                      fill
                      className="object-contain p-6"
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">{vehicle.category}</span>
                    <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Available</span>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-extrabold mb-1 text-blue-900">{vehicle.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-orange-500">{vehicle.price}</span>
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-semibold">{vehicle.type}</span>
                    </div>
                    <p className="text-gray-600 mb-4 flex-1 text-sm">{vehicle.description}</p>
                    <div className="flex gap-2 mt-auto">
                      <Link href={`/rent-a-car?vehicle=${vehicle.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm w-full text-center">
                        Rent Car
                      </Link>
                      <button
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm w-full"
                        onClick={() => setSelectedCar(vehicle)}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronLeft className="text-sm" />
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <FaChevronRight className="text-sm" />
                </button>
              </div>
            )}
          </div>
        );

      case 'taxi':
        return (
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaTaxi className="text-4xl text-yellow-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Premium Taxi Services</h2>
              <p className="text-lg text-gray-600 mb-8">
                Professional taxi services with experienced drivers. Available 24/7 for your convenience.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-bold text-lg mb-2">City Rides</h3>
                  <p className="text-gray-600 text-sm">Quick and reliable city transportation</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Airport Transfer</h3>
                  <p className="text-gray-600 text-sm">Comfortable airport pickups and drop-offs</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Long Distance</h3>
                  <p className="text-gray-600 text-sm">Inter-city travel with comfort</p>
                </div>
              </div>
              <Link href="/contact" className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
                Book Taxi Service
              </Link>
            </div>
          </div>
        );

      case 'airport':
        return (
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaPlane className="text-4xl text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Airport Transfer Services</h2>
              <p className="text-lg text-gray-600 mb-8">
                Seamless airport transportation with flight tracking and professional service.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Airport Pickup</h3>
                  <p className="text-gray-600 text-sm">Meet & greet service with flight monitoring</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Airport Drop-off</h3>
                  <p className="text-gray-600 text-sm">Reliable departure transportation</p>
                </div>
              </div>
              <Link href="/contact" className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                Book Airport Transfer
              </Link>
            </div>
          </div>
        );

      case 'hotel':
        return (
          <div className="text-center py-16">
            <div className="max-w-4xl mx-auto">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHotel className="text-4xl text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Hotel Accommodation</h2>
              <p className="text-lg text-gray-600 mb-8">
                Partner hotels and accommodation options for your stay in Rwanda.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Budget Hotels</h3>
                  <p className="text-gray-600 text-sm">Comfortable and affordable options</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Mid-Range Hotels</h3>
                  <p className="text-gray-600 text-sm">Quality accommodation with amenities</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Luxury Hotels</h3>
                  <p className="text-gray-600 text-sm">Premium hotels and resorts</p>
                </div>
              </div>
              
              {/* Hotel Booking Form */}
              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Book Hotel Accommodation</h3>
                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  setSubmitStatus('idle');
                  setSubmitMessage('');
                  
                  const formData = new FormData(e.currentTarget);
                  
                  // Validate required fields
                  const guestName = formData.get('guestName')?.toString().trim();
                  const email = formData.get('email')?.toString().trim();
                  const phone = formData.get('phone')?.toString().trim();
                  const checkInDate = formData.get('checkInDate')?.toString();
                  const checkOutDate = formData.get('checkOutDate')?.toString();
                  const roomType = formData.get('roomType')?.toString();
                  const guests = formData.get('guests')?.toString();
                  const specialRequests = formData.get('specialRequests')?.toString().trim() || '';
                  
                  // Check if all required fields are filled
                  if (!guestName || !email || !phone || !checkInDate || !checkOutDate || !roomType || !guests) {
                    setSubmitStatus('error');
                    setSubmitMessage('Please fill in all required fields.');
                    setIsSubmitting(false);
                    return;
                  }
                  
                  // Validate email format
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(email)) {
                    setSubmitStatus('error');
                    setSubmitMessage('Please enter a valid email address.');
                    setIsSubmitting(false);
                    return;
                  }
                  
                  // Validate check-out date is after check-in date
                  if (new Date(checkOutDate) <= new Date(checkInDate)) {
                    setSubmitStatus('error');
                    setSubmitMessage('Check-out date must be after check-in date.');
                    setIsSubmitting(false);
                    return;
                  }
                  
                  const bookingData = {
                    type: 'Hotel',
                    guestName,
                    email,
                    phone,
                    checkInDate,
                    checkOutDate,
                    roomType,
                    guests,
                    specialRequests,
                    status: 'Pending',
                    createdAt: new Date().toISOString()
                  };
                  
                  // Send booking data to API
                  fetch('/api/bookings', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookingData),
                  })
                  .then(response => {
                    if (!response.ok) {
                      return response.json().then(errorData => {
                        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                      });
                    }
                    return response.json();
                  })
                  .then(data => {
                    setSubmitStatus('success');
                    setSubmitMessage('Hotel booking submitted successfully! We will contact you soon.');
                    formRef.current?.reset();
                    
                    // Clear success message after 5 seconds
                    setTimeout(() => {
                      setSubmitStatus('idle');
                      setSubmitMessage('');
                    }, 5000);
                  })
                  .catch(error => {
                    console.error('Error submitting booking:', error);
                    setSubmitStatus('error');
                    setSubmitMessage(`Error submitting booking: ${error.message}. Please try again.`);
                  })
                  .finally(() => {
                    setIsSubmitting(false);
                  });
                }} ref={formRef}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Guest Name *</label>
                      <input
                        type="text"
                        name="guestName"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter guest name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests *</label>
                      <select
                        name="guests"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Select guests</option>
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="3">3 Guests</option>
                        <option value="4">4 Guests</option>
                        <option value="5+">5+ Guests</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date *</label>
                      <input
                        type="date"
                        name="checkInDate"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date *</label>
                      <input
                        type="date"
                        name="checkOutDate"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room Type *</label>
                    <select
                      name="roomType"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select room type</option>
                      <option value="Budget">Budget Room</option>
                      <option value="Mid-Range">Mid-Range Room</option>
                      <option value="Luxury">Luxury Room</option>
                      <option value="Suite">Suite</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                    <textarea
                      name="specialRequests"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Any special requests or preferences..."
                    ></textarea>
                  </div>
                  
                  {/* Status Messages */}
                  {submitStatus === 'success' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">{submitMessage}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {submitStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-red-800">{submitMessage}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      isSubmitting 
                        ? 'bg-orange-400 text-white cursor-not-allowed' 
                        : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-105 shadow-lg'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Hotel Booking'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      case 'sales':
        return (
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHandshake className="text-4xl text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Automotive Sales & Consultancy</h2>
              <p className="text-lg text-gray-600 mb-8">
                Professional vehicle sales services with expert guidance and after-sales support.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Vehicle Sales</h3>
                  <p className="text-gray-600 text-sm">Quality used and new vehicles</p>
                  <p className="text-purple-600 font-bold mt-2">Competitive Prices</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Consultancy</h3>
                  <p className="text-gray-600 text-sm">Expert advice on vehicle selection</p>
                  <p className="text-purple-600 font-bold mt-2">Free Consultation</p>
                </div>
              </div>
              <Link href="/contact" className="bg-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors">
                Get Consultation
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center justify-between px-4 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="max-w-xl z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-blue-900 leading-tight drop-shadow-lg">
            Discover Our <span className="text-orange-500">Services</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Choose from a wide range of premium services for every occasion. Flexible terms, professional service, and the best rates in Rwanda.
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

      {/* Search Bar (UI only) */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter pickup location"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date & Time</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="datetime-local"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Tabs */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                    activeTab === tab.id
                      ? `bg-${tab.color}-500 text-white shadow-lg`
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="text-lg" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {renderTabContent()}
        </div>
        
        {selectedCar && <CarDetailsModal vehicle={selectedCar} onClose={() => setSelectedCar(null)} />}
      </section>
    </div>
  )
} 