'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Employee, Payroll, PayrollSummary, PayrollStats } from '@/types/payroll';
import { FaTimes, FaSpinner, FaUserPlus, FaMoneyBillWave, FaCheckCircle, FaExclamationTriangle, FaEye, FaEdit, FaToggleOn, FaToggleOff, FaTrash } from 'react-icons/fa';

interface PayrollDashboardProps {
  user: any;
}

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

export default function PayrollDashboard({ user }: PayrollDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [payrollStats, setPayrollStats] = useState<PayrollStats | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [showViewEmployeeModal, setShowViewEmployeeModal] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  // Add Employee Modal State
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [newEmployeeData, setNewEmployeeData] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    position: '',
    department: '',
    employmentType: 'full-time',
    hireDate: new Date().toISOString().split('T')[0],
    salary: '',
    bankAccount: '',
    bankName: '',
    socialSecurityId: '',
    notes: ''
  });

  // Process Payroll Modal State
  const [showProcessPayrollModal, setShowProcessPayrollModal] = useState(false);
  const [processPayrollData, setProcessPayrollData] = useState({
    period: new Date().toISOString().slice(0, 7),
    workingDays: 22,
    notes: '',
    selectedEmployeeIds: [] as number[],
    selectAll: true
  });

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

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'x-username': user.username,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Error fetching users:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [user.username]);

  useEffect(() => {
    fetchPayrollData();
    fetchUsers();
  }, [fetchPayrollData, fetchUsers]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-RW') + ' RWF';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'employees', name: 'Employees', icon: '👥' },
    { id: 'payrolls', name: 'Payrolls', icon: '💰' },
    { id: 'reports', name: 'Reports', icon: '📈' },
  ];

  const handleAddEmployee = () => {
    // Auto-generate Employee ID
    const nextId = employees.length + 1;
    const generatedEmployeeId = `KTMEMP${String(nextId).padStart(3, '0')}`;

    setNewEmployeeData(prev => ({
      ...prev,
      employeeId: generatedEmployeeId
    }));
    setShowAddEmployeeModal(true);
  };

  const handleProcessPayroll = () => {
    // Initialize with current period and all active employees selected
    setProcessPayrollData({
      period: new Date().toISOString().slice(0, 7),
      workingDays: 22,
      notes: '',
      selectedEmployeeIds: employees.filter(e => e.status === 'active').map(e => e.id),
      selectAll: true
    });
    setShowProcessPayrollModal(true);
  };

  const handleGenerateReport = (reportType: 'monthly' | 'department' | 'employee') => {
    alert(`Generate ${reportType} payroll report for ${selectedPeriod}`);
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = { ...newEmployeeData };
      if (isNewUser) {
        delete (payload as any).userId;
      } else {
        delete (payload as any).firstName;
        delete (payload as any).lastName;
        delete (payload as any).email;
        delete (payload as any).phone;
        (payload as any).userId = parseInt(newEmployeeData.userId);
      }

      const response = await fetch('/api/payroll/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          salary: parseFloat(newEmployeeData.salary)
        })
      });

      if (response.ok) {
        setShowAddEmployeeModal(false);
        setIsNewUser(false);
        setNewEmployeeData({
          userId: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          employeeId: '',
          position: '',
          department: '',
          employmentType: 'full-time',
          hireDate: new Date().toISOString().split('T')[0],
          salary: '',
          bankAccount: '',
          bankName: '',
          socialSecurityId: '',
          notes: ''
        });
        fetchPayrollData(); // Refresh list
        alert('Employee added successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to add employee'}`);
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      alert('Failed to add employee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessPayrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const [year, month] = processPayrollData.period.split('-').map(Number);

      const response = await fetch('/api/payroll/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeIds: processPayrollData.selectedEmployeeIds,
          period: processPayrollData.period,
          year,
          month,
          workingDays: Number(processPayrollData.workingDays),
          notes: processPayrollData.notes
        })
      });

      if (response.ok) {
        const result = await response.json();
        setShowProcessPayrollModal(false);
        fetchPayrollData();

        if (result.errors && result.errors.length > 0) {
          alert(`Payroll processed with some errors:\n${result.errors.map((e: any) => `${e.employeeName}: ${e.error}`).join('\n')}`);
        } else {
          alert(`Successfully processed payroll for ${result.summary.processed} employees.`);
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to process payroll'}`);
      }
    } catch (error) {
      console.error('Error processing payroll:', error);
      alert('Failed to process payroll. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewEmployee = (employee: Employee) => {
    setViewingEmployee(employee);
    setShowViewEmployeeModal(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    alert('Edit functionality - navigate to Edit Employee page or open edit modal');
  };

  const handleToggleEmployeeStatus = async (employee: Employee) => {
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';

    try {
      const response = await fetch(`/api/payroll/employees?id=${employee.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-username': user.username,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchPayrollData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to update employee status'}`);
      }
    } catch (error) {
      console.error('Error updating employee status:', error);
      alert('Failed to update employee status. Please try again.');
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (!confirm(`Are you sure you want to delete ${employee.user?.fullName || employee.firstName + ' ' + employee.lastName}?`)) return;

    try {
      const response = await fetch(`/api/payroll/employees?id=${employee.id}`, {
        method: 'DELETE',
        headers: {
          'x-username': user.username,
        },
      });

      if (response.ok) {
        await fetchPayrollData();
        alert('Employee deleted successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to delete employee'}`);
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee. Please try again.');
    }
  };

  // Filter users who are not yet employees
  const availableUsers = users.filter(u => !employees.some(e => e.userId === u.id));

  // Active employees for payroll processing
  const activeEmployees = employees.filter(e => e.status === 'active');

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
                  {employees.length}
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
                <button
                  onClick={handleAddEmployee}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaUserPlus /> Add Employee
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
                              {employee.user?.fullName || employee.user?.username || `${employee.firstName} ${employee.lastName}`}
                            </div>
                            <div className="text-sm text-gray-500">{employee.user?.email || employee.email || employee.employeeId}</div>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewEmployee(employee)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleEditEmployee(employee)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleToggleEmployeeStatus(employee)}
                              className={`p-2 rounded-lg transition-colors ${employee.status === 'active'
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-gray-600 hover:bg-gray-50'
                                }`}
                              title={employee.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              {employee.status === 'active' ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
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
                <button
                  onClick={handleProcessPayroll}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaMoneyBillWave /> Process Payroll
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
                    {payrolls.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          No payroll records found for this period.
                        </td>
                      </tr>
                    ) : (
                      payrolls.map((payroll) => (
                        <tr key={payroll.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {payroll.employee.user?.fullName || payroll.employee.user?.username || `${payroll.employee.firstName} ${payroll.employee.lastName}`}
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
                      ))
                    )}
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

      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">Add New Employee</h3>
              <button
                onClick={() => setShowAddEmployeeModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-6 space-y-4">

              {/* User Selection Toggle */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">Link System User?</span>
                <button
                  type="button"
                  onClick={() => setIsNewUser(!isNewUser)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${!isNewUser ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${!isNewUser ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              {!isNewUser ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                  <select
                    required={!isNewUser}
                    value={newEmployeeData.userId}
                    onChange={(e) => setNewEmployeeData({ ...newEmployeeData, userId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="">Select a user...</option>
                    {availableUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.fullName || u.username} ({u.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Only users without employee records are shown.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      required={isNewUser}
                      value={newEmployeeData.firstName}
                      onChange={(e) => setNewEmployeeData({ ...newEmployeeData, firstName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      required={isNewUser}
                      value={newEmployeeData.lastName}
                      onChange={(e) => setNewEmployeeData({ ...newEmployeeData, lastName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required={isNewUser}
                      value={newEmployeeData.email}
                      onChange={(e) => setNewEmployeeData({ ...newEmployeeData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={newEmployeeData.phone}
                      onChange={(e) => setNewEmployeeData({ ...newEmployeeData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={newEmployeeData.employeeId}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed outline-none"
                    placeholder="KTMEMP001"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-generated</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    required
                    value={newEmployeeData.position}
                    onChange={(e) => setNewEmployeeData({ ...newEmployeeData, position: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="Position"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={newEmployeeData.department}
                    onChange={(e) => setNewEmployeeData({ ...newEmployeeData, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="Department"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <select
                    required
                    value={newEmployeeData.employmentType}
                    onChange={(e) => setNewEmployeeData({ ...newEmployeeData, employmentType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                  <input
                    type="date"
                    required
                    value={newEmployeeData.hireDate}
                    onChange={(e) => setNewEmployeeData({ ...newEmployeeData, hireDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary (RWF)</label>
                  <input
                    type="number"
                    required
                    value={newEmployeeData.salary}
                    onChange={(e) => setNewEmployeeData({ ...newEmployeeData, salary: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    value={newEmployeeData.bankName}
                    onChange={(e) => setNewEmployeeData({ ...newEmployeeData, bankName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="Bank of Kigali"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    value={newEmployeeData.bankAccount}
                    onChange={(e) => setNewEmployeeData({ ...newEmployeeData, bankAccount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="Account Number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Social Security ID (RSSB) <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    value={newEmployeeData.socialSecurityId}
                    onChange={(e) => setNewEmployeeData({ ...newEmployeeData, socialSecurityId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="RSSB Number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newEmployeeData.notes}
                  onChange={(e) => setNewEmployeeData({ ...newEmployeeData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-medium flex justify-center items-center gap-2"
                >
                  {isSubmitting && <FaSpinner className="animate-spin" />}
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Payroll Modal */}
      {showProcessPayrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Process Payroll</h3>
              <button
                onClick={() => setShowProcessPayrollModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleProcessPayrollSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Period</label>
                <input
                  type="month"
                  required
                  value={processPayrollData.period}
                  onChange={(e) => setProcessPayrollData({ ...processPayrollData, period: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Working Days</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="31"
                  value={processPayrollData.workingDays}
                  onChange={(e) => setProcessPayrollData({ ...processPayrollData, workingDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Select Employees</label>
                  <button
                    type="button"
                    onClick={() => {
                      const newSelectAll = !processPayrollData.selectAll;
                      setProcessPayrollData({
                        ...processPayrollData,
                        selectAll: newSelectAll,
                        selectedEmployeeIds: newSelectAll ? activeEmployees.map(e => e.id) : []
                      });
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {processPayrollData.selectAll ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1">
                  {activeEmployees.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No active employees found.</p>
                  ) : (
                    activeEmployees.map(employee => (
                      <label key={employee.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={processPayrollData.selectedEmployeeIds.includes(employee.id)}
                          onChange={(e) => {
                            const newSelected = e.target.checked
                              ? [...processPayrollData.selectedEmployeeIds, employee.id]
                              : processPayrollData.selectedEmployeeIds.filter(id => id !== employee.id);

                            setProcessPayrollData({
                              ...processPayrollData,
                              selectedEmployeeIds: newSelected,
                              selectAll: newSelected.length === activeEmployees.length
                            });
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {employee.user?.fullName || employee.user?.username || `${employee.firstName} ${employee.lastName}`}
                          <span className="text-xs text-gray-500 ml-1">({employee.position})</span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {processPayrollData.selectedEmployeeIds.length} employees
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={processPayrollData.notes}
                  onChange={(e) => setProcessPayrollData({ ...processPayrollData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Payroll notes..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowProcessPayrollModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || processPayrollData.selectedEmployeeIds.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-medium flex justify-center items-center gap-2"
                >
                  {isSubmitting && <FaSpinner className="animate-spin" />}
                  Process Payroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
