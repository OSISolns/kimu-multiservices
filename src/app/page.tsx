'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef, useMemo } from 'react'
import AnimatedSection from '../components/AnimatedSection'
import { FaTaxi, FaCar, FaPlane, FaShieldAlt, FaStar, FaClock, FaUsers, FaCheckCircle } from 'react-icons/fa'

export default function Home() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedCar, setSelectedCar] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [vehiclesWithAvailability, setVehiclesWithAvailability] = useState<any[]>([])
  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showDealBanner, setShowDealBanner] = useState(true);

  const featuredDeal = {
    title: 'Drive Now, Pay Later with Auto24 Rwanda',
    description: 'Own a Toyota Corolla Levin or BYD EV today with only 20% deposit. Limited slots available.',
    link: '/offers?tab=sales',
  };

  // Ensure we're on the client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Group vehicles by brand
  const brandGroups = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    if (Array.isArray(vehicles)) {
      vehicles.forEach(vehicle => {
        const brand = vehicle.name?.split(' ')[0] || 'Other';
        if (!groups[brand]) {
          groups[brand] = [];
        }
        groups[brand].push(vehicle);
      });
    }
    return Object.entries(groups).map(([brand, vehicles]) => ({
      brand,
      vehicles,
      totalVehicles: vehicles.length,
      featuredVehicle: vehicles[0], // Use first vehicle as representative
      priceRange: {
        min: Math.min(...vehicles.map(v => parseInt(v.price) || 0)),
        max: Math.max(...vehicles.map(v => parseInt(v.price) || 0))
      }
    }));
  }, [vehicles]);

  const [currentBrandIndex, setCurrentBrandIndex] = useState(0);

  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        setVehicles(Array.isArray(data) ? data : []);
        setVehiclesWithAvailability(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Error fetching vehicles:', err);
        setVehicles([]);
        setVehiclesWithAvailability([]);
      });
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
      });
  }, []);

  useEffect(() => {
    // Auto-advance slideshow
    if (isAutoPlaying && brandGroups.length > 1) {
      autoPlayIntervalRef.current = setInterval(() => {
        setCurrentBrandIndex(prevIndex => 
          prevIndex < brandGroups.length - 1 ? prevIndex + 1 : 0
        );
      }, 5000); // Change brand every 5 seconds
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [isAutoPlaying, brandGroups.length]);

  // Pause auto-play when user hovers over carousel
  const handleCarouselHover = () => {
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
  };

  // Resume auto-play when user leaves carousel
  const handleCarouselLeave = () => {
    if (isAutoPlaying && brandGroups.length > 1) {
      autoPlayIntervalRef.current = setInterval(() => {
        setCurrentBrandIndex(prevIndex => 
          prevIndex < brandGroups.length - 1 ? prevIndex + 1 : 0
        );
      }, 5000);
    }
  };

  // Manual navigation with auto-play reset
  const goToNextBrand = () => {
    const newIndex = currentBrandIndex < brandGroups.length - 1 ? currentBrandIndex + 1 : 0;
    setCurrentBrandIndex(newIndex);
    // Reset auto-play timer
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
    }
    if (isAutoPlaying && brandGroups.length > 1) {
      autoPlayIntervalRef.current = setInterval(() => {
        setCurrentBrandIndex(prevIndex => 
          prevIndex < brandGroups.length - 1 ? prevIndex + 1 : 0
        );
      }, 5000);
    }
  };

  const goToPreviousBrand = () => {
    const newIndex = currentBrandIndex > 0 ? currentBrandIndex - 1 : brandGroups.length - 1;
    setCurrentBrandIndex(newIndex);
    // Reset auto-play timer
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
    }
    if (isAutoPlaying && brandGroups.length > 1) {
      autoPlayIntervalRef.current = setInterval(() => {
        setCurrentBrandIndex(prevIndex => 
          prevIndex < brandGroups.length - 1 ? prevIndex + 1 : 0
        );
      }, 5000);
    }
  };

  const goToBrand = (index: number) => {
    setCurrentBrandIndex(index);
    // Reset auto-play timer
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
    }
    if (isAutoPlaying && brandGroups.length > 1) {
      autoPlayIntervalRef.current = setInterval(() => {
        setCurrentBrandIndex(prevIndex => 
          prevIndex < brandGroups.length - 1 ? prevIndex + 1 : 0
        );
      }, 5000);
    }
  };

  // Toggle auto-play
  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
  };

  const getSpecialOffer = () => {
    const offers = [
      'Weekend Discount',
      'Long-term Rental',
      'New Customer',
      'Early Bird',
      'Corporate Rate'
    ]
    return Math.random() > 0.6 ? offers[Math.floor(Math.random() * offers.length)] : null
  }

  const getFeatures = (vehicleId: string) => {
    const allFeatures = ['AC', 'Bluetooth', 'GPS', 'Backup Camera', 'Leather Seats', 'Sunroof', 'Cruise Control', 'USB Charging']
    const numFeatures = Math.floor(Math.random() * 4) + 3
    return allFeatures.sort(() => 0.5 - Math.random()).slice(0, numFeatures)
  }

  const getDetailedFeatures = () => {
    return {
      interior: ['Leather Seats', 'Heated Seats', 'Ventilated Seats', 'Power Seats', 'Memory Seats', 'Ambient Lighting'],
      technology: ['Bluetooth', 'Apple CarPlay', 'Android Auto', 'USB Charging', 'Wireless Charging', 'WiFi Hotspot'],
      safety: ['Backup Camera', '360° Camera', 'Blind Spot Monitor', 'Lane Departure Warning', 'Forward Collision Warning', 'Adaptive Cruise Control'],
      comfort: ['Dual Zone AC', 'Climate Control', 'Sunroof', 'Panoramic Roof', 'Power Windows', 'Keyless Entry']
    }
  }

  const openCarModal = (car: any) => {
    try {
      console.log('Opening modal for car:', car)
      setSelectedCar(car)
      setIsModalOpen(true)
      document.body.style.overflow = 'hidden'
    } catch (error) {
      console.error('Error opening car modal:', error)
    }
  }

  const closeCarModal = () => {
    try {
      setIsModalOpen(false)
      setSelectedCar(null)
      document.body.style.overflow = 'unset'
    } catch (error) {
      console.error('Error closing car modal:', error)
    }
  }

  const getRating = (vehicleId: string) => {
    // Only generate random values after mounting to avoid hydration mismatch
    if (!isMounted) return '4.5';
    
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return 'N/A';
    return (Math.random() * 2 + 3).toFixed(1);
  }

  const getReviews = (vehicleId: string) => {
    // Only generate random values after mounting to avoid hydration mismatch
    if (!isMounted) return '25';
    
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return '0';
    return Math.floor(Math.random() * 50) + 10;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-gray-100 text-gray-900">
      {showDealBanner && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-4 py-3">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm uppercase tracking-widest text-white/80">Limited-Time Deal</p>
              <h2 className="text-xl font-semibold">{featuredDeal.title}</h2>
              <p className="text-sm text-white/80">{featuredDeal.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={featuredDeal.link}
                className="inline-flex items-center gap-2 bg-white/90 text-blue-700 px-4 py-2 rounded-full font-semibold hover:bg-white transition"
              >
                Explore Offer
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M12.9 4.6 11.5 6l2.1 2.1H5v2h8.6L11.5 12l1.4 1.4 4.6-4.6-4.6-4.6z" />
                </svg>
              </Link>
              <button
                className="text-white/70 hover:text-white"
                onClick={() => setShowDealBanner(false)}
                aria-label="Dismiss deal announcement"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center justify-between px-4 py-24 max-w-7xl mx-auto">
        <div className="max-w-xl z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-gray-900 leading-tight drop-shadow-lg">
            Experience Premium<br />
            <span className="text-orange-500">Transportation</span> in Rwanda
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Premium car rentals, executive taxi services, and airport transfers. Arrive in style, comfort, and safety with KIMU Transport & Multiservices.
          </p>
          <div className="flex gap-4">
            <Link href="/offers" className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg">
              View Services
            </Link>
            <Link href="/rent-a-car" className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors shadow-lg">
              Rent a Car
            </Link>
          </div>
        </div>
        <div className="flex-1 flex justify-end items-center mt-12 md:mt-0">
          <Image 
            src="/vehicles/TXL-02.png" 
            alt="Luxury Car" 
            width={1000} 
            height={700} 
            className="object-contain animate-hero-float"
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>
      </section>

      {/* Enhanced Service Highlights */}
      <section className="py-20 bg-gradient-to-br from-white via-blue-50 to-gray-100 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="text-blue-600">Premium Services</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience excellence in transportation with our comprehensive range of services designed for your comfort and convenience
            </p>
          </div>
          
          {/* Enhanced Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Premium Taxi Card */}
            <div className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate-fade-in">
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-orange-100/30 to-transparent rounded-3xl"></div>
              
              {/* Top Border Gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>
              
              {/* Card Content */}
              <div className="relative z-10 p-8">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaTaxi className="text-2xl text-orange-600" />
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                  Premium Taxi
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Executive taxi services with professional drivers for business and leisure. 24/7 availability, comfort, and safety.
                </p>
                
                {/* Features */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaShieldAlt className="text-orange-500 flex-shrink-0" />
                    <span>Professional Drivers</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaClock className="text-orange-500 flex-shrink-0" />
                    <span>24/7 Availability</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaStar className="text-orange-500 flex-shrink-0" />
                    <span>Premium Comfort</span>
                  </div>
                </div>
                
                {/* CTA Button */}
                <Link href="/offers?tab=taxi" className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <FaTaxi className="text-sm" />
                  Book Taxi
                </Link>
              </div>
            </div>

            {/* Luxury Car Rentals Card */}
            <div className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate-fade-in" style={{ animationDelay: '200ms' }}>
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-blue-100/30 to-transparent rounded-3xl"></div>
              
              {/* Top Border Gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
              
              {/* Card Content */}
              <div className="relative z-10 p-8">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaCar className="text-2xl text-blue-600" />
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  Luxury Car Rentals
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A curated fleet of luxury vehicles for self-drive or chauffeur-driven experiences. Flexible rental terms.
                </p>
                
                {/* Features */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaCar className="text-blue-500 flex-shrink-0" />
                    <span>Premium Fleet</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaUsers className="text-blue-500 flex-shrink-0" />
                    <span>Chauffeur Option</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaCheckCircle className="text-blue-500 flex-shrink-0" />
                    <span>Flexible Terms</span>
                  </div>
                </div>
                
                {/* CTA Button */}
                <Link href="/rent-a-car" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <FaCar className="text-sm" />
                  Rent Now
                </Link>
              </div>
            </div>

            {/* Airport Transfers Card */}
            <div className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate-fade-in" style={{ animationDelay: '400ms' }}>
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-green-100/30 to-transparent rounded-3xl"></div>
              
              {/* Top Border Gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-600"></div>
              
              {/* Card Content */}
              <div className="relative z-10 p-8">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaPlane className="text-2xl text-green-600" />
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                  Airport Transfers
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Seamless airport pickups and drop-offs with real-time flight tracking. Arrive or depart in style and on time.
                </p>
                
                {/* Features */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaPlane className="text-green-500 flex-shrink-0" />
                    <span>Flight Tracking</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaClock className="text-green-500 flex-shrink-0" />
                    <span>Punctual Service</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaStar className="text-green-500 flex-shrink-0" />
                    <span>Premium Experience</span>
                  </div>
                </div>
                
                {/* CTA Button */}
                <Link href="/offers?tab=airport" className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <FaPlane className="text-sm" />
                  Book Transfer
                </Link>
              </div>
          </div>
          </div>
        </div>
      </section>

      {/* Enhanced Featured Cars Section with Slideshow */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-20 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-orange-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Featured <span className="text-orange-500">Brands</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our premium fleet organized by brand. Each brand represents a collection of vehicles with different models and specifications.
            </p>
          </div>
          
          {/* Carousel Container */}
          <div className="relative" onMouseEnter={handleCarouselHover} onMouseLeave={handleCarouselLeave}>
            {/* Auto-play Controls */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200">
              <button
                onClick={toggleAutoPlay}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                  isAutoPlaying 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isAutoPlaying ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                    Pause
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Play
                  </>
                )}
              </button>
              <span className="text-xs text-gray-500">
                Auto-advance: {isAutoPlaying ? 'ON' : 'OFF'}
              </span>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={goToPreviousBrand}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg border border-gray-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
              aria-label="Previous brand"
            >
              <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToNextBrand}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg border border-gray-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
              aria-label="Next brand"
            >
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Car Display */}
            {brandGroups.length > 0 && brandGroups[currentBrandIndex] ? (
              <div className="w-full max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-700 ease-in-out group hover:shadow-3xl">
                {/* Image Section with Overlay */}
                  <div className="relative h-80 sm:h-96 bg-gradient-to-br from-blue-50 to-gray-50 overflow-hidden">
                  <Image
                      src={brandGroups[currentBrandIndex].featuredVehicle.image}
                      alt={brandGroups[currentBrandIndex].featuredVehicle.name || 'Vehicle'}
                    fill
                    className="object-contain p-8 transition-all duration-700 ease-in-out cursor-pointer hover:scale-105"
                    loading="eager"
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 80vw, 1200px"
                      onClick={() => openCarModal(brandGroups[currentBrandIndex].featuredVehicle)}
                  />
                  
                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        {brandGroups[currentBrandIndex].featuredVehicle.category}
                    </span>
                    {getSpecialOffer() && (
                      <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                        {getSpecialOffer()}
                      </span>
                    )}
                  </div>
                  
                  {/* Availability Status */}
                  <div className="absolute top-4 right-4">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                        brandGroups[currentBrandIndex].featuredVehicle?.isAvailable 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                          brandGroups[currentBrandIndex].featuredVehicle?.isAvailable ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                        {brandGroups[currentBrandIndex].featuredVehicle?.isAvailable ? 'Available' : 'Rented'}
                      </div>
                  </div>
                  
                  {/* Favorite Button */}
                  <button
                      onClick={() => {
                        const vehicleId = brandGroups[currentBrandIndex].featuredVehicle.id.toString();
                        if (favorites.has(vehicleId)) {
                          setFavorites(prev => {
                            const newFavorites = new Set(prev);
                            newFavorites.delete(vehicleId);
                            return newFavorites;
                          });
                        } else {
                          setFavorites(prev => new Set(prev).add(vehicleId));
                        }
                      }}
                      className="absolute top-4 right-16 bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 rounded-full p-2 shadow-lg transition-all duration-200 transform hover:scale-110"
                    aria-label="Add to favorites"
                  >
                      <svg width="20" height="20" fill={favorites.has(brandGroups[currentBrandIndex].featuredVehicle.id.toString()) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
                
                {/* Content Section */}
                  <div className="p-6 sm:p-8">
                  {/* Title and Rating */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-900 leading-tight mb-2">
                          {brandGroups[currentBrandIndex].brand}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            {brandGroups[currentBrandIndex].totalVehicles} vehicles available
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            From {(brandGroups[currentBrandIndex].priceRange.min * 1000).toLocaleString()} RWF/day
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-yellow-100 px-3 py-2 rounded-xl">
                        <span className="text-yellow-600 text-lg">★</span>
                        <span className="text-sm font-semibold text-gray-700">{getRating(brandGroups[currentBrandIndex].featuredVehicle.id)}</span>
                        <span className="text-xs text-gray-500">({getReviews(brandGroups[currentBrandIndex].featuredVehicle.id)})</span>
                      </div>
                    </div>
                  
                    {/* Price and Type */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">Featured Model:</p>
                        <span className="text-lg font-semibold text-gray-800">
                          {brandGroups[currentBrandIndex].featuredVehicle.name}
                        </span>
                      </div>
                      <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                        {brandGroups[currentBrandIndex].featuredVehicle.type}
                      </span>
                    </div>
                  
                  {/* Specifications Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                        <div className="text-lg font-bold text-blue-600">{brandGroups[currentBrandIndex].featuredVehicle.capacity || '5'}</div>
                        <div className="text-xs text-gray-600">Seats</div>
                          </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                        <div className="text-sm font-bold text-green-600">{brandGroups[currentBrandIndex].featuredVehicle.transmission || 'Automatic'}</div>
                        <div className="text-xs text-gray-600">Transmission</div>
                          </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                        <div className="text-sm font-bold text-purple-600">{brandGroups[currentBrandIndex].featuredVehicle.fuel || 'Petrol'}</div>
                        <div className="text-xs text-gray-600">Fuel</div>
                          </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
                        <div className="text-sm font-bold text-orange-600">{brandGroups[currentBrandIndex].featuredVehicle.year || '2020'}</div>
                        <div className="text-xs text-gray-600">Year</div>
                          </div>
                  </div>
                  
                  {/* Features */}
                    <div className="mb-6">
                      <div className="text-sm font-semibold text-gray-700 mb-3">Features:</div>
                    <div className="flex flex-wrap gap-2">
                        {getFeatures(brandGroups[currentBrandIndex].featuredVehicle.id).map((feature, idx) => (
                          <span key={idx} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Description */}
                    <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                      {brandGroups[currentBrandIndex].featuredVehicle.description || 'Experience luxury and comfort with this premium vehicle. Perfect for both business and leisure travel in Rwanda.'}
                    </p>
                  
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link 
                        href={`/rent-a-car?brand=${brandGroups[currentBrandIndex].brand}`} 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-center transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Book Car
                      </Link>
                      <button 
                        onClick={() => openCarModal(brandGroups[currentBrandIndex].featuredVehicle)}
                        className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 border border-gray-200 hover:border-gray-300 transform hover:scale-105"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">🚗</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Vehicles Available</h3>
                <p className="text-gray-500">Please check back later for our featured vehicles.</p>
              </div>
            )}
            
            {/* Carousel Indicators */}
            {brandGroups.length > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {brandGroups.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToBrand(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentBrandIndex
                        ? 'bg-blue-600 scale-125'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to brand ${index + 1}`}
                  />
                ))}
              </div>
            )}
            
            {/* Car Counter */}
            {brandGroups.length > 1 && (
              <div className="text-center mt-4">
                <span className="text-sm text-gray-500">
                  {currentBrandIndex + 1} of {brandGroups.length} brands
                </span>
              </div>
            )}
            
            {/* Auto-advance Progress Bar */}
            {isAutoPlaying && brandGroups.length > 1 && (
              <div className="mt-4 max-w-xs mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                  <div className="bg-blue-600 h-1 rounded-full animate-progress-bar" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Experience KIMU Transport</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
              <video
                ref={video1Ref}
                className="w-full h-full object-cover"
                controls
                poster="/car-1.jpeg"
                preload="metadata"
              >
                <source src="/VID1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
              <video
                ref={video2Ref}
                className="w-full h-full object-cover"
                controls
                poster="/car-2.jpeg"
                preload="metadata"
              >
                <source src="/VID2.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Why Choose <span className="text-orange-500">KIMU Transport?</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-xl p-6 shadow text-gray-900">
              <div className="text-3xl mb-3">🚗</div>
              <div className="font-bold mb-2">Modern Fleet</div>
              <div className="text-gray-500">Latest models, meticulously maintained for your comfort and safety.</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 shadow text-gray-900">
              <div className="text-3xl mb-3">🛡️</div>
              <div className="font-bold mb-2">Professional Drivers</div>
              <div className="text-gray-500">Trained, courteous, and always on time. Your journey is our priority.</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 shadow text-gray-900">
              <div className="text-3xl mb-3">⭐</div>
              <div className="font-bold mb-2">Luxury Experience</div>
              <div className="text-gray-500">Enjoy a premium, stress-free ride every time you choose KIMU.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-blue-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Book Your Premium Ride Today</h2>
          <p className="text-xl mb-8">Contact us for premium car rentals, executive taxi services, and airport transfers in Rwanda.</p>
          <Link
            href="/contact"
            className="bg-white text-orange-600 px-8 py-3 rounded-lg hover:bg-orange-100 hover:scale-105 shadow-lg transition-all font-semibold"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* Car Details Modal */}
      {isModalOpen && selectedCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
              <button
                onClick={closeCarModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close"
              >
              &times;
              </button>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="relative w-full md:w-1/2 h-64 bg-gray-50 rounded-xl overflow-hidden">
                {selectedCar.image ? (
                          <Image
                    src={selectedCar.image}
                    alt={selectedCar.name || 'Vehicle'}
                            fill
                    className="object-contain p-4"
                          />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                            )}
                          </div>
              <div className="flex-1 flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-blue-900 mb-2">{selectedCar.name || 'Vehicle'}</h2>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl font-bold text-orange-500">{selectedCar.price || 'N/A'}</span>
                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                    {selectedCar.type || 'N/A'}
                            </span>
                          </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-base font-bold text-blue-600">{selectedCar.capacity || 'N/A'}</div>
                    <div className="text-xs text-gray-500">Seats</div>
                        </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-blue-600">{selectedCar.transmission || 'N/A'}</div>
                    <div className="text-xs text-gray-500">Transmission</div>
                      </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-blue-600">{selectedCar.fuel || 'N/A'}</div>
                    <div className="text-xs text-gray-500">Fuel</div>
                          </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-blue-600">{selectedCar.year || 'N/A'}</div>
                    <div className="text-xs text-gray-500">Year</div>
                          </div>
                        </div>
                <div className="mb-2">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Features:</div>
                                  <div className="flex flex-wrap gap-2">
                    {(selectedCar.features || []).map((feature: string, idx: number) => (
                                      <span key={idx} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                        {feature}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedCar.description || 'No description available.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 