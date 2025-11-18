'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaTimes, FaCar, FaCalendar, FaRoad, FaGasPump, FaCog, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

interface Car {
  id: number
  name: string
  image: string
  type: string
  category: string
  price: string
  year: number
  engine: string
  mileage: string
  transmission: string
  fuel: string
  capacity: string
  doors: number
  description: string
  isAvailable: boolean
  power: string
  fuelEfficiency: string
  quantity: number
  status: string
  licensePlate?: string
  vehicleId?: string
}

interface CarListModalProps {
  isOpen: boolean
  onClose: () => void
  modelName: string
  cars: Car[]
}

export default function CarListModal({ isOpen, onClose, modelName, cars }: CarListModalProps) {
  if (!isOpen) return null

  // Support model-level quantity by generating a list of available cars
  const first = cars[0]
  const quantity = first?.quantity && first.quantity > 0 ? first.quantity : cars.length
  function generatePlate(): string {
    // Rwanda series: restrict to RAD .. RAI only
    const allowedSeries = ['RAD', 'RAE', 'RAF', 'RAG', 'RAH', 'RAI']
    const series = allowedSeries[Math.floor(Math.random() * allowedSeries.length)]
    const num = String(Math.floor(Math.random() * 900) + 100)
    return `${series} ${num}`
  }
  function randomizeMileage(baseMileage: string): string {
    const numeric = parseInt((baseMileage || '50000').replace(/[^0-9]/g, '')) || 50000
    const factor = 0.8 + Math.random() * 0.4
    const value = Math.max(5000, Math.round(numeric * factor))
    return value.toLocaleString() + 'km'
  }
  function randomizeRecentYear(baseYear: number): number {
    const now = new Date().getFullYear()
    const min = now - 4
    const max = now - 1
    const target = Math.floor(Math.random() * (max - min + 1)) + min
    // Keep within recent range while respecting the base year upper bound
    return Math.min(max, Math.max(min, baseYear || target))
  }
  const synthesizedCars: Car[] = (cars.length === 1 && quantity > 1)
    ? Array.from({ length: quantity }, (_, i) => ({
        ...first,
        id: Number.isFinite(first.id) ? Number(first.id) * 1000 + i : i + 1,
        licensePlate: generatePlate(),
        mileage: randomizeMileage(first.mileage),
        year: randomizeRecentYear(first.year),
        isAvailable: first.isAvailable,
        status: first.status,
      }))
    : cars

  const availableCars = synthesizedCars.filter(car => car.isAvailable)
  const unavailableCars = synthesizedCars.filter(car => !car.isAvailable)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-blue-900">{modelName}</h2>
              <p className="text-gray-600 mt-2">
                {availableCars.length} cars available • {quantity} total in fleet
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes className="text-2xl text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Available Cars Section */}
          {availableCars.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                Available Cars ({availableCars.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableCars.map((car) => (
                  <div key={car.id} className="bg-white border border-green-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative h-32 mb-3">
                      <Image
                        src={car.image}
                        alt={car.name}
                        fill
                        className="object-contain rounded-lg"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        Available
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">{car.name}</h4>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600">{car.price}</span>
                        <span className="text-sm text-gray-500">per day</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <FaCalendar className="text-gray-400" />
                          <span>{car.year}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaRoad className="text-gray-400" />
                          <span>{car.mileage}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaGasPump className="text-gray-400" />
                          <span>{car.fuel}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaCog className="text-gray-400" />
                          <span>{car.transmission}</span>
                        </div>
                      </div>
                      
                      {car.licensePlate && (
                        <div className="text-xs text-gray-500">
                          Plate: {car.licensePlate}
                        </div>
                      )}
                      
                      <Link
                        href={`/rent-a-car?vehicle=${car.id}`}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center block mt-3"
                      >
                        Rent This Car
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unavailable Cars Section */}
          {unavailableCars.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
                <FaTimesCircle className="text-red-500" />
                Currently Unavailable ({unavailableCars.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unavailableCars.map((car) => (
                  <div key={car.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 opacity-75">
                    <div className="relative h-32 mb-3">
                      <Image
                        src={car.image}
                        alt={car.name}
                        fill
                        className="object-contain rounded-lg grayscale"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        {car.status}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700">{car.name}</h4>
                      <div className="text-sm text-gray-500">
                        <p>Status: {car.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
