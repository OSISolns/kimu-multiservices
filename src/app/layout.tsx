import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Image from 'next/image'
import Link from 'next/link'

// import MobileNav from '@/components/MobileNav'
import ClientLayoutWrapper from './ClientLayoutWrapper';
import AnnouncementRibbon from '@/components/AnnouncementRibbon';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'KIMU Transport & Multiservices - Car Rental & Tour Services in Rwanda',
  description: 'Professional car rental services and guided tours in Rwanda. Offering self-drive, chauffeur-driven cars, and comprehensive tour packages.',
  metadataBase: new URL('https://www.kimutransport.co.rw'),
  icons: {
    icon: [
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.kimutransport.co.rw',
    title: 'KIMU Transport & Multiservices - Car Rental & Tour Services in Rwanda',
    description: 'Professional car rental services and guided tours in Rwanda. Offering self-drive, chauffeur-driven cars, and comprehensive tour packages.',
    siteName: 'KIMU Transport & Multiservices',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'KIMU Transport Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KIMU Transport & Multiservices - Car Rental & Tour Services in Rwanda',
    description: 'Professional car rental services and guided tours in Rwanda. Offering self-drive, chauffeur-driven cars, and comprehensive tour packages.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>

        <AnnouncementRibbon />
        <header className="bg-white shadow-md">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/logo.png"
                    alt="KIMU Transport & Multiservices Logo"
                    width={100}
                    height={100}
                    priority
                  />
                </Link>
                <span className="text-2xl font-bold">
                  <span className="text-orange-600">KIMU</span> <span className="text-blue-600">Transport</span> & <span className="text-orange-600">Multiservices</span>
                </span>
              </div>
              <div className="hidden md:flex space-x-6 items-center">
                <Link href="/" className="relative font-semibold px-2 py-1 transition-colors duration-200 text-gray-800 hover:text-orange-600 after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-orange-600 after:transition-all after:duration-300 hover:after:w-full after:rounded-full">Home</Link>
                <Link href="/about" className="relative font-semibold px-2 py-1 transition-colors duration-200 text-gray-800 hover:text-orange-600 after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-orange-600 after:transition-all after:duration-300 hover:after:w-full after:rounded-full">About</Link>
                <Link href="/services" className="relative font-semibold px-2 py-1 transition-colors duration-200 text-gray-800 hover:text-orange-600 after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-orange-600 after:transition-all after:duration-300 hover:after:w-full after:rounded-full">Services</Link>
                <Link href="/offers" className="relative font-semibold px-2 py-1 transition-colors duration-200 text-gray-800 hover:text-orange-600 after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-orange-600 after:transition-all after:duration-300 hover:after:w-full after:rounded-full">Offers</Link>
                <Link href="/rent-a-car" className="relative font-semibold px-2 py-1 transition-colors duration-200 text-blue-700 hover:text-orange-600 after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-blue-700 after:transition-all after:duration-300 hover:after:w-full after:rounded-full">Book a Car</Link>
                <Link href="/contact" className="relative font-semibold px-2 py-1 transition-colors duration-200 text-gray-800 hover:text-orange-600 after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-orange-600 after:transition-all after:duration-300 hover:after:w-full after:rounded-full">Contact</Link>

                {/* Login Icon */}
                <Link
                  href="/staff/login"
                  className="ml-2 p-2 rounded-full transition-all duration-300 text-gray-600 hover:text-orange-600 hover:bg-orange-50 group"
                  aria-label="Staff Login"
                  title="Staff Login"
                >
                  <svg
                    className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Link>
              </div>
              {/* <MobileNav /> */}
            </div>
          </nav>
        </header>
        <ClientLayoutWrapper>
          <main>{children}</main>
        </ClientLayoutWrapper>
        <footer className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 text-white py-8 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">
                  Contact <span className="text-orange-300">Us</span>
                </h3>
                <p>Phone: +250 792 958 752</p>
                <p>Email: kimutransport6@gmail.com</p>
                <p>Address: Gisozi, KG 780 St</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">
                  Quick <span className="text-orange-300">Links</span>
                </h3>
                <ul className="space-y-2">
                  <li><Link href="/" className="hover:text-orange-300 transition-colors">Home</Link></li>
                  <li><Link href="/about" className="hover:text-orange-300 transition-colors">About</Link></li>
                  <li><Link href="/services" className="hover:text-orange-300 transition-colors">Services</Link></li>
                  <li><Link href="/offers" className="hover:text-orange-300 transition-colors">Offers</Link></li>
                  <li><Link href="/rent-a-car" className="hover:text-orange-300 transition-colors">Book a Car</Link></li>
                  <li><Link href="/contact" className="hover:text-orange-300 transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Our Services</h3>
                <ul className="space-y-2">
                  <li>Car rental & professional chauffeur</li>
                  <li>TAXI services</li>
                  <li>Accommodation booking services</li>
                </ul>
              </div>
            </div>

            {/* Social Media Links Section */}
            <div className="mt-8 mb-6 text-center">
              <h3 className="text-lg font-bold mb-4 text-orange-300">Follow Us</h3>
              <div className="flex justify-center space-x-8">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/profile.php?id=61577156153777"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-gray-400 hover:text-orange-500 transition-all duration-300 transform hover:scale-110"
                  aria-label="Follow us on Facebook"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/kimu_transport/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-gray-400 hover:text-orange-500 transition-all duration-300 transform hover:scale-110"
                  aria-label="Follow us on Instagram"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/250792958752"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-gray-400 hover:text-orange-500 transition-all duration-300 transform hover:scale-110"
                  aria-label="Contact us on WhatsApp"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@KIMUTRANSPORT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-gray-400 hover:text-orange-500 transition-all duration-300 transform hover:scale-110"
                  aria-label="Subscribe to our YouTube channel"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@kimu2500"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-gray-400 hover:text-orange-500 transition-all duration-300 transform hover:scale-110"
                  aria-label="Follow us on TikTok"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="mt-6 text-center border-t border-blue-600 pt-6">
              <p>Copyright © {new Date().getFullYear()} KIMU Transport & Multiservices | Powered by <a href="https://osisolutions.pro" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-orange-300">OSI SOLUTIONS LTD</a></p>
            </div>
          </div>
          {/* Faint Logo Silhouette */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-40 pointer-events-none">
            <Image
              src="/logo.png"
              alt="KIMU Logo Silhouette"
              width={300}
              height={300}
              className="filter brightness-0 invert opacity-90"
            />
          </div>
        </footer>

      </body>
    </html>
  )
} 
