"use client"

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaMoneyBillWave, FaChartLine, FaCreditCard, FaReceipt, FaCalculator, FaFileInvoiceDollar, FaDollarSign, FaChartBar, FaCalendarAlt, FaUsers, FaCar, FaHotel, FaTaxi, FaPiggyBank, FaChartPie, FaBalanceScale, FaFileAlt, FaDownload, FaPrint, FaEye, FaEdit, FaTrash, FaPlus, FaMinus, FaPercentage, FaClock, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaTable, FaSave, FaUndo, FaInfoCircle, FaCompress, FaExpand, FaTag, FaSync, FaTachometerAlt, FaArrowUp, FaArrowDown, FaFileExport } from 'react-icons/fa';
import { useUser } from '../../UserContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import IncomeTracker from '@/components/accounting/IncomeTracker';
import ExpenseTracker from '@/components/accounting/ExpenseTracker';
import InvoiceManager from '@/components/accounting/InvoiceManager';
import BudgetTracker from '@/components/accounting/BudgetTracker';
import GeneralLedger from '@/components/accounting/GeneralLedger';
import PayrollDashboard from '@/components/payroll/PayrollDashboard';

function formatRWF(num: number | undefined | null) {
  if (num === undefined || num === null || isNaN(num)) {
    return '0 RWF';
  }
  return num.toLocaleString('en-US') + ' RWF';
}

function calculatePercentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

// Types
type FinancialRecord = {
  id: number;
  description: string;
  mtnMomoRWF: number;
  equityBankRWF: number;
  bkBankRWF: number;
  date: string;
  [key: string]: any;
};

type FinancialData = {
  openingBalances: { mtnMomoRWF: number; equityBankRWF: number; bkBankRWF: number };
  income: FinancialRecord[];
  expenses: FinancialRecord[];
};

type PayrollEmployee = { id: number; [key: string]: any };
type PayrollData = { employees: PayrollEmployee[]; payrollHistory: any[] };

export default function UpgradedAccountantDashboard() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [financialData, setFinancialData] = useState<FinancialData>({
    openingBalances: { mtnMomoRWF: 0, equityBankRWF: 0, bkBankRWF: 0 },
    income: [],
    expenses: []
  });
  const [payrollData, setPayrollData] = useState<PayrollData>({ employees: [], payrollHistory: [] });
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dateRange, setDateRange] = useState('month');
  const [refreshKey, setRefreshKey] = useState(0);

  // Ensure all data has the correct structure with both bank accounts
  const ensureDataStructure = (data: any): FinancialData => {
    return {
      ...data,
      income: data.income.map((item: any) => ({
        ...item,
        mtnMomoRWF: item.mtnMomoRWF ?? item.cashRWF ?? 0,
        equityBankRWF: item.equityBankRWF ?? item.bankRWF ?? 0,
        bkBankRWF: item.bkBankRWF ?? 0
      })),
      expenses: data.expenses.map((item: any) => ({
        ...item,
        mtnMomoRWF: item.mtnMomoRWF ?? item.cashRWF ?? 0,
        equityBankRWF: item.equityBankRWF ?? item.bankRWF ?? 0,
        bkBankRWF: item.bkBankRWF ?? 0
      }))
    } as FinancialData;
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/staff/login');
    } else if (!isLoading && user && user.role !== 'accountant' && user.role !== 'admin') {
      router.push('/staff/dashboard');
    } else if (!isLoading && user) {
      fetchFinancialData();
      fetchPayrollData();
    }
  }, [router, user, isLoading, dateRange]);

  const fetchFinancialData = async () => {
    setIsDataLoading(true);
    try {
      const response = await fetch(`/api/financial-summary?period=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setFinancialData(ensureDataStructure(data));
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const fetchPayrollData = async () => {
    try {
      const [employeesResponse, payrollResponse] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/payroll')
      ]);
      
      if (employeesResponse.ok && payrollResponse.ok) {
        const employeesData = await employeesResponse.json();
        const payrollData = await payrollResponse.json();
        
        // Extract the actual arrays from the API responses
        const employees = employeesData.success ? employeesData.employees : [];
        const payrollHistory = payrollData.success ? payrollData.payroll : [];
        
        setPayrollData({ employees, payrollHistory });
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      // Set empty data on error to prevent crashes
      setPayrollData({ employees: [], payrollHistory: [] });
    }
  };

  const handleDataUpdate = () => {
    setRefreshKey(prev => prev + 1);
    fetchFinancialData();
    fetchPayrollData();
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FaTachometerAlt },
    { id: 'income', name: 'Income', icon: FaMoneyBillWave },
    { id: 'expenses', name: 'Expenses', icon: FaReceipt },
    { id: 'invoices', name: 'Invoices', icon: FaFileInvoiceDollar },
    { id: 'budget', name: 'Budget', icon: FaChartPie },
    { id: 'ledger', name: 'General Ledger', icon: FaBalanceScale },
    { id: 'payroll', name: 'Payroll', icon: FaUsers },
    { id: 'reports', name: 'Reports', icon: FaChartBar }
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  // Calculate totals
  const totalIncome = financialData.income.reduce((sum, item) => 
    sum + item.mtnMomoRWF + item.equityBankRWF + item.bkBankRWF, 0);
  const totalExpenses = financialData.expenses.reduce((sum, item) => 
    sum + item.mtnMomoRWF + item.equityBankRWF + item.bkBankRWF, 0);
  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Accounting Dashboard</h1>
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
                            {formatRWF(totalIncome)}
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
                            {formatRWF(totalExpenses)}
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
                            netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatRWF(netProfit)}
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
                            {financialData.income.length + financialData.expenses.length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Balances */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Account Balances
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-600 font-medium">MTN Momo</div>
                      <div className="text-2xl font-bold text-blue-700">
                        {formatRWF(financialData.openingBalances?.mtnMomoRWF || 0)}
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600 font-medium">Equity Bank</div>
                      <div className="text-2xl font-bold text-green-700">
                        {formatRWF(financialData.openingBalances?.equityBankRWF || 0)}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm text-purple-600 font-medium">BK Bank</div>
                      <div className="text-2xl font-bold text-purple-700">
                        {formatRWF(financialData.openingBalances?.bkBankRWF || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
                      className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
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
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Recent Transactions
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[...financialData.income.slice(0, 5), ...financialData.expenses.slice(0, 5)]
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .slice(0, 10)
                          .map((transaction, index) => {
                            const isIncome = financialData.income.includes(transaction);
                            const amount = transaction.mtnMomoRWF + transaction.equityBankRWF + transaction.bkBankRWF;
                            return (
                              <tr key={`${isIncome ? 'income' : 'expense'}-${transaction.id}`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(transaction.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {transaction.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    isIncome ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {isIncome ? 'Income' : 'Expense'}
                                  </span>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                  isIncome ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {isIncome ? '+' : '-'}{formatRWF(amount)}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
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
              console.log('Exporting data:', data);
            }} />
          )}

          {activeTab === 'payroll' && (
            <PayrollDashboard user={user} />
          )}

          {activeTab === 'reports' && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Financial Reports</h3>
                <a
                  href="/staff/financial-reports"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaFileAlt />
                  View All Reports
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <a
                  href="/staff/financial-reports?type=income-statement"
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <FaChartBar className="h-6 w-6 text-blue-500 mb-2" />
                  <div className="font-medium">Income Statement</div>
                  <div className="text-sm text-gray-500">Revenue and expenses report</div>
                </a>
                <a
                  href="/staff/financial-reports?type=balance-sheet"
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <FaBalanceScale className="h-6 w-6 text-green-500 mb-2" />
                  <div className="font-medium">Balance Sheet</div>
                  <div className="text-sm text-gray-500">Assets, liabilities, and equity</div>
                </a>
                <a
                  href="/staff/financial-reports?type=cash-flow"
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <FaChartLine className="h-6 w-6 text-purple-500 mb-2" />
                  <div className="font-medium">Cash Flow</div>
                  <div className="text-sm text-gray-500">Cash inflows and outflows</div>
                </a>
                <a
                  href="/staff/financial-reports?type=expense-breakdown"
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <FaReceipt className="h-6 w-6 text-red-500 mb-2" />
                  <div className="font-medium">Expense Report</div>
                  <div className="text-sm text-gray-500">Detailed expense breakdown</div>
                </a>
                <a
                  href="/staff/financial-reports?type=revenue-analysis"
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <FaFileInvoiceDollar className="h-6 w-6 text-yellow-500 mb-2" />
                  <div className="font-medium">Revenue Analysis</div>
                  <div className="text-sm text-gray-500">Revenue trends and analysis</div>
                </a>
                <a
                  href="/staff/financial-reports?type=summary"
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <FaChartPie className="h-6 w-6 text-indigo-500 mb-2" />
                  <div className="font-medium">Financial Summary</div>
                  <div className="text-sm text-gray-500">Complete overview report</div>
                </a>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/staff/reports"
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                  >
                    <FaReceipt />
                    All Reports
                  </a>
                  <a
                    href="/staff/financial-reports"
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 flex items-center gap-2"
                  >
                    <FaFileExport />
                    Generate Report
                  </a>
                  <a
                    href="/staff/enhanced-accountant-dashboard"
                    className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 flex items-center gap-2"
                  >
                    <FaChartBar />
                    Enhanced Dashboard
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}