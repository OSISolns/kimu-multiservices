'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function HotelPromptModal({ onProceed, onClose }: { onProceed: () => void, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full mx-2 p-6 text-center animate-fade-in">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Booking Successful!</h3>
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

export default function BookCarForm({ vehicles, selectedCar }: { vehicles: any[], selectedCar?: string }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    nationality: '',
    idOrPassport: '',
    carType: selectedCar || '',
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [showHotelPrompt, setShowHotelPrompt] = useState(false);

  // If selectedCar changes, update form.carType
  useEffect(() => {
    if (selectedCar) {
      setForm(prev => ({ ...prev, carType: selectedCar }));
    }
  }, [selectedCar]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    // Basic validation
    if (!form.name || !form.phone || !form.nationality || !form.idOrPassport || !form.carType || !form.pickupDate || !form.pickupTime || !form.returnDate || !form.returnTime) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }
    try {
      const payload = { ...form, type: 'Car Rental' };
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setShowHotelPrompt(true);
        setSuccess(true);
        setForm({
          name: '', phone: '', nationality: '', idOrPassport: '', carType: selectedCar || '', pickupDate: '', pickupTime: '', returnDate: '', returnTime: ''
        });
      } else {
        setError(data.error || 'Booking failed.');
      }
    } catch (err) {
      setError('Booking failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-xl w-full mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 flex flex-col gap-4">
        {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded text-center text-sm">Booking successful! We will contact you soon.</div>}
        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-center text-sm">{error}</div>}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-3 text-base focus:outline-blue-400" autoComplete="name" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium mb-1">Phone (WhatsApp) *</label>
            <input name="phone" value={form.phone} onChange={handleChange} required className="w-full border rounded px-3 py-3 text-base focus:outline-blue-400" autoComplete="tel" inputMode="tel" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium mb-1">Nationality <span className="text-red-500">*</span></label>
            <select name="nationality" value={form.nationality} onChange={handleChange} required className="w-full border rounded px-3 py-3 text-base focus:outline-blue-400">
              <option value="">Select</option>
              <option value="Rwandan">Rwandan</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium mb-1">Passport or National ID card <span className="text-red-500">*</span></label>
            <input name="idOrPassport" value={form.idOrPassport} onChange={handleChange} required className="w-full border rounded px-3 py-3 text-base focus:outline-blue-400" placeholder="Enter Passport or National ID card number" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium mb-1">Car *</label>
            <select name="carType" value={form.carType} onChange={handleChange} required className="w-full border rounded px-3 py-3 text-base focus:outline-blue-400" disabled={!!selectedCar}>
              <option value="">Select</option>
              {vehicles.map((v: any) => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium mb-1">Pickup Date *</label>
            <input type="date" name="pickupDate" value={form.pickupDate} onChange={handleChange} required className="w-full border rounded px-3 py-3 text-base focus:outline-blue-400" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium mb-1">Pickup Time *</label>
            <input type="time" name="pickupTime" value={form.pickupTime} onChange={handleChange} required className="w-full border rounded px-3 py-3 text-base focus:outline-blue-400" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium mb-1">Return Date *</label>
            <input type="date" name="returnDate" value={form.returnDate} onChange={handleChange} required className="w-full border rounded px-3 py-3 text-base focus:outline-blue-400" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium mb-1">Return Time *</label>
            <input type="time" name="returnTime" value={form.returnTime} onChange={handleChange} required className="w-full border rounded px-3 py-3 text-base focus:outline-blue-400" />
          </div>
        </div>
        <button type="submit" className="mt-4 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors text-lg font-semibold w-full" disabled={loading}>{loading ? 'Booking...' : 'Book Now'}</button>
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
    </>
  );
} 