'use client'

import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaCheck, FaTimes, FaSpinner, FaHistory, FaFilter } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Scale,
} from 'chart.js';
import Pagination from '../../../components/Pagination';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Income = {
  id: number;
  date: string;
  clientName: string;
  category: string;
  amount: number;
  paymentMethod: string;
  reference: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchTransactions();
  }, [categoryFilter]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      let url = '/api/accounting/income';
      if (categoryFilter !== 'all') {
        url += `?category=${categoryFilter}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        setError('Failed to fetch transactions');
      }
    } catch (err) {
      setError('An error occurred while fetching transactions');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalTurnover = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Group transactions by date for the chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const turnoverByDate = last7Days.reduce((acc, date) => {
    acc[date] = transactions
      .filter(t => new Date(t.date).toISOString().split('T')[0] === date)
      .reduce((sum, t) => sum + t.amount, 0);
    return acc;
  }, {} as Record<string, number>);

  const barData = {
    labels: last7Days.map(d => new Date(d).toLocaleDateString('en-RW', { weekday: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Turnover (RWF)',
        data: Object.values(turnoverByDate),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 12,
        hoverBackgroundColor: 'rgba(37, 99, 235, 1)',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `RWF ${context.raw.toLocaleString()}`,
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          callback: (value: any) => 'RWF ' + (value >= 1000 ? (value / 1000) + 'k' : value)
        }
      },
      x: { grid: { display: false } }
    },
  };

  // Pagination
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = transactions.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading && transactions.length === 0) {
    return <LoadingSpinner message="Analyzing transactions..." fullScreen={true} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <FaHistory className="text-blue-600" /> Transaction Ledger
            </h1>
            <p className="text-slate-500 font-medium">Real-time financial tracking and daily turnover</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Categories</option>
              <option value="car_rental">Car Rental</option>
              <option value="taxi_service">Taxi Service</option>
              <option value="airport_transfer">Airport Transfer</option>
              <option value="hotel">Hotel</option>
              <option value="car_sales">Car Sales</option>
            </select>
            <Link href="/staff/sales-dashboard" className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm">
              &larr; Exit
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100">
            <div className="h-64">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl p-8 text-white flex flex-col justify-between">
            <div>
              <div className="text-blue-100 font-bold uppercase tracking-widest text-xs mb-2">Aggregate Turnover</div>
              <div className="text-4xl font-black mb-1">RWF {totalTurnover.toLocaleString()}</div>
              <div className="text-blue-200 text-sm">Gross income from all services</div>
            </div>
            <div className="pt-6 border-t border-white/10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium opacity-80">Total Transactions</span>
                <span className="text-xl font-bold">{transactions.length}</span>
              </div>
              <button onClick={fetchTransactions} className="w-full bg-white/20 hover:bg-white/30 transition-all py-3 rounded-2xl font-bold flex items-center justify-center gap-2">
                <FaSpinner className={isLoading ? 'animate-spin' : ''} /> Refresh Data
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="py-5 px-6">Date</th>
                  <th className="py-5 px-6">Client</th>
                  <th className="py-5 px-6">Category</th>
                  <th className="py-5 px-6">Reference</th>
                  <th className="py-5 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                      {new Date(t.date).toLocaleDateString('en-RW', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-bold text-slate-800">{t.clientName || 'Walk-in Client'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        {t.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 font-medium font-mono">
                      {t.reference || '---'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="text-sm font-black text-slate-900">RWF {t.amount.toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-slate-50/50 border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={transactions.length}
              itemsPerPage={itemsPerPage}
              showItemsPerPage={true}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 