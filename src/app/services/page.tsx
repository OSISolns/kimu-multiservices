import React from 'react'
import { FaCar, FaTaxi, FaPlane, FaHotel, FaHandshake } from 'react-icons/fa'
import Link from 'next/link'

export default function Services() {
  return (
    <div className="min-h-screen bg-blue-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Our Services</h1>
        <div className="flex flex-col items-center mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-wrap justify-center gap-8 max-w-4xl w-full">
            <div className="flex flex-col items-center min-w-[220px]">
              <FaTaxi className="text-4xl text-blue-600 mb-2" />
              <span className="font-bold text-lg">Premium Taxi Services</span>
            </div>
            <div className="flex flex-col items-center min-w-[220px]">
              <FaCar className="text-4xl text-orange-500 mb-2" />
              <span className="font-bold text-lg">Vehicle Rental Solutions</span>
            </div>
            <div className="flex flex-col items-center min-w-[220px]">
              <FaPlane className="text-4xl text-blue-600 mb-2" />
              <span className="font-bold text-lg">Airport Transfer Excellence</span>
            </div>
            <div className="flex flex-col items-center min-w-[220px]">
              <FaHotel className="text-4xl text-orange-500 mb-2" />
              <span className="font-bold text-lg">Hotel Accommodation Services</span>
            </div>
            <div className="flex flex-col items-center min-w-[220px]">
              <FaHandshake className="text-4xl text-blue-600 mb-2" />
              <span className="font-bold text-lg">Automotive Sales & Consultancy</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-8 text-center">Explore Our Service Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center">
            <FaCar className="text-3xl text-orange-500 mb-4" />
            <h3 className="font-bold text-xl mb-2">Car Rental Services</h3>
            <p className="text-gray-600 mb-4 text-center">Self-drive, chauffeur-driven, and long-term car rentals. Choose from our modern fleet for any occasion.</p>
            <Link href="/offers/car-rental" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">View Cars</Link>
          </div>
          <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center">
            <FaPlane className="text-3xl text-blue-600 mb-4" />
            <h3 className="font-bold text-xl mb-2">Airport Transfers</h3>
            <p className="text-gray-600 mb-4 text-center">Seamless airport pickups and drop-offs with real-time flight tracking. Arrive or depart in style and on time.</p>
            <Link href="/contact" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors">Book Transfer</Link>
          </div>
          <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center">
            <FaHotel className="text-3xl text-orange-500 mb-4" />
            <h3 className="font-bold text-xl mb-2">Hotel Accommodation</h3>
            <p className="text-gray-600 mb-4 text-center">Strategic partnerships with premium hotels across Rwanda for the best rates and comfort.</p>
            <Link href="/contact" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Enquire</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center">
            <FaTaxi className="text-3xl text-blue-600 mb-4" />
            <h3 className="font-bold text-xl mb-2">Premium Taxi Services</h3>
            <p className="text-gray-600 mb-4 text-center">Executive taxi services with professional drivers for business and leisure. 24/7 availability, comfort, and safety.</p>
            <Link href="/contact" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors">Book Taxi</Link>
          </div>
          <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center">
            <FaHandshake className="text-3xl text-blue-600 mb-4" />
            <h3 className="font-bold text-xl mb-2">Automotive Sales & Consultancy</h3>
            <p className="text-gray-600 mb-4 text-center">Professional vehicle sales services with expert guidance and after-sales support. Find your next car with us.</p>
            <Link href="/contact" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Get Consultation</Link>
          </div>
        </div>
      </div>
    </div>
  )
} 