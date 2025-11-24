'use client'

import { useState, useEffect } from 'react'
import { Vehicle } from '@/types/vehicle'
import HeroSection from '@/components/home/HeroSection'
import ServicesSection from '@/components/home/ServicesSection'
import FeaturedBrands from '@/components/home/FeaturedBrands'
import VideoSection from '@/components/home/VideoSection'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import CTASection from '@/components/home/CTASection'
import VehicleModal from '@/components/home/VehicleModal'
import DealBanner from '@/components/home/DealBanner'

export default function Home() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedCar, setSelectedCar] = useState<Vehicle | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDealBanner, setShowDealBanner] = useState(true);

  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        setVehicles(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Error fetching vehicles:', err);
        setVehicles([]);
      });
  }, []);

  const openCarModal = (car: Vehicle) => {
    try {
      console.log('Opening modal for car:', car)
      setSelectedCar(car)
      setIsModalOpen(true)
      document.body.style.overflow = 'hidden'
    } catch (error) {
      console.error('Error opening car modal:', error)
    }
  }

  const closeCarModal = () => {
    try {
      setIsModalOpen(false)
      setSelectedCar(null)
      document.body.style.overflow = 'unset'
    } catch (error) {
      console.error('Error closing car modal:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-gray-100 text-gray-900">
      {showDealBanner && (
        <DealBanner onDismiss={() => setShowDealBanner(false)} />
      )}

      <HeroSection />
      <ServicesSection />
      <FeaturedBrands vehicles={vehicles} onVehicleSelect={openCarModal} />
      <VideoSection />
      <WhyChooseUs />
      <CTASection />

      <VehicleModal
        vehicle={selectedCar}
        isOpen={isModalOpen}
        onClose={closeCarModal}
      />
    </div>
  )
}