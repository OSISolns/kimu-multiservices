"use client"
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  
  // Rental Details
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  pickupLocation: string;
  returnLocation: string;
  selectedVehicle: string;
  
  // Driver Information
  driverLicenseNumber: string;
  driverLicenseCountry: string;
  driverLicenseExpiry: string;
  drivingExperience: string;
  
  // Rental Preferences
  rentalType: string;
  insuranceType: string;
  additionalDriver: boolean;
  additionalDriverName: string;
  additionalDriverLicense: string;
  
  // Additional Services
  gps: boolean;
  childSeat: boolean;
  childSeatAge: string;
  airportTransfer: boolean;
  airportTransferDetails: string;
  fuelPolicy: string;
  
  // Special Requirements
  specialRequirements: string;
  emergencyContact: string;
  emergencyPhone: string;
  
  // Payment Information
  paymentMethod: string;
  cardNumber: string;
  cardExpiry: string;
  cardCVV: string;
  cardholderName: string;
  
  // Terms and Conditions
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  marketingConsent: boolean;
}

export default function RentCarForm() {
  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: '',
    pickupLocation: '',
    returnLocation: '',
    selectedVehicle: '',
    driverLicenseNumber: '',
    driverLicenseCountry: '',
    driverLicenseExpiry: '',
    drivingExperience: '',
    rentalType: 'self-drive',
    insuranceType: 'basic',
    additionalDriver: false,
    additionalDriverName: '',
    additionalDriverLicense: '',
    gps: false,
    childSeat: false,
    childSeatAge: '',
    airportTransfer: false,
    airportTransferDetails: '',
    fuelPolicy: 'full-to-full',
    specialRequirements: '',
    emergencyContact: '',
    emergencyPhone: '',
    paymentMethod: 'mobile-money',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    cardholderName: '',
    agreeToTerms: false,
    agreeToPrivacy: false,
    marketingConsent: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<any>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [waForm, setWaForm] = useState({
    name: '',
    carId: '',
    days: 1,
    message: ''
  });
  const waModalRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleWaFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWaForm(prev => ({ ...prev, [name]: value }));
  };

  // Calculate total price based on selections
  useEffect(() => {
    if (selectedVehicleDetails) {
      let basePrice = parseInt(selectedVehicleDetails.price.replace(/[^\d]/g, ''));
      let total = basePrice;
      
      // Add insurance costs
      if (form.insuranceType === 'comprehensive') total += 15000;
      else if (form.insuranceType === 'premium') total += 25000;
      
      // Add additional services
      if (form.childSeat) total += 3000;
      if (form.airportTransfer) total += 10000;
      if (form.additionalDriver) total += 8000;
      
      setTotalPrice(total);
    }
  }, [form, selectedVehicleDetails]);

  // Update selected vehicle details when vehicle changes
  useEffect(() => {
    if (form.selectedVehicle) {
      fetch(`/api/vehicles/${form.selectedVehicle}`)
        .then(res => res.json())
        .then(data => setSelectedVehicleDetails(data))
        .catch(err => console.error('Error fetching vehicle details:', err));
    }
  }, [form.selectedVehicle]);

  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(err => console.error('Error fetching vehicles:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, totalPrice }),
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

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const steps = [
    { number: 1, title: 'Personal Info', description: 'Basic information' },
    { number: 2, title: 'Rental Details', description: 'Dates and vehicle' },
    { number: 3, title: 'Driver Info', description: 'License and experience' },
    { number: 4, title: 'Services', description: 'Additional options' },
    { number: 5, title: 'Payment', description: 'Payment and terms' },
  ];

  // Validation for required fields per step
  const is21OrOlder = (() => {
    if (!form.dateOfBirth) return false;
    const dob = new Date(form.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      return age - 1 >= 21;
    }
    return age >= 21;
  })();
  const isStep1Valid = form.firstName && form.lastName && form.email && form.phone && form.dateOfBirth && is21OrOlder && form.nationality && form.passportNumber;
  const isStep2Valid = form.pickupDate && form.pickupTime && form.returnDate && form.returnTime && form.pickupLocation && form.returnLocation && form.selectedVehicle;
  const isStep3Valid = form.driverLicenseNumber && form.driverLicenseCountry && form.driverLicenseExpiry && form.drivingExperience && form.rentalType && form.insuranceType;
  // Step 4 (additional services) has no required fields
  const isStep5Valid = form.paymentMethod && form.agreeToTerms && form.agreeToPrivacy;

  let canProceed = false;
  if (currentStep === 1) canProceed = !!isStep1Valid;
  else if (currentStep === 2) canProceed = !!isStep2Valid;
  else if (currentStep === 3) canProceed = !!isStep3Valid;
  else if (currentStep === 4) canProceed = true;
  else if (currentStep === 5) canProceed = !!isStep5Valid;

  const handleWaModalOpen = () => {
    setWaForm({
      name: `${form.firstName} ${form.lastName}`.trim(),
      carId: form.selectedVehicle,
      days: 1,
      message: ''
    });
    setShowWhatsAppModal(true);
  };

  const handleWaModalClose = () => setShowWhatsAppModal(false);

  const handleWaSend = (e: React.FormEvent) => {
    e.preventDefault();
    const car = vehicles.find(v => v.id == waForm.carId)?.name || 'a car';
    const msg =
      waForm.name && waForm.carId && waForm.days
        ? `Hello my name is ${waForm.name}, I would like to rent ${car} for ${waForm.days} day${waForm.days > 1 ? 's' : ''}. ${waForm.message}`
        : 'Hello, I would like to book a car via WhatsApp.';
    window.open(`https://wa.me/250798284312?text=${encodeURIComponent(msg)}`, '_blank');
    setShowWhatsAppModal(false);
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
      <div className="max-w-2xl sm:max-w-4xl md:max-w-6xl mx-auto px-2 sm:px-4 md:px-8">
        {/* WhatsApp Booking Button */}
        <style>{`
          @keyframes pulse-whatsapp {
            0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.7); }
            70% { box-shadow: 0 0 0 10px rgba(34,197,94,0); }
            100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
          }
        `}</style>
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={handleWaModalOpen}
            className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded shadow transition animate-pulse-whatsapp"
            style={{ animation: 'pulse-whatsapp 1.5s infinite' }}
          >
            Book via WhatsApp
          </button>
        </div>
        {/* WhatsApp Modal */}
        {showWhatsAppModal && (
          <div ref={waModalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={handleWaModalClose}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-lg font-bold mb-4">Book via WhatsApp</h2>
              <form onSubmit={handleWaSend} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={waForm.name}
                    onChange={handleWaFormChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Select Car</label>
                  <select
                    name="carId"
                    value={waForm.carId}
                    onChange={handleWaFormChange}
                    className="w-full border rounded p-2"
                    required
                  >
                    <option value="">Choose a car</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} - {vehicle.price}{vehicle.category ? ` (${vehicle.category})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Days</label>
                  <input
                    type="number"
                    name="days"
                    min={1}
                    value={waForm.days}
                    onChange={handleWaFormChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">What do you want?</label>
                  <textarea
                    name="message"
                    value={waForm.message}
                    onChange={handleWaFormChange}
                    className="w-full border rounded p-2"
                    rows={2}
                    placeholder="Any special requests or info?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded shadow transition"
                >
                  Send via WhatsApp
                </button>
              </form>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Rent a Car</h1>
          <p className="text-base sm:text-lg text-gray-600">Complete your booking with our premium fleet</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 md:p-10 mb-6 sm:mb-10 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[400px] sm:min-w-0">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.number ? '✓' : step.number}
                </div>
                <div className="ml-2 sm:ml-3 hidden xs:block md:block">
                  <div className="text-xs sm:text-sm font-semibold text-gray-900">{step.title}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
                    <input
                      name="dateOfBirth"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nationality *</label>
                    <select
                      name="nationality"
                      value={form.nationality}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Nationality</option>
                      <option value="Rwandan">Rwandan</option>
                      <option value="Kenyan">Kenyan</option>
                      <option value="Ugandan">Ugandan</option>
                      <option value="Tanzanian">Tanzanian</option>
                      <option value="American">American</option>
                      <option value="British">British</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {form.nationality === 'Rwandan' ? 'National ID Card Number *' : 'Passport Number *'}
                    </label>
                    <input
                      name="passportNumber"
                      value={form.passportNumber}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={form.nationality === 'Rwandan' ? 'Enter National ID Card Number' : 'Enter Passport Number'}
                      required
                    />
                  </div>
                </div>
                {errorMessage && (
                  <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4 text-center font-semibold text-sm">
                    {errorMessage}
                  </div>
                )}
                {currentStep === 1 && form.dateOfBirth && !is21OrOlder && (
                  <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4 text-center font-semibold text-sm">
                    You must be at least 21 years old to rent a car.
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Rental Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Rental Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Time *</label>
                    <select
                      name="pickupTime"
                      value={form.pickupTime}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Time</option>
                      <option value="08:00">8:00 AM</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                      <option value="18:00">6:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Return Time *</label>
                    <select
                      name="returnTime"
                      value={form.returnTime}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Time</option>
                      <option value="08:00">8:00 AM</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                      <option value="18:00">6:00 PM</option>
                      <option value="19:00">7:00 PM</option>
                      <option value="20:00">8:00 PM</option>
                      <option value="21:00">9:00 PM</option>
                      <option value="22:00">10:00 PM</option>
                      <option value="23:00">11:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Location *</label>
                    <select
                      name="pickupLocation"
                      value={form.pickupLocation}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Location</option>
                      <option value="Kigali Airport">Kigali Airport</option>
                      <option value="Kigali City Center">Kigali City Center</option>
                      <option value="Kigali Convention Center">Kigali Convention Center</option>
                      <option value="Kigali Business District">Kigali Business District</option>
                      <option value="Hotel Pickup">Hotel Pickup</option>
                      <option value="Other">Other (Specify)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Return Location *</label>
                    <select
                      name="returnLocation"
                      value={form.returnLocation}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Location</option>
                      <option value="Kigali Airport">Kigali Airport</option>
                      <option value="Kigali City Center">Kigali City Center</option>
                      <option value="Kigali Convention Center">Kigali Convention Center</option>
                      <option value="Kigali Business District">Kigali Business District</option>
                      <option value="Hotel Return">Hotel Return</option>
                      <option value="Other">Other (Specify)</option>
                    </select>
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

                {/* Vehicle Preview */}
                {selectedVehicleDetails && (
                  <div className="bg-gray-50 rounded-lg p-4">
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
              </div>
            )}

            {/* Step 3: Driver Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Driver Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Driver License Number *</label>
                    <input
                      name="driverLicenseNumber"
                      value={form.driverLicenseNumber}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">License Country *</label>
                    <select
                      name="driverLicenseCountry"
                      value={form.driverLicenseCountry}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Country</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="France">France</option>
                      <option value="Germany">Germany</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">License Expiry Date *</label>
                    <input
                      name="driverLicenseExpiry"
                      type="date"
                      value={form.driverLicenseExpiry}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Driving Experience *</label>
                    <select
                      name="drivingExperience"
                      value={form.drivingExperience}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Experience</option>
                      <option value="Less than 1 year">Less than 1 year</option>
                      <option value="1-3 years">1-3 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5-10 years">5-10 years</option>
                      <option value="More than 10 years">More than 10 years</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rental Type *</label>
                    <select
                      name="rentalType"
                      value={form.rentalType}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="self-drive">Self Drive</option>
                      <option value="chauffeur">With Chauffeur</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Insurance Type *</label>
                    <select
                      name="insuranceType"
                      value={form.insuranceType}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="basic">Basic Insurance (Included)</option>
                      <option value="comprehensive">Comprehensive (+15,000 RWF)</option>
                      <option value="premium">Premium Coverage (+25,000 RWF)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Additional Services */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Services</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Additional Driver</h3>
                      <p className="text-sm text-gray-600">Add another authorized driver</p>
                    </div>
                    <label className="flex items-center">
                      <input
                        name="additionalDriver"
                        type="checkbox"
                        checked={form.additionalDriver}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">+8,000 RWF</span>
                    </label>
                  </div>

                  {form.additionalDriver && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                      <input
                        name="additionalDriverName"
                        placeholder="Additional Driver Name"
                        value={form.additionalDriverName}
                        onChange={handleChange}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        name="additionalDriverLicense"
                        placeholder="Driver License Number"
                        value={form.additionalDriverLicense}
                        onChange={handleChange}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Child Seat</h3>
                      <p className="text-sm text-gray-600">Safety seat for children</p>
                    </div>
                    <label className="flex items-center">
                      <input
                        name="childSeat"
                        type="checkbox"
                        checked={form.childSeat}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">+3,000 RWF</span>
                    </label>
                  </div>

                  {form.childSeat && (
                    <div className="ml-4">
                      <select
                        name="childSeatAge"
                        value={form.childSeatAge}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Child Age</option>
                        <option value="0-9 months">0-9 months (Rear-facing)</option>
                        <option value="9 months-4 years">9 months-4 years (Forward-facing)</option>
                        <option value="4-12 years">4-12 years (Booster seat)</option>
                      </select>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Airport Transfer</h3>
                      <p className="text-sm text-gray-600">Pickup/drop-off at airport</p>
                    </div>
                    <label className="flex items-center">
                      <input
                        name="airportTransfer"
                        type="checkbox"
                        checked={form.airportTransfer}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">+10,000 RWF</span>
                    </label>
                  </div>

                  {form.airportTransfer && (
                    <div className="ml-4">
                      <textarea
                        name="airportTransferDetails"
                        placeholder="Flight details, terminal, etc."
                        value={form.airportTransferDetails}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fuel Policy</label>
                  <select
                    name="fuelPolicy"
                    value={form.fuelPolicy}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="full-to-full">Full to Full (Recommended)</option>
                    <option value="prepaid">Prepaid Fuel</option>
                    <option value="pay-on-return">Pay on Return</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Special Requirements</label>
                  <textarea
                    name="specialRequirements"
                    placeholder="Any special requests or requirements..."
                    value={form.specialRequirements}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Contact</label>
                    <input
                      name="emergencyContact"
                      placeholder="Emergency contact name"
                      value={form.emergencyContact}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Phone</label>
                    <input
                      name="emergencyPhone"
                      type="tel"
                      placeholder="Emergency contact phone"
                      value={form.emergencyPhone}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Payment and Terms */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment & Terms</h2>
                
                {/* Price Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Rate:</span>
                      <span>{selectedVehicleDetails?.price || '0 RWF'}</span>
                    </div>
                    {form.insuranceType === 'comprehensive' && (
                      <div className="flex justify-between">
                        <span>Comprehensive Insurance:</span>
                        <span>+15,000 RWF</span>
                      </div>
                    )}
                    {form.insuranceType === 'premium' && (
                      <div className="flex justify-between">
                        <span>Premium Insurance:</span>
                        <span>+25,000 RWF</span>
                      </div>
                    )}
                    {form.childSeat && (
                      <div className="flex justify-between">
                        <span>Child Seat:</span>
                        <span>+3,000 RWF</span>
                      </div>
                    )}
                    {form.airportTransfer && (
                      <div className="flex justify-between">
                        <span>Airport Transfer:</span>
                        <span>+10,000 RWF</span>
                      </div>
                    )}
                    {form.additionalDriver && (
                      <div className="flex justify-between">
                        <span>Additional Driver:</span>
                        <span>+8,000 RWF</span>
                      </div>
                    )}
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{totalPrice.toLocaleString()} RWF</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method *</label>
                    <select
                      name="paymentMethod"
                      value={form.paymentMethod}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="mobile-money">Mobile Money</option>
                      <option value="cash">Cash on Pickup</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
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
                      I agree to the <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a> *
                    </span>
                  </label>
                  
                  <label className="flex items-start">
                    <input
                      name="agreeToPrivacy"
                      type="checkbox"
                      checked={form.agreeToPrivacy}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                      required
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      I agree to the <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> *
                    </span>
                  </label>
                  
                  <label className="flex items-start">
                    <input
                      name="marketingConsent"
                      type="checkbox"
                      checked={form.marketingConsent}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      I agree to receive marketing communications and special offers
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Show error message if present */}
            {errorMessage && (
              <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4 text-center font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Previous
                </button>
              )}
              
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors ml-auto disabled:opacity-50"
                  disabled={!canProceed}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !canProceed}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors ml-auto disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 