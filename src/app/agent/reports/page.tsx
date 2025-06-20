"use client";

import { FaFileAlt, FaCar, FaTaxi, FaPlane, FaHotel, FaHandshake } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const summary = {
  totalBookings: 24,
  totalRevenue: 1450000,
  rentals: 12,
  taxis: 5,
  transfers: 4,
  hotels: 2,
  sales: 1,
};

const pieData = {
  labels: ['Car Rentals', 'Taxis', 'Transfers', 'Hotels', 'Sales'],
  datasets: [
    {
      label: 'Bookings',
      data: [summary.rentals, summary.taxis, summary.transfers, summary.hotels, summary.sales],
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)', // blue
        'rgba(251, 191, 36, 0.7)', // yellow
        'rgba(16, 185, 129, 0.7)', // green
        'rgba(251, 146, 60, 0.7)', // orange
        'rgba(99, 102, 241, 0.7)', // indigo
      ],
      borderWidth: 1,
    },
  ],
};
const pieOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' as const },
    title: { display: true, text: 'Service Distribution', font: { size: 18 } },
  },
};

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-blue-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-4">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FaFileAlt className="text-blue-500" /> Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-blue-700">Total Bookings</div>
            <div className="text-2xl font-extrabold text-blue-900">{summary.totalBookings}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-green-700">Total Revenue</div>
            <div className="text-2xl font-extrabold text-green-900">{summary.totalRevenue.toLocaleString()} RWF</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-yellow-700">Car Rentals</div>
            <div className="text-2xl font-extrabold text-yellow-900">{summary.rentals}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-orange-50 rounded-lg p-4 text-center flex flex-col items-center">
            <FaTaxi className="text-2xl text-orange-500 mb-1" />
            <div className="font-bold">Taxis</div>
            <div className="text-lg font-extrabold">{summary.taxis}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center flex flex-col items-center">
            <FaPlane className="text-2xl text-blue-500 mb-1" />
            <div className="font-bold">Transfers</div>
            <div className="text-lg font-extrabold">{summary.transfers}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center flex flex-col items-center">
            <FaHotel className="text-2xl text-orange-500 mb-1" />
            <div className="font-bold">Hotels</div>
            <div className="text-lg font-extrabold">{summary.hotels}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center flex flex-col items-center">
            <FaHandshake className="text-2xl text-blue-500 mb-1" />
            <div className="font-bold">Sales</div>
            <div className="text-lg font-extrabold">{summary.sales}</div>
          </div>
        </div>
        {/* Pie Chart for service distribution */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>
    </div>
  );
} 