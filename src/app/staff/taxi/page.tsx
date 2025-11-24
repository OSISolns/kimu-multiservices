"use client";

import { useState, useEffect } from 'react';
import { useUser } from '../../UserContext';
import { FaCar, FaCalendarAlt, FaMoneyBillWave, FaFileAlt, FaCheck, FaClock, FaWhatsapp, FaPhone, FaEdit, FaHotel, FaExclamationTriangle, FaBell, FaChartLine, FaCalculator, FaPiggyBank, FaChartPie, FaUsers, FaShieldAlt, FaStar, FaPlus, FaTrash, FaEye, FaSearch, FaFilter, FaArrowLeft, FaSort, FaSortUp, FaSortDown, FaDownload, FaPrint, FaMinus, FaPercentage, FaCheckCircle, FaTimesCircle, FaTag } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';

type TaxiBooking = {
  name: string;
  pickup: string;
  dropoff: string;
  time: string;
  status: string;
  phone: string;
};
const taxiBookings: TaxiBooking[] = [];

export default function TaxiAgentPage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Loading Taxi Dashboard" size="lg" fullScreen={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-4">
        <h1 className="text-2xl font-bold mb-6">Premium Taxi Services</h1>
        <table className="min-w-full text-sm mb-4">
          <thead>
            <tr className="text-gray-500 text-left">
              <th className="py-2 pr-4">Client</th>
              <th className="py-2 pr-4">Pickup</th>
              <th className="py-2 pr-4">Drop-off</th>
              <th className="py-2 pr-4">Time</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {taxiBookings.map((b, i) => (
              <tr key={i} className={`border-b last:border-0 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <td className="py-2 pr-4 font-semibold">{b.name}</td>
                <td className="py-2 pr-4">{b.pickup}</td>
                <td className="py-2 pr-4">{b.dropoff}</td>
                <td className="py-2 pr-4">{b.time}</td>
                <td className="py-2 pr-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${b.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{b.status}</span>
                </td>
                <td className="py-2 pr-4 flex gap-2">
                  <a title="WhatsApp" href={`https://wa.me/${b.phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"><FaWhatsapp /></a>
                  <a title="Call" href={`tel:${b.phone}`} className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs"><FaPhone /></a>
                  {b.status !== 'Completed' && <button title="Mark as Complete" className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"><FaCheck /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 