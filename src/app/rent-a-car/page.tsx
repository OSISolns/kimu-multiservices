"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaCar, FaHotel, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaEnvelope, FaPhone, FaIdCard, FaGlobe, FaShieldAlt, FaCheckCircle, FaStar, FaClock } from 'react-icons/fa';

// Form data interface
interface FormData {
  name: string;
  email: string;
  phone: string;
  idOrPassport: string;
  nationality: string;
  otherNationality: string;
  pickupDate: string;
  returnDate: string;
  selectedVehicle: string;
  agreeToTerms: boolean;
}

// Color mapping for different vehicle types and models using black, silver, gray, white, dark blue, and red
const getVehicleColor = (vehicleName: string, vehicleType: string) => {
  const name = vehicleName.toLowerCase();
  const type = vehicleType.toLowerCase();
  
  // Color by vehicle type
  if (type.includes('suv') || type.includes('4x4')) {
    return {
      bg: 'bg-red-600',
      border: 'border-red-300',
      text: 'text-red-800',
      shadow: 'shadow-red-200'
    };
  }
  
  if (type.includes('sedan') || type.includes('saloon')) {
    return {
      bg: 'bg-blue-800',
      border: 'border-blue-300',
      text: 'text-blue-900',
      shadow: 'shadow-blue-200'
    };
  }
  
  if (type.includes('hatchback')) {
    return {
      bg: 'bg-gray-600',
      border: 'border-gray-300',
      text: 'text-gray-800',
      shadow: 'shadow-gray-200'
    };
  }
  
  if (type.includes('minivan') || type.includes('mpv')) {
    return {
      bg: 'bg-gray-400',
      border: 'border-gray-300',
      text: 'text-gray-800',
      shadow: 'shadow-gray-200'
    };
  }
  
  if (type.includes('pickup') || type.includes('truck')) {
    return {
      bg: 'bg-black',
      border: 'border-gray-400',
      text: 'text-white',
      shadow: 'shadow-gray-300'
    };
  }
  
  // Color by specific vehicle model
  if (name.includes('toyota')) {
    if (name.includes('levin') || name.includes('corolla')) {
      return {
        bg: 'bg-white',
        border: 'border-gray-300',
        text: 'text-gray-800',
        shadow: 'shadow-gray-200'
      };
    }
    if (name.includes('coaster') || name.includes('hiace')) {
      return {
        bg: 'bg-gray-400',
        border: 'border-gray-300',
        text: 'text-gray-800',
        shadow: 'shadow-gray-200'
      };
    }
    if (name.includes('prado') || name.includes('land cruiser')) {
      return {
        bg: 'bg-red-600',
        border: 'border-red-300',
        text: 'text-red-800',
        shadow: 'shadow-red-200'
      };
    }
    if (name.includes('noah')) {
      return {
        bg: 'bg-blue-800',
        border: 'border-blue-300',
        text: 'text-blue-900',
        shadow: 'shadow-blue-200'
      };
    }
    if (name.includes('rav4')) {
      return {
        bg: 'bg-gray-600',
        border: 'border-gray-300',
        text: 'text-gray-800',
        shadow: 'shadow-gray-200'
      };
    }
    if (name.includes('prius')) {
      return {
        bg: 'bg-white',
        border: 'border-gray-300',
        text: 'text-gray-800',
        shadow: 'shadow-gray-200'
      };
    }
  }
  
  if (name.includes('kia')) {
    if (name.includes('sorento')) {
      return {
        bg: 'bg-black',
        border: 'border-gray-400',
        text: 'text-white',
        shadow: 'shadow-gray-300'
      };
    }
    if (name.includes('tucson')) {
      return {
        bg: 'bg-blue-800',
        border: 'border-blue-300',
        text: 'text-blue-900',
        shadow: 'shadow-blue-200'
      };
    }
    if (name.includes('sonata')) {
      return {
        bg: 'bg-gray-400',
        border: 'border-gray-300',
        text: 'text-gray-800',
        shadow: 'shadow-gray-200'
      };
    }
  }
  
  // Default color for unknown vehicles
  return {
    bg: 'bg-gray-600',
    border: 'border-gray-300',
    text: 'text-gray-800',
    shadow: 'shadow-gray-200'
  };
};

function HotelPromptModal({ onProceed, onClose }: { onProceed: () => void, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 p-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaCheckCircle className="text-2xl text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Booking Confirmed!</h3>
        <p className="text-gray-600 mb-6">Would you like to see our hotel/accommodation offers?</p>
        <div className="flex flex-col gap-3">
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            onClick={onProceed}
          >
            Yes, show me hotels
          </button>
          <button
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300"
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
  const [preSelectedVehicle, setPreSelectedVehicle] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);

  const countryList = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
  ];

  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        setVehicles(data);
        
        // Check if there's a vehicle query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const vehicleId = urlParams.get('vehicle');
        const brandParam = urlParams.get('brand');
        
        if (brandParam) {
          // Filter vehicles by brand
          const brandVehicles = data.filter((v: any) => 
            v.name?.toLowerCase().startsWith(brandParam.toLowerCase())
          );
          setFilteredVehicles(brandVehicles);
          setSelectedBrand(brandParam);
          
          if (brandVehicles.length > 0) {
            // Auto-select first vehicle from brand
            const firstVehicle = brandVehicles[0];
            setForm(prev => ({ ...prev, selectedVehicle: firstVehicle.id }));
            setPreSelectedVehicle(firstVehicle.name);
            setSelectedVehicleDetails(firstVehicle);
          }
        } else if (vehicleId) {
          // Find the vehicle in the fetched data
          const vehicle = data.find((v: any) => v.id.toString() === vehicleId);
          if (vehicle) {
            setForm(prev => ({ ...prev, selectedVehicle: vehicle.id }));
            setPreSelectedVehicle(vehicle.name);
            setSelectedVehicleDetails(vehicle);
          }
        } else {
          // No specific selection, show all vehicles
          setFilteredVehicles(data);
        }
      })
      .catch(err => console.error('Error fetching vehicles:', err));
  }, []);

  useEffect(() => {
    if (form.selectedVehicle) {
      const vehicle = filteredVehicles.find(v => v.id.toString() === form.selectedVehicle);
      if (vehicle) {
        setSelectedVehicleDetails(vehicle);
        setPreSelectedVehicle(vehicle.name);
      }
    }
  }, [form.selectedVehicle, filteredVehicles]);

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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 max-w-lg w-full text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <FaCheckCircle className="text-3xl text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-8 text-sm sm:text-base leading-relaxed">
            Thank you for your booking request. We have received your details and will contact you within 24 hours to confirm your reservation.
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
            <p className="text-sm text-blue-800">
              <strong>Booking Reference:</strong> KIMU-{Date.now().toString().slice(-6)}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg w-full"
          >
            Make Another Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Sophisticated Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Geometric Patterns */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section with Enhanced Design */}
      <div className="relative z-10 pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Company Logo with Sophisticated Design */}
          <div className="flex justify-center mb-8 sm:mb-12">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 overflow-hidden">
                {/* Logo Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl"></div>
                <Image src="/logo.png" alt="KIMU Transport" width={60} height={60} className="w-16 h-16 opacity-90 relative z-10" />
              </div>
            </div>
          </div>
          
          {/* Enhanced Title with Typography */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 mb-6 tracking-tight leading-tight">
              <span className="block text-orange-600">Premium</span>
              <span className="block bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 bg-clip-text text-transparent font-bold">
                Car Rental
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience luxury and comfort with our premium fleet of vehicles. Book your perfect ride today.
            </p>
          </div>
          
          {/* Enhanced Stats Cards with Sophisticated Design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              { icon: FaCar, label: 'Premium Fleet', value: '50+', color: 'from-blue-500 to-blue-600' },
              { icon: FaShieldAlt, label: 'Safe & Secure', value: '100%', color: 'from-orange-500 to-orange-600' },
              { icon: FaStar, label: 'Customer Rating', value: '4.9', color: 'from-blue-600 to-blue-700' },
              { icon: FaClock, label: '24/7 Support', value: 'Always', color: 'from-orange-600 to-orange-700' }
            ].map((stat, index) => (
              <div key={stat.label} className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
                {/* Card Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl"></div>
                
                <div className="relative z-10 text-center">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="text-white text-lg sm:text-xl" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-selected Vehicle Notification */}
        {preSelectedVehicle && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div className="bg-gradient-to-r from-orange-50 to-blue-50 border-2 border-orange-200 rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaCar className="text-white text-lg" />
                </div>
                <div className="flex-1">
                  <p className="text-orange-800 font-semibold text-sm sm:text-base">
                    Vehicle Pre-selected: <span className="font-bold text-blue-600">{preSelectedVehicle}</span>
                  </p>
                  <p className="text-blue-700 text-xs sm:text-sm leading-relaxed max-w-md">
                    This vehicle has been automatically selected for you. You can change it below if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
                  </div>

      {/* Enhanced Form Section */}
      <div className="relative z-10 pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Form Title */}
              <div className="text-center mb-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  Complete Your <span className="text-orange-600">Booking</span>
                </h2>
                <p className="text-gray-600 text-base">Fill in your details below to secure your vehicle</p>
              </div>

              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[
                    { name: 'name', label: 'Full Name', icon: FaUser, placeholder: 'Enter your full name', required: true, type: 'text' },
                    { name: 'email', label: 'Email Address', icon: FaEnvelope, placeholder: 'Enter your email', required: true, type: 'email' },
                    { name: 'phone', label: 'Phone Number', icon: FaPhone, placeholder: 'Enter your phone', required: true, type: 'tel' }
                  ].map((field, index) => (
                    <div key={field.name} className="group animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <field.icon className="text-orange-600" />
                        {field.label} {field.required && <span className="text-orange-500">*</span>}
                      </label>
                      <div className="relative overflow-hidden rounded-xl">
                        <input
                          name={field.name}
                          type={field.type}
                          value={form[field.name as keyof FormData] as string}
                          onChange={handleChange}
                          className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 text-gray-700 placeholder-gray-400 bg-white hover:bg-gray-50 group-hover:border-orange-300 relative z-10"
                          placeholder={field.placeholder}
                          required={field.required}
                        />
                        {/* Input Shimmer Effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-orange-100/30 to-transparent rounded-xl"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Identity & Nationality Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[
                    { name: 'idOrPassport', label: 'Passport/ID Number', icon: FaIdCard, placeholder: 'Enter passport or ID number', required: true },
                    { name: 'nationality', label: 'Nationality', icon: FaGlobe, required: true, isSelect: true, options: ['Rwandan', 'Other'] },
                    { name: 'otherNationality', label: 'Country', icon: FaMapMarkerAlt, required: form.nationality === 'Other', isSelect: true, options: countryList.filter(c => c !== 'Rwanda'), condition: form.nationality === 'Other' }
                  ].map((field, index) => (
                    <div key={field.name} className={`group animate-fade-in ${field.condition === false ? 'hidden' : ''}`} style={{ animationDelay: `${(index + 3) * 100}ms` }}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <field.icon className="text-blue-600" />
                        {field.label} {field.required && <span className="text-orange-500">*</span>}
                      </label>
                      {field.isSelect ? (
                        <div className="relative overflow-hidden rounded-xl">
                          <select
                            name={field.name}
                            value={form[field.name as keyof FormData] as string}
                            onChange={handleChange}
                            className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-700 bg-white hover:bg-gray-50 group-hover:border-blue-300 relative z-10"
                            required={field.required}
                          >
                            <option value="">Select {field.label.toLowerCase()}</option>
                            {field.options?.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          {/* Select Shimmer Effect */}
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-indigo-100/30 to-transparent rounded-xl"></div>
                        </div>
                      ) : (
                        <div className="relative overflow-hidden rounded-xl">
                          <input
                            name={field.name}
                            value={form[field.name as keyof FormData] as string}
                            onChange={handleChange}
                            className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-700 placeholder-gray-400 bg-white hover:bg-gray-50 group-hover:border-blue-300 relative z-10"
                            placeholder={field.placeholder}
                            required={field.required}
                          />
                          {/* Input Shimmer Effect */}
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-rose-100/30 to-transparent rounded-xl"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Dates & Vehicle Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[
                    { name: 'pickupDate', label: 'Pickup Date', icon: FaCalendarAlt, type: 'date', required: true },
                    { name: 'returnDate', label: 'Return Date', icon: FaCalendarAlt, type: 'date', required: true }
                  ].map((field, index) => (
                    <div key={field.name} className="group animate-fade-in" style={{ animationDelay: `${(index + 6) * 100}ms` }}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <field.icon className="text-blue-600" />
                        {field.label} {field.required && <span className="text-orange-500">*</span>}
                      </label>
                      <div className="relative overflow-hidden rounded-xl">
                        <input
                          name={field.name}
                          type={field.type}
                          value={field.name === 'returnDate' ? form.returnDate : form.pickupDate}
                          onChange={handleChange}
                          min={field.name === 'returnDate' ? form.pickupDate || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                          className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-700 bg-white hover:bg-gray-50 group-hover:border-blue-300 relative z-10"
                          required={field.required}
                        />
                        {/* Date Input Shimmer Effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-blue-100/30 to-transparent rounded-xl"></div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Brand Selection */}
                  <div className="group animate-fade-in" style={{ animationDelay: '900ms' }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaCar className="text-blue-600" />
                      Select Brand {<span className="text-rose-500">*</span>}
                    </label>
                    <div className="relative overflow-hidden rounded-xl">
                      <select
                        name="selectedBrand"
                        value={selectedBrand || ''}
                        onChange={(e) => {
                          const brand = e.target.value;
                          setSelectedBrand(brand);
                          if (brand) {
                            const brandVehicles = vehicles.filter((v: any) => 
                              v.name?.toLowerCase().startsWith(brand.toLowerCase())
                            );
                            setFilteredVehicles(brandVehicles);
                            setForm(prev => ({ ...prev, selectedVehicle: '' }));
                            setSelectedVehicleDetails(null);
                            setPreSelectedVehicle(null);
                          } else {
                            setFilteredVehicles(vehicles);
                            setForm(prev => ({ ...prev, selectedVehicle: '' }));
                            setSelectedVehicleDetails(null);
                            setPreSelectedVehicle(null);
                          }
                        }}
                        className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-700 bg-white hover:bg-gray-50 group-hover:border-blue-300 relative z-10"
                        required
                      >
                        <option value="">Choose brand</option>
                        {Array.from(new Set(vehicles.map(v => v.name?.split(' ')[0]))).map(brand => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                      {/* Brand Select Shimmer Effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-indigo-100/30 to-transparent rounded-xl"></div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Selection */}
                {selectedBrand && (
                  <div className="group animate-fade-in" style={{ animationDelay: '1000ms' }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaCar className="text-blue-600" />
                      Select Vehicle {<span className="text-rose-500">*</span>}
                    </label>
                    <div className="relative overflow-hidden rounded-xl">
                      <select
                        name="selectedVehicle"
                        value={form.selectedVehicle}
                        onChange={handleChange}
                        className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-700 bg-white hover:bg-gray-50 group-hover:border-blue-300 relative z-10"
                        required
                      >
                        <option value="">Choose your vehicle</option>
                        {filteredVehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.name} ({vehicle.category}) - {vehicle.price}
                          </option>
                        ))}
                      </select>
                      {/* Vehicle Select Shimmer Effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-violet-100/30 to-transparent rounded-xl"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Vehicle Display */}
                {selectedVehicleDetails && (
                <div className={`rounded-xl p-4 sm:p-6 border-2 shadow-lg ${getVehicleColor(selectedVehicleDetails.name, selectedVehicleDetails.type).border} bg-gradient-to-r from-gray-50 to-white animate-fade-in`}>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Selected Vehicle</h3>
                    <p className="text-gray-600 text-sm">You have selected the following vehicle for your booking</p>
                  </div>
                  
                  <div className="flex flex-col lg:flex-row items-start gap-6">
                    {/* Vehicle Image */}
                    <div className={`relative w-full lg:w-64 h-48 lg:h-64 rounded-xl overflow-hidden ${getVehicleColor(selectedVehicleDetails.name, selectedVehicleDetails.type).bg} flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <Image
                          src={selectedVehicleDetails.image}
                          alt={selectedVehicleDetails.name}
                          fill
                        className="object-contain p-3"
                        />
                      </div>
                      
                    {/* Vehicle Details */}
                    <div className="flex-1 space-y-4">
                      {/* Vehicle Name and Brand */}
                      <div>
                        <h4 className={`font-bold text-2xl mb-2 ${getVehicleColor(selectedVehicleDetails.name, selectedVehicleDetails.type).text}`}>
                          {selectedVehicleDetails.name}
                        </h4>
                        <p className="text-gray-600 text-base">
                          {selectedVehicleDetails.category} • {selectedVehicleDetails.type} • {selectedVehicleDetails.year}
                        </p>
                      </div>
                      
                      {/* Key Specifications */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white rounded-lg p-3 text-center border border-gray-200 shadow-sm">
                          <div className="text-lg font-bold text-blue-600">{selectedVehicleDetails.capacity || '5'}</div>
                          <div className="text-xs text-gray-600">Seats</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center border border-gray-200 shadow-sm">
                          <div className="text-sm font-bold text-green-600">{selectedVehicleDetails.transmission || 'Automatic'}</div>
                          <div className="text-xs text-gray-600">Transmission</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center border border-gray-200 shadow-sm">
                          <div className="text-sm font-bold text-purple-600">{selectedVehicleDetails.fuel || 'Petrol'}</div>
                          <div className="text-xs text-gray-600">Fuel Type</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center border border-gray-200 shadow-sm">
                          <div className="text-sm font-bold text-orange-600">{selectedVehicleDetails.year || '2020'}</div>
                          <div className="text-xs text-gray-600">Year</div>
                        </div>
                      </div>
                      
                      {/* Pricing and License Plate */}
                      <div className="flex flex-wrap gap-3 items-center">
                        <div className={`inline-block px-4 py-2 rounded-full text-base font-bold ${getVehicleColor(selectedVehicleDetails.name, selectedVehicleDetails.type).bg} text-white shadow-md`}>
                          {selectedVehicleDetails.price && !isNaN(parseInt(selectedVehicleDetails.price)) 
                            ? `${(parseInt(selectedVehicleDetails.price) * 1000).toLocaleString()} RWF/day`
                            : 'Contact for pricing'
                          }
                        </div>
                        {selectedVehicleDetails.licensePlate && (
                          <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-mono border border-gray-200">
                            Plate: {selectedVehicleDetails.licensePlate}
                          </div>
                        )}
                      </div>
                      
                      {/* Features */}
                      {selectedVehicleDetails.features && selectedVehicleDetails.features.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2 text-sm">Features:</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedVehicleDetails.features.map((feature: string, idx: number) => (
                              <span key={idx} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-200">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Description */}
                      {selectedVehicleDetails.description && (
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2 text-sm">Description:</h5>
                          <p className="text-gray-600 leading-relaxed text-sm">{selectedVehicleDetails.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Terms Agreement */}
              <div className="animate-fade-in" style={{ animationDelay: '900ms' }}>
                <label className="flex items-start group cursor-pointer">
                    <input
                      name="agreeToTerms"
                      type="checkbox"
                      checked={form.agreeToTerms}
                      onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-1 group-hover:border-blue-400 transition-colors duration-200"
                      required
                    />
                  <span className="ml-3 text-sm text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-200">
                    I agree to the <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-200">Terms and Conditions</a> and <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-200">Privacy Policy</a> <span className="text-rose-500">*</span>
                    </span>
                  </label>
                </div>

              {/* Error Message */}
            {errorMessage && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-center font-semibold text-sm animate-fade-in">
                {errorMessage}
              </div>
            )}

              {/* Submit Button Section */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-6 sm:pt-8 animate-fade-in" style={{ animationDelay: '1000ms' }}>
                {form.selectedVehicle && (
                  <div className="relative overflow-hidden rounded-xl">
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, selectedVehicle: '' }))}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 hover:shadow-lg border-2 border-gray-200 hover:border-gray-300 transform hover:scale-105 relative z-10 w-full"
                    >
                      Change Vehicle
                    </button>
                    {/* Change Vehicle Button Shimmer Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-gray-200/50 to-transparent rounded-xl"></div>
                  </div>
                )}
                                <div className="relative overflow-hidden rounded-2xl">
                <button
                  type="submit"
                disabled={loading}
                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-8 sm:px-12 py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-500 transform hover:scale-110 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-white/20 relative z-10 w-full"
                  >
                    {loading ? (
                      <span className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </span>
                    ) : (
                      'Book Your Car'
                    )}
                </button>
                  {/* Button Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl"></div>
                </div>
            </div>
          </form>
          </div>
        </div>
      </div>

      {/* Hotel Prompt Modal */}
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
  );
} 