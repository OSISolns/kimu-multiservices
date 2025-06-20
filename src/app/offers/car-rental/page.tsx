import Image from 'next/image'
import Link from 'next/link'
import { FaCar, FaGasPump, FaUsers, FaSnowflake, FaMapMarkedAlt } from 'react-icons/fa'
import AnimatedSection from '../../../components/AnimatedSection'
import { vehicles, getVehiclesWithAvailability } from '../../../data/vehicles'
import BookCarForm from './BookCarForm'

async function fetchBookings() {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/api/bookings`, { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!res.ok) {
      console.error('Failed to fetch bookings:', res.status, res.statusText);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

export default async function CarRental() {
  const bookings = await fetchBookings();
  const vehiclesWithAvailability = getVehiclesWithAvailability(bookings);
  const availableVehicles = vehiclesWithAvailability.filter(v => v.isAvailable);
  const rentedVehicles = vehiclesWithAvailability.filter(v => !v.isAvailable);

  return (
    <div className="min-h-screen py-6 md:py-12 bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Hero Section */}
        <AnimatedSection className="text-center mb-8 md:mb-12 px-2">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 leading-tight">Car Rentals in Rwanda</h1>
          <p className="text-lg md:text-xl text-gray-600">Starting from 80,000 RWF per day</p>
        </AnimatedSection>

        {/* Quick Stats */}
        <AnimatedSection className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-md text-center">
            <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Most Popular</h3>
            <p className="text-orange-600 font-bold text-base md:text-lg">Toyota Corolla</p>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-md text-center">
            <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Average Price</h3>
            <p className="text-orange-600 font-bold text-base md:text-lg">100,000 RWF/day</p>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-md text-center">
            <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Best Deal</h3>
            <p className="text-orange-600 font-bold text-base md:text-lg">80,000 RWF/day</p>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-md text-center">
            <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Available Cars</h3>
            <p className="text-orange-600 font-bold text-base md:text-lg">{availableVehicles.length} Vehicles</p>
          </div>
        </AnimatedSection>

        {/* Available Vehicles */}
        <AnimatedSection>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">Available Vehicles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {availableVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="relative h-40 md:h-48 w-full">
                  <Image
                    src={vehicle.image}
                    alt={vehicle.name}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-green-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
                    Available
                  </div>
                  <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-orange-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
                    {vehicle.category}
                  </div>
                </div>
                <div className="p-4 md:p-6 flex flex-col flex-1">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 md:mb-4 gap-2">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold">{vehicle.name}</h3>
                      <p className="text-gray-600 text-sm md:text-base">{vehicle.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl md:text-2xl font-bold text-orange-600">{vehicle.price}</p>
                      <p className="text-xs md:text-sm text-gray-500">per day</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:gap-4 mb-3 md:mb-4">
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-base">
                      <FaUsers className="text-orange-600" />
                      <span>5 Seats</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-base">
                      <FaGasPump className="text-orange-600" />
                      <span>Petrol</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-base">
                      <FaSnowflake className="text-orange-600" />
                      <span>AC</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-base">
                      <FaMapMarkedAlt className="text-orange-600" />
                      <span>GPS</span>
                    </div>
                  </div>
                  <div className="space-y-2 md:space-y-4 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FaCar
                            key={i}
                            className={`w-3 h-3 md:w-4 md:h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs md:text-sm text-gray-600">(15 reviews)</span>
                    </div>
                    <Link 
                      href={`/contact?vehicle=${vehicle.id}`}
                      className="bg-orange-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-lg hover:bg-orange-700 transition-colors duration-300 block text-center text-sm md:text-base"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Book a Car Form */}
        <AnimatedSection className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Book a Car</h2>
          <BookCarForm vehicles={availableVehicles} />
        </AnimatedSection>

        {/* Currently Rented Vehicles */}
        {rentedVehicles.length > 0 && (
          <AnimatedSection className="mt-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-600">Currently Rented</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rentedVehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-gray-100 rounded-xl shadow-lg overflow-hidden opacity-75">
                  <div className="relative h-48">
                    <Image
                      src={vehicle.image}
                      alt={vehicle.name}
                      fill
                      className="object-cover grayscale"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                      Rented
                    </div>
                    <div className="absolute top-4 left-4 bg-gray-600 text-white px-3 py-1 rounded-full text-sm">
                      {vehicle.category}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-600">{vehicle.name}</h3>
                        <p className="text-gray-500">{vehicle.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-500">{vehicle.price}</p>
                        <p className="text-sm text-gray-400">per day</p>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">This vehicle is currently rented</p>
                      <p className="text-gray-400 text-xs mt-2">Check back later for availability</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* Why Choose Us Section */}
        <AnimatedSection className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Our Car Rental Service?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCar className="text-2xl text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Wide Selection</h3>
              <p className="text-gray-600">Choose from our diverse fleet of well-maintained vehicles</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMapMarkedAlt className="text-2xl text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Flexible Pickup</h3>
              <p className="text-gray-600">Convenient pickup and drop-off locations across Rwanda</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-2xl text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer support for peace of mind</p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
} 