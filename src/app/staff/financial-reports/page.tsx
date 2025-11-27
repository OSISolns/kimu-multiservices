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
  FaDollarSign
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 bg-[url('/subtle-prism.svg')] bg-cover bg-fixed">
      {/* Header with Glassmorphism */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
                <FaFileExport className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financial Reports</h1>
                <p className="text-xs text-gray-500 font-medium">Generate & Export Financial Statements</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/staff/accountant-dashboard')}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm text-sm font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Report Types */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/50">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 px-2">Report Types</h2>
              <div className="space-y-2">
                {reportTypes.map((report) => {
                  const IconComponent = report.icon;
                  const isActive = activeReport === report.id;

                  return (
                    <button
                      key={report.id}
                      onClick={() => setActiveReport(report.id)}
                      className={`w-full p-3 rounded-xl text-left transition-all duration-200 group ${isActive
                        ? `bg-${report.color}-50 border border-${report.color}-100 shadow-sm`
                        : 'hover:bg-gray-50 border border-transparent'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? `bg-${report.color}-100 text-${report.color}-600` : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:shadow-sm'
                          }`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <div className={`font-semibold text-sm ${isActive ? `text-${report.color}-900` : 'text-gray-700'
                            }`}>
                            {report.name}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1">{report.description}</div>
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Report Settings</h2>
                  <p className="text-sm text-gray-500">Configure parameters for your report</p>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <FaFilter />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                  {showFilters ? <FaArrowUp /> : <FaArrowDown />}
                </button>
              </div>

              {showFilters && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Period</label>
                      <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        <option value="week">Last Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                        <option value="custom">Custom Range</option>
                      </select>
                    </div>

                    {period === 'custom' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Start Date</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">End Date</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={generateReport}
                      disabled={isLoadingReport}
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-medium"
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
                          className="bg-green-600 text-white px-6 py-2.5 rounded-xl hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-500/30 transition-all active:scale-95 font-medium"
                        >
                          <FaFileExcel />
                          Export Excel
                        </button>
                        <button
                          onClick={printReport}
                          className="bg-gray-800 text-white px-6 py-2.5 rounded-xl hover:bg-gray-900 flex items-center gap-2 shadow-lg shadow-gray-500/30 transition-all active:scale-95 font-medium"
                        >
                          <FaPrint />
                          Print
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Report Results */}
            {reportData ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden animate-fadeIn">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {reportTypes.find(r => r.id === activeReport)?.name}
                    </h2>
                    <div className="text-sm text-gray-500 mt-1">
                      Generated on {new Date(reportData.generatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                    {period === 'custom' ? `${startDate} - ${endDate}` : period.charAt(0).toUpperCase() + period.slice(1)}
                  </div>
                </div>

                <div className="p-6">
                  {activeReport === 'summary' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                        <div className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-2">Total Income</div>
                        <div className="text-3xl font-bold text-green-700">
                          {reportData.summary?.totalIncome?.toLocaleString()} RWF
                        </div>
                      </div>
                      <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                        <div className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2">Total Expenses</div>
                        <div className="text-3xl font-bold text-red-700">
                          {reportData.summary?.totalExpenses?.toLocaleString()} RWF
                        </div>
                      </div>
                      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Net Profit</div>
                        <div className="text-3xl font-bold text-blue-700">
                          {reportData.summary?.netProfit?.toLocaleString()} RWF
                        </div>
                      </div>
                    </div>
                  )}

                  {activeReport === 'income-statement' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                          <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                            <FaDollarSign className="text-green-600" /> Revenue
                          </h3>
                          <div className="text-3xl font-bold text-green-700">
                            {reportData.summary?.totalRevenue?.toLocaleString()} RWF
                          </div>
                        </div>
                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                          <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                            <FaReceipt className="text-red-600" /> Expenses
                          </h3>
                          <div className="text-3xl font-bold text-red-700">
                            {reportData.summary?.totalExpenses?.toLocaleString()} RWF
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <div className="flex justify-between items-end">
                          <div>
                            <h3 className="font-bold text-blue-800 mb-2">Net Income</h3>
                            <div className="text-4xl font-bold text-blue-700">
                              {reportData.summary?.netIncome?.toLocaleString()} RWF
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-blue-600 font-medium mb-1">Profit Margin</div>
                            <div className="text-2xl font-bold text-blue-800">
                              {reportData.summary?.grossMargin?.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* Balance Sheet */}
                  {activeReport === 'balance-sheet' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Assets */}
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                          <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                            <FaChartBar className="text-blue-600" /> Assets
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Cash & Equivalents</span>
                              <span className="font-semibold text-gray-900">
                                {((reportData.openingBalances?.mtnMomoRWF || 0) + (reportData.openingBalances?.equityBankRWF || 0) + (reportData.openingBalances?.bkBankRWF || 0)).toLocaleString()} RWF
                              </span>
                            </div>
                            <div className="pt-3 border-t border-blue-200">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-blue-800">Total Assets</span>
                                <span className="text-xl font-bold text-blue-700">
                                  {((reportData.openingBalances?.mtnMomoRWF || 0) + (reportData.openingBalances?.equityBankRWF || 0) + (reportData.openingBalances?.bkBankRWF || 0)).toLocaleString()} RWF
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Liabilities & Equity */}
                        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                          <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
                             <FaBalanceScale className="text-purple-600" /> Liabilities & Equity
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Total Liabilities</span>
                              <span className="font-semibold text-gray-900">0 RWF</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Owner&apos;s Equity (Net Profit)</span>
                              <span className="font-semibold text-gray-900">
                                {reportData.summary?.netProfit?.toLocaleString() || 0} RWF
                              </span>
                            </div>
                            <div className="pt-3 border-t border-purple-200">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-purple-800">Total Liabilities & Equity</span>
                                <span className="text-xl font-bold text-purple-700">
                                  {reportData.summary?.netProfit?.toLocaleString() || 0} RWF
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash Flow Statement */}
                  {activeReport === 'cash-flow' && (
                    <div className="space-y-6">
                      <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                        <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                          <FaDollarSign className="text-green-600" /> Cash from Operating Activities
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Income</span>
                            <span className="font-semibold text-green-700">
                              +{reportData.summary?.totalIncome?.toLocaleString() || 0} RWF
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Expenses</span>
                            <span className="font-semibold text-red-700">
                              -{reportData.summary?.totalExpenses?.toLocaleString() || 0} RWF
                            </span>
                          </div>
                          <div className="pt-3 border-t border-green-200">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-green-800">Net Cash from Operations</span>
                              <span className="text-xl font-bold text-green-700">
                                {reportData.summary?.netProfit?.toLocaleString() || 0} RWF
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expense Analysis */}
                  {activeReport === 'expense-breakdown' && (
                    <div className="space-y-6">
                      <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                        <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                          <FaReceipt className="text-red-600" /> Expense Analysis
                        </h3>
                        <div className="mb-6">
                           <div className="text-sm text-red-600 font-medium uppercase tracking-wider mb-1">Total Expenses</div>
                           <div className="text-4xl font-bold text-red-700">
                             {reportData.summary?.totalExpenses?.toLocaleString() || 0} RWF
                           </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-800 border-b border-red-200 pb-2">Top Expense Categories</h4>
                          {(() => {
                            const grouped = reportData.expenses?.reduce((acc: any, curr: any) => {
                                const desc = curr.description || 'Other';
                                const amount = (curr.mtnMomoRWF || 0) + (curr.equityBankRWF || 0) + (curr.bkBankRWF || 0);
                                acc[desc] = (acc[desc] || 0) + amount;
                                return acc;
                            }, {});
                            
                            const sortedCategories = Object.entries(grouped || {})
                                .sort(([, a]: any, [, b]: any) => b - a)
                                .slice(0, 10);
                                
                            const total = reportData.summary?.totalExpenses || 1;

                            if (sortedCategories.length === 0) {
                                return <div className="text-gray-500 italic">No expenses recorded for this period.</div>;
                            }

                            return sortedCategories.map(([category, amount]: any, idx: number) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-700 font-medium">{category}</span>
                                  <span className="font-bold text-gray-900">{amount.toLocaleString()} RWF</span>
                                </div>
                                <div className="w-full bg-white rounded-full h-2 border border-red-100">
                                  <div 
                                    className="bg-red-500 h-2 rounded-full" 
                                    style={{ width: `${(amount / total * 100).toFixed(1)}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-gray-500 text-right">{(amount / total * 100).toFixed(1)}%</div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Revenue Analysis */}
                  {activeReport === 'revenue-analysis' && (
                    <div className="space-y-6">
                      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                        <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                          <FaChartBar className="text-emerald-600" /> Revenue Analysis
                        </h3>
                        <div className="mb-6">
                           <div className="text-sm text-emerald-600 font-medium uppercase tracking-wider mb-1">Total Revenue</div>
                           <div className="text-4xl font-bold text-emerald-700">
                             {reportData.summary?.totalIncome?.toLocaleString() || 0} RWF
                           </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-800 border-b border-emerald-200 pb-2">Top Revenue Sources</h4>
                          {(() => {
                            const grouped = reportData.income?.reduce((acc: any, curr: any) => {
                                const desc = curr.description || 'Other';
                                const amount = (curr.mtnMomoRWF || 0) + (curr.equityBankRWF || 0) + (curr.bkBankRWF || 0);
                                acc[desc] = (acc[desc] || 0) + amount;
                                return acc;
                            }, {});
                            
                            const sortedCategories = Object.entries(grouped || {})
                                .sort(([, a]: any, [, b]: any) => b - a)
                                .slice(0, 10);
                                
                            const total = reportData.summary?.totalIncome || 1;

                            if (sortedCategories.length === 0) {
                                return <div className="text-gray-500 italic">No income recorded for this period.</div>;
                            }

                            return sortedCategories.map(([category, amount]: any, idx: number) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-700 font-medium">{category}</span>
                                  <span className="font-bold text-gray-900">{amount.toLocaleString()} RWF</span>
                                </div>
                                <div className="w-full bg-white rounded-full h-2 border border-emerald-100">
                                  <div 
                                    className="bg-emerald-500 h-2 rounded-full" 
                                    style={{ width: `${(amount / total * 100).toFixed(1)}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-gray-500 text-right">{(amount / total * 100).toFixed(1)}%</div>
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
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-12 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaSearch className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No Report Generated</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                  Select a report type and configure the settings above, then click &quot;Generate Report&quot; to view the data.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}