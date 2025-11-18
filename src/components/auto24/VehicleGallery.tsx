"use client";

import Image from 'next/image';
import { useState } from 'react';

interface Vehicle {
  id: string;
  name: string;
  year: number;
  price: number;
  deposit: number;
  image: string;
  features: string[];
  description: string;
}

interface VehicleGalleryProps {
  vehicles: Vehicle[];
}

export default function VehicleGallery({ vehicles }: VehicleGalleryProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Kimu Transport & Multiservices x Auto24 Rwanda Vehicle Offers
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Drive Now, Pay Later - Start with just 20% deposit. 
            All vehicles supplied in partnership with Auto24 Rwanda.
          </p>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Vehicle Image */}
              <div className="relative h-64">
                <Image
                  src={vehicle.image}
                  alt={vehicle.name}
                  fill
                  className="object-cover"
                />
                {/* Auto24 Partnership Badge */}
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Auto24 Rwanda
                </div>
                {/* 20% Deposit Badge */}
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  20% Deposit
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {vehicle.name} {vehicle.year}
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm">
                  {vehicle.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.features.map((feature, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Full Price:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {vehicle.price.toLocaleString()} RWF
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">20% Deposit:</span>
                    <span className="text-xl font-bold text-green-600">
                      {vehicle.deposit.toLocaleString()} RWF
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setSelectedVehicle(vehicle)}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
                  >
                    View Details
                  </button>
                  <button className="w-full border border-blue-500 text-blue-500 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium">
                    Start Application
                  </button>
                </div>
              </div>

              {/* Auto24 Attribution */}
              <div className="px-6 pb-4">
                <p className="text-xs text-gray-500 text-center">
                  Images courtesy of Auto24 Rwanda
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Partnership Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Partnership with Auto24 Rwanda
          </h3>
          <p className="text-blue-700">
            All vehicles are sourced from Auto24 Rwanda, ensuring quality, authenticity, 
            and comprehensive vehicle history. We work together to provide you with 
            the best automotive solutions in Rwanda.
          </p>
        </div>
      </div>

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedVehicle.name} {selectedVehicle.year}
                </h2>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Image
                    src={selectedVehicle.image}
                    alt={selectedVehicle.name}
                    width={400}
                    height={300}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>
                  <p className="text-gray-600 mb-4">{selectedVehicle.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Full Price:</span>
                      <span className="text-lg font-bold">{selectedVehicle.price.toLocaleString()} RWF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">20% Deposit:</span>
                      <span className="text-lg font-bold text-green-600">{selectedVehicle.deposit.toLocaleString()} RWF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Remaining Balance:</span>
                      <span className="text-lg font-bold text-gray-600">{(selectedVehicle.price - selectedVehicle.deposit).toLocaleString()} RWF</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <button className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium">
                      Apply Now
                    </button>
                    <button className="w-full border border-blue-500 text-blue-500 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium">
                      Contact Sales Team
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
