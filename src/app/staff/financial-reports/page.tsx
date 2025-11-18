'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../UserContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  FaChartBar, 
  FaBalanceScale, 
  FaChartLine, 
  FaReceipt, 
  FaDownload, 
  FaFileExport,
  FaPrint,
  FaEye,
  FaCalendarAlt,
  FaFilter,
  FaArrowDown,
  FaArrowUp
} from 'react-icons/fa';

interface FinancialReport {
  reportType: string;
  period: string;
  generatedAt: string;
  summary: any;
  [key: string]: any;
}

export default function FinancialReportsPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [activeReport, setActiveReport] = useState<string>('summary');
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<FinancialReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/staff/login');
    } else if (!isLoading && user && !['admin', 'accountant'].includes(user.role)) {
      router.push('/staff/dashboard');
    }
  }, [isLoading, user, router]);

  const reportTypes = [
    {
      id: 'summary',
      name: 'Financial Summary',
      description: 'Overview of income, expenses, and profit',
      icon: FaChartBar,
      color: 'blue'
    },
    {
      id: 'income-statement',
      name: 'Income Statement',
      description: 'Revenue and expenses breakdown',
      icon: FaReceipt,
      color: 'green'
    },
    {
      id: 'balance-sheet',
      name: 'Balance Sheet',
      description: 'Assets, liabilities, and equity',
      icon: FaBalanceScale,
      color: 'purple'
    },
    {
      id: 'cash-flow',
      name: 'Cash Flow Statement',
      description: 'Cash inflows and outflows',
      icon: FaChartLine,
      color: 'orange'
    },
    {
      id: 'expense-breakdown',
      name: 'Expense Analysis',
      description: 'Detailed expense categorization',
      icon: FaReceipt,
      color: 'red'
    },
    {
      id: 'revenue-analysis',
      name: 'Revenue Analysis',
      description: 'Revenue by category and trends',
      icon: FaChartBar,
      color: 'emerald'
    }
  ];

  const generateReport = async () => {
    setIsLoadingReport(true);
    try {
      const params = new URLSearchParams();
      params.append('type', activeReport);
      params.append('period', period);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/financial-reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        console.error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const exportReport = async (format: 'excel' | 'pdf') => {
    if (!reportData) return;
    
    try {
      // For now, we'll implement Excel export
      if (format === 'excel') {
        const response = await fetch('/api/export/financial-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportData, format: 'excel' })
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `financial-report-${activeReport}-${period}-${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const printReport = () => {
    window.print();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || !['admin', 'accountant'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold text-red-600">
        Not Authorized
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="mt-2 text-gray-600">Generate and export comprehensive financial reports</p>
        </div>

        {/* Report Type Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => {
              const IconComponent = report.icon;
              const isActive = activeReport === report.id;
              
              return (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    isActive 
                      ? `border-${report.color}-500 bg-${report.color}-50` 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <IconComponent className={`h-6 w-6 mb-2 ${
                    isActive ? `text-${report.color}-600` : 'text-gray-500'
                  }`} />
                  <div className={`font-medium ${
                    isActive ? `text-${report.color}-900` : 'text-gray-900'
                  }`}>
                    {report.name}
                  </div>
                  <div className="text-sm text-gray-500">{report.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Report Settings</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <FaFilter />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {showFilters ? <FaArrowUp /> : <FaArrowDown />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Last Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {period === 'custom' && showFilters && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={generateReport}
              disabled={isLoadingReport}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoadingReport ? (
                <LoadingSpinner size="sm" inline />
              ) : (
                <FaEye />
              )}
              Generate Report
            </button>

            {reportData && (
              <>
                <button
                  onClick={() => exportReport('excel')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <FaDownload />
                  Export Excel
                </button>
                <button
                  onClick={printReport}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                >
                  <FaPrint />
                  Print
                </button>
              </>
            )}
          </div>
        </div>

        {/* Report Results */}
        {reportData && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {reportTypes.find(r => r.id === activeReport)?.name} Report
              </h2>
              <div className="text-sm text-gray-500">
                Generated: {new Date(reportData.generatedAt).toLocaleString()}
              </div>
            </div>

            {/* Report Content */}
            <div className="space-y-6">
              {activeReport === 'summary' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Total Income</div>
                    <div className="text-2xl font-bold text-green-700">
                      {reportData.summary?.totalIncome?.toLocaleString()} RWF
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-sm text-red-600 font-medium">Total Expenses</div>
                    <div className="text-2xl font-bold text-red-700">
                      {reportData.summary?.totalExpenses?.toLocaleString()} RWF
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Net Profit</div>
                    <div className="text-2xl font-bold text-blue-700">
                      {reportData.summary?.netProfit?.toLocaleString()} RWF
                    </div>
                  </div>
                </div>
              )}

              {activeReport === 'income-statement' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Revenue</h3>
                      <div className="text-2xl font-bold text-green-700">
                        {reportData.summary?.totalRevenue?.toLocaleString()} RWF
                      </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-red-800 mb-2">Expenses</h3>
                      <div className="text-2xl font-bold text-red-700">
                        {reportData.summary?.totalExpenses?.toLocaleString()} RWF
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Net Income</h3>
                    <div className="text-2xl font-bold text-blue-700">
                      {reportData.summary?.netIncome?.toLocaleString()} RWF
                    </div>
                    <div className="text-sm text-blue-600">
                      Profit Margin: {reportData.summary?.grossMargin?.toFixed(2)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Add more report type displays as needed */}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/staff/accountant-dashboard"
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
            >
              <FaChartBar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="font-medium">Dashboard</div>
            </a>
            <a
              href="/staff/reports"
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
            >
              <FaReceipt className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="font-medium">All Reports</div>
            </a>
            <a
              href="/staff/financial-reports"
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
            >
              <FaFileExport className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="font-medium">Financial Reports</div>
            </a>
            <a
              href="/staff/enhanced-accountant-dashboard"
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
            >
              <FaBalanceScale className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="font-medium">Enhanced Dashboard</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}