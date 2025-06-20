import Head from 'next/head'

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
          <h1 className="text-4xl font-bold text-center mb-12">About KIMU Transport & Multiservices</h1>

          {/* Mission Statement */}
          <section
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-600 text-lg">
              At KIMU Transport & Multiservices, our mission is to provide premium transportation and hospitality services to individuals, businesses, and organizations in Rwanda. We are committed to delivering reliable, innovative, and customer-focused solutions that enhance travel experiences and empower our community.
            </p>
          </section>

          {/* Company Overview */}
          <section
            className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16"
          >
            <div className="bg-white rounded-xl shadow-md p-8 transition-all duration-300 cursor-pointer hover:shadow-blue-200">
              <h2 className="text-2xl font-bold mb-6">Who We Are</h2>
              <p className="text-gray-600 mb-4">
                KIMU Transport & Multiservices is a dynamic Rwandan company offering premium transportation and hospitality services. Our experienced team is dedicated to excellence in every area we serve, from safe and efficient transportation to luxury vehicle sales and hotel accommodations.
              </p>
              <p className="text-gray-600">
                We are passionate about supporting our clients with dependable, high-quality services tailored to their needs. Our commitment to integrity, professionalism, and innovation sets us apart in the industry.
              </p>
            </div>

            <div id="what-we-offer" className="bg-white rounded-xl shadow-md p-8 transition-all duration-300 cursor-pointer hover:shadow-blue-200">
              <h2 className="text-2xl font-bold mb-6">What We Offer</h2>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start"><span className="text-blue-600 mr-2">•</span> Premium Taxi Services: Executive transportation solutions with professional drivers for both business and leisure clients.</li>
                <li className="flex items-start"><span className="text-blue-600 mr-2">•</span> Vehicle Rental Solutions: Flexible and comprehensive vehicle rental services with a diverse fleet of well-maintained vehicles.</li>
                <li className="flex items-start"><span className="text-blue-600 mr-2">•</span> Airport Transfer Excellence: Premium airport transportation services with real-time flight tracking.</li>
                <li className="flex items-start"><span className="text-blue-600 mr-2">•</span> Hotel Accommodation Services: Strategic partnerships with premium hotels across Rwanda.</li>
                <li className="flex items-start"><span className="text-blue-600 mr-2">•</span> Automotive Sales & Consultancy: Professional vehicle sales services with expert guidance and after-sales support.</li>
              </ul>
            </div>
          </section>

          {/* Why Choose Us */}
          <section
            className="bg-blue-50 rounded-lg p-8"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Why Choose KIMU Transport & Multiservices</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center bg-white rounded-xl p-6 shadow-md transition-all duration-300 cursor-pointer hover:shadow-blue-200">
                <h3 className="text-xl font-semibold mb-4">Professional Service</h3>
                <p className="text-gray-600">
                  Our team of experienced professionals ensures the highest quality of service in every area we operate.
                </p>
              </div>
              <div className="text-center bg-white rounded-xl p-6 shadow-md transition-all duration-300 cursor-pointer hover:shadow-blue-200">
                <h3 className="text-xl font-semibold mb-4">Premium Solutions</h3>
                <p className="text-gray-600">
                  We offer a comprehensive range of premium services—transportation, vehicle rentals, airport transfers, hotel bookings, and automotive sales—all under one roof.
                </p>
              </div>
              <div className="text-center bg-white rounded-xl p-6 shadow-md transition-all duration-300 cursor-pointer hover:shadow-blue-200">
                <h3 className="text-xl font-semibold mb-4">Community Focus</h3>
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