'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Employee, Payroll, PayrollSummary, PayrollStats } from '@/types/payroll';

interface PayrollDashboardProps {
  user: any;
}

export default function PayrollDashboard({ user }: PayrollDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [payrollStats, setPayrollStats] = useState<PayrollStats | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const fetchPayrollData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statsRes, employeesRes, payrollsRes] = await Promise.all([
        fetch(`/api/payroll/reports?type=stats&period=${selectedPeriod}`),
        fetch('/api/payroll/employees'),
        fetch(`/api/payroll?period=${selectedPeriod}`),
      ]);

      const [statsData, employeesData, payrollsData] = await Promise.all([
        statsRes.json(),
        employeesRes.json(),
        payrollsRes.json(),
      ]);

      if (statsData.success) setPayrollStats(statsData.data);
      if (employeesData.success) setEmployees(employeesData.employees);
      if (payrollsData.success) setPayrolls(payrollsData.payrolls);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchPayrollData();
  }, [fetchPayrollData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
    }).format(amount);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'employees', name: 'Employees', icon: '👥' },
    { id: 'payrolls', name: 'Payrolls', icon: '💰' },
    { id: 'reports', name: 'Reports', icon: '📈' },
  ];

  const handleAddEmployee = () => {
    setActiveTab('employees');
  };

  const handleProcessPayroll = () => {
    setActiveTab('payrolls');
  };

  const handleGenerateReport = (reportType: 'monthly' | 'department' | 'employee') => {

    alert(`Generate ${reportType} payroll report for ${selectedPeriod}`);
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
            <p className="text-gray-600">Manage employee payroll and salary structures</p>
          </div>
          <div className="flex space-x-4">
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={fetchPayrollData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {payrollStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <span className="text-blue-600 text-lg">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {payrollStats.totalStats.totalPayrolls}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <span className="text-green-600 text-lg">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Payroll</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(payrollStats.totalStats.totalNetSalary)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Salary</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(payrollStats.totalStats.averageNetSalary)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <span className="text-purple-600 text-lg">📈</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Payrolls</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {payrolls.filter(p => p.status === 'processed').length}
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Payroll Overview</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Department Breakdown</h4>
                  <div className="space-y-2">
                    {payrollStats?.departmentBreakdown.map((dept, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{dept.department}</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(dept.totalSalary)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Monthly Trend</h4>
                  <div className="space-y-2">
                    {payrollStats?.monthlyTrend.slice(-6).map((month, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{month.month}</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(month.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Employees</h3>
                <button onClick={handleAddEmployee} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Employee
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Salary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr key={employee.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {employee.user.fullName || employee.user.username}
                            </div>
                            <div className="text-sm text-gray-500">{employee.employeeId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(employee.salary)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${employee.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : employee.status === 'inactive'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {employee.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payrolls' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Payrolls</h3>
                <button onClick={handleProcessPayroll} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Process Payroll
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gross Salary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Salary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payrolls.map((payroll) => (
                      <tr key={payroll.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payroll.employee.user.fullName || payroll.employee.user.username}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payroll.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(payroll.grossSalary)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(payroll.netSalary)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${payroll.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : payroll.status === 'processed'
                                ? 'bg-blue-100 text-blue-800'
                                : payroll.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                            {payroll.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Payroll Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-medium text-blue-900 mb-2">Monthly Report</h4>
                  <p className="text-sm text-blue-700 mb-4">
                    Generate detailed monthly payroll reports
                  </p>
                  <button onClick={() => handleGenerateReport('monthly')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Generate
                  </button>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="font-medium text-green-900 mb-2">Department Report</h4>
                  <p className="text-sm text-green-700 mb-4">
                    Analyze payroll by department
                  </p>
                  <button onClick={() => handleGenerateReport('department')} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    Generate
                  </button>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="font-medium text-purple-900 mb-2">Employee Report</h4>
                  <p className="text-sm text-purple-700 mb-4">
                    Individual employee payroll history
                  </p>
                  <button onClick={() => handleGenerateReport('employee')} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                    Generate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

