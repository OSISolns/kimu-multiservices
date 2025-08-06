import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Image from 'next/image'
import FloatingBackground from '@/components/FloatingBackground'
import MobileNav from '@/components/MobileNav'
import { UserProvider } from './UserContext'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'KIMU Transport & Multiservices - Car Rental & Tour Services in Rwanda',
  description: 'Professional car rental services and guided tours in Rwanda. Offering self-drive, chauffeur-driven cars, and comprehensive tour packages.',
  metadataBase: new URL('https://www.kimutransport.co.rw'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.kimutransport.co.rw',
    title: 'KIMU Transport & Multiservices - Car Rental & Tour Services in Rwanda',
    description: 'Professional car rental services and guided tours in Rwanda. Offering self-drive, chauffeur-driven cars, and comprehensive tour packages.',
    siteName: 'KIMU Transport & Multiservices',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KIMU Transport & Multiservices - Car Rental & Tour Services in Rwanda',
    description: 'Professional car rental services and guided tours in Rwanda. Offering self-drive, chauffeur-driven cars, and comprehensive tour packages.',
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
        <UserProvider>
        <FloatingBackground />
        <header className="bg-white shadow-md">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <a href="/" className="flex items-center">
                  <Image 
                    src="/logo.png" 
                    alt="KIMU Transport & Multiservices Logo" 
                    width={100} 
                    height={100}
                    priority
                  />
                </a>
                <span className="text-2xl font-bold text-orange-600">KIMU Transport & Multiservices</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <a href="/" className="relative font-semibold px-2 py-1 transition-colors duration-200 text-gray-800 hover:text-orange-600 after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-orange-600 after:transition-all after:duration-300 hover:after:w-full after:rounded-full">Home</a>
                <a href="/about" className="relative font-semibold px-2 py-1 transition-colors duration-200 text-gray-800 hover:text-orange-600 after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-orange-600 after:transition-all after:duration-300 hover:after:w-full after:rounded-full">About</a>
                <a href="/services" className="relative font-semibold px-2 py-1 transition-colors duration-200 text-gray-800 hover:text-orange-600 after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-orange-600 after:transition-all after:duration-300 hover:after:w-full after:rounded-full">Services</a>
                <a href="/offers" className="relative font-semibold px-2 py-1 transition-colors duration-200 text-gray-800 hover:text-orange-600 after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-orange-600 after:transition-all after:duration-300 hover:after:w-full after:rounded-full">Offers</a>
                <a href="/rent-a-car" className="relative font-semibold px-2 py-1 transition-colors duration-200 text-blue-700 hover:text-orange-600 after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-blue-700 after:transition-all after:duration-300 hover:after:w-full after:rounded-full">Book a Car</a>
                <a href="/contact" className="relative font-semibold px-2 py-1 transition-colors duration-200 text-gray-800 hover:text-orange-600 after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-orange-600 after:transition-all after:duration-300 hover:after:w-full after:rounded-full">Contact</a>
              </div>
              <MobileNav />
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="bg-blue-700 text-white py-8 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Contact Us</h3>
                <p>Phone: +250 798 284 312</p>
                <p>Phone: +250 788 447 574</p>
                <p>Email: kimutransport6@gmail.com</p>
                <p>Address: KG 24 Avenue</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><a href="/" className="hover:text-blue-300">Home</a></li>
                  <li><a href="/about" className="hover:text-blue-300">About</a></li>
                  <li><a href="/services" className="hover:text-blue-300">Services</a></li>
                  <li><a href="/offers" className="hover:text-blue-300">Offers</a></li>
                  <li><a href="/rent-a-car" className="hover:text-blue-300">Book a Car</a></li>
                  <li><a href="/contact" className="hover:text-blue-300">Contact</a></li>
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
            <div className="mt-8 text-center">
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
        </UserProvider>
      </body>
    </html>
  )
} 
