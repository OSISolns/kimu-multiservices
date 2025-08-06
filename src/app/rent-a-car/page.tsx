"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaCar, FaHotel } from 'react-icons/fa';

interface FormData {
  name: string;
  email: string;
  phone: string;
  pickupDate: string;
  returnDate: string;
  selectedVehicle: string;
  agreeToTerms: boolean;
  idOrPassport: string;
  nationality: string;
  otherNationality: string;
}

function HotelPromptModal({ onProceed, onClose }: { onProceed: () => void, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full mx-2 p-6 text-center animate-fade-in">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Booking Confirmed!</h3>
        <p className="text-sm text-gray-700 mb-4">Would you like to see our hotel/accommodation offers?</p>
        <div className="flex gap-2 justify-center">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            onClick={onProceed}
          >
            Yes, show me hotels
          </button>
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            onClick={onClose}
          >
            No, thanks
          </button>
        </div>
      </div>
    </div>
  );
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
    idOrPassport: '',
    nationality: '',
    otherNationality: '',
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<any>(null);
  const router = useRouter();
  const [showHotelPrompt, setShowHotelPrompt] = useState(false);

  const countryList = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
  ];

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
      const payload = { ...form, type: 'Car Rental' };
      if (form.nationality === 'Other') {
        payload.otherNationality = form.otherNationality;
      }
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        setShowHotelPrompt(true);
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
    <div className="min-h-screen relative overflow-hidden py-4 sm:py-8">
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
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Passport or National ID card <span className="text-red-500">*</span></label>
                    <input
                      name="idOrPassport"
                      value={form.idOrPassport}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="Enter Passport or National ID card number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nationality <span className="text-red-500">*</span></label>
                    <select
                      name="nationality"
                      value={form.nationality}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Rwandan">Rwandan</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {form.nationality === 'Other' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Select your country <span className="text-red-500">*</span></label>
                      <select
                        name="otherNationality"
                        value={form.otherNationality}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select country</option>
                        {countryList.filter(c => c !== 'Rwanda').map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                  )}
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
                  I agree to the <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms and Conditions</a> and <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy Policy</a> *
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
          {showHotelPrompt && (
            <HotelPromptModal
              onProceed={() => {
                setShowHotelPrompt(false);
                router.push('/offers?showHotel=true');
              }}
              onClose={() => setShowHotelPrompt(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
} 