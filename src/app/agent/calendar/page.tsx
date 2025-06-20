"use client";
import { useState } from 'react';
import { FaCalendarAlt, FaCar, FaTaxi, FaPlane, FaHotel, FaHandshake } from 'react-icons/fa';

const bookings = [
  { date: '2024-06-10', type: 'Rental', client: 'Jean Uwimana', car: 'Toyota Prado TXL', time: '08:00' },
  { date: '2024-06-11', type: 'Rental', client: 'Alice Smith', car: 'Hyundai Sonata', time: '09:00' },
  { date: '2024-06-12', type: 'Taxi', client: 'Paul Mugisha', car: '', time: '14:00' },
  { date: '2024-06-12', type: 'Hotel', client: 'Claudine Ingabire', car: '', time: '15:00' },
  { date: '2024-06-13', type: 'Transfer', client: 'Linda Mukamana', car: '', time: '08:30' },
];

function getMonthDays(year: number, month: number) {
  const days = [];
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= lastDate; d++) days.push(d);
  return days;
}

const todayStr = new Date().toISOString().slice(0, 10);

export default function AgentCalendarPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const days = getMonthDays(year, month);
  const monthBookings = bookings.filter(b => new Date(b.date).getMonth() === month && new Date(b.date).getFullYear() === year);
  const bookingsByDay: Record<number, typeof bookings> = {};
  monthBookings.forEach(b => {
    const day = new Date(b.date).getDate();
    if (!bookingsByDay[day]) bookingsByDay[day] = [];
    bookingsByDay[day].push(b);
  });
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const todayBookings = bookings.filter(b => b.date === todayStr);
  const upcomingBookings = bookings.filter(b => b.date > todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-4">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FaCalendarAlt className="text-blue-500" /> Calendar</h1>
        <p className="text-gray-600 mb-8 text-lg">Manage your schedule and view upcoming bookings here.<br /><span className="font-semibold text-blue-600">More coming soon!</span></p>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Calendar */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setMonth(m => m === 0 ? 11 : m - 1)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">&lt;</button>
              <div className="font-bold text-lg">{monthNames[month]} {year}</div>
              <button onClick={() => setMonth(m => m === 11 ? 0 : m + 1)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center mb-2 text-gray-500 font-semibold">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((d, i) => d ? (
                <div key={i} className={`rounded-lg p-2 h-16 flex flex-col items-center justify-start border
                  ${bookingsByDay[d] ? 'bg-blue-300 border-blue-600 text-white shadow-md' : 'bg-gray-50 border-gray-200'}
                  ${new Date(year, month, d).toISOString().slice(0,10) === todayStr ? 'ring-2 ring-blue-500' : ''}
                `}>
                  <div className="font-bold mb-1">{d}</div>
                  {bookingsByDay[d] && (
                    <div className="flex flex-col gap-1 w-full">
                      {bookingsByDay[d].map((b, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-xs bg-blue-200 rounded px-1 py-0.5">
                          {b.type === 'Rental' && <FaCar className="text-blue-600" />}
                          {b.type === 'Taxi' && <FaTaxi className="text-orange-500" />}
                          {b.type === 'Transfer' && <FaPlane className="text-blue-500" />}
                          {b.type === 'Hotel' && <FaHotel className="text-orange-500" />}
                          {b.type === 'Sales' && <FaHandshake className="text-blue-500" />}
                          <span>{b.client}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : <div key={i}></div>) }
            </div>
          </div>
          {/* Sidebar */}
          <div className="w-full md:w-72 flex-shrink-0">
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-2">Today&apos;s Bookings</h2>
              {todayBookings.length === 0 ? <div className="text-gray-400">No bookings today.</div> : (
                <ul className="space-y-2">
                  {todayBookings.map((b, i) => (
                    <li key={i} className="bg-blue-100 rounded p-2 flex items-center gap-2">
                      {b.type === 'Rental' && <FaCar className="text-blue-600" />}
                      {b.type === 'Taxi' && <FaTaxi className="text-orange-500" />}
                      {b.type === 'Transfer' && <FaPlane className="text-blue-500" />}
                      {b.type === 'Hotel' && <FaHotel className="text-orange-500" />}
                      {b.type === 'Sales' && <FaHandshake className="text-blue-500" />}
                      <span className="font-semibold">{b.client}</span>
                      <span className="ml-auto text-xs text-gray-600">{b.time}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold mb-2">Upcoming Bookings</h2>
              {upcomingBookings.length === 0 ? <div className="text-gray-400">No upcoming bookings.</div> : (
                <ul className="space-y-2">
                  {upcomingBookings.map((b, i) => (
                    <li key={i} className="bg-yellow-100 rounded p-2 flex items-center gap-2">
                      {b.type === 'Rental' && <FaCar className="text-blue-600" />}
                      {b.type === 'Taxi' && <FaTaxi className="text-orange-500" />}
                      {b.type === 'Transfer' && <FaPlane className="text-blue-500" />}
                      {b.type === 'Hotel' && <FaHotel className="text-orange-500" />}
                      {b.type === 'Sales' && <FaHandshake className="text-blue-500" />}
                      <span className="font-semibold">{b.client}</span>
                      <span className="ml-auto text-xs text-gray-600">{b.date} {b.time}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 