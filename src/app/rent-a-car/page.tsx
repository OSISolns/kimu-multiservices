"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface FormData {
  name: string;
  email: string;
  phone: string;
  pickupDate: string;
  returnDate: string;
  selectedVehicle: string;
  agreeToTerms: boolean;
}

export default function RentCarForm() {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    pickupDate: '',
    returnDate: '',
    selectedVehicle: '',
    agreeToTerms: false,
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<any>(null);

  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(err => console.error('Error fetching vehicles:', err));
  }, []);

  useEffect(() => {
    if (form.selectedVehicle) {
      fetch(`/api/vehicles/${form.selectedVehicle}`)
        .then(res => res.json())
        .then(data => setSelectedVehicleDetails(data))
        .catch(err => console.error('Error fetching vehicle details:', err));
    }
  }, [form.selectedVehicle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (response.ok) {
        setSuccess(true);
      } else {
        setErrorMessage(result.error || 'There was an error submitting your booking. Please try again.');
      }
    } catch (error) {
      setErrorMessage('There was an error submitting your booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-5xl sm:text-6xl mb-4">✓</div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Thank you for your booking request. We have received your details and will contact you within 24 hours to confirm your reservation.
          </p>
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-6">
            <p className="text-xs sm:text-sm text-blue-800">
              <strong>Booking Reference:</strong> KIMU-{Date.now().toString().slice(-6)}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full"
          >
            Make Another Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-4 sm:py-8">
      <div className="max-w-xl mx-auto px-2 sm:px-4 md:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Rent a Car</h1>
          <p className="text-base sm:text-lg text-gray-600">Book your car in seconds!</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Date *</label>
                <input
                  name="pickupDate"
                  type="date"
                  value={form.pickupDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Return Date *</label>
                <input
                  name="returnDate"
                  type="date"
                  value={form.returnDate}
                  onChange={handleChange}
                  min={form.pickupDate || new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Vehicle *</label>
              <select
                name="selectedVehicle"
                value={form.selectedVehicle}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose your vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} - {vehicle.price} ({vehicle.category})
                  </option>
                ))}
              </select>
            </div>
            {selectedVehicleDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-2">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden">
                    <Image
                      src={selectedVehicleDetails.image}
                      alt={selectedVehicleDetails.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedVehicleDetails.name}</h3>
                    <p className="text-sm text-gray-600">{selectedVehicleDetails.category} • {selectedVehicleDetails.type}</p>
                    <p className="text-lg font-bold text-blue-600">{selectedVehicleDetails.price}</p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="flex items-start">
                <input
                  name="agreeToTerms"
                  type="checkbox"
                  checked={form.agreeToTerms}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  required
                />
                <span className="ml-2 text-sm text-gray-700">
                  I agree to the <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms and Conditions</a> *
                </span>
              </label>
            </div>
            {errorMessage && (
              <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4 text-center font-semibold text-sm">
                {errorMessage}
              </div>
            )}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors ml-auto disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Book Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 