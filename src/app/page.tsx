'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import AnimatedSection from '../components/AnimatedSection'

const carImages = [
  '/car-1.jpeg',
  '/car-2.jpeg',
  '/car-3.jpeg',
  '/car-4.jpeg',
  '/car-5.jpeg',
  '/car-6.jpeg',
  '/car-7.jpeg',
  '/car-8.jpeg',
  '/car-9.jpeg',
  '/car-10.jpeg',
  '/car-11.jpeg',
  '/car-12.jpeg',
  '/car-13.jpeg',
  '/car-14.jpeg',
  '/car-15.jpg',
  '/car-16.jpg',
  '/car-17.jpg',
]

const fallbackImage = '/vehicles/default.png'; // Make sure this exists or use another placeholder

function getVehicleImage(image: string | undefined | null): string {
  if (typeof image === 'string' && image.trim().length > 0 && image.startsWith('/')) {
    return image;
  }
  return fallbackImage;
}

export default function Home() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [current, setCurrent] = useState(0)
  const [shuffledVehicles, setShuffledVehicles] = useState<any[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedCar, setSelectedCar] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [vehiclesWithAvailability, setVehiclesWithAvailability] = useState<any[]>([])
  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        setVehicles(data);
        setVehiclesWithAvailability(data);
      })
      .catch(err => {
        console.error('Error fetching vehicles:', err);
      });
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(data);
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
      });
  }, []);

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

  const getFeatures = () => {
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

  // Shuffle vehicles only on client side after mount
  useEffect(() => {
    const shuffle = (array: any[]) => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }
    // Only show available vehicles in the shuffle
    const availableVehicles = vehiclesWithAvailability.filter(v => v.isAvailable);
    setShuffledVehicles(shuffle(availableVehicles))
  }, [vehiclesWithAvailability])

  // Reset current if shuffledVehicles changes
  useEffect(() => {
    if (current >= shuffledVehicles.length && shuffledVehicles.length > 0) {
      setCurrent(0)
    }
  }, [shuffledVehicles, current])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carImages.length)
    }, 4000) // Increased to 4 seconds for better reading
    return () => clearInterval(interval)
  }, [])
  
  const prevSlide = () => setCurrent((prev) => (prev - 1 + shuffledVehicles.length) % shuffledVehicles.length)
  const nextSlide = () => setCurrent((prev) => (prev + 1) % shuffledVehicles.length)

  const toggleFavorite = (vehicleId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(vehicleId.toString())) {
        newFavorites.delete(vehicleId.toString())
      } else {
        newFavorites.add(vehicleId.toString())
      }
      return newFavorites
    })
  }

  const currentVehicle = shuffledVehicles[current]

  // Enhanced car data with additional features (use vehicles from state)
  const enhancedVehicles = vehicles.map(vehicle => ({
    ...vehicle,
    specs: {
      seats: Math.floor(Math.random() * 4) + 4, // 4-7 seats
      transmission: Math.random() > 0.5 ? 'Automatic' : 'Manual',
      fuelType: ['Petrol', 'Diesel', 'Hybrid'][Math.floor(Math.random() * 3)],
      year: 2020 + Math.floor(Math.random() * 4), // 2020-2023
      mileage: Math.floor(Math.random() * 50000) + 10000, // 10k-60k km
    },
    rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
    reviews: Math.floor(Math.random() * 50) + 10, // 10-60 reviews
    availability: Math.random() > 0.2, // 80% available
    specialOffer: Math.random() > 0.7 ? ['Weekend Discount', 'Long-term Rental', 'New Customer'] : null,
    features: ['AC', 'Bluetooth', 'GPS', 'Backup Camera', 'Leather Seats'].slice(0, Math.floor(Math.random() * 3) + 2),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-gray-100 text-gray-900">
      {(() => {
        try {
          return (
            <>
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
                  <style jsx>{`
                    @keyframes hero-float {
                      0% { transform: scale(1) translateY(0px) translateX(0px) rotate(-2deg); }
                      25% { transform: scale(1.04) translateY(-10px) translateX(10px) rotate(2deg); }
                      50% { transform: scale(1.02) translateY(10px) translateX(-10px) rotate(-1deg); }
                      75% { transform: scale(1.05) translateY(-8px) translateX(8px) rotate(1deg); }
                      100% { transform: scale(1) translateY(0px) translateX(0px) rotate(-2deg); }
                    }
                  `}</style>
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

              {/* Service Highlights */}
              <section className="py-16 bg-gradient-to-br from-white via-blue-50 to-gray-100">
                <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="bg-white rounded-xl p-8 shadow-lg border-t-4 border-orange-500">
                    <h3 className="text-xl font-bold mb-3 text-orange-500">Premium Taxi</h3>
                    <p className="text-gray-600">Executive taxi services with professional drivers for business and leisure. 24/7 availability, comfort, and safety.</p>
                  </div>
                  <div className="bg-white rounded-xl p-8 shadow-lg border-t-4 border-blue-600">
                    <h3 className="text-xl font-bold mb-3 text-blue-600">Luxury Car Rentals</h3>
                    <p className="text-gray-600">A curated fleet of luxury vehicles for self-drive or chauffeur-driven experiences. Flexible rental terms.</p>
                  </div>
                  <div className="bg-white rounded-xl p-8 shadow-lg border-t-4 border-orange-500">
                    <h3 className="text-xl font-bold mb-3 text-orange-500">Airport Transfers</h3>
                    <p className="text-gray-600">Seamless airport pickups and drop-offs with real-time flight tracking. Arrive or depart in style and on time.</p>
                  </div>
                </div>
              </section>

              {/* Enhanced Featured Cars Section */}
              <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
                <div className="max-w-4xl mx-auto px-4">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4 text-gray-900">Featured <span className="text-orange-500">Cars</span></h2>
                    <p className="text-lg text-gray-600">Discover our premium fleet of vehicles for your next journey</p>
                  </div>
                  
                  <div className="relative flex flex-col items-center">
                    {/* Enhanced Slide */}
                    {shuffledVehicles.length > 0 && shuffledVehicles[current] && shuffledVehicles[current].image ? (
                      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-700 ease-in-out">
                        {/* Image Section with Overlay */}
                        <div className="relative h-80 bg-gradient-to-br from-blue-50 to-gray-50">
                          <Image
                            src={getVehicleImage(shuffledVehicles[current].image)}
                            alt={shuffledVehicles[current].name || 'Vehicle'}
                            fill
                            className="object-contain p-8 transition-all duration-700 ease-in-out cursor-pointer hover:scale-105"
                            loading="eager"
                            sizes="(max-width: 640px) 90vw, 640px"
                            onClick={() => openCarModal(shuffledVehicles[current])}
                          />
                          
                          {/* Top Badges */}
                          <div className="absolute top-4 left-4 flex gap-2">
                            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                              {shuffledVehicles[current].category}
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
                              shuffledVehicles[current]?.isAvailable 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${
                                shuffledVehicles[current]?.isAvailable ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              {shuffledVehicles[current]?.isAvailable ? 'Available' : 'Rented'}
                            </div>
                          </div>
                          
                          {/* Favorite Button */}
                          <button
                            onClick={() => toggleFavorite(shuffledVehicles[current].id)}
                            className="absolute top-4 right-16 bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 rounded-full p-2 shadow-lg transition-all duration-200"
                            aria-label="Add to favorites"
                          >
                            <svg width="20" height="20" fill={favorites.has(shuffledVehicles[current].id.toString()) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </button>
                        </div>
                        
                        {/* Content Section */}
                        <div className="p-6">
                          {/* Title and Rating */}
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-2xl font-extrabold text-blue-900">{shuffledVehicles[current].name}</h3>
                            <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded">
                              <span className="text-yellow-600">★</span>
                              <span className="text-sm font-semibold text-gray-700">{(Math.random() * 2 + 3).toFixed(1)}</span>
                              <span className="text-xs text-gray-500">({Math.floor(Math.random() * 50) + 10})</span>
                            </div>
                          </div>
                          
                          {/* Price and Type */}
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl font-bold text-orange-500">{shuffledVehicles[current].price}</span>
                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                              {shuffledVehicles[current].type}
                            </span>
                          </div>
                          
                          {/* Specifications Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            {(() => {
                              return (
                                <>
                                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold text-blue-600">{shuffledVehicles[current].capacity}</div>
                                    <div className="text-xs text-gray-500">Seats</div>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <div className="text-sm font-bold text-blue-600">{shuffledVehicles[current].transmission}</div>
                                    <div className="text-xs text-gray-500">Transmission</div>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <div className="text-sm font-bold text-blue-600">{shuffledVehicles[current].fuel}</div>
                                    <div className="text-xs text-gray-500">Fuel</div>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <div className="text-sm font-bold text-blue-600">{shuffledVehicles[current].year}</div>
                                    <div className="text-xs text-gray-500">Year</div>
                                  </div>
                                </>
                              )
                            })()}
                          </div>
                          
                          {/* Features */}
                          <div className="mb-4">
                            <div className="text-sm font-semibold text-gray-700 mb-2">Features:</div>
                            <div className="flex flex-wrap gap-2">
                              {getFeatures().map((feature, idx) => (
                                <span key={idx} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {/* Description */}
                          <p className="text-gray-600 mb-6 text-sm leading-relaxed">{shuffledVehicles[current].description}</p>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <Link 
                              href={`/rent-a-car?vehicle=${shuffledVehicles[current].id}`} 
                              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                            >
                              Rent Now
                            </Link>
                            <button 
                              onClick={() => openCarModal(shuffledVehicles[current])}
                              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    
                    {/* Enhanced Navigation */}
                    <div className="flex justify-between items-center w-full max-w-2xl mt-8">
                      <button
                        onClick={prevSlide}
                        className="bg-white hover:bg-blue-50 text-blue-600 rounded-full p-4 shadow-lg transition-all duration-200 border border-gray-200"
                        aria-label="Previous car"
                      >
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      
                      <div className="flex gap-2">
                        {shuffledVehicles && Array.isArray(shuffledVehicles) && shuffledVehicles.length > 0 && shuffledVehicles.slice(0, 8).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`w-3 h-3 rounded-full transition-all duration-200 ${
                              current === idx ? 'bg-orange-500' : 'bg-blue-200'
                            }`}
                            aria-label={`Go to car ${idx + 1}`}
                          />
                        ))}
                      </div>
                      
                      <button
                        onClick={nextSlide}
                        className="bg-white hover:bg-blue-50 text-blue-600 rounded-full p-4 shadow-lg transition-all duration-200 border border-gray-200"
                        aria-label="Next car"
                      >
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="mt-8 grid grid-cols-3 gap-6 text-center">
                      <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                        <div className="text-2xl font-bold text-blue-600">{shuffledVehicles.length}</div>
                        <div className="text-sm text-gray-500">Total Cars</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.floor(shuffledVehicles.length * 0.8)}
                        </div>
                        <div className="text-sm text-gray-500">Available Now</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                        <div className="text-2xl font-bold text-orange-500">
                          {Math.floor(shuffledVehicles.length * 0.3)}
                        </div>
                        <div className="text-sm text-gray-500">Special Offers</div>
                      </div>
                    </div>
                    
                    {/* Quick Preview Section */}
                    {shuffledVehicles.length > 1 && (
                      <div className="mt-8 w-full max-w-2xl">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Coming Up Next</h3>
                        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden">
                              <Image
                                src={getVehicleImage(shuffledVehicles[(current + 1) % shuffledVehicles.length].image)}
                                alt={shuffledVehicles[(current + 1) % shuffledVehicles.length].name || 'Vehicle'}
                                fill
                                className="object-contain p-2"
                                sizes="80px"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{shuffledVehicles[(current + 1) % shuffledVehicles.length].name}</h4>
                              <p className="text-sm text-gray-600 mb-1">{shuffledVehicles[(current + 1) % shuffledVehicles.length].category}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-orange-500">{shuffledVehicles[(current + 1) % shuffledVehicles.length].price}</span>
                                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-semibold">
                                  {shuffledVehicles[(current + 1) % shuffledVehicles.length].type}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => setCurrent((current + 1) % shuffledVehicles.length)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                            >
                              View Now
                            </button>
                          </div>
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
            </>
          )
        } catch (error) {
          console.error('Error rendering main page content:', error)
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
                <p className="text-gray-600 mb-4">We&apos;re experiencing technical difficulties. Please try refreshing the page.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          )
        }
      })()}

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
                    src={getVehicleImage(selectedCar.image)}
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