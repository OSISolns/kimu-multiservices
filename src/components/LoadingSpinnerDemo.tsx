'use client';

import React, { useState } from 'react';
import LoadingSpinner, { CompanySpinner, DotsSpinner, LogoSpinner, InlineSpinner } from './LoadingSpinner';

export default function LoadingSpinnerDemo() {
  const [activeDemo, setActiveDemo] = useState<string>('company');

  const demos = [
    {
      id: 'company',
      title: 'Company Branding',
      description: 'Enhanced company logo with multiple rotating rings and glow effects'
    },
    {
      id: 'variants',
      title: 'All Variants',
      description: 'Different loading animations for various use cases'
    },
    {
      id: 'sizes',
      title: 'Size Options',
      description: 'Different sizes from extra small to extra large'
    },
    {
      id: 'colors',
      title: 'Color Themes',
      description: 'Various color schemes to match different contexts'
    },
    {
      id: 'inline',
      title: 'Inline Usage',
      description: 'Compact spinners for buttons and inline elements'
    }
  ];

  const renderDemo = () => {
    switch (activeDemo) {
      case 'company':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <LoadingSpinner 
                message="KIMU Transport Services" 
                size="xl" 
                variant="company"
                showProgress={true}
                duration={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <LoadingSpinner message="Loading..." size="sm" variant="company" />
              </div>
              <div className="text-center">
                <LoadingSpinner message="Processing..." size="md" variant="company" />
              </div>
              <div className="text-center">
                <LoadingSpinner message="Initializing..." size="lg" variant="company" />
              </div>
            </div>
          </div>
        );

      case 'variants':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <h3 className="font-semibold mb-4">Company</h3>
              <LoadingSpinner variant="company" size="md" message="Company branding" />
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <h3 className="font-semibold mb-4">Logo</h3>
              <LoadingSpinner variant="logo" size="md" message="Logo animation" />
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <h3 className="font-semibold mb-4">Spinner</h3>
              <LoadingSpinner variant="spinner" size="md" message="Classic spinner" />
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <h3 className="font-semibold mb-4">Dots</h3>
              <LoadingSpinner variant="dots" size="md" message="Bouncing dots" />
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <h3 className="font-semibold mb-4">Pulse</h3>
              <LoadingSpinner variant="pulse" size="md" message="Pulsing effect" />
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <h3 className="font-semibold mb-4">With Progress</h3>
              <LoadingSpinner variant="company" size="md" message="With progress bar" showProgress={true} duration={3} />
            </div>
          </div>
        );

      case 'sizes':
        return (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <h3 className="font-semibold mb-4 text-sm">Extra Small</h3>
              <LoadingSpinner variant="company" size="xs" message="XS" />
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <h3 className="font-semibold mb-4">Small</h3>
              <LoadingSpinner variant="company" size="sm" message="Small" />
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <h3 className="font-semibold mb-4">Medium</h3>
              <LoadingSpinner variant="company" size="md" message="Medium" />
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <h3 className="font-semibold mb-4">Large</h3>
              <LoadingSpinner variant="company" size="lg" message="Large" />
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <h3 className="font-semibold mb-4">Extra Large</h3>
              <LoadingSpinner variant="company" size="xl" message="XL" />
            </div>
          </div>
        );

      case 'colors':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {['auto', 'blue', 'orange', 'green', 'red', 'purple'].map(color => (
              <div key={color} className="text-center p-4 bg-white rounded-lg shadow">
                <h3 className="font-semibold mb-4 capitalize">{color}</h3>
                <LoadingSpinner 
                  variant="spinner" 
                  size="md" 
                  message={color} 
                  color={color as any}
                />
              </div>
            ))}
          </div>
        );

      case 'inline':
        return (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Button Loading States</h3>
              <div className="space-y-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <InlineSpinner size="xs" variant="spinner" color="blue" />
                  Processing...
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <InlineSpinner size="sm" variant="dots" color="green" />
                  Uploading...
                </button>
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <InlineSpinner size="sm" variant="pulse" color="orange" />
                  Saving...
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Text Inline</h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <InlineSpinner size="xs" variant="dots" />
                  Loading user data...
                </p>
                <p className="flex items-center gap-2">
                  <InlineSpinner size="xs" variant="spinner" color="blue" />
                  Fetching reports...
                </p>
                <p className="flex items-center gap-2">
                  <InlineSpinner size="xs" variant="pulse" color="green" />
                  Syncing data...
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Loading Spinner System</h1>
          <p className="text-slate-600">Enhanced loading animations for KIMU Transport</p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {demos.map(demo => (
            <button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeDemo === demo.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {demo.title}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-slate-700 mb-2">
            {demos.find(d => d.id === activeDemo)?.title}
          </h2>
          <p className="text-slate-600">
            {demos.find(d => d.id === activeDemo)?.description}
          </p>
        </div>

        {/* Demo Content */}
        <div className="bg-slate-100 rounded-xl p-8">
          {renderDemo()}
        </div>

        {/* Usage Examples */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Usage Examples</h3>
          <div className="bg-slate-100 rounded p-4 text-sm">
            <pre className="text-slate-700">
{`// Company branded spinner
<LoadingSpinner variant="company" size="lg" message="Loading..." />

// Inline spinner for buttons
<LoadingSpinner inline size="xs" variant="spinner" color="blue" />

// With progress bar
<LoadingSpinner 
  variant="company" 
  showProgress={true} 
  duration={5}
  message="Processing data..."
/>

// Full screen loading
<LoadingSpinner fullScreen variant="company" size="xl" />`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
