"use client"

import Image from 'next/image'
import Link from 'next/link'
import { FaCar, FaGasPump, FaUsers, FaSnowflake, FaMapMarkedAlt } from 'react-icons/fa'
import AnimatedSection from '../../../components/AnimatedSection'
import BookCarForm from './BookCarForm'
import { useRef, useState, useEffect } from 'react'

function VehicleDetailsModal({ vehicle, onClose }: { vehicle: any, onClose: () => void }) {
  if (!vehicle) return null;
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
            <span className="text-lg font-bold text-orange-500">{vehicle.price}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="flex items-center gap-1 text-xs text-gray-700"><FaUsers className="text-orange-600" /> {vehicle.capacity || '5'} Seats</span>
            <span className="flex items-center gap-1 text-xs text-gray-700"><FaGasPump className="text-orange-600" /> {vehicle.fuel}</span>
            <span className="flex items-center gap-1 text-xs text-gray-700"><FaSnowflake className="text-blue-400" /> AC</span>
            <span className="flex items-center gap-1 text-xs text-gray-700"><FaMapMarkedAlt className="text-blue-400" /> GPS</span>
          </div>
          <div className="text-sm text-gray-600 text-center mb-2">{vehicle.description}</div>
          <div className="mt-4 w-full flex flex-col items-center">
            <h3 className="text-base font-semibold text-blue-800 mb-1 tracking-wide uppercase">Rental Conditions</h3>
            <ul className="flex flex-wrap gap-2 justify-center text-xs text-blue-900 font-medium">
              <li className="bg-blue-50 border border-blue-100 rounded px-2 py-1">Valid driver&apos;s license</li>
              <li className="bg-blue-50 border border-blue-100 rounded px-2 py-1">Min. age: 18</li>
              <li className="bg-blue-50 border border-blue-100 rounded px-2 py-1">Return full tank</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CarRental() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<string | undefined>(undefined);
  const [modalVehicle, setModalVehicle] = useState<any | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [vehiclesRes, bookingsRes] = await Promise.all([
          fetch('/api/vehicles'),
          fetch('/api/bookings'),
        ]);
        const vehiclesData = vehiclesRes.ok ? await vehiclesRes.json() : [];
        const bookingsData = bookingsRes.ok ? await bookingsRes.json() : [];
        setVehicles(vehiclesData);
        setBookings(bookingsData);
      } catch (err) {
        setVehicles([]);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const availableVehicles = vehicles.filter((v: any) => v.isAvailable);
  const rentedVehicles = vehicles.filter((v: any) => !v.isAvailable);

  const handleShowDetails = (vehicle: any) => {
    setModalVehicle(vehicle);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        {/* Hero Section */}
      <section className="relative bg-blue-900 text-white py-16 px-4 mb-10 rounded-b-3xl shadow-lg overflow-hidden">
        <div className="max-w-4xl mx-auto text-center z-10 relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 drop-shadow-lg">Rent a Car in Seconds</h1>
          <p className="text-lg sm:text-2xl mb-6 font-medium drop-shadow">Choose from our wide range of vehicles and enjoy a seamless rental experience.</p>
          </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-blue-600/60 z-0" />
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vehicle List */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6 text-blue-900">Available Vehicles</h2>
          {loading ? (
            <div className="text-center text-lg text-blue-700">Loading vehicles...</div>
          ) : availableVehicles.length === 0 ? (
            <div className="text-center text-gray-500">No vehicles available at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {availableVehicles.map((vehicle: any) => (
                <div key={vehicle.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-4 flex flex-col">
                  <div className="relative w-full h-40 mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-white">
                    <Image src={vehicle.image} alt={vehicle.name} fill className="object-contain" sizes="(max-width: 640px) 100vw, 400px" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-900 mb-1">{vehicle.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-semibold">{vehicle.type}</span>
                    <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">{vehicle.category}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaUsers className="text-orange-600" />
                    <span className="text-xs text-gray-700">5 Seats</span>
                    <FaGasPump className="text-orange-600 ml-4" />
                    <span className="text-xs text-gray-700">{vehicle.fuel}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaSnowflake className="text-blue-400" />
                    <span className="text-xs text-gray-700">AC</span>
                    <FaMapMarkedAlt className="text-blue-400 ml-4" />
                    <span className="text-xs text-gray-700">GPS</span>
                  </div>
                  <div className="text-xl font-bold text-orange-600 mb-2">{vehicle.price}</div>
                    <button
                    className="mt-auto bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    onClick={() => handleShowDetails(vehicle)}
                    >
                    Details
                    </button>
                </div>
              ))}
            </div>
        )}
              </div>
        {/* Booking Form Sidebar */}
        <div className="lg:col-span-1">
          <div ref={formRef} className="sticky top-24">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-blue-900">Book a Car</h2>
              <BookCarForm vehicles={availableVehicles} selectedCar={selectedCar} />
            </div>
          </div>
        </div>
      </div>
      {modalVehicle && <VehicleDetailsModal vehicle={modalVehicle} onClose={() => setModalVehicle(null)} />}
    </div>
  )
} 