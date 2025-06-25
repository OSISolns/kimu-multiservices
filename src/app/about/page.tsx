import Head from 'next/head'
import Image from 'next/image'
import { FaUserTie, FaCarSide, FaHandsHelping } from 'react-icons/fa'

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
      <div className="min-h-screen py-12 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-8 animate-fadeIn">
            <Image src="/logo.png" alt="KIMU Transport & Multiservices Logo" width={120} height={120} className="mb-2 drop-shadow-2xl" />
            <h1 className="text-4xl font-bold text-center mb-2 text-blue-900 drop-shadow-xl">About KIMU Transport & Multiservices</h1>
            <div className="h-1 w-24 bg-orange-500 rounded-full mb-4" />
          </div>

          {/* Mission Statement */}
          <section className="max-w-3xl mx-auto text-center mb-16 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-blue-800">Our Mission</h2>
            <p className="text-gray-600 text-lg">
              At KIMU Transport & Multiservices, our mission is to provide premium transportation and hospitality services to individuals, businesses, and organizations in Rwanda. We are committed to delivering reliable, innovative, and customer-focused solutions that enhance travel experiences and empower our community.
            </p>
          </section>

          {/* Company Overview - now a card with more shadow and animation */}
          <section className="flex flex-col md:flex-row gap-12 mb-16 items-center animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl p-10 transition-all duration-300 hover:shadow-blue-300 flex-1">
              <h2 className="text-2xl font-bold mb-6 text-blue-800">Who We Are</h2>
              <p className="text-gray-600 mb-4">
                KIMU Transport & Multiservices is a dynamic Rwandan company offering premium transportation and hospitality services. Our experienced team is dedicated to excellence in every area we serve, from safe and efficient transportation to luxury vehicle sales and hotel accommodations.
              </p>
              <p className="text-gray-600">
                We are passionate about supporting our clients with dependable, high-quality services tailored to their needs. Our commitment to integrity, professionalism, and innovation sets us apart in the industry.
              </p>
            </div>
          </section>

          {/* What We Offer - staggered cards */}
          <section id="what-we-offer" className="mb-16 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-blue-800 text-center animate-fadeIn">What We Offer</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-xl p-8 flex items-start gap-3 animate-fadeIn hover:shadow-blue-200 transition-all duration-300">
                <span className="text-blue-600 text-2xl mt-1">•</span>
                <div>
                  <div className="font-semibold text-blue-900 mb-1">Premium Taxi Services</div>
                  <div className="text-gray-600 text-sm">Executive transportation solutions with professional drivers for both business and leisure clients.</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-8 flex items-start gap-3 animate-fadeIn hover:shadow-blue-200 transition-all duration-300">
                <span className="text-blue-600 text-2xl mt-1">•</span>
                <div>
                  <div className="font-semibold text-blue-900 mb-1">Vehicle Rental Solutions</div>
                  <div className="text-gray-600 text-sm">Flexible and comprehensive vehicle rental services with a diverse fleet of well-maintained vehicles.</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-8 flex items-start gap-3 animate-fadeIn hover:shadow-blue-200 transition-all duration-300">
                <span className="text-blue-600 text-2xl mt-1">•</span>
                <div>
                  <div className="font-semibold text-blue-900 mb-1">Airport Transfer Excellence</div>
                  <div className="text-gray-600 text-sm">Premium airport transportation services with real-time flight tracking.</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-8 flex items-start gap-3 animate-fadeIn hover:shadow-blue-200 transition-all duration-300">
                <span className="text-blue-600 text-2xl mt-1">•</span>
                <div>
                  <div className="font-semibold text-blue-900 mb-1">Hotel Accommodation Services</div>
                  <div className="text-gray-600 text-sm">Strategic partnerships with premium hotels across Rwanda.</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-8 flex items-start gap-3 animate-fadeIn hover:shadow-blue-200 transition-all duration-300 col-span-1 sm:col-span-2 mx-auto w-full sm:w-2/3">
                <span className="text-blue-600 text-2xl mt-1">•</span>
                <div>
                  <div className="font-semibold text-blue-900 mb-1">Automotive Sales & Consultancy</div>
                  <div className="text-gray-600 text-sm">Professional vehicle sales services with expert guidance and after-sales support.</div>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Us - animated cards with more shadow */}
          <section className="bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-8 text-center text-blue-800 animate-fadeIn">Why Choose KIMU Transport & Multiservices</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center bg-white rounded-2xl p-8 shadow-2xl transition-all duration-300 cursor-pointer hover:shadow-blue-300 flex flex-col items-center animate-fadeIn">
                <FaUserTie className="text-4xl text-blue-600 mb-3" />
                <h3 className="text-xl font-semibold mb-2">Professional Service</h3>
                <p className="text-gray-600">
                  Our team of experienced professionals ensures the highest quality of service in every area we operate.
                </p>
              </div>
              <div className="text-center bg-white rounded-2xl p-8 shadow-2xl transition-all duration-300 cursor-pointer hover:shadow-blue-300 flex flex-col items-center animate-fadeIn">
                <FaCarSide className="text-4xl text-orange-500 mb-3" />
                <h3 className="text-xl font-semibold mb-2">Premium Solutions</h3>
                <p className="text-gray-600">
                  We offer a comprehensive range of premium services—transportation, vehicle rentals, airport transfers, hotel bookings, and automotive sales—all under one roof.
                </p>
              </div>
              <div className="text-center bg-white rounded-2xl p-8 shadow-2xl transition-all duration-300 cursor-pointer hover:shadow-blue-300 flex flex-col items-center animate-fadeIn">
                <FaHandsHelping className="text-4xl text-green-600 mb-3" />
                <h3 className="text-xl font-semibold mb-2">Community Focus</h3>
                <p className="text-gray-600">
                  We are committed to empowering our community with reliable, accessible, and innovative solutions tailored to local needs.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
} 