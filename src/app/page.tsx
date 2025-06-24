'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import AnimatedSection from '../components/AnimatedSection'
import { vehicles, getVehiclesWithAvailability } from '../data/vehicles'

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

// Enhanced car data with additional features
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
}))

export default function Home() {
  const [current, setCurrent] = useState(0)
  const [shuffledVehicles, setShuffledVehicles] = useState<typeof vehicles>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedCar, setSelectedCar] = useState<typeof vehicles[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [vehiclesWithAvailability, setVehiclesWithAvailability] = useState<any[]>([])
  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)

  // Fetch bookings and update vehicle availability
  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        const vehiclesWithAvail = getVehiclesWithAvailability(data);
        setVehiclesWithAvailability(vehiclesWithAvail);
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
        setVehiclesWithAvailability(vehicles.map(v => ({ ...v, isAvailable: true })));
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

  const openCarModal = (car: typeof vehicles[0]) => {
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

  const handlePlay = (ref: React.RefObject<HTMLVideoElement>) => {
    ref.current && ref.current.play()
  }
  const handlePause = (ref: React.RefObject<HTMLVideoElement>) => {
    ref.current && ref.current.pause()
  }

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
                  <Image 
                    src="/vehicles/TXL-02.png" 
                    alt="Luxury Car" 
                    width={600} 
                    height={420} 
                    className="object-contain rounded-2xl shadow-2xl border-4 border-white"
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
                    {shuffledVehicles.length > 0 && shuffledVehicles[current] && (
                      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-700 ease-in-out">
                        {/* Image Section with Overlay */}
                        <div className="relative h-80 bg-gradient-to-br from-blue-50 to-gray-50">
                          <Image
                            src={shuffledVehicles[current].image}
                            alt={shuffledVehicles[current].name}
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
                    )}
                    
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
                        {shuffledVehicles.slice(0, 8).map((_, idx) => (
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
                          <path d="M9 6l6 6-6 6" />
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
                                src={shuffledVehicles[(current + 1) % shuffledVehicles.length].image}
                                alt={shuffledVehicles[(current + 1) % shuffledVehicles.length].name}
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
                        onMouseEnter={() => handlePlay(video1Ref)}
                        onMouseLeave={() => handlePause(video1Ref)}
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
                        onMouseEnter={() => handlePlay(video2Ref)}
                        onMouseLeave={() => handlePause(video2Ref)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Car Details</h2>
              <button
                onClick={closeCarModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {(() => {
                try {
                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column - Image and Basic Info */}
                      <div>
                        <div className="relative h-80 bg-gradient-to-br from-blue-50 to-gray-50 rounded-xl overflow-hidden mb-6">
                          <Image
                            src={selectedCar.image}
                            alt={selectedCar.name}
                            fill
                            className="object-contain p-8"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                          />
                          <div className="absolute top-4 left-4 flex gap-2">
                            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                              {selectedCar.category}
                            </span>
                            {getSpecialOffer() && (
                              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                                {getSpecialOffer()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                          <h3 className="text-3xl font-bold text-gray-900">{selectedCar.name}</h3>
                          <div className="flex items-center gap-4">
                            <span className="text-3xl font-bold text-orange-500">{selectedCar.price}</span>
                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                              {selectedCar.type}
                            </span>
                          </div>
                          <p className="text-gray-600 leading-relaxed">{selectedCar.description}</p>
                        </div>
                      </div>

                      {/* Right Column - Detailed Specs */}
                      <div className="space-y-6">
                        {/* Rating and Reviews */}
                        <div className="bg-yellow-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-yellow-600 text-xl">★</span>
                            <span className="text-lg font-semibold text-gray-700">{(Math.random() * 2 + 3).toFixed(1)}</span>
                            <span className="text-sm text-gray-500">({Math.floor(Math.random() * 50) + 10} reviews)</span>
                          </div>
                          <p className="text-sm text-gray-600">Excellent choice for your journey</p>
                        </div>

                        {/* Technical Specifications */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {(() => {
                              return (
                                <>
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-sm text-gray-500">Engine</div>
                                    <div className="font-semibold text-gray-900">{selectedCar.engine}</div>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-sm text-gray-500">Power</div>
                                    <div className="font-semibold text-gray-900">{selectedCar.power} HP</div>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-sm text-gray-500">Fuel Efficiency</div>
                                    <div className="font-semibold text-gray-900">{selectedCar.fuelEfficiency} km/L</div>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-sm text-gray-500">Mileage</div>
                                    <div className="font-semibold text-gray-900">{selectedCar.mileage.toLocaleString()} km</div>
                                  </div>
                                </>
                              )
                            })()}
                          </div>
                        </div>

                        {/* Features */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Features & Amenities</h4>
                          <div className="space-y-3">
                            {(() => {
                              const detailedFeatures = getDetailedFeatures()
                              return Object.entries(detailedFeatures).map(([category, features]) => (
                                <div key={category}>
                                  <h5 className="text-sm font-semibold text-gray-700 mb-2 capitalize">{category}</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {features.slice(0, 3).map((feature, idx) => (
                                      <span key={idx} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                        {feature}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))
                            })()}
                          </div>
                        </div>

                        {/* Rental Terms */}
                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Rental Terms</h4>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex justify-between">
                              <span>Minimum Rental:</span>
                              <span className="font-semibold">1 Day</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Driver Included:</span>
                              <span className="font-semibold text-green-600">Yes</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Insurance:</span>
                              <span className="font-semibold text-green-600">Included</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fuel Policy:</span>
                              <span className="font-semibold">Full to Full</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                } catch (error) {
                  console.error('Error rendering modal content:', error)
                  return (
                    <div className="text-center py-8">
                      <p className="text-red-600">Error loading car details. Please try again.</p>
                      <button
                        onClick={closeCarModal}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
                      >
                        Close
                      </button>
                    </div>
                  )
                }
              })()}

              {/* Modal Footer */}
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                <Link
                  href={`/rent-a-car?vehicle=${selectedCar.id}`}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                >
                  Rent This Car
                </Link>
                <button
                  onClick={() => toggleFavorite(selectedCar.id)}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <svg width="20" height="20" fill={favorites.has(selectedCar.id.toString()) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {favorites.has(selectedCar.id.toString()) ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={closeCarModal}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 