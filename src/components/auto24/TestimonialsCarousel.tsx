"use client";

import { useState, useEffect } from 'react';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  vehicle: string;
  rating: number;
  text: string;
  avatar?: string;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export default function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate testimonials every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="bg-blue-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600">
            Real experiences from real customers who chose Kimu Transport & Multiservices and Auto24 Rwanda
          </p>
        </div>

        {/* Main Testimonial Display */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 mb-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Rating */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-6 h-6 ${
                      i < currentTestimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial Text */}
            <blockquote className="text-xl lg:text-2xl text-gray-700 italic mb-8 leading-relaxed">
              &quot;{currentTestimonial.text}&quot;
            </blockquote>

            {/* Customer Info */}
            <div className="flex items-center justify-center space-x-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {currentTestimonial.name.charAt(0)}
              </div>
              <div className="text-left">
                <h4 className="text-lg font-semibold text-gray-900">
                  {currentTestimonial.name}
                </h4>
                <p className="text-gray-600">
                  {currentTestimonial.location}
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  {currentTestimonial.vehicle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center space-x-2 mb-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* All Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`bg-white rounded-lg p-6 shadow-md cursor-pointer transition-all duration-200 ${
                index === currentIndex ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              {/* Rating */}
              <div className="flex space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 mb-4 line-clamp-3">
                &quot;{testimonial.text}&quot;
              </p>

              {/* Customer Info */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 text-sm">
                    {testimonial.name}
                  </h5>
                  <p className="text-xs text-gray-600">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Partnership Note */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg p-6 shadow-md max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Powered by Partnership
            </h3>
            <p className="text-gray-600">
              All customer experiences are made possible through our strategic partnership 
              with Auto24 Rwanda, ensuring quality vehicles and exceptional service delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
