"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaMoneyBillWave, FaChartLine, FaCreditCard, FaReceipt, FaCalculator, FaFileInvoiceDollar, FaDollarSign, FaChartBar, FaCalendarAlt, FaUsers, FaCar, FaHotel, FaTaxi, FaPiggyBank, FaChartPie, FaBalanceScale, FaFileAlt, FaDownload, FaPrint, FaEye, FaEdit, FaTrash, FaPlus, FaMinus, FaPercentage, FaClock, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaTable, FaSave, FaUndo, FaInfoCircle, FaCompress, FaExpand, FaTag, FaSync, FaTachometerAlt } from 'react-icons/fa';
import { useUser } from '../../UserContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import ExpenseTracker from '@/components/accounting/ExpenseTracker';
import IncomeTracker from '@/components/accounting/IncomeTracker';
import InvoiceManager from '@/components/accounting/InvoiceManager';
import BudgetTracker from '@/components/accounting/BudgetTracker';
import GeneralLedger from '@/components/accounting/GeneralLedger';

function formatRWF(num: number | undefined | null) {
  if (num === undefined || num === null || isNaN(num)) {
    return '0 RWF';
  }
  return num.toLocaleString('en-US') + ' RWF';
}

export default function EnhancedAccountantDashboard() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [financialData, setFinancialData] = useState<any>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dateRange, setDateRange] = useState('month');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/staff/login');
    } else if (!isLoading && user && user.role !== 'accountant' && user.role !== 'admin') {
      router.push('/staff/dashboard');
    } else if (!isLoading && user) {
      fetchFinancialData();
    }
  }, [router, user, isLoading, dateRange]);

  const fetchFinancialData = async () => {
    setIsDataLoading(true);
    try {
      const response = await fetch(`/api/financial-summary?period=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setFinancialData(data);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleDataUpdate = () => {
    setRefreshKey(prev => prev + 1);
    fetchFinancialData();
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FaTachometerAlt },
    { id: 'income', name: 'Income', icon: FaMoneyBillWave },
    { id: 'expenses', name: 'Expenses', icon: FaReceipt },
    { id: 'invoices', name: 'Invoices', icon: FaFileInvoiceDollar },
    { id: 'budget', name: 'Budget', icon: FaChartPie },
    { id: 'ledger', name: 'General Ledger', icon: FaBalanceScale },
    { id: 'reports', name: 'Reports', icon: FaChartBar }
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enhanced Accounting Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Comprehensive financial management and accounting tools
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Time</option>
                <option value="daily">Today</option>
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
                <option value="yearly">This Year</option>
              </select>
              <button
                onClick={handleDataUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <FaSync /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <Icon />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FaDollarSign className="h-6 w-6 text-green-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Income
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {financialData ? formatRWF(financialData.totalIncome) : 'Loading...'}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FaReceipt className="h-6 w-6 text-red-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Expenses
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {financialData ? formatRWF(financialData.totalExpenses) : 'Loading...'}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FaChartLine className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Net Profit
                          </dt>
                          <dd className={`text-lg font-medium ${
                            financialData && financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {financialData ? formatRWF(financialData.netProfit) : 'Loading...'}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FaTable className="h-6 w-6 text-purple-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Transactions
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {financialData ? financialData.transactionCount : 'Loading...'}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Balances */}
              {financialData && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Account Balances
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-600 font-medium">MTN Momo</div>
                        <div className="text-2xl font-bold text-blue-700">
                          {formatRWF(financialData.closingBalances?.mtnMomoRWF || 0)}
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-green-600 font-medium">Equity Bank</div>
                        <div className="text-2xl font-bold text-green-700">
                          {formatRWF(financialData.closingBalances?.equityBankRWF || 0)}
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-purple-600 font-medium">BK Bank</div>
                        <div className="text-2xl font-bold text-purple-700">
                          {formatRWF(financialData.closingBalances?.bkBankRWF || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      onClick={() => setActiveTab('income')}
                      className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                    >
                      <FaMoneyBillWave className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">Add Income</div>
                      <div className="text-xs text-gray-500">Record new income</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('expenses')}
                      className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                    >
                      <FaReceipt className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">Add Expense</div>
                      <div className="text-xs text-gray-500">Record new expense</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('invoices')}
                      className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                    >
                      <FaFileInvoiceDollar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">Create Invoice</div>
                      <div className="text-xs text-gray-500">Generate new invoice</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('budget')}
                      className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                    >
                      <FaChartPie className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">Set Budget</div>
                      <div className="text-xs text-gray-500">Create budget plan</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('ledger')}
                      className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
                    >
                      <FaBalanceScale className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">View Ledger</div>
                      <div className="text-xs text-gray-500">Check transactions</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'income' && (
            <IncomeTracker onIncomeAdded={handleDataUpdate} />
          )}

          {activeTab === 'expenses' && (
            <ExpenseTracker onExpenseAdded={handleDataUpdate} />
          )}

          {activeTab === 'invoices' && (
            <InvoiceManager onInvoiceCreated={handleDataUpdate} />
          )}

          {activeTab === 'budget' && (
            <BudgetTracker onBudgetUpdated={handleDataUpdate} />
          )}

          {activeTab === 'ledger' && (
            <GeneralLedger onDataExport={(data) => {
              // Handle data export
              console.log('Exporting data:', data);
            }} />
          )}

          {activeTab === 'reports' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                  <FaChartBar className="h-6 w-6 text-blue-500 mb-2" />
                  <div className="font-medium">Income Statement</div>
                  <div className="text-sm text-gray-500">Revenue and expenses report</div>
                </button>
                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                  <FaBalanceScale className="h-6 w-6 text-green-500 mb-2" />
                  <div className="font-medium">Balance Sheet</div>
                  <div className="text-sm text-gray-500">Assets, liabilities, and equity</div>
                </button>
                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                  <FaChartLine className="h-6 w-6 text-purple-500 mb-2" />
                  <div className="font-medium">Cash Flow</div>
                  <div className="text-sm text-gray-500">Cash inflows and outflows</div>
                </button>
                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                  <FaReceipt className="h-6 w-6 text-red-500 mb-2" />
                  <div className="font-medium">Expense Report</div>
                  <div className="text-sm text-gray-500">Detailed expense breakdown</div>
                </button>
                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                  <FaFileInvoiceDollar className="h-6 w-6 text-yellow-500 mb-2" />
                  <div className="font-medium">Invoice Report</div>
                  <div className="text-sm text-gray-500">Outstanding and paid invoices</div>
                </button>
                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                  <FaChartPie className="h-6 w-6 text-indigo-500 mb-2" />
                  <div className="font-medium">Budget Report</div>
                  <div className="text-sm text-gray-500">Budget vs actual analysis</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
