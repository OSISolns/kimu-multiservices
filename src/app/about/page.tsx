import Head from 'next/head'
import Image from 'next/image'
import { FaUserTie, FaCarSide, FaHandsHelping, FaShieldAlt, FaClock, FaMapMarkedAlt, FaUsers, FaStar, FaAward, FaHeart, FaLightbulb, FaRocket } from 'react-icons/fa'

export default function About() {
  return (
    <>
      <Head>
        <title>About KIMU Transport & Multiservices - Rwanda Multiservices Company</title>
        <meta name="description" content="Learn about KIMU Transport & Multiservices, a leading provider of premium taxi services, vehicle rentals, airport transfers, hotel bookings, and automotive sales in Rwanda." />
        <meta property="og:title" content="About KIMU Transport & Multiservices - Rwanda Multiservices Company" />
        <meta property="og:description" content="Learn about KIMU Transport & Multiservices, a leading provider of premium taxi services, vehicle rentals, airport transfers, hotel bookings, and automotive sales in Rwanda." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.kimutransport.co.rw/about" />
        <meta property="og:image" content="https://www.kimutransport.co.rw/logo.png" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.kimutransport.co.rw/about" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8 animate-fade-in">
              <Image 
                src="/logo.png" 
                alt="KIMU Transport & Multiservices Logo" 
                width={100} 
                height={100} 
                className="mx-auto mb-6 transform hover:scale-110 transition-transform duration-500" 
              />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 animate-fade-in">
              Our <span className="text-orange-600">Story</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed animate-fade-in">
              Building Rwanda&apos;s future through exceptional <span className="text-blue-600">transportation</span> and <span className="text-orange-600">hospitality</span> services
            </p>
          </div>
          </div>

        {/* Company Story Section */}
        <section className="py-12 sm:py-16 lg:py-20 xl:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  A Legacy of <span className="text-blue-600">Excellence</span> in Rwanda
                </h2>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  KIMU Transport & Multiservices began with a simple vision: to transform transportation in Rwanda by combining world-class service with local expertise. What started as a small fleet has grown into a comprehensive multiservices company that serves thousands of satisfied customers across the country.
                </p>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  Our journey has been driven by innovation, integrity, and an unwavering commitment to our community. We&apos;ve evolved from a traditional transport company to a dynamic partner in Rwanda&apos;s growth story.
              </p>
            </div>
              
              <div className="relative animate-fade-in">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-white transform hover:scale-105 transition-all duration-500 hover:shadow-2xl">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 group">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <FaAward className="text-xl sm:text-2xl lg:text-3xl text-yellow-300" />
                      </div>
                <div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">Trusted Partner</h3>
                        <p className="text-blue-100 text-sm sm:text-base">8+ years of reliable service</p>
                </div>
              </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 group">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <FaUsers className="text-xl sm:text-2xl lg:text-3xl text-green-300" />
                      </div>
                <div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">Growing Community</h3>
                        <p className="text-blue-100 text-sm sm:text-base">10,000+ satisfied customers</p>
                </div>
              </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 group">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <FaMapMarkedAlt className="text-xl sm:text-2xl lg:text-3xl text-orange-300" />
                      </div>
                <div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">Nationwide Reach</h3>
                        <p className="text-blue-100 text-sm sm:text-base">Covering all of Rwanda</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                </div>
              </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 animate-fade-in">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Our <span className="text-orange-600">Purpose</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                We&apos;re driven by a clear mission and an ambitious vision for Rwanda&apos;s future
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-blue-100 transform hover:scale-105 transition-all duration-500 hover:shadow-xl animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FaRocket className="text-xl sm:text-2xl lg:text-3xl text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Our Mission</h3>
                </div>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  To provide premium transportation and hospitality services that empower individuals, businesses, and organizations across Rwanda. We&apos;re committed to delivering reliable, innovative, and customer-focused solutions that enhance travel experiences and contribute to our community&apos;s growth.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-orange-100 transform hover:scale-105 transition-all duration-500 hover:shadow-xl animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FaLightbulb className="text-xl sm:text-2xl lg:text-3xl text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Our Vision</h3>
                </div>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  To be Rwanda&apos;s most trusted and innovative transportation partner, setting industry standards for excellence, sustainability, and community impact. We envision a future where quality transportation is accessible to all, driving economic growth and social progress.
                </p>
              </div>
                </div>
              </div>
        </section>

        {/* Core Values Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 animate-fade-in">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                What Drives Us
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Our core values shape every decision we make and every service we provide
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <div className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 transform hover:-translate-y-2 animate-fade-in">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaShieldAlt className="text-lg sm:text-xl lg:text-2xl text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Integrity</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  We conduct business with honesty, transparency, and ethical practices in all our operations.
                </p>
              </div>
              
              <div className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 transform hover:-translate-y-2 animate-fade-in">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaStar className="text-lg sm:text-xl lg:text-2xl text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Excellence</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  We strive for the highest quality in every service, continuously improving and innovating.
                </p>
              </div>
              
              <div className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 transform hover:-translate-y-2 animate-fade-in">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaHeart className="text-lg sm:text-xl lg:text-2xl text-orange-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Community</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  We&apos;re deeply committed to Rwanda&apos;s growth and the well-being of our local communities.
                </p>
              </div>
              
              <div className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 transform hover:-translate-y-2 animate-fade-in">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaClock className="text-lg sm:text-xl lg:text-2xl text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Reliability</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  Our customers can always count on us to deliver on our promises, on time, every time.
                </p>
                </div>
              </div>
            </div>
          </section>

        {/* Services Overview Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 animate-fade-in">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Comprehensive Solutions
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                From transportation to hospitality, we provide end-to-end solutions for all your needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-blue-200 hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaCarSide className="text-lg sm:text-xl lg:text-2xl text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Premium Transportation</h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  Executive taxi services with professional drivers, luxury vehicles, and personalized experiences for business and leisure clients.
                </p>
              </div>
              
              <div className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-orange-200 hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaMapMarkedAlt className="text-lg sm:text-xl lg:text-2xl text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Vehicle Solutions</h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  Flexible rental options, airport transfers with flight tracking, and a diverse fleet of well-maintained vehicles for every need.
                </p>
              </div>
              
              <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-green-200 hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in md:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaHandsHelping className="text-lg sm:text-xl lg:text-2xl text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Hospitality & Consulting</h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  Strategic hotel partnerships, automotive sales expertise, and professional consulting services to enhance your travel experience.
                </p>
              </div>
              </div>
            </div>
          </section>

        {/* Call to Action Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 animate-fade-in">
              Ready to Experience Excellence?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 animate-fade-in">
              Join thousands of satisfied customers who trust KIMU for their transportation and hospitality needs in Rwanda
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in">
              <a 
                href="/rent-a-car" 
                className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 text-base sm:text-lg transform hover:scale-105 hover:shadow-lg"
              >
                Rent a Car
              </a>
              <a 
                href="/contact" 
                className="bg-gray-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-900 transition-all duration-300 text-base sm:text-lg transform hover:scale-105 hover:shadow-lg"
              >
                Get in Touch
              </a>
        </div>
      </div>
        </section>
      </div>


    </>
  )
} 