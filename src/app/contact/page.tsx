'use client'

import { useState } from 'react'
import Head from 'next/head'
import AnimatedSection from '../../components/AnimatedSection'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaCar, FaHotel, FaYoutube, FaWhatsapp, FaClock, FaLocationDot, FaPhone, FaEnvelope } from 'react-icons/fa6'
import Image from 'next/image'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
    urgency: 'standard'
  })

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      service: '',
      message: ''
    }
    let isValid = true

    if (!formData.name.trim()) {
      newErrors.name = 'Please provide your full name'
      isValid = false
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
      isValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
      isValid = false
    }

    if (formData.phone && !/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
      isValid = false
    }

    if (!formData.service) {
      newErrors.service = 'Please select a service type'
      isValid = false
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please tell us about your inquiry'
      isValid = false
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsSubmitting(true)

      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))

      // WhatsApp integration with better formatting
      const phone = '250792958752'
      const urgencyText = formData.urgency === 'urgent' ? 'URGENT: ' : ''
      const msg =
        `${urgencyText}New Inquiry from KIMU Website%0A%0A` +
        `👤 *Name:* ${formData.name}%0A` +
        `📧 *Email:* ${formData.email}%0A` +
        `📱 *Phone:* ${formData.phone || 'Not provided'}%0A` +
        `🚗 *Service:* ${formData.service}%0A` +
        `⏰ *Urgency:* ${formData.urgency === 'urgent' ? 'High Priority' : 'Standard'}%0A%0A` +
        `💬 *Message:* ${formData.message}%0A%0A` +
        `🌐 *Source:* Website Contact Form`

      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <>
      <Head>
        <title>Contact KIMU Transport & Multiservices</title>
        <meta name="description" content="Contact KIMU Transport & Multiservices for premium taxi services, vehicle rentals, airport transfers, hotel bookings, and automotive sales in Rwanda." />
        <meta property="og:title" content="Contact KIMU Transport & Multiservices" />
        <meta property="og:description" content="Contact KIMU Transport & Multiservices for premium taxi services, vehicle rentals, airport transfers, hotel bookings, and automotive sales in Rwanda." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kimu.osisolutions.pro/contact" />
        <meta property="og:image" content="/logo.png" />
      </Head>
      <div className="min-h-screen relative overflow-hidden py-12">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10 animate-fade-in">
          <svg width="100%" height="100%" className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0 }}>
            <circle cx="20%" cy="20%" r="120" fill="#3b82f6" opacity="0.3">
              <animate attributeName="r" values="120;140;120" dur="6s" repeatCount="indefinite" />
            </circle>
            <circle cx="80%" cy="80%" r="100" fill="#f97316" opacity="0.3">
              <animate attributeName="r" values="100;120;100" dur="7s" repeatCount="indefinite" />
            </circle>
          </svg>
          {/* Car Icon Animation */}
          <FaCar className="text-blue-400 absolute left-10 top-10 text-[120px] animate-bounce-slow" style={{ filter: 'blur(1px)' }} />
          {/* Hotel Icon Animation */}
          <FaHotel className="text-orange-400 absolute right-10 bottom-10 text-[100px] animate-bounce-slower" style={{ filter: 'blur(1px)' }} />
          {/* Company Logo Animation */}
          <div className="absolute right-10 top-10 animate-fade-scale">
            <Image src="/logo.png" alt="Company Logo" width={90} height={90} className="opacity-60" style={{ filter: 'blur(0.5px)' }} unoptimized />
          </div>
        </div>
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-12">
            Get in <span className="text-orange-600">Touch</span>
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <AnimatedSection as="div">
              <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-orange-200">
                <h2 className="text-2xl font-bold mb-6">
                  Contact <span className="text-blue-600">Details</span>
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <FaPhone className="text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Phone Numbers</h3>
                      <p className="text-gray-600">+250 792 958 752</p>
                  </div>
              
                  <div className="flex items-start space-x-3">
                    <FaEnvelope className="text-orange-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Email</h3>
                      <p className="text-gray-600">kimutransport6@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaLocationDot className="text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Office Location</h3>
                      <p className="text-gray-600">KG 780 St Gisozi, Kigali-City, Rwanda</p>
                      <p className="text-sm text-gray-500">Near Gisozi Sector</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaClock className="text-orange-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Operating Hours</h3>
                      <p className="text-gray-600">Monday - Friday: 7:30 AM - 7:00 PM</p>
                      <p className="text-gray-600">Saturday: 8:00 AM - 4:00 PM</p>
                      <p className="text-gray-600">Sunday: 9:00 AM - 2:00 PM</p>
                      <p className="text-sm text-gray-500 mt-1">24/7 Emergency Services Available</p>
                    </div>
                  </div>
                  {/* Social Media Links */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Connect With <span className="text-orange-600">Us</span>
                    </h3>
                    <div className="flex space-x-3">
                      <a href="https://www.facebook.com/profile.php?id=61577156153777" target="_blank" rel="noopener noreferrer" aria-label="Facebook - Kimu Transport & Multiservices Ltd"
                        title="Kimu Transport & Multiservices Ltd on Facebook"
                        className="rounded-full bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 transition-all p-3 text-xl shadow-sm">
                        <FaFacebookF />
                      </a>
                      <a href="https://www.instagram.com/kimu_transport/" target="_blank" rel="noopener noreferrer" aria-label="Instagram - Kimu Transport & Multiservices Ltd"
                        title="Kimu Transport & Multiservices Ltd on Instagram"
                        className="rounded-full bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-500 transition-all p-3 text-xl shadow-sm">
                        <FaInstagram />
                      </a>
                      <a href="https://www.tiktok.com/@kimu2500?_t=ZM-8xThdmR7Jzx&_r=1" target="_blank" rel="noopener noreferrer" aria-label="TikTok - Kimu Transport & Multiservices Ltd"
                        title="Kimu Transport & Multiservices Ltd on TikTok"
                        className="rounded-full bg-orange-100 hover:bg-orange-600 hover:text-white text-orange-600 transition-all p-3 text-xl shadow-sm">
                        <FaTiktok />
                      </a>
                      <a href="https://www.youtube.com/@kimu_transport" target="_blank" rel="noopener noreferrer" aria-label="YouTube - Kimu Transport & Multiservices Ltd"
                        title="Kimu Transport & Multiservices Ltd on YouTube"
                        className="rounded-full bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-600 transition-all p-3 text-xl shadow-sm">
                        <FaYoutube />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
            {/* Contact Form */}
            <AnimatedSection as="div">
              <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-orange-200">
                <h2 className="text-2xl font-bold mb-6">
                  Send us a <span className="text-blue-600">Message</span>
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                      className={`w-full px-4 py-2.5 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors`}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+250 792 958 752"
                      className={`w-full px-4 py-2.5 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                      Service Type *
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border ${errors.service ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors`}
                    >
                      <option value="">Choose your service</option>
                      <option value="Premium Taxi Services">Premium Taxi Services</option>
                      <option value="Vehicle Rental Solutions">Vehicle Rental Solutions</option>
                      <option value="Airport Transfer Excellence">Airport Transfer Excellence</option>
                      <option value="Hotel Accommodation Services">Hotel Accommodation Services</option>
                      <option value="Automotive Sales & Consultancy">Automotive Sales & Consultancy</option>
                      <option value="Corporate Travel Solutions">Corporate Travel Solutions</option>
                      <option value="Event Transportation">Event Transportation</option>
                    </select>
                    {errors.service && <p className="mt-1 text-sm text-red-600">{errors.service}</p>}
                  </div>
                  <div>
                    <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
                      Urgency Level
                    </label>
                    <select
                      id="urgency"
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="standard">Standard (24-48 hours)</option>
                      <option value="urgent">Urgent (Same day)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message Details *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your requirements, preferred dates, and any specific needs..."
                      required
                      rows={4}
                      className={`w-full px-4 py-2.5 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors`}
                    ></textarea>
                    {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 rounded-lg shadow-lg transition-all font-semibold flex items-center justify-center space-x-2 ${isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 hover:scale-105'
                      } text-white`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <FaWhatsapp className="text-lg" />
                        <span>Send via WhatsApp</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    * Required fields. We&apos;ll respond within 24 hours during business days.
                  </p>
                </form>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </>
  )
} 
