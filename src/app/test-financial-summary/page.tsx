"use client"
import { useState } from 'react';
import { FaDownload, FaChartLine, FaMoneyBillWave, FaCalculator, FaCalendarAlt } from 'react-icons/fa';

export default function TestFinancialSummary() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const pullFinancialSummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (period !== 'all') {
        params.append('period', period);
      }
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }
      params.append('generatedBy', 'Test User');

      const response = await fetch(`/api/financial-summary?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch financial summary');
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatRWF = (num: number) => {
    return num.toLocaleString('en-US') + ' RWF';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <FaChartLine className="text-3xl text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Summary Test</h1>
              <p className="text-gray-600">Pull and test financial summary generation</p>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-600" />
              Summary Parameters
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="custom">Custom Date Range</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={pullFinancialSummary}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <FaDownload />
                      Pull Summary
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Results */}
          {summary && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Summary Generated Successfully!</h3>
                <p className="text-green-700">Period: {summary.period}</p>
                <p className="text-green-700">Generated by: {summary.generatedBy}</p>
                <p className="text-green-700">Generated at: {new Date(summary.generatedAt).toLocaleString()}</p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow border">
                  <div className="flex items-center gap-3 mb-3">
                    <FaMoneyBillWave className="text-green-600 text-2xl" />
                    <h3 className="text-lg font-semibold text-green-700">Total Income</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-700">{formatRWF(summary.totalIncome)}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow border">
                  <div className="flex items-center gap-3 mb-3">
                    <FaCalculator className="text-red-600 text-2xl" />
                    <h3 className="text-lg font-semibold text-red-700">Total Expenses</h3>
                  </div>
                  <p className="text-3xl font-bold text-red-700">{formatRWF(summary.totalExpenses)}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow border">
                  <div className="flex items-center gap-3 mb-3">
                    <FaChartLine className="text-blue-600 text-2xl" />
                    <h3 className="text-lg font-semibold text-blue-700">Net Profit</h3>
                  </div>
                  <p className={`text-3xl font-bold ${summary.netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                    {formatRWF(summary.netProfit)}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow border">
                  <div className="flex items-center gap-3 mb-3">
                    <FaCalendarAlt className="text-purple-600 text-2xl" />
                    <h3 className="text-lg font-semibold text-purple-700">Transactions</h3>
                  </div>
                  <p className="text-3xl font-bold text-purple-700">{summary.transactionCount}</p>
                </div>
              </div>

              {/* Account Balances */}
              <div className="bg-white rounded-xl p-6 shadow border">
                <h3 className="text-xl font-semibold mb-4">Account Balances</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Opening Balances</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">MTN Momo:</span>
                        <span className="font-semibold">{formatRWF(summary.openingBalances.mtnMomoRWF)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Equity Bank:</span>
                        <span className="font-semibold">{formatRWF(summary.openingBalances.equityBankRWF)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">BK Bank:</span>
                        <span className="font-semibold">{formatRWF(summary.openingBalances.bkBankRWF)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Closing Balances</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">MTN Momo:</span>
                        <span className="font-semibold">{formatRWF(summary.closingBalances.mtnMomoRWF)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Equity Bank:</span>
                        <span className="font-semibold">{formatRWF(summary.closingBalances.equityBankRWF)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">BK Bank:</span>
                        <span className="font-semibold">{formatRWF(summary.closingBalances.bkBankRWF)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow border">
                  <h3 className="text-xl font-semibold mb-4 text-green-700">Income Transactions ({summary.income.length})</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {summary.income.map((item: any) => (
                      <div key={item.id} className="border-l-4 border-green-500 pl-3">
                        <p className="font-medium text-gray-900">{item.description}</p>
                        <p className="text-sm text-gray-600">{item.date}</p>
                        <p className="text-sm text-green-700 font-semibold">
                          {formatRWF((item.mtnMomoRWF || 0) + (item.equityBankRWF || 0) + (item.bkBankRWF || 0))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow border">
                  <h3 className="text-xl font-semibold mb-4 text-red-700">Expense Transactions ({summary.expenses.length})</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {summary.expenses.map((item: any) => (
                      <div key={item.id} className="border-l-4 border-red-500 pl-3">
                        <p className="font-medium text-gray-900">{item.description}</p>
                        <p className="text-sm text-gray-600">{item.date} • {item.category}</p>
                        <p className="text-sm text-red-700 font-semibold">
                          {formatRWF((item.mtnMomoRWF || 0) + (item.equityBankRWF || 0) + (item.bkBankRWF || 0))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 