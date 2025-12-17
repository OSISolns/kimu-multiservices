'use client';

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'

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
  FaArrowUp,
  FaFilePdf,
  FaFileExcel,
  FaSearch,
  FaDollarSign,
  FaSpinner,
  FaTimes
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
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/staff/login');
    } else if (!isLoading && user && !['admin', 'accountant'].includes(user.role)) {
      router.push('/staff/sales-dashboard');
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 bg-[url('/subtle-prism.svg')] bg-cover bg-fixed">
      {/* Header with Glassmorphism */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl shadow-lg shadow-orange-500/30">
                <FaFileExport className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Financial Analysis</h1>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest opacity-60">Generate & Export Financial Statements</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/staff/accountant-dashboard')}
                className="px-6 py-2.5 bg-white border-2 border-gray-100 rounded-2xl text-gray-600 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all shadow-sm text-xs font-black uppercase tracking-widest active:scale-95"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Report Types */}
          <div className="lg:col-span-1 space-y-4 print:hidden">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white/50">
              <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 px-2 opacity-50">Report Types</h2>
              <div className="space-y-3">
                {reportTypes.map((report) => {
                  const IconComponent = report.icon;
                  const isActive = activeReport === report.id;

                  // Explicit classes to avoid purge issues
                  const colorMap: { [key: string]: string } = {
                    blue: isActive ? 'bg-blue-50 border-blue-100' : 'hover:bg-blue-50/50',
                    green: isActive ? 'bg-emerald-50 border-emerald-100' : 'hover:bg-emerald-50/50',
                    purple: isActive ? 'bg-purple-50 border-purple-100' : 'hover:bg-purple-50/50',
                    orange: isActive ? 'bg-orange-50 border-orange-100' : 'hover:bg-orange-50/50',
                    red: isActive ? 'bg-rose-50 border-rose-100' : 'hover:bg-rose-50/50',
                    emerald: isActive ? 'bg-emerald-50 border-emerald-100' : 'hover:bg-emerald-50/50',
                  };

                  const iconColorMap: { [key: string]: string } = {
                    blue: isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600',
                    green: isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600',
                    purple: isActive ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400 group-hover:bg-purple-100 group-hover:text-purple-600',
                    orange: isActive ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-600',
                    red: isActive ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-400 group-hover:bg-rose-100 group-hover:text-rose-600',
                    emerald: isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600',
                  };

                  const textColorMap: { [key: string]: string } = {
                    blue: isActive ? 'text-blue-900' : 'text-gray-700',
                    green: isActive ? 'text-emerald-900' : 'text-gray-700',
                    purple: isActive ? 'text-purple-900' : 'text-gray-700',
                    orange: isActive ? 'text-orange-900' : 'text-gray-700',
                    red: isActive ? 'text-rose-900' : 'text-gray-700',
                    emerald: isActive ? 'text-emerald-900' : 'text-gray-700',
                  };

                  return (
                    <button
                      key={report.id}
                      onClick={() => setActiveReport(report.id)}
                      className={`w-full p-4 rounded-2xl text-left transition-all duration-300 group ${colorMap[report.color]} border-2 border-transparent ${isActive ? 'shadow-lg shadow-gray-200/50 !border-white' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl transition-all duration-300 ${iconColorMap[report.color]} ${isActive ? 'scale-110 rotate-3 shadow-sm' : ''}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <div className={`font-black text-sm uppercase tracking-wider ${textColorMap[report.color]}`}>
                            {report.name}
                          </div>
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tight opacity-60 mt-0.5">{report.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters and Controls */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-white/50 print:hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Report Settings</h2>
                  <p className="text-sm text-gray-500 font-medium">Configure parameters for your analysis</p>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 bg-orange-50 px-4 py-2.5 rounded-2xl transition-all hover:shadow-md active:scale-95"
                >
                  <FaFilter />
                  {showFilters ? 'Hide Configuration' : 'Show Configuration'}
                  {showFilters ? <FaArrowUp /> : <FaArrowDown />}
                </button>
              </div>

              {showFilters && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-3 px-1">Period Selection</label>
                      <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none hover:border-gray-200 shadow-sm"
                      >
                        <option value="week">Last 7 Days</option>
                        <option value="month">Current Month</option>
                        <option value="quarter">Fiscal Quarter</option>
                        <option value="year">Full Year</option>
                        <option value="custom">Custom Range</option>
                      </select>
                    </div>

                    {period === 'custom' && (
                      <>
                        <div className="animate-slideDown">
                          <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-3 px-1">Start Date</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none hover:border-gray-200 shadow-sm"
                          />
                        </div>
                        <div className="animate-slideDown">
                          <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-3 px-1">End Date</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none hover:border-gray-200 shadow-sm"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 pt-8 border-t border-gray-100/50">
                    <button
                      onClick={generateReport}
                      disabled={isLoadingReport}
                      className="flex-[2] min-w-[200px] bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-2xl hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-orange-500/30 transition-all active:scale-95 font-black uppercase tracking-widest"
                    >
                      {isLoadingReport ? (
                        <FaSpinner className="animate-spin text-xl" />
                      ) : (
                        <FaEye className="text-xl" />
                      )}
                      {isLoadingReport ? 'Processing...' : 'Generate Analysis'}
                    </button>

                    {reportData && (
                      <div className="flex flex-1 gap-3 min-w-[300px]">
                        <button
                          onClick={() => exportReport('excel')}
                          className="flex-1 bg-emerald-50 text-emerald-600 border border-emerald-100 px-6 py-4 rounded-2xl hover:bg-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-95 font-black uppercase tracking-widest text-xs"
                        >
                          <FaFileExcel className="text-lg" />
                          Excel
                        </button>
                        <button
                          onClick={printReport}
                          className="flex-1 bg-gray-50 text-gray-700 border border-gray-200 px-6 py-4 rounded-2xl hover:bg-gray-100 flex items-center justify-center gap-2 transition-all active:scale-95 font-black uppercase tracking-widest text-xs"
                        >
                          <FaPrint className="text-lg" />
                          Print
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Report Results */}
            {reportData ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/50 overflow-hidden animate-fadeIn">
                <div className="px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                      {reportTypes.find(r => r.id === activeReport)?.name}
                    </h2>
                    <div className="text-xs text-gray-500 mt-1 font-bold uppercase tracking-widest opacity-60">
                      Analysis generated {new Date(reportData.generatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-white shadow-sm text-gray-900 rounded-2xl text-xs font-black uppercase tracking-widest border border-gray-100">
                    {period === 'custom' ? `${startDate} to ${endDate}` : `${period} view active`}
                  </div>
                </div>

                <div className="p-8">
                  {activeReport === 'summary' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-emerald-50/50 p-8 rounded-3xl border-2 border-emerald-100/50 shadow-sm group hover:bg-emerald-50 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-emerald-100 rounded-xl group-hover:scale-110 transition-transform">
                            <FaDollarSign className="h-6 w-6 text-emerald-600" />
                          </div>
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">CREDIT</span>
                        </div>
                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 opacity-70">Total Revenue</div>
                        <div className="text-3xl font-black text-emerald-700 tracking-tight">
                          {reportData.summary?.totalIncome?.toLocaleString()} <span className="text-sm text-emerald-500 ml-1">RWF</span>
                        </div>
                      </div>

                      <div className="bg-orange-50/50 p-8 rounded-3xl border-2 border-orange-100/50 shadow-sm group hover:bg-orange-50 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-orange-100 rounded-xl group-hover:scale-110 transition-transform">
                            <FaReceipt className="h-6 w-6 text-orange-600" />
                          </div>
                          <span className="text-[10px] font-black text-orange-600 bg-orange-100 px-2 py-1 rounded-lg">DEBIT</span>
                        </div>
                        <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 opacity-70">Managed Expenses</div>
                        <div className="text-3xl font-black text-orange-700 tracking-tight">
                          {reportData.summary?.totalExpenses?.toLocaleString()} <span className="text-sm text-orange-500 ml-1">RWF</span>
                        </div>
                      </div>

                      <div className="bg-blue-50/50 p-8 rounded-3xl border-2 border-blue-100/50 shadow-sm group hover:bg-blue-50 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                            <FaChartLine className="h-6 w-6 text-blue-600" />
                          </div>
                          <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">BALANCE</span>
                        </div>
                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 opacity-70">Net Operating Profit</div>
                        <div className="text-3xl font-black text-blue-700 tracking-tight">
                          {reportData.summary?.netProfit?.toLocaleString()} <span className="text-sm text-blue-500 ml-1">RWF</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeReport === 'income-statement' && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-emerald-50/50 p-8 rounded-3xl border-2 border-emerald-100/50">
                          <h3 className="text-sm font-black text-emerald-800 mb-6 flex items-center gap-3 uppercase tracking-widest">
                            <div className="p-2 bg-emerald-100 rounded-lg"><FaDollarSign className="text-emerald-600" /></div> Revenue
                          </h3>
                          <div className="text-4xl font-black text-emerald-700 tracking-tighter">
                            {reportData.summary?.totalRevenue?.toLocaleString()} <span className="text-lg">RWF</span>
                          </div>
                        </div>
                        <div className="bg-orange-50/50 p-8 rounded-3xl border-2 border-orange-100/50">
                          <h3 className="text-sm font-black text-orange-800 mb-6 flex items-center gap-3 uppercase tracking-widest">
                            <div className="p-2 bg-orange-100 rounded-lg"><FaReceipt className="text-orange-600" /></div> Expenses
                          </h3>
                          <div className="text-4xl font-black text-orange-700 tracking-tighter">
                            {reportData.summary?.totalExpenses?.toLocaleString()} <span className="text-lg">RWF</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-600 rounded-3xl p-10 text-white shadow-xl shadow-blue-500/30 flex flex-col sm:flex-row justify-between items-center gap-8 bg-gradient-to-br from-blue-600 to-blue-700">
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Net Income</h3>
                          <div className="text-5xl font-black tracking-tighter">
                            {reportData.summary?.netIncome?.toLocaleString()} <span className="text-2xl opacity-60">RWF</span>
                          </div>
                        </div>
                        <div className="text-center sm:text-right bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Profit Margin</div>
                          <div className="text-4xl font-black tracking-tighter">
                            {reportData.summary?.grossMargin?.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeReport === 'balance-sheet' && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-blue-50/50 p-8 rounded-3xl border-2 border-blue-100/50 shadow-sm">
                          <h3 className="text-sm font-black text-blue-800 mb-6 flex items-center gap-3 uppercase tracking-widest">
                            <div className="p-2 bg-blue-100 rounded-lg"><FaChartBar className="text-blue-600" /></div> Assets
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl">
                              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Cash & Equivalents</span>
                              <span className="font-black text-gray-900">
                                {((reportData.openingBalances?.mtnMomoRWF || 0) + (reportData.openingBalances?.equityBankRWF || 0) + (reportData.openingBalances?.bkBankRWF || 0)).toLocaleString()} RWF
                              </span>
                            </div>
                            <div className="pt-6 border-t-2 border-blue-100 border-dashed">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-blue-800 uppercase tracking-widest">Total Assets</span>
                                <span className="text-2xl font-black text-blue-700 tracking-tight">
                                  {((reportData.openingBalances?.mtnMomoRWF || 0) + (reportData.openingBalances?.equityBankRWF || 0) + (reportData.openingBalances?.bkBankRWF || 0)).toLocaleString()} RWF
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-purple-50/50 p-8 rounded-3xl border-2 border-purple-100/50 shadow-sm">
                          <h3 className="text-sm font-black text-purple-800 mb-6 flex items-center gap-3 uppercase tracking-widest">
                            <div className="p-2 bg-purple-100 rounded-lg"><FaBalanceScale className="text-purple-600" /></div> Liabilities & Equity
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl">
                              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Total Liabilities</span>
                              <span className="font-black text-gray-900">0 RWF</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl">
                              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Owner Equity</span>
                              <span className="font-black text-gray-900">
                                {reportData.summary?.netProfit?.toLocaleString() || 0} RWF
                              </span>
                            </div>
                            <div className="pt-6 border-t-2 border-purple-100 border-dashed">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-purple-800 uppercase tracking-widest">Total Equity</span>
                                <span className="text-2xl font-black text-purple-700 tracking-tight">
                                  {reportData.summary?.netProfit?.toLocaleString() || 0} RWF
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeReport === 'cash-flow' && (
                    <div className="space-y-8">
                      <div className="bg-emerald-50/50 p-8 rounded-3xl border-2 border-emerald-100/50 shadow-sm">
                        <h3 className="text-sm font-black text-emerald-800 mb-8 flex items-center gap-3 uppercase tracking-widest">
                          <div className="p-2 bg-emerald-100 rounded-lg"><FaDollarSign className="text-emerald-600" /></div> Operating Cash Flow
                        </h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-6 bg-white/50 rounded-2xl border-2 border-transparent hover:border-emerald-100 transition-all">
                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Gross Receipts</span>
                            <span className="font-black text-emerald-600 text-lg">+{reportData.summary?.totalIncome?.toLocaleString() || 0} RWF</span>
                          </div>
                          <div className="flex justify-between items-center p-6 bg-white/50 rounded-2xl border-2 border-transparent hover:border-orange-100 transition-all">
                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Operating Outflows</span>
                            <span className="font-black text-orange-600 text-lg">-{reportData.summary?.totalExpenses?.toLocaleString() || 0} RWF</span>
                          </div>
                          <div className="pt-8 border-t-2 border-emerald-100 border-dashed">
                            <div className="flex justify-between items-center px-4">
                              <span className="text-sm font-black text-emerald-800 uppercase tracking-widest">Net Operating Cash</span>
                              <div className="text-3xl font-black text-emerald-700 tracking-tight">
                                {reportData.summary?.netProfit?.toLocaleString() || 0} <span className="text-sm ml-1">RWF</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeReport === 'expense-breakdown' && (
                    <div className="space-y-8">
                      <div className="bg-orange-50/50 p-8 rounded-3xl border-2 border-orange-100/50 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                          <div>
                            <h3 className="text-sm font-black text-orange-800 mb-4 flex items-center gap-3 uppercase tracking-widest">
                              <div className="p-2 bg-orange-100 rounded-lg"><FaReceipt className="text-orange-600" /></div> Expense Analysis
                            </h3>
                            <div className="text-[10px] text-orange-600 font-black uppercase tracking-widest mb-1 opacity-70">Total Managed Expenditure</div>
                            <div className="text-5xl font-black text-orange-700 tracking-tighter">
                              {reportData.summary?.totalExpenses?.toLocaleString() || 0} <span className="text-xl">RWF</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest border-b border-orange-200 pb-4 mb-6">Categorization Breakdown</h4>
                          {(() => {
                            const grouped = reportData.expenses?.reduce((acc: any, curr: any) => {
                              const desc = curr.description || 'General Operation';
                              const amount = (transactionAmount(curr));
                              acc[desc] = (acc[desc] || 0) + amount;
                              return acc;
                            }, {});

                            function transactionAmount(t: any) {
                              return (t.mtnMomoRWF || 0) + (t.equityBankRWF || 0) + (t.bkBankRWF || 0) + (t.bankOfAfricaRWF || 0) + (t.accessBankRWF || 0) + (t.copeduRWF || 0) + (t.cashRWF || 0);
                            }

                            const sortedCategories = Object.entries(grouped || {})
                              .sort(([, a]: any, [, b]: any) => b - a)
                              .slice(0, 10);

                            const total = reportData.summary?.totalExpenses || 1;

                            if (sortedCategories.length === 0) {
                              return <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest bg-white/50 rounded-2xl border-2 border-dashed border-orange-100">No data available for this range</div>;
                            }

                            return sortedCategories.map(([category, amount]: any, idx: number) => (
                              <div key={idx} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{category}</span>
                                  <span className="font-black text-gray-900">{(amount as number).toLocaleString()} RWF</span>
                                </div>
                                <div className="w-full bg-white rounded-full h-3 border-2 border-orange-50 shadow-inner overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${(amount / total * 100).toFixed(1)}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-end">
                                  <span className="text-[10px] font-black text-orange-600/60 uppercase tracking-widest">{(amount / total * 100).toFixed(1)}% OF TOTAL</span>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeReport === 'revenue-analysis' && (
                    <div className="space-y-8">
                      <div className="bg-emerald-50/50 p-8 rounded-3xl border-2 border-emerald-100/50 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                          <div>
                            <h3 className="text-sm font-black text-emerald-800 mb-4 flex items-center gap-3 uppercase tracking-widest">
                              <div className="p-2 bg-emerald-100 rounded-lg"><FaChartBar className="text-emerald-600" /></div> Revenue Analysis
                            </h3>
                            <div className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1 opacity-70">Total Enterprise Revenue</div>
                            <div className="text-5xl font-black text-emerald-700 tracking-tighter">
                              {reportData.summary?.totalIncome?.toLocaleString() || 0} <span className="text-xl">RWF</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest border-b border-emerald-200 pb-4 mb-6">Revenue Stream Performance</h4>
                          {(() => {
                            const grouped = reportData.income?.reduce((acc: any, curr: any) => {
                              const desc = curr.description || 'Miscellaneous Revenue';
                              const amount = (transactionAmount(curr));
                              acc[desc] = (acc[desc] || 0) + amount;
                              return acc;
                            }, {});

                            function transactionAmount(t: any) {
                              return (t.mtnMomoRWF || 0) + (t.equityBankRWF || 0) + (t.bkBankRWF || 0) + (t.bankOfAfricaRWF || 0) + (t.accessBankRWF || 0) + (t.copeduRWF || 0) + (t.cashRWF || 0);
                            }

                            const sortedCategories = Object.entries(grouped || {})
                              .sort(([, a]: any, [, b]: any) => b - a)
                              .slice(0, 10);

                            const total = reportData.summary?.totalIncome || 1;

                            if (sortedCategories.length === 0) {
                              return <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest bg-white/50 rounded-2xl border-2 border-dashed border-emerald-100">No data available for this range</div>;
                            }

                            return sortedCategories.map(([category, amount]: any, idx: number) => (
                              <div key={idx} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{category}</span>
                                  <span className="font-black text-gray-900">{(amount as number).toLocaleString()} RWF</span>
                                </div>
                                <div className="w-full bg-white rounded-full h-3 border-2 border-emerald-50 shadow-inner overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${(amount / total * 100).toFixed(1)}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-end">
                                  <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">{(amount / total * 100).toFixed(1)}% OVERALL</span>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-[40px] shadow-sm border border-white/50 p-20 text-center">
                <div className="w-24 h-24 bg-orange-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 border-2 border-orange-100/50 shadow-inner">
                  <FaChartBar className="h-10 w-10 text-orange-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-3">Intelligence Pending</h3>
                <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
                  Configure your analysis parameters and click &quot;Generate Analysis&quot; to begin the financial extraction.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}