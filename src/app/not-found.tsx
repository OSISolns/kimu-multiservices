'use client'

import Link from 'next/link';
import { FaEnvelope, FaPhone, FaWhatsapp } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600 opacity-20 select-none">
            404
          </h1>
        </div>

        {/* Main Content */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-xl text-gray-600 mb-6 max-w-md mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Go Home
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Go Back
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Popular Pages
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: '/offers', label: 'Offers' },
              { href: '/rent-a-car', label: 'Rent a Car' },
              { href: '/services', label: 'Services' },
              { href: '/contact', label: 'Contact' },
              { href: '/about', label: 'About' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 hover:shadow-md"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-lg mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Need Help?
          </h3>
          <p className="text-gray-600 mb-4">
            If you believe this is an error or need assistance, please contact our support team.
          </p>
          <div className="text-sm text-gray-600 space-y-2 flex flex-col items-center">
            <p className="flex items-center gap-2">
              <FaEnvelope className="text-blue-500" />
              <span>Email: kimutransport6@gmail.com</span>
            </p>
            <p className="flex items-center gap-2">
              <FaPhone className="text-green-500" />
              <span>Phone: +250 792 958 752</span>
            </p>
            <p className="flex items-center gap-2">
              <FaWhatsapp className="text-emerald-500" />
              <span>WhatsApp: +250 792 958 752</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} KIMU Transport & Multiservices. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
