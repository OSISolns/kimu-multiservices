"use client"

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaMoneyBillWave, FaChartLine, FaCreditCard, FaReceipt, FaCalculator,
  FaFileInvoiceDollar, FaDollarSign, FaChartBar, FaCalendarAlt, FaUsers,
  FaCar, FaHotel, FaTaxi, FaPiggyBank, FaChartPie, FaBalanceScale,
  FaFileAlt, FaDownload, FaPrint, FaEye, FaEdit, FaTrash, FaPlus,
  FaMinus, FaPercentage, FaClock, FaExclamationTriangle, FaCheckCircle,
  FaTimesCircle, FaTable, FaSave, FaUndo, FaInfoCircle, FaCompress,
  FaExpand, FaTag, FaSync, FaTachometerAlt, FaArrowUp, FaArrowDown,
  FaFileExport, FaWallet
} from 'react-icons/fa';
import { useUser } from '../../UserContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import IncomeTracker from '@/components/accounting/IncomeTracker';
import ExpenseTracker from '@/components/accounting/ExpenseTracker';
import InvoiceManager from '@/components/accounting/InvoiceManager';
import BudgetTracker from '@/components/accounting/BudgetTracker';
import GeneralLedger from '@/components/accounting/GeneralLedger';
import PayrollDashboard from '@/components/payroll/PayrollDashboard';
import PettyCashManager from '@/components/accounting/PettyCashManager';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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
  bankOfAfricaRWF: number;
  accessBankRWF: number;
  copeduRWF: number;
  cashRWF: number;
  date: string;
  [key: string]: any;
};

type FinancialData = {
  openingBalances: { mtnMomoRWF: number; equityBankRWF: number; bkBankRWF: number; bankOfAfricaRWF: number; accessBankRWF: number; copeduRWF: number; cashRWF: number };
  closingBalances: { mtnMomoRWF: number; equityBankRWF: number; bkBankRWF: number; bankOfAfricaRWF: number; accessBankRWF: number; copeduRWF: number; cashRWF: number };
  income: FinancialRecord[];
  expenses: FinancialRecord[];
};

type PayrollEmployee = { id: number;[key: string]: any };
type PayrollData = { employees: PayrollEmployee[]; payrollHistory: any[] };

export default function UpgradedAccountantDashboard() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [financialData, setFinancialData] = useState<FinancialData>({
    openingBalances: { mtnMomoRWF: 0, equityBankRWF: 0, bkBankRWF: 0, bankOfAfricaRWF: 0, accessBankRWF: 0, copeduRWF: 0, cashRWF: 0 },
    closingBalances: { mtnMomoRWF: 0, equityBankRWF: 0, bkBankRWF: 0, bankOfAfricaRWF: 0, accessBankRWF: 0, copeduRWF: 0, cashRWF: 0 },
    income: [],
    expenses: []
  });
  const [payrollData, setPayrollData] = useState<PayrollData>({ employees: [], payrollHistory: [] });
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dateRange, setDateRange] = useState('month');
  const [refreshKey, setRefreshKey] = useState(0);

  // Ensure all data has the correct structure with all accounts
  const ensureDataStructure = (data: any): FinancialData => {
    return {
      ...data,
      closingBalances: data.closingBalances || { mtnMomoRWF: 0, equityBankRWF: 0, bkBankRWF: 0, bankOfAfricaRWF: 0, accessBankRWF: 0, copeduRWF: 0, cashRWF: 0 },
      income: data.income.map((item: any) => ({
        ...item,
        mtnMomoRWF: item.mtnMomoRWF ?? 0,
        equityBankRWF: item.equityBankRWF ?? 0,
        bkBankRWF: item.bkBankRWF ?? 0,
        bankOfAfricaRWF: item.bankOfAfricaRWF ?? 0,
        accessBankRWF: item.accessBankRWF ?? 0,
        copeduRWF: item.copeduRWF ?? 0,
        cashRWF: item.cashRWF ?? 0
      })),
      expenses: data.expenses.map((item: any) => ({
        ...item,
        mtnMomoRWF: item.mtnMomoRWF ?? 0,
        equityBankRWF: item.equityBankRWF ?? 0,
        bkBankRWF: item.bkBankRWF ?? 0,
        bankOfAfricaRWF: item.bankOfAfricaRWF ?? 0,
        accessBankRWF: item.accessBankRWF ?? 0,
        copeduRWF: item.copeduRWF ?? 0,
        cashRWF: item.cashRWF ?? 0
      }))
    } as FinancialData;
  };

  const fetchFinancialData = useCallback(async () => {
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
  }, [dateRange]);

  const fetchPayrollData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/staff/login');
    } else if (!isLoading && user && user.role !== 'accountant' && user.role !== 'admin') {
      router.push('/staff/sales-dashboard');
    } else if (!isLoading && user) {
      fetchFinancialData();
      fetchPayrollData();
    }
  }, [router, user, isLoading, fetchFinancialData, fetchPayrollData]);

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
    { id: 'pettycash', name: 'Petty Cash', icon: FaPiggyBank },
    { id: 'ledger', name: 'General Ledger', icon: FaBalanceScale },
    { id: 'payroll', name: 'Payroll', icon: FaUsers }
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  // Calculate totals
  const totalIncome = financialData.income.reduce((sum, item) =>
    sum + (item.mtnMomoRWF || 0) + (item.equityBankRWF || 0) + (item.bkBankRWF || 0) + (item.bankOfAfricaRWF || 0) + (item.accessBankRWF || 0) + (item.copeduRWF || 0) + (item.cashRWF || 0), 0);
  const totalExpenses = financialData.expenses.reduce((sum, item) =>
    sum + (item.mtnMomoRWF || 0) + (item.equityBankRWF || 0) + (item.bkBankRWF || 0) + (item.bankOfAfricaRWF || 0) + (item.accessBankRWF || 0) + (item.copeduRWF || 0) + (item.cashRWF || 0), 0);
  const netProfit = totalIncome - totalExpenses;

  // Chart Data Preparation
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#4B5563',
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            family: "'Inter', sans-serif",
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            family: "'Inter', sans-serif",
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#4B5563',
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      }
    }
  };

  // Helper to aggregate data by day of week
  const aggregateByDay = (data: FinancialRecord[]) => {
    const aggregated = new Array(7).fill(0);

    data.forEach(item => {
      const date = new Date(item.date);
      const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, ...
      const amount = (item.mtnMomoRWF || 0) + (item.equityBankRWF || 0) + (item.bkBankRWF || 0) + (item.bankOfAfricaRWF || 0) + (item.accessBankRWF || 0) + (item.copeduRWF || 0) + (item.cashRWF || 0);
      aggregated[dayIndex] += amount;
    });

    // Rotate to start from Monday as per labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    // Indices: 1, 2, 3, 4, 5, 6, 0
    return [
      aggregated[1],
      aggregated[2],
      aggregated[3],
      aggregated[4],
      aggregated[5],
      aggregated[6],
      aggregated[0]
    ];
  };

  const incomeData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Income',
        data: aggregateByDay(financialData.income),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const expenseData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Expenses',
        data: aggregateByDay(financialData.expenses),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
      },
    ],
  };

  const balanceDistributionData = {
    labels: ['MTN Momo', 'Equity Bank', 'BK Bank', 'Bank of Africa', 'Access Bank', 'COPEDU', 'Cash'],
    datasets: [
      {
        data: [
          financialData.closingBalances.mtnMomoRWF,
          financialData.closingBalances.equityBankRWF,
          financialData.closingBalances.bkBankRWF,
          financialData.closingBalances.bankOfAfricaRWF,
          financialData.closingBalances.accessBankRWF,
          financialData.closingBalances.copeduRWF,
          financialData.closingBalances.cashRWF
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 bg-[url('/subtle-prism.svg')] bg-cover bg-fixed">
      {/* Header with Glassmorphism */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
                <FaCalculator className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Accounting Dashboard</h1>
                <p className="text-xs text-gray-500 font-medium">Financial Overview & Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all cursor:pointer hover:bg-gray-50"
                >
                  <option value="all">All Time</option>
                  <option value="daily">Today</option>
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
                  <option value="yearly">This Year</option>
                </select>
                <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <button
                onClick={handleDataUpdate}
                className="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                title="Refresh Data"
              >
                <FaSync className={isDataLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <nav className="flex space-x-2 p-1 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm w-max mx-auto md:mx-0 md:w-full md:justify-start">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${isActive
                    ? 'bg-white text-blue-600 shadow-md shadow-blue-500/10 scale-100'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    } whitespace-nowrap py-2.5 px-4 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-200`}
                >
                  <Icon className={isActive ? "text-blue-500" : "text-gray-400"} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6 animate-fadeIn">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Income */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                      <FaDollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                      +12.5%
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatRWF(totalIncome)}</p>
                </div>

                {/* Total Expenses */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                      <FaReceipt className="h-6 w-6 text-red-600" />
                    </div>
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                      +5.2%
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatRWF(totalExpenses)}</p>
                </div>

                {/* Net Profit */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl transition-colors ${netProfit >= 0 ? 'bg-blue-100 group-hover:bg-blue-200' : 'bg-orange-100 group-hover:bg-orange-200'}`}>
                      <FaChartLine className={`h-6 w-6 ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg border ${netProfit >= 0 ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>
                      {netProfit >= 0 ? 'Healthy' : 'Attention'}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-500">Net Profit</h3>
                  <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                    {formatRWF(netProfit)}
                  </p>
                </div>

                {/* Transactions Count */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                      <FaTable className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">
                      Active
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {financialData.income.length + financialData.expenses.length}
                  </p>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Income Trend */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Income Overview</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View Report</button>
                  </div>
                  <div className="h-64">
                    <Line options={chartOptions} data={incomeData} />
                  </div>
                </div>

                {/* Balance Distribution */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Account Distribution</h3>
                  <div className="h-64 flex items-center justify-center">
                    <Doughnut options={doughnutOptions} data={balanceDistributionData} />
                  </div>
                </div>
              </div>

              {/* Account Balances & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Account Balances */}
                <div className="lg:col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg shadow-gray-900/20">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <FaWallet className="text-blue-400" /> Current Balances
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                      <div className="text-sm text-gray-300 mb-1">MTN Mobile Money</div>
                      <div className="text-xl font-bold tracking-wide">
                        {formatRWF(financialData.closingBalances?.mtnMomoRWF || 0)}
                      </div>
                    </div>
                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                      <div className="text-sm text-gray-300 mb-1">Equity Bank</div>
                      <div className="text-xl font-bold tracking-wide">
                        {formatRWF(financialData.closingBalances?.equityBankRWF || 0)}
                      </div>
                    </div>
                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                      <div className="text-sm text-gray-300 mb-1">BK Bank</div>
                      <div className="text-xl font-bold tracking-wide">
                        {formatRWF(financialData.closingBalances?.bkBankRWF || 0)}
                      </div>
                    </div>
                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                      <div className="text-sm text-gray-300 mb-1">Bank of Africa</div>
                      <div className="text-xl font-bold tracking-wide">
                        {formatRWF(financialData.closingBalances?.bankOfAfricaRWF || 0)}
                      </div>
                    </div>
                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                      <div className="text-sm text-gray-300 mb-1">Access Bank</div>
                      <div className="text-xl font-bold tracking-wide">
                        {formatRWF(financialData.closingBalances?.accessBankRWF || 0)}
                      </div>
                    </div>
                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                      <div className="text-sm text-gray-300 mb-1">COPEDU Bank</div>
                      <div className="text-xl font-bold tracking-wide">
                        {formatRWF(financialData.closingBalances?.copeduRWF || 0)}
                      </div>
                    </div>
                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                      <div className="text-sm text-gray-300 mb-1">Cash</div>
                      <div className="text-xl font-bold tracking-wide">
                        {formatRWF(financialData.closingBalances?.cashRWF || 0)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => setActiveTab('expenses')}
                      className="flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-transparent bg-white hover:border-orange-200 hover:bg-orange-50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
                        <FaMinus className="text-orange-600 text-xl" />
                      </div>
                      <span className="text-xs font-black text-gray-700 uppercase tracking-widest group-hover:text-orange-700">Record Expense</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('income')}
                      className="flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-transparent bg-white hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-sm">
                        <FaPlus className="text-emerald-600 text-xl" />
                      </div>
                      <span className="text-xs font-black text-gray-700 uppercase tracking-widest group-hover:text-emerald-700">Add Income</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('invoices')}
                      className="flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-transparent bg-white hover:border-blue-200 hover:bg-blue-50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
                        <FaFileInvoiceDollar className="text-blue-600 text-xl" />
                      </div>
                      <span className="text-xs font-black text-gray-700 uppercase tracking-widest group-hover:text-blue-700">New Invoice</span>
                    </button>

                  </div>
                </div>
              </div>

              {/* Recent Transactions Table */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {[...financialData.income.slice(0, 5), ...financialData.expenses.slice(0, 5)]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10)
                        .map((transaction) => {
                          const isIncome = financialData.income.includes(transaction);
                          const amount = (transaction.mtnMomoRWF || 0) + (transaction.equityBankRWF || 0) + (transaction.bkBankRWF || 0) + (transaction.bankOfAfricaRWF || 0) + (transaction.accessBankRWF || 0) + (transaction.copeduRWF || 0) + (transaction.cashRWF || 0);
                          return (
                            <tr key={`${isIncome ? 'income' : 'expense'}-${transaction.id}`} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                {new Date(transaction.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                {transaction.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isIncome ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                  {isIncome ? 'Income' : 'Expense'}
                                </span>
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${isIncome ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {isIncome ? '+' : '-'}{formatRWF(amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Completed
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'income' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
              <IncomeTracker onIncomeAdded={handleDataUpdate} />
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
              <ExpenseTracker onExpenseAdded={handleDataUpdate} />
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
              <InvoiceManager onInvoiceCreated={handleDataUpdate} />
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
              <BudgetTracker onBudgetUpdated={handleDataUpdate} />
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
              <GeneralLedger onDataExport={(data) => {
                console.log('Exporting data:', data);
              }} />
            </div>
          )}

          {activeTab === 'pettycash' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
              <PettyCashManager />
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
              <PayrollDashboard user={user} />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Financial Reports</h3>
                <a
                  href="/staff/financial-reports"
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                >
                  <FaFileAlt />
                  View All Reports
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <a
                  href="/staff/financial-reports?type=income-statement"
                  className="p-6 border border-gray-100 rounded-2xl bg-white hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <FaChartBar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="font-bold text-lg text-gray-900 mb-1">Income Statement</div>
                  <div className="text-sm text-gray-500">Revenue and expenses report</div>
                </a>
                <a
                  href="/staff/financial-reports?type=balance-sheet"
                  className="p-6 border border-gray-100 rounded-2xl bg-white hover:border-green-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                    <FaBalanceScale className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="font-bold text-lg text-gray-900 mb-1">Balance Sheet</div>
                  <div className="text-sm text-gray-500">Assets, liabilities, and equity</div>
                </a>
                <a
                  href="/staff/financial-reports?type=cash-flow"
                  className="p-6 border border-gray-100 rounded-2xl bg-white hover:border-orange-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                    <FaChartLine className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="font-bold text-lg text-gray-900 mb-1">Cash Flow</div>
                  <div className="text-sm text-gray-500">Cash inflows and outflows</div>
                </a>
                <a
                  href="/staff/financial-reports?type=expense-breakdown"
                  className="p-6 border border-gray-100 rounded-2xl bg-white hover:border-red-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                    <FaReceipt className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="font-bold text-lg text-gray-900 mb-1">Expense Report</div>
                  <div className="text-sm text-gray-500">Detailed expense breakdown</div>
                </a>
                <a
                  href="/staff/financial-reports?type=revenue-analysis"
                  className="p-6 border border-gray-100 rounded-2xl bg-white hover:border-yellow-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow-100 transition-colors">
                    <FaFileInvoiceDollar className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="font-bold text-lg text-gray-900 mb-1">Revenue Analysis</div>
                  <div className="text-sm text-gray-500">Revenue trends and analysis</div>
                </a>
                <a
                  href="/staff/financial-reports?type=summary"
                  className="p-6 border border-gray-100 rounded-2xl bg-white hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                    <FaChartPie className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="font-bold text-lg text-gray-900 mb-1">Financial Summary</div>
                  <div className="text-sm text-gray-500">Complete overview report</div>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}