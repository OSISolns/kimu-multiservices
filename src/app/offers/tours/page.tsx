'use client'

import React, { useState } from 'react'
import { FaMapMarkedAlt, FaCompass, FaBinoculars, FaCameraRetro, FaCheckCircle, FaSpinner, FaWhatsapp } from 'react-icons/fa'
import Image from 'next/image'

const tours = [
  {
    id: 'kigali-city',
    title: 'Kigali City Exploration',
    description: 'Discover the heartbeat of Rwanda. Visit the Kigali Genocide Memorial, local markets, and enjoy panoramic views from Mt. Kigali.',
    duration: 'Full Day',
    price: 'From $50',
    image: 'https://images.unsplash.com/photo-1589197331516-4d84593e04e7?auto=format&fit=crop&q=80&w=800',
    icon: <FaCompass className="text-orange-500" />
  },
  {
    id: 'wildlife-safari',
    title: 'Akagera Wildlife Safari',
    description: 'A thrilling journey through Akagera National Park. Spot the Big Five, zebras, giraffes, and a variety of bird species.',
    duration: '2-3 Days',
    price: 'From $250',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
    icon: <FaBinoculars className="text-blue-500" />
  },
  {
    id: 'cultural-experience',
    title: 'Cultural Heritage Tour',
    description: 'Immerse yourself in Rwandan traditions. Visit the King\'s Palace in Nyanza and learn about ancient customs and dances.',
    duration: 'Full Day',
    price: 'From $80',
    image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&q=80&w=800',
    icon: <FaCameraRetro className="text-emerald-500" />
  }
]

export default function ToursPage() {
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [selectedTour, setSelectedTour] = useState(tours[0]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    guests: '1'
  });

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingStatus('submitting');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-username': 'guest' // Using a dummy username for guest bookings if required
        },
        body: JSON.stringify({
          type: 'City Tour',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          pickupDate: formData.date,
          notes: `Tour: ${selectedTour.title} | Guests: ${formData.guests}`,
          status: 'Pending'
        }),
      });

      if (response.ok) {
        setBookingStatus('success');
      } else {
        setBookingStatus('error');
      }
    } catch (err) {
      console.error(err);
      setBookingStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1600" 
          alt="Rwanda Tours" 
          fill 
          className="object-cover brightness-50"
          priority
        />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight animate-fade-in">
            Discover <span className="text-orange-500">Rwanda</span>
          </h1>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto font-medium leading-relaxed">
            Experience the breathtaking beauty of the Land of a Thousand Hills with our premium guided tours and wildlife safaris.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Tour Listings */}
          <div className="flex-1 space-y-12">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-2">Signature Experiences</h2>
              <p className="text-slate-500 font-medium">Curated journeys designed to show you the very best of Rwanda</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tours.map((tour) => (
                <div 
                  key={tour.id} 
                  className={`bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 border-2 transition-all duration-500 group cursor-pointer ${selectedTour.id === tour.id ? 'border-orange-500 ring-4 ring-orange-100' : 'border-transparent'}`}
                  onClick={() => setSelectedTour(tour)}
                >
                  <div className="relative h-48">
                    <Image src={tour.image} alt={tour.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl font-black text-xs text-orange-600 shadow-lg">
                      {tour.price}
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl">
                        {tour.icon}
                      </div>
                      <h3 className="text-xl font-black text-slate-800">{tour.title}</h3>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      {tour.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{tour.duration}</span>
                      <button className={`text-sm font-bold ${selectedTour.id === tour.id ? 'text-orange-600' : 'text-blue-600 hover:underline'}`}>
                        {selectedTour.id === tour.id ? 'Selected' : 'Select Tour'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:w-[400px]">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-orange-200/20 p-10 sticky top-10 border border-slate-100">
              <h3 className="text-2xl font-black text-slate-900 mb-6">Book Your Trip</h3>
              
              {bookingStatus === 'success' ? (
                <div className="text-center py-10 animate-fade-in">
                  <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-slate-800 mb-2">Booking Received!</h4>
                  <p className="text-slate-500 text-sm mb-6">Our tour coordinator will contact you shortly to finalize your adventure.</p>
                  <button 
                    onClick={() => setBookingStatus('idle')}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                  >
                    Make Another Booking
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 mb-6">
                    <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Selected Experience</div>
                    <div className="text-sm font-bold text-orange-900">{selectedTour.title}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                      <input 
                        required
                        type="email" 
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone</label>
                      <input 
                        required
                        type="tel" 
                        placeholder="+250..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Date</label>
                      <input 
                        required
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Guests</label>
                      <select 
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium text-sm"
                      >
                        {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>)}
                      </select>
                    </div>
                  </div>

                  <button 
                    disabled={bookingStatus === 'submitting'}
                    className="w-full py-5 bg-orange-500 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-orange-500/20 hover:bg-orange-600 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
                  >
                    {bookingStatus === 'submitting' ? <FaSpinner className="animate-spin mx-auto" /> : 'Confirm Adventure'}
                  </button>

                  <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest pt-4">
                    Or chat with us via <a href="https://wa.me/250780000000" className="text-green-500 hover:underline">WhatsApp</a>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 