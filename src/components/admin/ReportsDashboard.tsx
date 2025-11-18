'use client';

import React, { useState, useEffect } from 'react';
import { 
  FinancialReport, 
  OperationalReport, 
  CustomerReport, 
  EmployeeReport,
  Report,
  ReportStats 
} from '@/types/analytics';

interface ReportsDashboardProps {
  user: any;
}

export default function ReportsDashboard({ user }: ReportsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardData();
      fetchReports();
    }
  }, [user, selectedPeriod, dateRange]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        period: selectedPeriod,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
      });

      const response = await fetch(`/api/admin/analytics/dashboard?${params}`, {
        headers: {
          'x-username': user.username,
        },
      });

      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data.dashboard);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/admin/reports', {
        headers: {
          'x-username': user.username,
        },
      });

      const data = await response.json();
      if (data.success) {
        setReports(data.data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const generateReport = async (reportType: string, format: string = 'json') => {
    try {
      const response = await fetch('/api/admin/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-username': user.username,
        },
        body: JSON.stringify({
          reportType,
          period: selectedPeriod,
          dateFrom: dateRange.from,
          dateTo: dateRange.to,
          format,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Report generated successfully!');
        fetchReports();
      } else {
        alert(data.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'financial', name: 'Financial', icon: '💰' },
    { id: 'operational', name: 'Operational', icon: '🚀' },
    { id: 'customers', name: 'Customers', icon: '👥' },
    { id: 'employees', name: 'Employees', icon: '👨‍💼' },
    { id: 'reports', name: 'Reports', icon: '📋' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive business intelligence and reporting</p>
          </div>
          <div className="flex space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            {selectedPeriod === 'custom' && (
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <span className="text-green-600 text-lg">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Net Profit</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(dashboardData.financial.netProfit)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatPercentage(dashboardData.financial.profitMargin)} margin
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.operational.totalBookings}
                </p>
                <p className="text-sm text-gray-500">
                  {formatPercentage(dashboardData.operational.completionRate)} completion
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <span className="text-purple-600 text-lg">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">New Customers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.customer.newLeads}
                </p>
                <p className="text-sm text-gray-500">
                  {formatPercentage(dashboardData.customer.growthRate)} growth
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">👨‍💼</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Employees</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.employee.activeEmployees}
                </p>
                <p className="text-sm text-gray-500">
                  {formatPercentage(dashboardData.employee.activeRate)} active
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && dashboardData && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Business Overview</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Income by Category</h4>
                  <div className="space-y-2">
                    {dashboardData.financial.incomeByCategory.slice(0, 5).map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">{item.category.replace('_', ' ')}</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Bookings by Type</h4>
                  <div className="space-y-2">
                    {dashboardData.operational.bookingsByType.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{item.type}</span>
                        <span className="text-sm font-medium">
                          {item.count} ({formatPercentage(item.percentage)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Monthly Trend</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-medium text-gray-500">Month</th>
                        <th className="text-right py-2 text-sm font-medium text-gray-500">Income</th>
                        <th className="text-right py-2 text-sm font-medium text-gray-500">Expenses</th>
                        <th className="text-right py-2 text-sm font-medium text-gray-500">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.trends.monthly.slice(-6).map((month: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 text-sm text-gray-900">{month.month}</td>
                          <td className="py-2 text-sm text-gray-900 text-right">{formatCurrency(month.income)}</td>
                          <td className="py-2 text-sm text-gray-900 text-right">{formatCurrency(month.expenses)}</td>
                          <td className="py-2 text-sm text-gray-900 text-right">{formatCurrency(month.profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && dashboardData && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Financial Analytics</h3>
                <button
                  onClick={() => generateReport('financial')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Generate Report
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Total Income</div>
                  <div className="text-2xl font-bold text-green-700">
                    {formatCurrency(dashboardData.financial.totalIncome)}
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-600 font-medium">Total Expenses</div>
                  <div className="text-2xl font-bold text-red-700">
                    {formatCurrency(dashboardData.financial.totalExpenses)}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Profit Margin</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {formatPercentage(dashboardData.financial.profitMargin)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h4 className="font-medium text-gray-900 mb-4">Income by Category</h4>
                  <div className="space-y-3">
                    {dashboardData.financial.incomeByCategory.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {item.category.replace('_', ' ')}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.amount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatPercentage(item.percentage)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h4 className="font-medium text-gray-900 mb-4">Expenses by Category</h4>
                  <div className="space-y-3">
                    {dashboardData.financial.expensesByCategory.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {item.category.replace('_', ' ')}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-red-600 h-2 rounded-full" 
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.amount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatPercentage(item.percentage)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'operational' && dashboardData && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Operational Analytics</h3>
                <button
                  onClick={() => generateReport('operational')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Generate Report
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Total Bookings</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {dashboardData.operational.totalBookings}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Completed</div>
                  <div className="text-2xl font-bold text-green-700">
                    {dashboardData.operational.completedBookings}
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-600 font-medium">Cancelled</div>
                  <div className="text-2xl font-bold text-red-700">
                    {dashboardData.operational.cancelledBookings}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">Completion Rate</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {formatPercentage(dashboardData.operational.completionRate)}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="font-medium text-gray-900 mb-4">Bookings by Type</h4>
                <div className="space-y-3">
                  {dashboardData.operational.bookingsByType.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{item.type}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-sm font-medium text-gray-900">{item.count}</div>
                        <div className="text-xs text-gray-500">
                          {formatPercentage(item.percentage)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && dashboardData && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Customer Analytics</h3>
                <button
                  onClick={() => generateReport('customer')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Generate Report
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">Total Customers</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {dashboardData.customer.totalLeads}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">New Customers</div>
                  <div className="text-2xl font-bold text-green-700">
                    {dashboardData.customer.newLeads}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Growth Rate</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {formatPercentage(dashboardData.customer.growthRate)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'employees' && dashboardData && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Employee Analytics</h3>
                <button
                  onClick={() => generateReport('employee')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Generate Report
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600 font-medium">Total Employees</div>
                  <div className="text-2xl font-bold text-yellow-700">
                    {dashboardData.employee.totalEmployees}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Active Employees</div>
                  <div className="text-2xl font-bold text-green-700">
                    {dashboardData.employee.activeEmployees}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Active Rate</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {formatPercentage(dashboardData.employee.activeRate)}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">Total Payroll</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {formatCurrency(dashboardData.employee.totalPayroll)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Generated Reports</h3>
                <div className="space-x-2">
                  <button
                    onClick={() => generateReport('comprehensive', 'pdf')}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Generate PDF
                  </button>
                  <button
                    onClick={() => generateReport('comprehensive', 'excel')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Generate Excel
                  </button>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Generated By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{report.name}</div>
                          <div className="text-sm text-gray-500">{report.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {report.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            report.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : report.status === 'running'
                              ? 'bg-blue-100 text-blue-800'
                              : report.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.user.fullName || report.user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(report.createdAt).toLocaleDateString()}
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
    </div>
  );
}
