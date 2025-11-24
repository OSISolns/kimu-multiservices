"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface CustomerStory {
  id: string;
  name: string;
  vehicle: string;
  year: number;
  testimonial: string;
  deliveryPhoto: string;
  location: string;
  rating: number;
  deliveryDate: string;
}

interface CustomerDeliveryMomentsProps {
  stories: CustomerStory[];
}

export default function CustomerDeliveryMoments({ stories }: CustomerDeliveryMomentsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % stories.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [stories.length]);

  const currentStory = stories[currentIndex];

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Customer Delivery Moments
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real customers, real experiences. See how Kimu Transport and Auto24 Rwanda 
            are making car ownership dreams come true across Rwanda.
          </p>
        </div>

        {/* Main Story Display */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Customer Photo */}
            <div className="relative h-96 lg:h-full">
              <Image
                src={currentStory.deliveryPhoto}
                alt={`${currentStory.name} with their ${currentStory.vehicle}`}
                fill
                className="object-cover"
              />
              {/* Partnership Badge */}
              <div className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                Kimu x Auto24
              </div>
            </div>

            {/* Customer Story */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentStory.name}
                </h3>
                <p className="text-lg text-gray-600 mb-4">
                  {currentStory.vehicle} {currentStory.year} • {currentStory.location}
                </p>
                <p className="text-sm text-gray-500">
                  Delivered on {new Date(currentStory.deliveryDate).toLocaleDateString()}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-6">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < currentStory.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {currentStory.rating}/5 stars
                </span>
              </div>

              {/* Testimonial */}
              <blockquote className="text-lg text-gray-700 italic mb-6">
                &quot;{currentStory.testimonial}&quot;
              </blockquote>

              {/* Partnership Note */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Partnership:</strong> This vehicle was sourced and delivered 
                  through our partnership with Auto24 Rwanda, ensuring quality and 
                  comprehensive vehicle history.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Story Navigation */}
        <div className="flex justify-center space-x-2 mb-8">
          {stories.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentIndex ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* All Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story, index) => (
            <div
              key={story.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 ${
                index === currentIndex ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <div className="relative h-48">
                <Image
                  src={story.deliveryPhoto}
                  alt={`${story.name} with their ${story.vehicle}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Auto24
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {story.name}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {story.vehicle} {story.year}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">
                  &quot;{story.testimonial}&quot;
                </p>
                <div className="flex items-center mt-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 ${
                          i < story.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-1 text-xs text-gray-500">
                    {story.rating}/5
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Join Our Happy Customers?
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            Start your car ownership journey with just 20% deposit
          </p>
          <div className="space-x-4">
            <button className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium">
              Browse Vehicles
            </button>
            <button className="border border-blue-500 text-blue-500 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
