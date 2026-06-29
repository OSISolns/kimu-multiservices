"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bar } from 'react-chartjs-2';
import ExcelJS from 'exceljs';
import { useUser } from '../../UserContext';
import { useRouter } from 'next/navigation';
import { FaFileAlt, FaDownload, FaPrint, FaChartLine, FaChartPie, FaMoneyBillWave, FaCalendarAlt, FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaPlus, FaMinus, FaPercentage, FaClock, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaTag, FaCalculator, FaPiggyBank, FaBalanceScale, FaUser, FaCar, FaHotel, FaTaxi, FaPlane, FaHandshake, FaSignOutAlt, FaSignInAlt, FaStar } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';

// Real data and utility functions - will be populated from database
type StaffPerf = {
  name: string; fullName: string; role: string; bookings: number; revenue: number; completed: number; pending: number; cancelled: number; leads: number; feedback: number; reviews: number; attendance: number; kpi: number;
  vehiclesManaged?: number; tripLogs?: number; maintenanceActions?: number; campaigns?: number; crmActivity?: number; invoices?: number; paymentsTracked?: number;
};
const staffPerformance: StaffPerf[] = [];
const months: string[] = [];
const staffTrends: { [key: string]: number[] } = {};
function getTopPerformer(staff: any[]) {
  return staff.reduce((top, s) => (s.revenue > top.revenue ? s : top), staff[0]);
}
function getAverageBookingValue(s: any) {
  return s.bookings ? Math.round(s.revenue / s.bookings) : 0;
}
function getConversionRate(s: any) {
  return s.leads ? Math.round((s.bookings / s.leads) * 100) : 0;
}
function filterStaffByName(staff: any[], filter: string) {
  return staff.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()));
}
function sortStaff(staff: any[], key: string, asc: boolean) {
  return [...staff].sort((a, b) => (asc ? a[key] - b[key] : b[key] - a[key]));
}

const roleTabs = [
  { key: 'all', label: 'All Staff' },
  { key: 'sales', label: 'Sales & Marketing' },
  { key: 'transport-officer', label: 'Transport Officer' },
  { key: 'accountant', label: 'Accountant' },
  { key: 'admin', label: 'Admin' },
];

function getKpiColor(kpi: number) {
  if (kpi >= 90) return 'bg-green-100 text-green-800';
  if (kpi >= 80) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

export default function StaffPerformancePage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [tab, setTab] = useState('all');
  const [staffFilter, setStaffFilter] = useState('');
  const [sortKey, setSortKey] = useState('revenue');
  const [sortAsc, setSortAsc] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/staff/login');
    } else if (!isLoading && user && user.role !== 'admin') {
      router.push('/staff/sales-dashboard');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 bg-[url('/subtle-prism.svg')] bg-cover bg-fixed flex-col flex items-center justify-center">
        <LoadingSpinner message="Loading Performance Data" size="lg" fullScreen={true} />
      </div>
    );
  }

  if (!isLoading && user && user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-red-600">Not Authorized</div>;
  }

  let filteredStaff = staffPerformance.filter(s => tab === 'all' || s.role === tab);
  if (staffFilter) filteredStaff = filteredStaff.filter(s => s.name.toLowerCase().includes(staffFilter.toLowerCase()));
  filteredStaff = [...filteredStaff].sort((a, b) => sortAsc ? (a as any)[sortKey] - (b as any)[sortKey] : (b as any)[sortKey] - (a as any)[sortKey]);

  // Summary stats
  const totalBookings = filteredStaff.reduce((sum, s) => sum + s.bookings, 0);
  const totalRevenue = filteredStaff.reduce((sum, s) => sum + s.revenue, 0);
  const avgFeedback = filteredStaff.length ? (filteredStaff.reduce((sum, s) => sum + s.feedback, 0) / filteredStaff.length).toFixed(2) : 0;
  const topByRevenue = [...filteredStaff].sort((a, b) => b.revenue - a.revenue)[0];
  const topByBookings = [...filteredStaff].sort((a, b) => b.bookings - a.bookings)[0];

  function exportStaffToExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Staff Performance');
    sheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Role', key: 'role', width: 18 },
      { header: 'Bookings', key: 'bookings', width: 12 },
      { header: 'Revenue', key: 'revenue', width: 15 },
      { header: 'Completed', key: 'completed', width: 12 },
      { header: 'Pending', key: 'pending', width: 10 },
      { header: 'Cancelled', key: 'cancelled', width: 12 },
      { header: 'Leads', key: 'leads', width: 10 },
      { header: 'Feedback', key: 'feedback', width: 10 },
      { header: 'Reviews', key: 'reviews', width: 10 },
      { header: 'KPI', key: 'kpi', width: 8 },
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
        leads: s.leads,
        feedback: s.feedback,
        reviews: s.reviews,
        kpi: s.kpi,
      });
    });
    // Style header
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    // Add totals/averages row with formulas
    const lastRow = sheet.lastRow ? sheet.lastRow.number + 1 : filteredStaff.length + 2;
    sheet.getCell(`A${lastRow}`).value = 'Totals/Averages';
    sheet.getCell(`C${lastRow}`).value = { formula: `SUM(C2:C${lastRow - 1})` };
    sheet.getCell(`D${lastRow}`).value = { formula: `SUM(D2:D${lastRow - 1})` };
    sheet.getCell(`E${lastRow}`).value = { formula: `SUM(E2:E${lastRow - 1})` };
    sheet.getCell(`F${lastRow}`).value = { formula: `SUM(F2:F${lastRow - 1})` };
    sheet.getCell(`G${lastRow}`).value = { formula: `SUM(G2:G${lastRow - 1})` };
    sheet.getCell(`H${lastRow}`).value = { formula: `SUM(H2:H${lastRow - 1})` };
    sheet.getCell(`I${lastRow}`).value = { formula: `AVERAGE(I2:I${lastRow - 1})` };
    sheet.getCell(`J${lastRow}`).value = { formula: `AVERAGE(J2:J${lastRow - 1})` };
    sheet.getCell(`K${lastRow}`).value = { formula: `AVERAGE(K2:K${lastRow - 1})` };
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
          <Link href="/staff/sales-dashboard" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">&larr; Back to Dashboard</Link>
          <button onClick={exportStaffToExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">Export to Excel</button>
        </div>
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">Staff Performance Dashboard</h1>
        {/* Role Tabs */}
        <div className="mb-6 flex gap-2 border-b">
          {roleTabs.map(tabObj => (
            <button
              key={tabObj.key}
              onClick={() => setTab(tabObj.key)}
              className={`px-4 py-2 font-semibold border-b-2 ${tab === tabObj.key ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500'} focus:outline-none`}
            >
              {tabObj.label}
            </button>
          ))}
        </div>
        {/* KPI Scorecards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {filteredStaff.map(s => (
            <div key={s.name} className={`rounded-lg p-4 text-center shadow ${getKpiColor(s.kpi)}`}>
              <div className="text-lg font-bold">{s.name}</div>
              <div className="text-xs text-gray-500 mb-1">{s.fullName}</div>
              <div className="text-sm capitalize mb-2">{s.role.replace('-', ' ')}</div>
              <div className="text-2xl font-extrabold">KPI: {s.kpi}</div>
              <div className="text-sm">Bookings: {s.bookings}</div>
              <div className="text-sm">Revenue: {s.revenue.toLocaleString()} RWF</div>
              <div className="text-sm flex items-center justify-center gap-1">Feedback: {s.feedback} <FaStar className="text-yellow-500 text-xs" /></div>
              <div className="text-sm">Attendance: {s.attendance}%</div>
            </div>
          ))}
        </div>
        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-blue-700">Total Bookings</div>
            <div className="text-2xl font-extrabold text-blue-900">{totalBookings}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-green-700">Total Revenue</div>
            <div className="text-2xl font-extrabold text-green-900">{totalRevenue.toLocaleString()} RWF</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-yellow-700">Average Feedback</div>
            <div className="text-2xl font-extrabold text-yellow-900 flex items-center justify-center gap-1">{avgFeedback} <FaStar className="text-yellow-500 text-sm" /></div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-purple-700">Top by Revenue</div>
            <div className="text-lg font-extrabold text-purple-900">{topByRevenue?.name} ({topByRevenue?.revenue?.toLocaleString()} RWF)</div>
            <div className="text-sm text-purple-700">Top by Bookings: {topByBookings?.name} ({topByBookings?.bookings})</div>
          </div>
        </div>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
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
            <option value="kpi">Sort by KPI</option>
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
            title="From date"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
            className="border rounded px-2 py-1 text-sm"
            title="To date"
          />
        </div>
        {/* Role-Specific Tables/Logs */}
        {tab === 'sales' && (
          <div className="mb-8">
            <div className="mb-2">
              <Link href="/staff/sales-dashboard" className="text-blue-600 hover:underline font-semibold">Open Sales Management &rarr;</Link>
            </div>
            <h2 className="text-lg font-bold mb-2">Sales & Marketing Officer Tasks & KPIs</h2>
            <ul className="list-disc ml-6 mb-2 text-sm">
              <li>Leads generated and converted (weekly/monthly)</li>
              <li>Revenue from closed deals</li>
              <li>Campaign reach & engagement</li>
              <li>Customer satisfaction/feedback</li>
              <li>Timeliness in reporting</li>
              <li>CRM activity tracking</li>
            </ul>
            <table className="min-w-full text-sm mb-4">
              <thead>
                <tr className="text-gray-500 text-left">
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Full Name</th>
                  <th className="py-2 px-4">Leads</th>
                  <th className="py-2 px-4">Bookings</th>
                  <th className="py-2 px-4">Revenue</th>
                  <th className="py-2 px-4">Campaigns</th>
                  <th className="py-2 px-4">CRM Activity</th>
                  <th className="py-2 px-4">Feedback</th>
                  <th className="py-2 px-4">Attendance</th>
                  <th className="py-2 px-4">KPI</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(s => (
                  <tr key={s.name} className="border-b last:border-0 hover:bg-blue-50/50 transition-colors">
                    <td className="py-2 px-4">{s.name}</td>
                    <td className="py-2 px-4">{s.fullName}</td>
                    <td className="py-2 px-4">{s.leads}</td>
                    <td className="py-2 px-4">{s.bookings}</td>
                    <td className="py-2 px-4">{s.revenue?.toLocaleString()} RWF</td>
                    <td className="py-2 px-4">{s.campaigns || '-'}</td>
                    <td className="py-2 px-4">{s.crmActivity || '-'}</td>
                    <td className="py-2 px-4"><span className="inline-flex items-center gap-1">{s.feedback} <FaStar className="text-yellow-500 text-xs" /></span></td>
                    <td className="py-2 px-4">{s.attendance}%</td>
                    <td className="py-2 px-4">{s.kpi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'transport-officer' && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-2">Transport Officer Tasks & KPIs</h2>
            <ul className="list-disc ml-6 mb-2 text-sm">
              <li>Timeliness of dispatch and arrivals</li>
              <li>Vehicle utilization rates</li>
              <li>Daily trip logs & reports</li>
              <li>Fuel and maintenance efficiency</li>
              <li>Complaint/incidence reports</li>
              <li>Driver time management</li>
            </ul>
            <table className="min-w-full text-sm mb-4">
              <thead>
                <tr className="text-gray-500 text-left">
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Full Name</th>
                  <th className="py-2 px-4">Bookings</th>
                  <th className="py-2 px-4">Revenue</th>
                  <th className="py-2 px-4">Vehicles Managed</th>
                  <th className="py-2 px-4">Trip Logs</th>
                  <th className="py-2 px-4">Maintenance Actions</th>
                  <th className="py-2 px-4">Feedback</th>
                  <th className="py-2 px-4">Attendance</th>
                  <th className="py-2 px-4">KPI</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(s => (
                  <tr key={s.name} className="border-b last:border-0 hover:bg-blue-50/50 transition-colors">
                    <td className="py-2 px-4">{s.name}</td>
                    <td className="py-2 px-4">{s.fullName}</td>
                    <td className="py-2 px-4">{s.bookings}</td>
                    <td className="py-2 px-4">{s.revenue?.toLocaleString()} RWF</td>
                    <td className="py-2 px-4">{s.vehiclesManaged || '-'}</td>
                    <td className="py-2 px-4">{s.tripLogs || '-'}</td>
                    <td className="py-2 px-4">{s.maintenanceActions || '-'}</td>
                    <td className="py-2 px-4"><span className="inline-flex items-center gap-1">{s.feedback} <FaStar className="text-yellow-500 text-xs" /></span></td>
                    <td className="py-2 px-4">{s.attendance}%</td>
                    <td className="py-2 px-4">{s.kpi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'accountant' && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-2">Accountant Tasks & KPIs</h2>
            <ul className="list-disc ml-6 mb-2 text-sm">
              <li>Accuracy of financial records</li>
              <li>Timeliness of financial reporting</li>
              <li>Invoice/payment follow-up rate</li>
              <li>Budget adherence</li>
              <li>Expense tracking and cash flow visibility</li>
              <li>Audit readiness</li>
            </ul>
            <table className="min-w-full text-sm mb-4">
              <thead>
                <tr className="text-gray-500 text-left">
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Full Name</th>
                  <th className="py-2 px-4">Bookings</th>
                  <th className="py-2 px-4">Revenue</th>
                  <th className="py-2 px-4">Invoices</th>
                  <th className="py-2 px-4">Payments Tracked</th>
                  <th className="py-2 px-4">Feedback</th>
                  <th className="py-2 px-4">Attendance</th>
                  <th className="py-2 px-4">KPI</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(s => (
                  <tr key={s.name} className="border-b last:border-0 hover:bg-blue-50/50 transition-colors">
                    <td className="py-2 px-4">{s.name}</td>
                    <td className="py-2 px-4">{s.fullName}</td>
                    <td className="py-2 px-4">{s.bookings}</td>
                    <td className="py-2 px-4">{s.revenue?.toLocaleString()} RWF</td>
                    <td className="py-2 px-4">{s.invoices || '-'}</td>
                    <td className="py-2 px-4">{s.paymentsTracked || '-'}</td>
                    <td className="py-2 px-4"><span className="inline-flex items-center gap-1">{s.feedback} <FaStar className="text-yellow-500 text-xs" /></span></td>
                    <td className="py-2 px-4">{s.attendance}%</td>
                    <td className="py-2 px-4">{s.kpi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'admin' && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-2">Admin (Manager) Tasks & Monitoring</h2>
            <ul className="list-disc ml-6 mb-2 text-sm">
              <li>Supervise daily business operations</li>
              <li>Set and review KPIs per department</li>
              <li>Conduct performance evaluations</li>
              <li>Handle customer complaints/escalations</li>
              <li>Coordinate cross-department collaboration</li>
              <li>Submit strategic reports to stakeholders/owners</li>
            </ul>
            <div className="mb-2 text-sm">How Admin Monitors Everyone:</div>
            <ul className="list-disc ml-6 mb-2 text-sm">
              <li>Weekly Performance Meetings (with staff reports)</li>
              <li>Dashboards & Logs: Sales, Transport, Finance, Feedback, Vehicle Utilization, Issue Tracking</li>
              <li>KPI Scorecards (monthly rating)</li>
            </ul>
            <div className="mb-2 text-sm font-semibold">Reports Archive:</div>
            <ul className="list-disc ml-6 mb-2 text-sm">
              <li>Weekly Report - 2024-07-01</li>
              <li>Weekly Report - 2024-06-24</li>
              <li>Monthly Report - June 2024</li>
            </ul>
            <div className="mb-2 text-sm font-semibold">Shared Tools:</div>
            <ul className="list-disc ml-6 mb-2 text-sm">
              <li><a href="https://docs.google.com/spreadsheets/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Sheets</a> (Daily trips, bookings, finances)</li>
              <li><a href="https://www.notion.so/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Notion</a> (Weekly reports, task tracking)</li>
              <li><a href="https://trello.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Trello</a> (Task completion, collaboration)</li>
            </ul>
          </div>
        )}
        {/* All Staff Table (default) */}
        {tab === 'all' && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left">
                  <th className="py-2 px-4">Staff</th>
                  <th className="py-2 px-4">Full Name</th>
                  <th className="py-2 px-4">Role</th>
                  <th className="py-2 px-4">Bookings</th>
                  <th className="py-2 px-4">Revenue</th>
                  <th className="py-2 px-4">Completed</th>
                  <th className="py-2 px-4">Pending</th>
                  <th className="py-2 px-4">Cancelled</th>
                  <th className="py-2 px-4">Leads</th>
                  <th className="py-2 px-4">Feedback</th>
                  <th className="py-2 px-4">Reviews</th>
                  <th className="py-2 px-4">Attendance</th>
                  <th className="py-2 px-4">KPI</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((s, i) => (
                  <tr key={s.name} className={s.kpi >= 90 ? 'bg-green-50 font-bold' : 'border-b last:border-0 hover:bg-blue-50/50 transition-colors'}>
                    <td className="py-2 px-4">{s.name}</td>
                    <td className="py-2 px-4">{s.fullName}</td>
                    <td className="py-2 px-4 capitalize">{s.role.replace('-', ' ')}</td>
                    <td className="py-2 px-4">{s.bookings}</td>
                    <td className="py-2 px-4">{s.revenue?.toLocaleString()} RWF</td>
                    <td className="py-2 px-4">{s.completed}</td>
                    <td className="py-2 px-4">{s.pending}</td>
                    <td className="py-2 px-4">{s.cancelled}</td>
                    <td className="py-2 px-4">{s.leads}</td>
                    <td className="py-2 px-4"><span className="inline-flex items-center gap-1">{s.feedback} <FaStar className="text-yellow-500 text-xs" /></span></td>
                    <td className="py-2 px-4">{s.reviews}</td>
                    <td className="py-2 px-4">{s.attendance}%</td>
                    <td className="py-2 px-4">{s.kpi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 