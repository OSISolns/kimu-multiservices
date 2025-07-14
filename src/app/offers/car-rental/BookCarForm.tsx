'use client'
import { useState, useEffect } from 'react';

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
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
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
          <label className="block text-sm font-medium mb-1">Nationality *</label>
          <select name="nationality" value={form.nationality} onChange={handleChange} required className="w-full border rounded px-3 py-3 text-base focus:outline-blue-400">
            <option value="">Select</option>
            <option value="Rwandan">Rwandan</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium mb-1">{form.nationality === 'Rwandan' ? 'National ID' : 'Passport Number'} *</label>
          <input name="idOrPassport" value={form.idOrPassport} onChange={handleChange} required className="w-full border rounded px-3 py-3 text-base focus:outline-blue-400" />
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
  );
} 