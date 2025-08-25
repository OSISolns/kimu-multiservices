import React from 'react'
import { FaCar, FaTaxi, FaPlane, FaHotel, FaHandshake, FaShieldAlt, FaClock, FaMapMarkedAlt, FaUsers, FaStar } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'

export default function Services() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      
      {/* Core Services Overview */}
      <div className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 transform hover:scale-105 transition-transform duration-300">
              Our Core Services
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              We specialize in premium transportation solutions that keep Rwanda moving forward
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16 max-w-5xl mx-auto">
            {/* Car Rental */}
            <div className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 hover:scale-105 animate-fade-in">
              <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <FaCar className="text-4xl sm:text-5xl lg:text-6xl text-white group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3" />
              </div>
              <div className="p-4 sm:p-6 lg:p-8">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-4 group-hover:text-orange-600 transition-colors duration-300">Car Rental</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  Choose from our carefully maintained fleet of vehicles. Whether you need a compact car for city driving or an SUV for family trips, we&apos;ve got you covered.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 group-hover:text-green-600 transition-colors duration-300">
                    <FaShieldAlt className="text-green-500 group-hover:scale-110 transition-transform duration-300" />
                    <span>Fully Insured</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-300">
                    <FaClock className="text-blue-500 group-hover:scale-110 transition-transform duration-300" />
                    <span>24/7 Support</span>
                  </div>
                </div>
                <Link 
                  href="/rent-a-car" 
                  className="inline-block bg-orange-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:bg-orange-600 transition-all duration-300 w-full text-center text-base font-medium transform hover:scale-105 hover:shadow-lg"
                >
                  Browse Vehicles
                </Link>
              </div>
            </div>

            {/* Airport Transfers */}
            <div className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 hover:scale-105 animate-fade-in">
              <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <FaPlane className="text-4xl sm:text-5xl lg:text-6xl text-white group-hover:scale-110 transition-transform duration-300 group-hover:-rotate-12" />
              </div>
              <div className="p-4 sm:p-6 lg:p-8">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-4 group-hover:text-blue-600 transition-colors duration-300">Airport Transfers</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  Start your journey right with our professional airport transfer service. We monitor your flight and ensure timely pickup, no matter when you arrive.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-300">
                    <FaMapMarkedAlt className="text-blue-500 group-hover:scale-110 transition-transform duration-300" />
                    <span>Flight Tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 group-hover:text-green-600 transition-colors duration-300">
                    <FaClock className="text-green-500 group-hover:scale-110 transition-transform duration-300" />
                    <span>On Time</span>
                  </div>
                </div>
                <Link 
                  href="/contact" 
                  className="inline-block bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 w-full text-center text-base font-medium transform hover:scale-105 hover:shadow-lg"
                >
                  Book Transfer
                </Link>
              </div>
            </div>

            {/* Premium Taxi */}
            <div className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden sm:col-span-2 lg:col-span-1 transform hover:-translate-y-2 hover:scale-105 animate-fade-in">
              <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <FaTaxi className="text-4xl sm:text-5xl lg:text-6xl text-white group-hover:scale-110 transition-transform duration-300 group-hover:bounce" />
              </div>
              <div className="p-4 sm:p-6 lg:p-8">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-4 group-hover:text-emerald-600 transition-colors duration-300">Premium Taxi</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  Professional drivers, clean vehicles, and reliable service for all your local transportation needs. Available around the clock.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 group-hover:text-emerald-600 transition-colors duration-300">
                    <FaUsers className="text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
                    <span>Professional Drivers</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 group-hover:text-yellow-600 transition-colors duration-300">
                    <FaStar className="text-yellow-500 group-hover:scale-110 transition-transform duration-300" />
                    <span>Top Rated</span>
                  </div>
                </div>
                <Link 
                  href="/contact" 
                  className="inline-block bg-emerald-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-300 w-full text-center text-base font-medium transform hover:scale-105 hover:shadow-lg"
                >
                  Call Taxi
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 transform hover:scale-105 transition-transform duration-300">
              Why Travelers Choose KIMU
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              We&apos;ve built our reputation on trust, reliability, and exceptional service
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="text-center group transform hover:-translate-y-2 transition-all duration-300 animate-fade-in">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 group-hover:bg-blue-200 transition-all duration-300">
                <FaShieldAlt className="text-lg sm:text-xl lg:text-2xl text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">Safety First</h3>
              <p className="text-xs sm:text-sm text-gray-600 px-2 group-hover:text-gray-700 transition-colors duration-300">
                All vehicles undergo regular safety inspections and maintenance
              </p>
            </div>

            <div className="text-center group transform hover:-translate-y-2 transition-all duration-300 animate-fade-in">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 group-hover:bg-orange-200 transition-all duration-300">
                <FaClock className="text-lg sm:text-xl lg:text-2xl text-orange-600 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors duration-300">Always Available</h3>
              <p className="text-xs sm:text-sm text-gray-600 px-2 group-hover:text-gray-700 transition-colors duration-300">
                24/7 service to meet your transportation needs anytime
              </p>
            </div>

            <div className="text-center group transform hover:-translate-y-2 transition-all duration-300 animate-fade-in">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 group-hover:bg-green-200 transition-all duration-300">
                <FaStar className="text-lg sm:text-xl lg:text-2xl text-green-600 group-hover:rotate-12 transition-transform duration-300" />
            </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors duration-300">Quality Assured</h3>
              <p className="text-xs sm:text-sm text-gray-600 px-2 group-hover:text-gray-700 transition-colors duration-300">
                Premium vehicles and professional drivers for every journey
              </p>
            </div>

            <div className="text-center sm:col-span-2 lg:col-span-1 group transform hover:-translate-y-2 transition-all duration-300 animate-fade-in">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 group-hover:bg-purple-200 transition-all duration-300">
                <FaHandshake className="text-lg sm:text-xl lg:text-2xl text-purple-600 group-hover:rotate-12 transition-transform duration-300" />
            </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">Local Expertise</h3>
              <p className="text-xs sm:text-sm text-gray-600 px-2 group-hover:text-gray-700 transition-colors duration-300">
                                  Deep knowledge of Rwanda&apos;s roads and travel requirements
              </p>
            </div>
            </div>
          </div>
        </div>

      {/* Additional Services */}
      <div className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start max-w-5xl mx-auto">
            <div className="animate-fade-in">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 transform hover:scale-105 transition-transform duration-300">
                Beyond Transportation
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                                  We&apos;re more than just a car rental company. Our partnerships and expertise extend to hotel accommodations and automotive consulting, making us your one-stop solution for travel in Rwanda.
              </p>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4 group transform hover:-translate-x-2 transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-orange-200 transition-all duration-300">
                    <FaHotel className="text-lg sm:text-xl text-orange-600 group-hover:rotate-6 transition-transform duration-300" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors duration-300">Hotel Partnerships</h3>
                    <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                      Exclusive rates at premium hotels across Rwanda. From business stays to leisure getaways, we ensure comfortable accommodations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 group transform hover:-translate-x-2 transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-blue-200 transition-all duration-300">
                    <FaHandshake className="text-lg sm:text-xl text-blue-600 group-hover:rotate-6 transition-transform duration-300" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">Automotive Consulting</h3>
                    <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                      Expert advice on vehicle purchases, maintenance, and fleet management. We help businesses and individuals make informed automotive decisions.
                    </p>
                  </div>
          </div>
          </div>

              <div className="mt-6 sm:mt-8">
                <Link 
                  href="/contact" 
                  className="inline-block bg-gray-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-900 transition-all duration-300 text-base font-medium transform hover:scale-105 hover:shadow-lg"
                >
                  Get in Touch
                </Link>
          </div>
        </div>

            <div className="relative animate-fade-in">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white transform hover:scale-105 transition-all duration-500 hover:shadow-2xl">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Ready to Get Started?</h3>
                <p className="text-blue-100 mb-4 sm:mb-6 text-sm sm:text-base">
                  Whether you need a car for a day or transportation for your entire team, we&apos;re here to help make your journey smooth and enjoyable.
                </p>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base group hover:translate-x-2 transition-transform duration-300">
                    <FaCar className="text-orange-300 group-hover:scale-110 transition-transform duration-300" />
                    <span>Flexible rental periods</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base group hover:translate-x-2 transition-transform duration-300">
                    <FaShieldAlt className="text-green-300 group-hover:scale-110 transition-transform duration-300" />
                    <span>Comprehensive insurance</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base group hover:translate-x-2 transition-transform duration-300">
                    <FaClock className="text-blue-300 group-hover:scale-110 transition-transform duration-300" />
                    <span>24/7 customer support</span>
                  </div>
                </div>
              </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
} 