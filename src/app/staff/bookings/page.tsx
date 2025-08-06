"use client";

import { useEffect, useState } from "react";
import { useUser } from "../../UserContext";
import Link from 'next/link';

function BookingForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { user } = useUser();
  const [type, setType] = useState('Car Rental');
  const [name, setName] = useState('');
  const [idOrPassport, setIdOrPassport] = useState('');
  const [nationality, setNationality] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [guestName, setGuestName] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [roomType, setRoomType] = useState('');
  const [guests, setGuests] = useState(1);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function validate() {
    if (type === 'Car Rental') {
      if (!name || !email || !phone || !idOrPassport || !nationality) {
        setError('Please fill all required fields for Car Rental.');
        return false;
      }
    } else {
      if (!guestName || !email || !phone || !checkInDate || !checkOutDate || !roomType || !guests) {
        setError('Please fill all required fields for Hotel booking.');
        return false;
      }
    }
    setError('');
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    let payload: any = { type, email, phone };
    if (type === 'Car Rental') {
      payload.name = name;
      payload.idOrPassport = idOrPassport;
      payload.nationality = nationality;
      if (pickupDate) payload.pickupDate = pickupDate;
      if (pickupTime) payload.pickupTime = pickupTime;
      if (returnDate) payload.returnDate = returnDate;
      if (returnTime) payload.returnTime = returnTime;
    }
    if (type === 'Hotel') {
      payload.guestName = guestName;
      payload.checkInDate = checkInDate;
      payload.checkOutDate = checkOutDate;
      payload.roomType = roomType;
      payload.guests = guests;
    }
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-username': user?.username || '',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create booking');
      onCreated();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Error creating booking');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl">&times;</button>
        <h2 className="text-xl font-bold mb-4">New Booking</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="Car Rental">Car Rental</option>
              <option value="Hotel">Hotel</option>
            </select>
          </div>
          {type === 'Car Rental' ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ID/Passport <span className="text-red-500">*</span></label>
                <input value={idOrPassport} onChange={e => setIdOrPassport(e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nationality <span className="text-red-500">*</span></label>
                <input value={nationality} onChange={e => setNationality(e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Pickup Date</label>
                  <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Pickup Time</label>
                  <input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Return Date</label>
                  <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Return Time</label>
                  <input type="time" value={returnTime} onChange={e => setReturnTime(e.target.value)} className="w-full border rounded px-3 py-2" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Guest Name <span className="text-red-500">*</span></label>
                <input value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Check-in Date <span className="text-red-500">*</span></label>
                  <input type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} className="w-full border rounded px-3 py-2" required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Check-out Date <span className="text-red-500">*</span></label>
                  <input type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} className="w-full border rounded px-3 py-2" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Room Type <span className="text-red-500">*</span></label>
                <select value={roomType} onChange={e => setRoomType(e.target.value)} className="w-full border rounded px-3 py-2" required>
                  <option value="">Select a room type</option>
                  <option value="Budget Hotels">Budget Hotels – Comfortable and affordable options</option>
                  <option value="Mid-Range Hotels">Mid-Range Hotels – Quality accommodation with amenities</option>
                  <option value="Luxury Hotels">Luxury Hotels – Premium hotels and resorts</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Guests <span className="text-red-500">*</span></label>
                <input type="number" min={1} value={guests} onChange={e => setGuests(Number(e.target.value))} className="w-full border rounded px-3 py-2" required />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone <span className="text-red-500">*</span></label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700" disabled={loading}>
            {loading ? 'Creating...' : 'Create Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const { user } = useUser();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        headers: {
          'x-username': user?.username || '',
        },
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data.bookings);
    } catch (e: any) {
      setError(e.message || "Error fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-4">
        <div className="mb-4">
          <Link href="/staff/dashboard" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">&larr; Back to Dashboard</Link>
        </div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Bookings</h1>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">+ New Booking</button>
        </div>
        {loading ? (
          <p className="text-gray-500">Loading bookings...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-600">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left">
                  <th className="py-2 px-4">ID</th>
                  <th className="py-2 px-4">Type</th>
                  <th className="py-2 px-4">Name/Guest</th>
                  <th className="py-2 px-4">Email</th>
                  <th className="py-2 px-4">Phone</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Created At</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 px-4">{b.id}</td>
                    <td className="py-2 px-4">{b.type}</td>
                    <td className="py-2 px-4">{b.name || b.guestName || '-'}</td>
                    <td className="py-2 px-4">{b.email || '-'}</td>
                    <td className="py-2 px-4">{b.phone || '-'}</td>
                    <td className="py-2 px-4">{b.status}</td>
                    <td className="py-2 px-4">{b.createdAt ? new Date(b.createdAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {showForm && <BookingForm onClose={() => setShowForm(false)} onCreated={fetchBookings} />}
      </div>
    </div>
  );
} 