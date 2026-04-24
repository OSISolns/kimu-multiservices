"use client";

// This page uses useUser hook and should not be prerendered

import { FaFileAlt, FaCar, FaTaxi, FaPlane, FaHotel, FaHandshake, FaDownload, FaCheck, FaHourglassHalf, FaTimes, FaMoneyBillWave, FaChartLine, FaCalculator, FaPiggyBank, FaChartPie } from 'react-icons/fa';
import dynamicImport from 'next/dynamic';

// Dynamically import charts to reduce initial bundle size
const Pie = dynamicImport(() => import('react-chartjs-2').then(mod => ({ default: mod.Pie })), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
});

const Line = dynamicImport(() => import('react-chartjs-2').then(mod => ({ default: mod.Line })), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
});

const Bar = dynamicImport(() => import('react-chartjs-2').then(mod => ({ default: mod.Bar })), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
});

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'
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
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useUser } from '../../UserContext';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

// Types and Constants
import {
  BookingSummary,
  StatusBreakdown,
  RecentBooking,
  StaffPerformance,
  FinancialSummary,
  BookingStatsResponse,
  StaffPerformanceResponse,
  DateRange,
  TabType,
  SortKey,
  FinancialPeriod
} from '@/types/reports';

import {
  CHART_COLORS,
  CHART_OPTIONS,
  STATUS_ICONS,
  TAB_CONFIG,
  FINANCIAL_PERIODS,
  SORT_OPTIONS,
  SERVICE_LABELS
} from '@/constants/reports';

// Utilities
import {
  getTopPerformer,
  filterStaffByName,
  sortStaff,
  formatRWF,
  getSuccessRate,
  getPerformancePercentage
} from '@/utils/reportHelpers';

import {
  exportRecentBookingsToExcel,
  exportStaffToExcel,
  exportFinancialSummaryToExcel
} from '@/utils/excelExports';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ChartTitle);

export default function ReportsPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  // State Management
  const [staffFilter, setStaffFilter] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('revenue');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRange>({ from: '', to: '' });
  const [tab, setTab] = useState<TabType>('trends');
  const [financialPeriod, setFinancialPeriod] = useState<FinancialPeriod>('all');
  const [financialStartDate, setFinancialStartDate] = useState<string>('');
  const [financialEndDate, setFinancialEndDate] = useState<string>('');
  const [financialLoading, setFinancialLoading] = useState<boolean>(false);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  // Data State
  const [summary, setSummary] = useState<BookingSummary>({
    totalBookings: 0,
    totalRevenue: 0,
    rentals: 0,
    taxis: 0,
    transfers: 0,
    hotels: 0,
    sales: 0,
  });

  const [trendsLabels, setTrendsLabels] = useState<string[]>([]);
  const [bookingsTrend, setBookingsTrend] = useState<number[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<number[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown>({});
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [staffTrends, setStaffTrends] = useState<{ [key: string]: number[] }>({});

  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    transactionCount: 0,
    period: '',
    generatedBy: '',
    generatedAt: new Date().toISOString(),
    openingBalances: {
      mtnMomoRWF: 0,
      equityBankRWF: 0,
      bkBankRWF: 0,
      cashRWF: 0,
      pettyCashRWF: 0
    },
    closingBalances: {
      mtnMomoRWF: 0,
      equityBankRWF: 0,
      bkBankRWF: 0,
      cashRWF: 0,
      pettyCashRWF: 0
    },
    income: [],
    expenses: []
  });

  // Chart Data Configuration
  const trendsData = {
    labels: trendsLabels,
    datasets: [
      {
        label: 'Bookings',
        data: bookingsTrend,
        backgroundColor: CHART_COLORS.bookings.background,
        borderColor: CHART_COLORS.bookings.border,
        type: 'line' as const,
        yAxisID: 'y',
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Revenue (RWF)',
        data: revenueTrend,
        backgroundColor: CHART_COLORS.revenue.background,
        borderColor: CHART_COLORS.revenue.border,
        type: 'line' as const,
        yAxisID: 'y1',
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const statusPieData = {
    labels: Object.keys(statusBreakdown),
    datasets: [
      {
        label: 'Status',
        data: Object.values(statusBreakdown),
        backgroundColor: [
          CHART_COLORS.success,
          CHART_COLORS.secondary,
          CHART_COLORS.danger,
        ],
        borderWidth: 1,
      },
    ],
  };

  const serviceBookings = [summary.rentals, summary.taxis, summary.transfers, summary.hotels, summary.sales];
  const serviceBarData = {
    labels: [...SERVICE_LABELS],
    datasets: [
      {
        label: 'Bookings',
        data: serviceBookings,
        backgroundColor: [
          CHART_COLORS.primary,
          CHART_COLORS.secondary,
          CHART_COLORS.success,
          CHART_COLORS.warning,
          CHART_COLORS.info,
        ],
        borderRadius: 8,
      },
    ],
  };

  // Optimized API Functions with caching
  const fetchReportData = useCallback(async (): Promise<void> => {
    setDataLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.append('startDate', dateRange.from);
      if (dateRange.to) params.append('endDate', dateRange.to);

      // Add cache-control headers for faster subsequent loads
      const fetchOptions = {
        headers: {
          'Cache-Control': 'max-age=300', // 5 minutes cache
        }
      };

      const [bookingStatsRes, staffPerformanceRes] = await Promise.all([
        fetch(`/api/reports/booking-stats?${params.toString()}`, fetchOptions),
        fetch(`/api/reports/staff-performance?${params.toString()}`, fetchOptions)
      ]);

      if (bookingStatsRes.ok) {
        const bookingData: BookingStatsResponse = await bookingStatsRes.json();
        setSummary(bookingData.summary);
        setTrendsLabels(bookingData.trendsLabels);
        setBookingsTrend(bookingData.bookingsTrend);
        setRevenueTrend(bookingData.revenueTrend);
        setStatusBreakdown(bookingData.statusBreakdown);
        setRecentBookings(bookingData.recentBookings);
      }

      if (staffPerformanceRes.ok) {
        const staffData: StaffPerformanceResponse = await staffPerformanceRes.json();
        setStaffPerformance(staffData.staffPerformance);
        setMonths(staffData.months);
        setStaffTrends(staffData.staffTrends);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setDataLoading(false);
    }
  }, [dateRange]);

  const pullFinancialSummary = useCallback(async (): Promise<void> => {
    setFinancialLoading(true);
    try {
      const params = new URLSearchParams();
      if (financialPeriod !== 'all') {
        params.append('period', financialPeriod);
      }
      if (financialStartDate) {
        params.append('startDate', financialStartDate);
      }
      if (financialEndDate) {
        params.append('endDate', financialEndDate);
      }
      params.append('generatedBy', user?.username || 'Admin');

      const response = await fetch(`/api/financial-summary?${params.toString()}`, {
        headers: {
          'Cache-Control': 'max-age=180', // 3 minutes cache for financial data
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch financial summary');
      }

      const data: FinancialSummary = await response.json();
      setFinancialSummary(data);
    } catch (error) {
      console.error('Error fetching financial summary:', error);
    } finally {
      setFinancialLoading(false);
    }
  }, [financialPeriod, financialStartDate, financialEndDate, user?.username]);

  // Financial Analysis Computed Values
  const expenseAnalysis = useMemo(() => {
    const grouped: { [key: string]: number } = {};
    financialSummary.expenses.forEach(t => {
      const cat = t.category || 'Uncategorized';
      const amount = (t.mtnMomoRWF || 0) + (t.equityBankRWF || 0) + (t.bkBankRWF || 0) + (t.cashRWF || 0);
      grouped[cat] = (grouped[cat] || 0) + amount;
    });
    return Object.entries(grouped).sort(([, a], [, b]) => b - a);
  }, [financialSummary.expenses]);

  const incomeAnalysis = useMemo(() => {
    const grouped: { [key: string]: number } = {};
    financialSummary.income.forEach(t => {
      const cat = t.category || 'Sales';
      const amount = (t.mtnMomoRWF || 0) + (t.equityBankRWF || 0) + (t.bkBankRWF || 0) + (t.cashRWF || 0);
      grouped[cat] = (grouped[cat] || 0) + amount;
    });
    return Object.entries(grouped).sort(([, a], [, b]) => b - a);
  }, [financialSummary.income]);

  const totalOpeningBalance = useMemo(() =>
    (financialSummary.openingBalances.mtnMomoRWF || 0) +
    (financialSummary.openingBalances.equityBankRWF || 0) +
    (financialSummary.openingBalances.bkBankRWF || 0) +
    (financialSummary.openingBalances.cashRWF || 0),
    [financialSummary.openingBalances]);

  const totalClosingBalance = useMemo(() =>
    (financialSummary.closingBalances.mtnMomoRWF || 0) +
    (financialSummary.closingBalances.equityBankRWF || 0) +
    (financialSummary.closingBalances.bkBankRWF || 0) +
    (financialSummary.closingBalances.cashRWF || 0),
    [financialSummary.closingBalances]);

  // Effects
  useEffect(() => {
    fetchReportData();
  }, [dateRange, fetchReportData]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/staff/login');
    } else if (!isLoading && user && !['admin', 'accountant'].includes(user.role)) {
      router.push('/staff/sales-dashboard');
    }
  }, [isLoading, user, router]);

  // Computed Values
  const filteredStaff = sortStaff(
    filterStaffByName(staffPerformance, staffFilter),
    sortKey,
    sortAsc
  );
  const topPerformer = getTopPerformer(filteredStaff);

  // Authorization Check
  if (!isLoading && user && !['admin', 'accountant'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold text-red-600">
        Not Authorized
      </div>
    );
  }

  // Status Icon Renderer
  const renderStatusIcon = (status: string) => {
    const config = STATUS_ICONS[status as keyof typeof STATUS_ICONS];
    if (!config) return null;

    const IconComponent = status === 'Completed' ? FaCheck :
      status === 'Pending' ? FaHourglassHalf : FaTimes;

    return <IconComponent className={config.color} />;
  };

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-4">
        {/* Header Navigation */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/staff/accountant-dashboard"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            &larr; Back to Dashboard
          </Link>
          <button
            onClick={() => exportRecentBookingsToExcel(recentBookings)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            <FaDownload /> Export to Excel
          </button>
        </div>

        {/* Page Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white/60-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Reports & Analytics</h1>
              <p className="text-slate-600 mt-1">Comprehensive insights into your business performance</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchReportData}
                disabled={dataLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {dataLoading ? (
                  <LoadingSpinner size="sm" inline message="Refreshing..." variant="spinner" color="blue" />
                ) : (
                  <>
                    <FaDownload />
                    <span>Refresh Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white/60-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchReportData}
                disabled={dataLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {dataLoading ? 'Updating...' : 'Update Reports'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b flex gap-2">
          {TAB_CONFIG.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id as TabType)}
              className={`px-4 py-2 font-semibold border-b-2 ${tab === id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500'
                } focus:outline-none`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        {dataLoading ? (
          <div className="text-center py-12">
            <LoadingSpinner
              message="Loading Reports Data"
              size="lg"
              variant="company"
              showProgress={true}
              duration={5}
            />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow border">
                <div className="flex items-center gap-3 mb-3">
                  <FaFileAlt className="text-blue-600 text-2xl" />
                  <h3 className="text-lg font-semibold text-blue-700">Total Bookings</h3>
                </div>
                <p className="text-3xl font-bold text-blue-900">{summary.totalBookings}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow border">
                <div className="flex items-center gap-3 mb-3">
                  <FaMoneyBillWave className="text-green-600 text-2xl" />
                  <h3 className="text-lg font-semibold text-green-700">Total Revenue</h3>
                </div>
                <p className="text-3xl font-bold text-green-900">{formatRWF(summary.totalRevenue)}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow border">
                <div className="flex items-center gap-3 mb-3">
                  <FaCar className="text-orange-600 text-2xl" />
                  <h3 className="text-lg font-semibold text-orange-700">Car Rentals</h3>
                </div>
                <p className="text-3xl font-bold text-orange-900">{summary.rentals}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow border">
                <div className="flex items-center gap-3 mb-3">
                  <FaTaxi className="text-yellow-600 text-2xl" />
                  <h3 className="text-lg font-semibold text-yellow-700">Taxi Services</h3>
                </div>
                <p className="text-3xl font-bold text-yellow-900">{summary.taxis}</p>
              </div>
            </div>

            {/* Tab Content */}
            {tab === 'trends' && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center">
                <Line data={trendsData} options={CHART_OPTIONS.trends} />
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
                      {Object.entries(statusBreakdown).map(([status, count]) => {
                        const total = Object.values(statusBreakdown).reduce((a, b) => a + b, 0);
                        const percent = total ? Math.round((count / total) * 100) : 0;
                        const config = STATUS_ICONS[status as keyof typeof STATUS_ICONS];

                        return (
                          <tr key={status} className="border-b last:border-0 hover:bg-blue-50/50 transition-colors">
                            <td className={`py-2 px-4 font-semibold flex items-center gap-2 ${config?.textColor || ''}`}>
                              {renderStatusIcon(status)} {status}
                            </td>
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
                <Bar data={serviceBarData} options={CHART_OPTIONS.serviceBar} />
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
                      {recentBookings.map((booking) => (
                        <tr key={booking.id} className="border-b last:border-0 hover:bg-blue-50/50 transition-colors">
                          <td className="py-2 px-4">{booking.id}</td>
                          <td className="py-2 px-4">{booking.type}</td>
                          <td className="py-2 px-4">{booking.name}</td>
                          <td className="py-2 px-4">{booking.status}</td>
                          <td className="py-2 px-4">{booking.amount ? formatRWF(booking.amount) : '-'}</td>
                          <td className="py-2 px-4">{booking.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'staff' && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-bold mb-4">Staff Performance</h2>
                {filteredStaff && filteredStaff.length > 0 ? (
                  <>
                    <div className="mb-4 flex items-center gap-4">
                      <input
                        type="text"
                        placeholder="Search staff by name..."
                        value={staffFilter}
                        onChange={(e) => setStaffFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <select
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value as SortKey)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {SORT_OPTIONS.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setSortAsc(!sortAsc)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {sortAsc ? '↑ Ascending' : '↓ Descending'}
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-gray-500 text-left">
                            <th className="py-2 px-4">Staff Member</th>
                            <th className="py-2 px-4">Total Revenue</th>
                            <th className="py-2 px-4">Total Bookings</th>
                            <th className="py-2 px-4">Performance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStaff.map((staff) => (
                            <tr key={staff.id} className="border-b last:border-0 hover:bg-blue-50/50 transition-colors">
                              <td className="py-2 px-4 font-semibold">{staff.name}</td>
                              <td className="py-2 px-4">{formatRWF(staff.totalRevenue)}</td>
                              <td className="py-2 px-4">{staff.totalBookings}</td>
                              <td className="py-2 px-4">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${getPerformancePercentage(staff, topPerformer)}%` }}
                                  ></div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <button
                        onClick={() => exportStaffToExcel(filteredStaff)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <FaDownload />
                        Export to Excel
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-2">No staff performance data available</div>
                    <div className="text-gray-400 text-sm">Staff performance data will appear here once available</div>
                  </div>
                )}
              </div>
            )}

            {tab === 'finance' && (
              <div className="space-y-6">
                {/* Financial Summary Controls */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-600" />
                    Financial Ledger Summary
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                      <select
                        value={financialPeriod}
                        onChange={(e) => setFinancialPeriod(e.target.value as FinancialPeriod)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      >
                        {FINANCIAL_PERIODS.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={financialStartDate}
                        onChange={(e) => setFinancialStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={financialEndDate}
                        onChange={(e) => setFinancialEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <button
                        onClick={pullFinancialSummary}
                        disabled={financialLoading}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {financialLoading ? (
                          <LoadingSpinner size="sm" inline message="Loading..." variant="dots" color="orange" />
                        ) : (
                          <span>Pull Summary</span>
                        )}
                      </button>

                      {financialSummary.totalIncome > 0 && (
                        <button
                          onClick={() => exportFinancialSummaryToExcel(financialSummary, user?.username)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <FaDownload />
                          Export
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Financial Summary Results */}
                {financialSummary.totalIncome > 0 && (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-white rounded-xl p-6 shadow border">
                        <div className="flex items-center gap-3 mb-3">
                          <FaMoneyBillWave className="text-green-600 text-2xl" />
                          <h3 className="text-lg font-semibold text-green-700">Total Income</h3>
                        </div>
                        <p className="text-3xl font-bold text-green-700">{formatRWF(financialSummary.totalIncome)}</p>
                      </div>

                      <div className="bg-white rounded-xl p-6 shadow border">
                        <div className="flex items-center gap-3 mb-3">
                          <FaCalculator className="text-red-600 text-2xl" />
                          <h3 className="text-lg font-semibold text-red-700">Total Expenses</h3>
                        </div>
                        <p className="text-3xl font-bold text-red-700">{formatRWF(financialSummary.totalExpenses)}</p>
                      </div>

                      <div className="bg-white rounded-xl p-6 shadow border">
                        <div className="flex items-center gap-3 mb-3">
                          <FaChartLine className="text-blue-600 text-2xl" />
                          <h3 className="text-lg font-semibold text-blue-700">Net Profit</h3>
                        </div>
                        <p className={`text-3xl font-bold ${financialSummary.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {formatRWF(financialSummary.netProfit)}
                        </p>
                      </div>

                      <div className="bg-white rounded-xl p-6 shadow border">
                        <div className="flex items-center gap-3 mb-3">
                          <FaChartPie className="text-purple-600 text-2xl" />
                          <h3 className="text-lg font-semibold text-purple-700">Transactions</h3>
                        </div>
                        <p className="text-3xl font-bold text-purple-700">{financialSummary.transactionCount}</p>
                      </div>
                    </div>

                    {/* Cash Flow Statement */}
                    <div className="bg-white rounded-xl p-6 shadow border">
                      <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <FaMoneyBillWave className="text-blue-600" />
                        Cash Flow Statement
                      </h3>
                      <div className="space-y-4">
                        <div className="border-b pb-4">
                          <h4 className="font-semibold text-gray-700 mb-2">Operating Activities</h4>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Cash Receipts from Customers</span>
                            <span className="font-medium text-green-600">+{formatRWF(financialSummary.totalIncome)}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Cash Paid for Expenses</span>
                            <span className="font-medium text-red-600">-{formatRWF(financialSummary.totalExpenses)}</span>
                          </div>
                          <div className="flex justify-between font-bold mt-2 pt-2 border-t border-dashed">
                            <span>Net Cash Flow from Operations</span>
                            <span className={financialSummary.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}>
                              {formatRWF(financialSummary.netProfit)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Reconciliation</h4>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Cash at Beginning of Period</span>
                            <span className="font-medium">{formatRWF(totalOpeningBalance)}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Net Increase/Decrease in Cash</span>
                            <span className={`font-medium ${financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {financialSummary.netProfit >= 0 ? '+' : ''}{formatRWF(financialSummary.netProfit)}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-100/80 bg-gray-50 p-2 rounded">
                            <span>Cash at End of Period</span>
                            <span className="text-blue-700">{formatRWF(totalClosingBalance)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Balance Sheet */}
                    <div className="bg-white rounded-xl p-6 shadow border">
                      <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <FaPiggyBank className="text-purple-600" />
                        Balance Sheet
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Assets */}
                        <div>
                          <h4 className="font-bold text-gray-700 border-b-2 border-green-500 pb-2 mb-3">ASSETS</h4>
                          <div className="space-y-4">
                            <div>
                              <h5 className="font-semibold text-gray-600 text-sm uppercase mb-2">Current Assets</h5>
                              <div className="pl-3 border-l-2 border-gray-100/80 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Cash on Hand</span>
                                  <span className="font-medium">{formatRWF(financialSummary.closingBalances.cashRWF)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Mobile Money (MTN)</span>
                                  <span className="font-medium">{formatRWF(financialSummary.closingBalances.mtnMomoRWF)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Equity Bank</span>
                                  <span className="font-medium">{formatRWF(financialSummary.closingBalances.equityBankRWF)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">BK Bank</span>
                                  <span className="font-medium">{formatRWF(financialSummary.closingBalances.bkBankRWF)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between font-bold pt-2 border-t">
                              <span>Total Assets</span>
                              <span className="text-green-700">{formatRWF(totalClosingBalance)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Liabilities & Equity */}
                        <div>
                          <h4 className="font-bold text-gray-700 border-b-2 border-red-500 pb-2 mb-3">LIABILITIES & EQUITY</h4>
                          <div className="space-y-6">
                            <div>
                              <h5 className="font-semibold text-gray-600 text-sm uppercase mb-2">Liabilities</h5>
                              <div className="pl-3 border-l-2 border-gray-100/80">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Total Liabilities</span>
                                  <span className="font-medium">0 RWF</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h5 className="font-semibold text-gray-600 text-sm uppercase mb-2">Equity</h5>
                              <div className="pl-3 border-l-2 border-gray-100/80 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Owner&apos;s Equity</span>
                                  <span className="font-medium">{formatRWF(totalClosingBalance)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between font-bold pt-2 border-t">
                              <span>Total Liabilities & Equity</span>
                              <span className="text-blue-700">{formatRWF(totalClosingBalance)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Revenue & Expense Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Revenue Analysis */}
                      <div className="bg-white rounded-xl p-6 shadow border">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                          <FaChartPie className="text-green-600" />
                          Revenue Analysis
                        </h3>
                        <div className="space-y-3">
                          {incomeAnalysis.map(([category, amount]) => (
                            <div key={category}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700 capitalize">{category.replace('_', ' ')}</span>
                                <span className="font-semibold text-gray-900">{formatRWF(amount)}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${(amount / financialSummary.totalIncome) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                          {incomeAnalysis.length === 0 && <p className="text-gray-500 text-sm">No revenue data available.</p>}
                        </div>
                      </div>

                      {/* Expense Analysis */}
                      <div className="bg-white rounded-xl p-6 shadow border">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                          <FaChartPie className="text-red-600" />
                          Expense Analysis
                        </h3>
                        <div className="space-y-3">
                          {expenseAnalysis.map(([category, amount]) => (
                            <div key={category}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700 capitalize">{category.replace('_', ' ')}</span>
                                <span className="font-semibold text-gray-900">{formatRWF(amount)}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className="bg-red-500 h-2 rounded-full"
                                  style={{ width: `${(amount / financialSummary.totalExpenses) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                          {expenseAnalysis.length === 0 && <p className="text-gray-500 text-sm">No expense data available.</p>}
                        </div>
                      </div>
                    </div>

                    {/* Income Transactions */}
                    <div className="bg-white rounded-xl p-6 shadow border">
                      <h3 className="text-xl font-semibold mb-4 text-green-700 flex items-center gap-2">
                        <FaMoneyBillWave className="text-green-600" />
                        Income Transactions ({financialSummary.income.length})
                      </h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {financialSummary.income.map((item) => (
                          <div key={item.id} className="border-l-4 border-green-500 pl-3">
                            <p className="font-medium text-gray-900">{item.description}</p>
                            <div className="flex justify-between text-sm text-gray-600 mt-1">
                              <span>{item.date}</span>
                              <span className="font-semibold text-green-700">{formatRWF(item.mtnMomoRWF || 0)}</span>
                            </div>
                          </div>
                        ))}
                        {financialSummary.income.length === 0 && (
                          <p className="text-gray-500 text-center py-4">No income transactions available</p>
                        )}
                      </div>
                    </div>

                    {/* Expense Transactions */}
                    <div className="bg-white rounded-xl p-6 shadow border">
                      <h3 className="text-xl font-semibold mb-4 text-red-700 flex items-center gap-2">
                        <FaCalculator className="text-red-600" />
                        Expense Transactions ({financialSummary.expenses.length})
                      </h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {financialSummary.expenses.map((item) => (
                          <div key={item.id} className="border-l-4 border-red-500 pl-3">
                            <p className="font-medium text-gray-900">{item.description}</p>
                            <div className="flex justify-between text-sm text-gray-600 mt-1">
                              <span>{item.date}</span>
                              <span className="font-semibold text-red-700">{formatRWF(item.mtnMomoRWF || 0)}</span>
                            </div>
                          </div>
                        ))}
                        {financialSummary.expenses.length === 0 && (
                          <p className="text-gray-500 text-center py-4">No expense transactions available</p>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p><span className="font-semibold text-blue-700">Period:</span> {financialSummary.period || 'N/A'}</p>
                        </div>
                        <div>
                          <p><span className="font-semibold text-blue-700">Generated by:</span> {financialSummary.generatedBy || 'System'}</p>
                          <p><span className="font-semibold text-blue-700">Generated at:</span> {financialSummary.generatedAt ? new Date(financialSummary.generatedAt).toLocaleString() : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {financialSummary.totalIncome === 0 && !financialLoading && (
                  <div className="text-center py-12">
                    <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Financial Data Available</h3>
                    <p className="text-gray-500 mb-4">Click &quot;Pull Summary&quot; to fetch financial data for the selected period.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}