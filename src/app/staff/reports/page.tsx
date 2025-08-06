"use client";

import { FaFileAlt, FaCar, FaTaxi, FaPlane, FaHotel, FaHandshake, FaDownload, FaCheck, FaHourglassHalf, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
} from 'chart.js';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { useUser } from '../../UserContext';
import { useRouter } from 'next/navigation';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ChartTitle);

const summary = {
  totalBookings: 24,
  totalRevenue: 1450000,
  rentals: 12,
  taxis: 5,
  transfers: 4,
  hotels: 2,
  sales: 1,
};

// Mock trends data (bookings and revenue by month)
const trendsLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const bookingsTrend = [2, 4, 6, 5, 3, 4];
const revenueTrend = [120000, 250000, 300000, 200000, 180000, 250000];
const trendsData = {
  labels: trendsLabels,
  datasets: [
    {
      label: 'Bookings',
      data: bookingsTrend,
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgba(59, 130, 246, 1)',
      type: 'bar' as const,
      yAxisID: 'y',
    },
    {
      label: 'Revenue (RWF)',
      data: revenueTrend,
      backgroundColor: 'rgba(16, 185, 129, 0.3)',
      borderColor: 'rgba(16, 185, 129, 1)',
      type: 'line' as const,
      yAxisID: 'y1',
      fill: false,
      tension: 0.4,
    },
  ],
};
const trendsOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: true, text: 'Monthly Trends (Bookings & Revenue)' },
  },
  scales: {
    y: { beginAtZero: true, title: { display: true, text: 'Bookings' } },
    y1: {
      beginAtZero: true,
      position: 'right' as const,
      grid: { drawOnChartArea: false },
      title: { display: true, text: 'Revenue (RWF)' },
    },
  },
};

// Mock status breakdown
const statusBreakdown = { Completed: 18, Pending: 5, Cancelled: 1 };
const statusPieData = {
  labels: Object.keys(statusBreakdown),
  datasets: [
    {
      label: 'Status',
      data: Object.values(statusBreakdown),
      backgroundColor: [
        'rgba(16, 185, 129, 0.7)', // green
        'rgba(251, 191, 36, 0.7)', // yellow
        'rgba(239, 68, 68, 0.7)', // red
      ],
      borderWidth: 1,
    },
  ],
};
const statusPieOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' },
    title: { display: true, text: 'Booking Status Breakdown' },
  },
};

// Mock recent activity
const recentBookings = [
  { id: 101, type: 'Car Rental', name: 'Jean Uwimana', status: 'Completed', amount: 120000, date: '2024-06-10' },
  { id: 102, type: 'Taxi', name: 'Alice Smith', status: 'Pending', amount: 20000, date: '2024-06-11' },
  { id: 103, type: 'Hotel', name: 'Paul Mugisha', status: 'Completed', amount: 80000, date: '2024-06-12' },
  { id: 104, type: 'Car Rental', name: 'Claudine Ingabire', status: 'Cancelled', amount: 0, date: '2024-06-13' },
  { id: 105, type: 'Transfer', name: 'John Doe', status: 'Completed', amount: 75000, date: '2024-06-14' },
];

// Bar chart for service distribution (bookings by service)
const serviceLabels = ['Car Rentals', 'Taxis', 'Transfers', 'Hotels', 'Sales'];
const serviceBookings = [summary.rentals, summary.taxis, summary.transfers, summary.hotels, summary.sales];
const serviceBarData = {
  labels: serviceLabels,
  datasets: [
    {
      label: 'Bookings',
      data: serviceBookings,
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)', // blue
        'rgba(251, 191, 36, 0.7)', // yellow
        'rgba(16, 185, 129, 0.7)', // green
        'rgba(251, 146, 60, 0.7)', // orange
        'rgba(99, 102, 241, 0.7)', // indigo
      ],
      borderRadius: 8,
    },
  ],
};
const serviceBarOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Bookings by Service Type', font: { size: 18 } },
  },
  scales: {
    y: { beginAtZero: true, title: { display: true, text: 'Bookings' } },
  },
};

// Mock staff performance data with roles and role-specific stats
const staffPerformance = [
  { name: 'Jean Bosco', role: 'admin', bookings: 8, revenue: 480000, completed: 7, pending: 1, cancelled: 0, leads: 10, feedback: 4.8, reviews: 12, usersManaged: 5, systemActions: 12 },
  { name: 'Alice Mukamana', role: 'agent', bookings: 6, revenue: 350000, completed: 5, pending: 1, cancelled: 0, leads: 8, feedback: 4.5, reviews: 9, repeatCustomers: 3 },
  { name: 'Samuel Dusabe', role: 'transport-officer', bookings: 5, revenue: 420000, completed: 4, pending: 0, cancelled: 1, leads: 7, feedback: 4.9, reviews: 10, vehiclesManaged: 12, maintenanceActions: 4 },
  { name: 'Esther Uwimana', role: 'agent', bookings: 3, revenue: 200000, completed: 2, pending: 1, cancelled: 0, leads: 5, feedback: 4.7, reviews: 7, repeatCustomers: 1 },
];

// Mock trend data per staff (monthly)
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const staffTrends = {
  'Jean Bosco':   [1, 2, 1, 2, 1, 1],
  'Alice Mukamana': [1, 1, 1, 1, 1, 1],
  'Samuel Dusabe':  [0, 1, 1, 1, 1, 1],
  'Esther Uwimana': [0, 1, 0, 1, 0, 1],
};

function getTopPerformer(staff: any[]) {
  return staff.reduce((top, s) => (s.revenue > top.revenue ? s : top), staff[0]);
}

function getAverageBookingValue(s: any) {
  return s.bookings ? Math.round(s.revenue / s.bookings) : 0;
}

function getConversionRate(s: any) {
  return s.leads ? Math.round((s.bookings / s.leads) * 100) : 0;
}

function getCommission(s: any) {
  // Mock: 5% commission
  return Math.round(s.revenue * 0.05);
}

function filterStaffByName(staff: any[], filter: string) {
  return staff.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()));
}

function sortStaff(staff: any[], key: string, asc: boolean) {
  return [...staff].sort((a, b) => (asc ? (a as any)[key] - (b as any)[key] : (b as any)[key] - (a as any)[key]));
}

function exportRecentBookingsToExcel() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Recent Bookings');
  sheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Type', key: 'type', width: 18 },
    { header: 'Name', key: 'name', width: 22 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Amount', key: 'amount', width: 14 },
    { header: 'Date', key: 'date', width: 16 },
  ];
  recentBookings.forEach(b => {
    sheet.addRow({
      id: b.id,
      type: b.type,
      name: b.name,
      status: b.status,
      amount: b.amount,
      date: b.date,
    });
  });
  // Style header
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
  // Add totals/averages row with formulas
  const lastRow = sheet.lastRow ? sheet.lastRow.number + 1 : recentBookings.length + 2;
  sheet.getCell(`A${lastRow}`).value = 'Totals/Averages';
  sheet.getCell(`E${lastRow}`).value = { formula: `SUM(E2:E${lastRow-1})` };
  sheet.getCell(`F${lastRow}`).value = { formula: `COUNTA(F2:F${lastRow-1})` };
  sheet.getRow(lastRow).font = { bold: true };
  // Download
  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recent-bookings-${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  });
}

export default function ReportsPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [staffFilter, setStaffFilter] = useState('');
  const [sortKey, setSortKey] = useState('revenue');
  const [sortAsc, setSortAsc] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [tab, setTab] = useState('trends');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/staff/login');
    } else if (!isLoading && user && !['admin', 'accountant'].includes(user.role)) {
      router.push('/staff/dashboard');
    }
  }, [isLoading, user, router]);

  if (!isLoading && user && !['admin', 'accountant'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold text-red-600">
        Not Authorized
      </div>
    );
  }

  let filteredStaff = filterStaffByName(staffPerformance, staffFilter);
  filteredStaff = sortStaff(filteredStaff, sortKey, sortAsc);
  const topPerformer = getTopPerformer(filteredStaff);

  function exportStaffToExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Staff Performance');
    sheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Bookings', key: 'bookings', width: 12 },
      { header: 'Revenue', key: 'revenue', width: 15 },
      { header: 'Completed', key: 'completed', width: 12 },
      { header: 'Pending', key: 'pending', width: 10 },
      { header: 'Cancelled', key: 'cancelled', width: 12 },
      { header: 'Conversion', key: 'conversion', width: 12 },
      { header: 'Feedback', key: 'feedback', width: 10 },
      { header: 'Reviews', key: 'reviews', width: 10 },
    ];
    filteredStaff.forEach(s => {
      sheet.addRow({
        name: s.name,
        role: s.role,
        bookings: s.bookings,
        revenue: s.revenue,
        completed: s.completed,
        pending: s.pending,
        cancelled: s.cancelled,
        conversion: getConversionRate(s) + '%',
        feedback: s.feedback,
        reviews: s.reviews,
      });
    });
    // Style header
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    // Add totals/averages row with formulas
    const lastRow = sheet.lastRow ? sheet.lastRow.number + 1 : filteredStaff.length + 2;
    sheet.getCell(`A${lastRow}`).value = 'Totals/Averages';
    sheet.getCell(`C${lastRow}`).value = { formula: `SUM(C2:C${lastRow-1})` };
    sheet.getCell(`D${lastRow}`).value = { formula: `SUM(D2:D${lastRow-1})` };
    sheet.getCell(`E${lastRow}`).value = { formula: `SUM(E2:E${lastRow-1})` };
    sheet.getCell(`F${lastRow}`).value = { formula: `SUM(F2:F${lastRow-1})` };
    sheet.getCell(`G${lastRow}`).value = { formula: `SUM(G2:G${lastRow-1})` };
    sheet.getCell(`H${lastRow}`).value = { formula: `AVERAGE(H2:H${lastRow-1})` };
    sheet.getCell(`I${lastRow}`).value = { formula: `AVERAGE(I2:I${lastRow-1})` };
    sheet.getCell(`J${lastRow}`).value = { formula: `AVERAGE(J2:J${lastRow-1})` };
    sheet.getCell(`K${lastRow}`).value = undefined;
    sheet.getRow(lastRow).font = { bold: true };
    // Download
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `staff-performance-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/staff/dashboard" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">&larr; Back to Dashboard</Link>
          <button onClick={exportRecentBookingsToExcel} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"><FaDownload /> Export to Excel</button>
        </div>
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FaFileAlt className="text-blue-500" /> Reports</h1>
        {/* Tabs */}
        <div className="mb-8 border-b flex gap-2">
          <button onClick={() => setTab('trends')} className={`px-4 py-2 font-semibold border-b-2 ${tab === 'trends' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500'} focus:outline-none`}>Trends</button>
          <button onClick={() => setTab('status')} className={`px-4 py-2 font-semibold border-b-2 ${tab === 'status' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500'} focus:outline-none`}>Status Breakdown</button>
          <button onClick={() => setTab('service')} className={`px-4 py-2 font-semibold border-b-2 ${tab === 'service' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500'} focus:outline-none`}>Service Distribution</button>
          <button onClick={() => setTab('activity')} className={`px-4 py-2 font-semibold border-b-2 ${tab === 'activity' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500'} focus:outline-none`}>Recent Activity</button>
          <button onClick={() => setTab('staff')} className={`px-4 py-2 font-semibold border-b-2 ${tab === 'staff' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500'} focus:outline-none`}>Staff Performance</button>
        </div>
        {/* Tab Content */}
        {tab === 'trends' && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center">
            <Chart type="bar" data={trendsData} options={trendsOptions} />
          </div>
        )}
        {tab === 'status' && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold mb-4">Booking Status Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-left">
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Count</th>
                    <th className="py-2 px-4">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(statusBreakdown).map(([status, count], i) => {
                    const total = Object.values(statusBreakdown).reduce((a, b) => a + b, 0);
                    const percent = total ? Math.round((count / total) * 100) : 0;
                    let icon = null, color = '';
                    if (status === 'Completed') { icon = <FaCheck className="text-green-600" />; color = 'text-green-800'; }
                    if (status === 'Pending') { icon = <FaHourglassHalf className="text-yellow-600" />; color = 'text-yellow-800'; }
                    if (status === 'Cancelled') { icon = <FaTimes className="text-red-600" />; color = 'text-red-800'; }
                    return (
                      <tr key={status} className="border-b last:border-0 hover:bg-gray-50">
                        <td className={`py-2 px-4 font-semibold flex items-center gap-2 ${color}`}>{icon} {status}</td>
                        <td className="py-2 px-4">{count}</td>
                        <td className="py-2 px-4">{percent}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {tab === 'service' && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center">
            <Bar data={serviceBarData} options={serviceBarOptions} />
          </div>
        )}
        {tab === 'activity' && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold mb-4">Recent Bookings</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-left">
                    <th className="py-2 px-4">ID</th>
                    <th className="py-2 px-4">Type</th>
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Amount</th>
                    <th className="py-2 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 px-4">{b.id}</td>
                      <td className="py-2 px-4">{b.type}</td>
                      <td className="py-2 px-4">{b.name}</td>
                      <td className="py-2 px-4">{b.status}</td>
                      <td className="py-2 px-4">{b.amount ? b.amount.toLocaleString() : '-'} RWF</td>
                      <td className="py-2 px-4">{b.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
        </div>
          </div>
        )}
        {tab === 'staff' && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
              <h2 className="text-lg font-bold">Staff Performance</h2>
              <button onClick={exportStaffToExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">Export to Excel</button>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={staffFilter}
                  onChange={e => setStaffFilter(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                />
                <select value={sortKey} onChange={e => setSortKey(e.target.value)} className="border rounded px-2 py-1 text-sm">
                  <option value="revenue">Sort by Revenue</option>
                  <option value="bookings">Sort by Bookings</option>
                  <option value="feedback">Sort by Feedback</option>
                </select>
                <button
                  className="border rounded px-2 py-1 text-sm"
                  onClick={() => setSortAsc(a => !a)}
                  title="Toggle sort order"
                >{sortAsc ? 'Asc' : 'Desc'}</button>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
                  className="border rounded px-2 py-1 text-sm"
                  title="From date (mock)"
                />
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
                  className="border rounded px-2 py-1 text-sm"
                  title="To date (mock)"
                />
              </div>
            </div>
            <div className="mb-4">
              <Link href="/staff/performance" className="text-blue-600 hover:underline font-semibold">View Full Staff Performance Page &rarr;</Link>
            </div>
            {/* Top Performer Highlight */}
            <div className="mb-4">
              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold text-sm">
                Top Performer: {topPerformer.name} ({topPerformer.revenue.toLocaleString()} RWF)
              </span>
            </div>
            {/* Trend Chart (mock) */}
            <div className="mb-4">
              <Bar
                data={{
                  labels: months,
                  datasets: filteredStaff.map(s => ({
                    label: s.name,
                    data: staffTrends[s.name as keyof typeof staffTrends],
                    backgroundColor: s.name === topPerformer.name ? 'rgba(16,185,129,0.7)' : 'rgba(59,130,246,0.5)',
                  })),
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { position: 'top' }, title: { display: true, text: 'Bookings per Month (Mock)' } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
            {/* Staff Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-left">
                    <th className="py-2 px-4">Staff</th>
                    <th className="py-2 px-4">Role</th>
                    <th className="py-2 px-4">Bookings</th>
                    <th className="py-2 px-4">Revenue</th>
                    <th className="py-2 px-4">Avg Value</th>
                    <th className="py-2 px-4">Completed</th>
                    <th className="py-2 px-4">Pending</th>
                    <th className="py-2 px-4">Cancelled</th>
                    <th className="py-2 px-4">Conversion</th>
                    <th className="py-2 px-4">Feedback</th>
                    <th className="py-2 px-4">Reviews</th>
                    <th className="py-2 px-4">Role Features</th>
                    <th className="py-2 px-4">Status Breakdown</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((s, i) => (
                    <tr key={i} className={s.name === topPerformer.name ? 'bg-green-50 font-bold' : 'border-b last:border-0 hover:bg-gray-50'}>
                      <td className="py-2 px-4">{s.name}</td>
                      <td className="py-2 px-4 capitalize">{s.role}</td>
                      <td className="py-2 px-4">{s.bookings}</td>
                      <td className="py-2 px-4">{s.revenue.toLocaleString()} RWF</td>
                      <td className="py-2 px-4">{getAverageBookingValue(s).toLocaleString()} RWF</td>
                      <td className="py-2 px-4">{s.completed}</td>
                      <td className="py-2 px-4">{s.pending}</td>
                      <td className="py-2 px-4">{s.cancelled}</td>
                      <td className="py-2 px-4">{getConversionRate(s)}%</td>
                      <td className="py-2 px-4">{s.feedback} ⭐</td>
                      <td className="py-2 px-4">{s.reviews}</td>
                      <td className="py-2 px-4">
                        {s.role === 'admin' && (
                          <div>
                            <div><span className="font-semibold">Users Managed:</span> {s.usersManaged}</div>
                            <div><span className="font-semibold">System Actions:</span> {s.systemActions}</div>
                          </div>
                        )}
                        {s.role === 'agent' && (
                          <div>
                            <div><span className="font-semibold">Repeat Customers:</span> {s.repeatCustomers}</div>
                          </div>
                        )}
                        {s.role === 'transport-officer' && (
                          <div>
                            <div><span className="font-semibold">Vehicles Managed:</span> {s.vehiclesManaged}</div>
                            <div><span className="font-semibold">Maintenance Actions:</span> {s.maintenanceActions}</div>
          </div>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        <Bar
                          data={{
                            labels: ['Completed', 'Pending', 'Cancelled'],
                            datasets: [{
                              label: 'Bookings',
                              data: [s.completed, s.pending, s.cancelled],
                              backgroundColor: [
                                'rgba(16,185,129,0.7)',
                                'rgba(251,191,36,0.7)',
                                'rgba(239,68,68,0.7)',
                              ],
                            }],
                          }}
                          options={{
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true, display: false }, x: { display: false } },
                            responsive: true,
                            maintainAspectRatio: false,
                          }}
                          height={30}
                          width={100}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
          </div>
        )}
      </div>
    </div>
  );
} 