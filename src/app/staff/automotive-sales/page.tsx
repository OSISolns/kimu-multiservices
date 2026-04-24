'use client'

import { useState, useEffect } from 'react';
import { FaWhatsapp, FaPhone, FaCheck, FaSpinner, FaUserTie, FaBuilding, FaMapMarkerAlt, FaCalendarCheck } from 'react-icons/fa';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

type Lead = {
  id: number;
  name: string;
  company: string;
  stage: string;
  value: number;
  contact: string;
  email: string;
  location: string;
  lastContact: string;
  nextFollowUp: string;
};

export default function AutomotiveSalesAgentPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/leads');
      if (response.ok) {
        const result = await response.json();
        setLeads(result.data || []);
      } else {
        setError('Failed to fetch automotive sales leads');
      }
    } catch (err) {
      setError('An error occurred while fetching leads');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStage = async (id: number, newStage: string) => {
    try {
      const response = await fetch(`/api/leads`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stage: newStage }),
      });
      if (response.ok) {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, stage: newStage } : l));
      }
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Automotive Sales & Consultancy</h1>
            <p className="text-slate-500 font-medium">Manage vehicle inquiries, consulting leads, and sales pipeline</p>
          </div>
          <Link href="/staff/sales-dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">&larr; Dashboard</Link>
        </div>

        {isLoading ? (
          <div className="py-32 flex justify-center">
            <FaSpinner className="animate-spin text-5xl text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center font-bold border border-red-100">{error}</div>
        ) : leads.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
            <FaUserTie className="text-7xl text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 text-xl font-bold">No active sales leads found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {leads.map((l) => (
              <div key={l.id} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 flex flex-col md:flex-row justify-between gap-6 hover:border-blue-200 transition-all group">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <FaUserTie className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">{l.name}</h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <FaBuilding /> {l.company || 'Private Individual'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <FaMapMarkerAlt className="text-blue-400" /> {l.location || 'Not Specified'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <FaCalendarCheck className="text-green-400" /> Next Follow-up: {new Date(l.nextFollowUp).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-black text-blue-600">
                      RWF {l.value?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end gap-4 min-w-[200px]">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    l.stage === 'Closed' ? 'bg-green-100 text-green-700' :
                    l.stage === 'Lost' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {l.stage}
                  </div>
                  
                  <div className="flex gap-2 w-full">
                    <a 
                      href={`https://wa.me/${l.contact?.replace(/[^\d]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl transition-all shadow-md shadow-green-100"
                    >
                      <FaWhatsapp />
                    </a>
                    <a 
                      href={`tel:${l.contact}`} 
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl transition-all shadow-md shadow-slate-100"
                    >
                      <FaPhone />
                    </a>
                    {l.stage !== 'Closed' && (
                      <button 
                        onClick={() => handleUpdateStage(l.id, 'Closed')}
                        className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg shadow-blue-100"
                        title="Mark as Won/Closed"
                      >
                        <FaCheck />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 