'use client'

import { useState } from 'react'
import Head from 'next/head'
import AnimatedSection from '../../components/AnimatedSection'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaCar, FaHotel, FaYoutube } from 'react-icons/fa6'
import Image from 'next/image'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  })

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  })

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
      newErrors.name = 'Name is required'
      isValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
      isValid = false
    }

    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
      isValid = false
    }

    if (!formData.service) {
      newErrors.service = 'Please select a service'
      isValid = false
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
    // WhatsApp integration
    const phone = '250798284312'
    const msg =
      `Name: ${formData.name}%0A` +
      `Email: ${formData.email}%0A` +
      `Phone: ${formData.phone}%0A` +
      `Service Interested In: ${formData.service}%0A` +
      `Message: ${formData.message}`
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
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
            <circle cx="20%" cy="20%" r="120" fill="#e0f2fe" opacity="0.5">
              <animate attributeName="r" values="120;140;120" dur="6s" repeatCount="indefinite" />
            </circle>
            <circle cx="80%" cy="80%" r="100" fill="#fef9c3" opacity="0.4">
              <animate attributeName="r" values="100;120;100" dur="7s" repeatCount="indefinite" />
            </circle>
          </svg>
          {/* Car Icon Animation */}
          <FaCar className="text-blue-200 absolute left-10 top-10 text-[120px] animate-bounce-slow" style={{ filter: 'blur(1px)' }} />
          {/* Hotel Icon Animation */}
          <FaHotel className="text-yellow-200 absolute right-10 bottom-10 text-[100px] animate-bounce-slower" style={{ filter: 'blur(1px)' }} />
          {/* Company Logo Animation */}
          <div className="absolute right-10 top-10 animate-fade-scale">
            <Image src="/logo.png" alt="Company Logo" width={90} height={90} className="opacity-60" style={{ filter: 'blur(0.5px)' }} />
          </div>
        </div>
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-12">Contact Us</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <AnimatedSection as="div">
              <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-blue-200">
                <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Phone</h3>
                    <p className="text-gray-600">+250 798 284 312</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Email</h3>
                    <p className="text-gray-600">kimu.transport6@gmail.com</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Address</h3>
                    <p className="text-gray-600">KG 24 St, Kigali, Rwanda</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Business Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 9:00 AM - 2:00 PM</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                  {/* Social Media Links */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2 mt-6">Follow us</h3>
                    <div className="flex space-x-4">
                      <a href="https://www.facebook.com/profile.php?id=61577156153777" target="_blank" rel="noopener noreferrer" aria-label="Facebook - Kimu Transport & Multiservices Ltd"
                        title="Kimu Transport & Multiservices Ltd on Facebook"
                        className="rounded-full bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 transition-all p-3 text-2xl shadow-sm">
                        <FaFacebookF />
                      </a>
                      <a href="https://www.instagram.com/kimu_transport/" target="_blank" rel="noopener noreferrer" aria-label="Instagram - Kimu Transport & Multiservices Ltd"
                        title="Kimu Transport & Multiservices Ltd on Instagram"
                        className="rounded-full bg-pink-50 hover:bg-pink-500 hover:text-white text-pink-500 transition-all p-3 text-2xl shadow-sm">
                        <FaInstagram />
                      </a>
                      <a href="https://www.tiktok.com/@kimu2500?_t=ZM-8xThdmR7Jzx&_r=1" target="_blank" rel="noopener noreferrer" aria-label="TikTok - Kimu Transport & Multiservices Ltd"
                        title="Kimu Transport & Multiservices Ltd on TikTok"
                        className="rounded-full bg-black hover:bg-pink-600 hover:text-white text-white transition-all p-3 text-2xl shadow-sm">
                        <FaTiktok />
                      </a>
                      <a href="https://www.youtube.com/@kimu_transport" target="_blank" rel="noopener noreferrer" aria-label="YouTube - Kimu Transport & Multiservices Ltd"
                        title="Kimu Transport & Multiservices Ltd on YouTube"
                        className="rounded-full bg-red-100 hover:bg-red-600 hover:text-white text-red-600 transition-all p-3 text-2xl shadow-sm">
                        <FaYoutube />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
            {/* Contact Form */}
            <AnimatedSection as="div">
              <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-blue-200">
                <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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
                      className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                      Service Interested In
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${errors.service ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="">Select a service</option>
                      <option value="Premium Taxi Services">Premium Taxi Services</option>
                      <option value="Vehicle Rental Solutions">Vehicle Rental Solutions</option>
                      <option value="Airport Transfer Excellence">Airport Transfer Excellence</option>
                      <option value="Hotel Accommodation Services">Hotel Accommodation Services</option>
                      <option value="Automotive Sales & Consultancy">Automotive Sales & Consultancy</option>
                    </select>
                    {errors.service && <p className="mt-1 text-sm text-red-600">{errors.service}</p>}
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className={`w-full px-4 py-2 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    ></textarea>
                    {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 hover:scale-105 shadow-lg transition-all font-semibold"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </>
  )
} 