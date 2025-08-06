"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaDownload, FaChartBar, FaFileExport, FaCalendarAlt, FaMoneyBillWave, FaReceipt, FaChartLine } from 'react-icons/fa';
import { useUser } from '../../UserContext';

function formatRWF(num: number) {
  return num.toLocaleString('en-US') + ' RWF';
}

export default function FinancialReports() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [payments, setPayments] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState('month');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/staff/login');
    } else if (!isLoading && user && user.role !== 'accountant' && user.role !== 'admin') {
      router.push('/staff/dashboard');
    } else if (!isLoading && user) {
      fetchData();
    }
  }, [router, user, isLoading]);

  const fetchData = () => {
    fetch('/api/payments')
      .then(res => res.json())
      .then(data => {
        setPayments(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Error fetching payments:', err);
        setPayments([]);
      });

    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        } else {
          setBookings([]);
        }
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
        setBookings([]);
      });

    setTimeout(() => setIsLoaded(true), 100);
  };

  const getFilteredPayments = () => {
    const now = new Date();
    const filtered = payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      switch (dateRange) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return paymentDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return paymentDate >= monthAgo;
        case 'quarter':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          return paymentDate >= quarterAgo;
        default:
          return true;
      }
    });
    return filtered;
  };

  const filteredPayments = getFilteredPayments();
  const totalRevenue = filteredPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const paymentMethods = filteredPayments.reduce((acc, payment) => {
    acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 max-w-full mx-auto p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Financial Reports</h1>
          <p className="text-gray-600">Comprehensive financial analytics and reporting</p>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Report Period</h2>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center gap-3 mb-4">
              <FaMoneyBillWave className="text-green-600 text-2xl" />
              <h3 className="text-lg font-semibold">Total Revenue</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{formatRWF(totalRevenue)}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center gap-3 mb-4">
              <FaReceipt className="text-blue-600 text-2xl" />
              <h3 className="text-lg font-semibold">Total Payments</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{filteredPayments.length}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center gap-3 mb-4">
              <FaChartLine className="text-purple-600 text-2xl" />
              <h3 className="text-lg font-semibold">Success Rate</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {filteredPayments.length > 0 
                ? Math.round((filteredPayments.filter(p => p.status === 'completed').length / filteredPayments.length) * 100)
                : 0}%
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center gap-3 mb-4">
              <FaCalendarAlt className="text-orange-600 text-2xl" />
              <h3 className="text-lg font-semibold">Period</h3>
            </div>
            <p className="text-xl font-bold text-orange-600 capitalize">{dateRange}</p>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FaChartBar className="text-blue-600" />
            Payment Methods Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(paymentMethods).map(([method, count]) => (
              <div key={method} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold capitalize">{method}</span>
                  <span className="text-2xl font-bold text-blue-600">{count as number}</span>
                </div>
                                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${((count as number) / filteredPayments.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Payments Table */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <FaReceipt className="text-green-600" />
              Payment Details
            </h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <FaDownload />
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left border-b">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-mono">#{payment.bookingId}</td>
                    <td className="py-3 px-4">{payment.bookingType}</td>
                    <td className="py-3 px-4 font-bold">{formatRWF(payment.amount)}</td>
                    <td className="py-3 px-4 capitalize">{payment.paymentMethod}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      {payment.transactionId || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaFileExport className="text-green-600" />
              Export Options
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Export to Excel
              </button>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Export to PDF
              </button>
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Generate Report
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Completed Payments:</span>
                <span className="font-bold">{filteredPayments.filter(p => p.status === 'completed').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending Payments:</span>
                <span className="font-bold">{filteredPayments.filter(p => p.status === 'pending').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed Payments:</span>
                <span className="font-bold">{filteredPayments.filter(p => p.status === 'failed').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Payment:</span>
                <span className="font-bold">
                  {filteredPayments.length > 0 
                    ? formatRWF(Math.round(filteredPayments.reduce((sum, p) => sum + p.amount, 0) / filteredPayments.length))
                    : '0 RWF'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 shadow">
            <h3 className="text-lg font-semibold mb-4">Report Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                Schedule Report
              </button>
              <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                Print Report
              </button>
              <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                Share Report
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 