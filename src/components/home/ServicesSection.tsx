import Link from 'next/link'
import { FaTaxi, FaCar, FaPlane, FaShieldAlt, FaStar, FaClock, FaUsers, FaCheckCircle } from 'react-icons/fa'

export default function ServicesSection() {
    return (
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
    )
}
