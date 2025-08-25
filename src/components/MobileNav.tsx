'use client'
import { useState } from 'react';
import Link from 'next/link';

export default function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <div className="md:hidden flex items-center">
        <button
          className="text-3xl text-orange-600 focus:outline-none"
          aria-label="Open menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white shadow-lg z-50 animate-fade-in">
          <div className="flex flex-col items-center py-6 space-y-4">
            <Link href="/" className="font-semibold text-lg text-gray-800 hover:text-orange-600" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/about" className="font-semibold text-lg text-gray-800 hover:text-orange-600" onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/services" className="font-semibold text-lg text-gray-800 hover:text-orange-600" onClick={() => setMenuOpen(false)}>Services</Link>
            <Link href="/offers" className="font-semibold text-lg text-gray-800 hover:text-orange-600" onClick={() => setMenuOpen(false)}>Offers</Link>
            <Link href="/rent-a-car" className="font-semibold text-lg text-blue-700 hover:text-orange-600" onClick={() => setMenuOpen(false)}>Book a Car</Link>
            <Link href="/contact" className="font-semibold text-lg text-gray-800 hover:text-orange-600" onClick={() => setMenuOpen(false)}>Contact</Link>
          </div>
        </div>
      )}
    </>
  );
} 