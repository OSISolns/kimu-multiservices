'use client';

import React, { useState, useEffect } from 'react';
import { PayrollStats, Payroll } from '@/types/payroll';

interface PayrollReportsProps {
  user: any;
}

export default function PayrollReports({ user }: PayrollReportsProps) {
  const [activeReport, setActiveReport] = useState('summary');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const reportTypes = [
    { id: 'summary', name: 'Summary Report', description: 'Overall payroll summary' },
    { id: 'monthly', name: 'Monthly Report', description: 'Monthly payroll trends' },
    { id: 'department', name: 'Department Report', description: 'Payroll by department' },
    { id: 'employee', name: 'Employee Report', description: 'Individual employee details' },
    { id: 'stats', name: 'Statistics', description: 'Payroll statistics and analytics' },
  ];

  const departments = [
    'Administration',
    'Finance',
    'Operations',
    'Sales',
    'Customer Service',
    'IT',
    'HR',
  ];

  const generateReport = async (reportType: string) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        type: reportType,
        period: selectedPeriod,
        year: selectedYear.toString(),
      });
      
      if (selectedDepartment) {
        params.append('department', selectedDepartment);
      }

      const response = await fetch(`/api/payroll/reports?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setReportData(data.data);
      } else {
        alert(data.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
    }).format(amount);
  };

  const renderSummaryReport = () => {
    if (!reportData) return null;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Payrolls</div>
            <div className="text-2xl font-bold text-blue-700">
              {reportData.summary.totalPayrolls}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Total Gross Salary</div>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(reportData.summary.totalGrossSalary)}
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 font-medium">Total Net Salary</div>
            <div className="text-2xl font-bold text-yellow-700">
              {formatCurrency(reportData.summary.totalNetSalary)}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Average Salary</div>
            <div className="text-2xl font-bold text-purple-700">
              {formatCurrency(reportData.summary.averageNetSalary)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-medium text-gray-900 mb-4">Department Breakdown</h4>
            <div className="space-y-2">
              {reportData.departmentBreakdown.map((dept: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{dept.department}</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(dept.totalNetSalary)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-medium text-gray-900 mb-4">Recent Payrolls</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {reportData.payrolls.slice(0, 10).map((payroll: any) => (
                <div key={payroll.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {payroll.employee.user.fullName || payroll.employee.user.username}
                    </div>
                    <div className="text-xs text-gray-500">{payroll.period}</div>
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(payroll.netSalary)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMonthlyReport = () => {
    if (!reportData) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-medium text-gray-900 mb-4">Monthly Payroll Trends</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payrolls
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Salary
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.monthlyData.map((month: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {month.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {month.totalPayrolls}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(month.totalGrossSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(month.totalNetSalary)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderDepartmentReport = () => {
    if (!reportData) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-medium text-gray-900 mb-4">Department Analysis</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payrolls
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Gross
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Net
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Gross
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Net
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.departmentData.map((dept: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.totalPayrolls}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(dept.totalGrossSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(dept.totalNetSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(dept.averageGrossSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(dept.averageNetSalary)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderEmployeeReport = () => {
    if (!reportData) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-medium text-gray-900 mb-4">Employee Payroll Details</h4>
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
                {reportData.employeeData.map((payroll: any) => (
                  <tr key={payroll.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payroll.employee.user.fullName || payroll.employee.user.username}
                        </div>
                        <div className="text-sm text-gray-500">{payroll.employee.position}</div>
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payroll.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : payroll.status === 'processed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
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
      </div>
    );
  };

  const renderStatsReport = () => {
    if (!reportData) return null;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Payrolls</div>
            <div className="text-2xl font-bold text-blue-700">
              {reportData.totalStats.totalPayrolls}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Total Gross</div>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(reportData.totalStats.totalGrossSalary)}
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 font-medium">Total Net</div>
            <div className="text-2xl font-bold text-yellow-700">
              {formatCurrency(reportData.totalStats.totalNetSalary)}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Average Net</div>
            <div className="text-2xl font-bold text-purple-700">
              {formatCurrency(reportData.totalStats.averageNetSalary)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-medium text-gray-900 mb-4">Monthly Trend</h4>
            <div className="space-y-2">
              {reportData.monthlyTrend.slice(-12).map((month: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{month.month}</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(month.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-medium text-gray-900 mb-4">Department Breakdown</h4>
            <div className="space-y-2">
              {reportData.departmentBreakdown.map((dept: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{dept.department}</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(dept.totalSalary)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payroll Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={activeReport}
              onChange={(e) => setActiveReport(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period
            </label>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department (Optional)
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {reportTypes.find(t => t.id === activeReport)?.description}
          </div>
          <div className="space-x-3">
            <button
              onClick={() => generateReport(activeReport)}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Generate Report'}
            </button>
            {reportData && (
              <button
                onClick={() => {
                  const data = reportData[`${activeReport}Data`] || reportData.payrolls || [];
                  exportToCSV(data, `${activeReport}-report-${selectedPeriod}`);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Report Content */}
      {reportData && (
        <div className="bg-white shadow rounded-lg p-6">
          {activeReport === 'summary' && renderSummaryReport()}
          {activeReport === 'monthly' && renderMonthlyReport()}
          {activeReport === 'department' && renderDepartmentReport()}
          {activeReport === 'employee' && renderEmployeeReport()}
          {activeReport === 'stats' && renderStatsReport()}
        </div>
      )}
    </div>
  );
}

