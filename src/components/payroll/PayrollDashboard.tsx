'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Employee, Payroll, PayrollSummary, PayrollStats } from '@/types/payroll';
import { FaTimes, FaSpinner, FaUserPlus, FaMoneyBillWave, FaCheckCircle, FaExclamationTriangle, FaEye, FaEdit, FaToggleOn, FaToggleOff, FaTrash, FaDownload } from 'react-icons/fa';

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
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
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

  const resetEmployeeForm = () => {
    setEditingEmployee(null);
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

      const url = editingEmployee
        ? `/api/payroll/employees?id=${editingEmployee.id}`
        : '/api/payroll/employees';
      const method = editingEmployee ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-username': user.username,
          'x-user-email': user.email || '',
          'x-user-id': user.id?.toString() || '',
        },
        body: JSON.stringify({
          ...payload,
          salary: parseFloat(newEmployeeData.salary)
        })
      });

      if (response.ok) {
        setShowAddEmployeeModal(false);
        resetEmployeeForm();
        fetchPayrollData(); // Refresh list
        alert(editingEmployee ? 'Employee updated successfully!' : 'Employee added successfully!');
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
    setEditingEmployee(employee);

    // Determine if this employee is linked to a user or standalone
    const hasUser = !!employee.userId;
    setIsNewUser(!hasUser);

    // Populate the form with employee data
    setNewEmployeeData({
      userId: employee.userId?.toString() || '',
      firstName: employee.firstName || (hasUser ? '' : ''),
      lastName: employee.lastName || (hasUser ? '' : ''),
      email: employee.email || employee.user?.email || '',
      phone: employee.phone || employee.user?.phone || '',
      employeeId: employee.employeeId,
      position: employee.position,
      department: employee.department,
      employmentType: employee.employmentType,
      hireDate: new Date(employee.hireDate).toISOString().split('T')[0],
      salary: employee.salary.toString(),
      bankAccount: employee.bankAccount || '',
      bankName: employee.bankName || '',
      socialSecurityId: employee.socialSecurityId || '',
      notes: employee.notes || ''
    });

    setShowAddEmployeeModal(true);
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
          'x-user-email': user.email || '',
          'x-user-id': user.id?.toString() || '',
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

  // When editing, include the employee's current user in the list (if they have one)
  const usersForDropdown = editingEmployee && editingEmployee.user
    ? [...availableUsers, editingEmployee.user]
    : availableUsers;

  // Active employees for payroll processing
  const activeEmployees = employees.filter(e => e.status === 'active');

  const handleExcelExport = async () => {
    const { exportToExcel } = await import('@/utils/excelExport');
    
    const columns = [
      { header: 'Period', key: 'period', type: 'text' as const },
      { header: 'Employee Name', key: 'employeeName', type: 'text' as const },
      { header: 'Department', key: 'department', type: 'text' as const },
      { header: 'Position', key: 'position', type: 'text' as const },
      { header: 'Basic Salary (RWF)', key: 'basicSalary', type: 'number' as const, numFormat: '#,##0" RWF"' },
      { header: 'Gross Salary (RWF)', key: 'grossSalary', type: 'number' as const, numFormat: '#,##0" RWF"' },
      { header: 'Total Deductions (RWF)', key: 'totalDeductions', type: 'number' as const, numFormat: '#,##0" RWF"' },
      { header: 'Net Salary (RWF)', key: 'netSalary', type: 'number' as const, numFormat: '#,##0" RWF"' },
      { header: 'Status', key: 'status', type: 'text' as const }
    ];

    const data = payrolls.map(item => ({
      ...item,
      employeeName: item.employee.user?.fullName || item.employee.user?.username || `${item.employee.firstName} ${item.employee.lastName}`,
      department: item.employee.department,
      position: item.employee.position,
      status: item.status.toUpperCase()
    }));

    await exportToExcel({
      filename: `Payroll_Report_${selectedPeriod}`,
      sheetName: 'Payrolls',
      title: 'Payroll Report',
      subtitle: `Period: ${selectedPeriod} | Total Employees: ${payrolls.length}`,
      columns,
      data,
      summaryRow: {
        position: 'Total',
        basicSalary: { formula: '=SUM(E{start}:E{end})' },
        grossSalary: { formula: '=SUM(F{start}:F{end})' },
        totalDeductions: { formula: '=SUM(G{start}:G{end})' },
        netSalary: { formula: '=SUM(H{start}:H{end})' }
      }
    });
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExcelExport}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                  >
                    <FaDownload /> Export Excel
                  </button>
                  <button
                    onClick={handleProcessPayroll}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FaMoneyBillWave /> Process Payroll
                  </button>
                </div>
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
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-12 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 my-8">
            {/* Header with Gradient */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FaUserPlus className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                    </h3>
                    <p className="text-sm text-blue-100 mt-0.5">
                      {editingEmployee ? 'Update employee information' : 'Register a new member to the payroll'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-6 space-y-6">
              {/* User Selection Section */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-blue-900 uppercase tracking-wider">System Integration</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-blue-800">Link System User?</span>
                    <button
                      type="button"
                      onClick={() => setIsNewUser(!isNewUser)}
                      disabled={!!editingEmployee}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${!isNewUser ? 'bg-blue-600' : 'bg-gray-200'
                        } ${editingEmployee ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${!isNewUser ? 'translate-x-5' : 'translate-x-0'
                          }`}
                      />
                    </button>
                  </div>
                </div>

                {!isNewUser ? (
                  <div className="animate-fadeIn">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select User Account</label>
                    <select
                      required={!isNewUser}
                      value={newEmployeeData.userId}
                      onChange={(e) => setNewEmployeeData({ ...newEmployeeData, userId: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-blue-200 shadow-sm"
                    >
                      <option value="">Select a user account...</option>
                      {usersForDropdown.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.fullName || u.username} ({u.email})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                      <FaExclamationTriangle className="text-[10px]" />
                      Only users without existing employee records are listed.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        required={isNewUser}
                        value={newEmployeeData.firstName}
                        onChange={(e) => setNewEmployeeData({ ...newEmployeeData, firstName: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-blue-200 shadow-sm"
                        placeholder="First Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        required={isNewUser}
                        value={newEmployeeData.lastName}
                        onChange={(e) => setNewEmployeeData({ ...newEmployeeData, lastName: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-blue-200 shadow-sm"
                        placeholder="Last Name"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        required={isNewUser}
                        value={newEmployeeData.email}
                        onChange={(e) => setNewEmployeeData({ ...newEmployeeData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-blue-200 shadow-sm"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={newEmployeeData.phone}
                        onChange={(e) => setNewEmployeeData({ ...newEmployeeData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-blue-200 shadow-sm"
                        placeholder="+250 7XX XXX XXX"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Employment Details Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  <FaMoneyBillWave className="text-blue-600" />
                  Employment & Payment Details
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Employee ID</label>
                    <input
                      type="text"
                      required
                      value={newEmployeeData.employeeId}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-500 font-mono outline-none cursor-not-allowed"
                      placeholder="KTMEMP001"
                    />
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tight">System Generated</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                    <input
                      type="text"
                      required
                      value={newEmployeeData.position}
                      onChange={(e) => setNewEmployeeData({ ...newEmployeeData, position: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                      placeholder="e.g. Senior Accountant"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      required
                      value={newEmployeeData.department}
                      onChange={(e) => setNewEmployeeData({ ...newEmployeeData, department: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                      placeholder="e.g. Operations"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Employment Type</label>
                    <select
                      required
                      value={newEmployeeData.employmentType}
                      onChange={(e) => setNewEmployeeData({ ...newEmployeeData, employmentType: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="intern">Intern</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hire Date</label>
                    <input
                      type="date"
                      required
                      value={newEmployeeData.hireDate}
                      onChange={(e) => setNewEmployeeData({ ...newEmployeeData, hireDate: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Salary (RWF)</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        value={newEmployeeData.salary}
                        onChange={(e) => setNewEmployeeData({ ...newEmployeeData, salary: e.target.value })}
                        className="w-full pl-4 pr-16 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 hover:border-gray-300"
                        placeholder="0.00"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">RWF</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name</label>
                    <input
                      type="text"
                      value={newEmployeeData.bankName}
                      onChange={(e) => setNewEmployeeData({ ...newEmployeeData, bankName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                      placeholder="e.g. Bank of Kigali"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Account</label>
                    <input
                      type="text"
                      value={newEmployeeData.bankAccount}
                      onChange={(e) => setNewEmployeeData({ ...newEmployeeData, bankAccount: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300 font-mono"
                      placeholder="Account Number"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Social Security ID (RSSB)</label>
                    <input
                      type="text"
                      value={newEmployeeData.socialSecurityId}
                      onChange={(e) => setNewEmployeeData({ ...newEmployeeData, socialSecurityId: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                      placeholder="RSSB identification number"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={newEmployeeData.notes}
                  onChange={(e) => setNewEmployeeData({ ...newEmployeeData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300 resize-none"
                  placeholder="Internal notes about employment terms, etc."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      {editingEmployee ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      {editingEmployee ? 'Update Employee' : 'Add Employee'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Payroll Modal */}
      {showProcessPayrollModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-12 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 my-8">
            {/* Header with Gradient */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FaMoneyBillWave className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Process Payroll</h3>
                    <p className="text-sm text-blue-100 mt-0.5">Generate salary records for selected period</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProcessPayrollModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            <form onSubmit={handleProcessPayrollSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payroll Period</label>
                  <input
                    type="month"
                    required
                    value={processPayrollData.period}
                    onChange={(e) => setProcessPayrollData({ ...processPayrollData, period: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Working Days</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="31"
                    value={processPayrollData.workingDays}
                    onChange={(e) => setProcessPayrollData({ ...processPayrollData, workingDays: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end mb-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                    <FaUserPlus className="text-blue-600" />
                    Select Employees
                  </div>
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
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors border border-blue-100"
                  >
                    {processPayrollData.selectAll ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto border-2 border-gray-100 rounded-2xl p-2 space-y-1 bg-gray-50/50">
                  {activeEmployees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <FaExclamationTriangle className="text-2xl mb-2" />
                      <p className="text-sm font-medium">No active employees found.</p>
                    </div>
                  ) : (
                    activeEmployees.map(employee => (
                      <label
                        key={employee.id}
                        className={`flex items-center p-3 rounded-xl cursor-pointer transition-all border-2 ${processPayrollData.selectedEmployeeIds.includes(employee.id)
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-transparent hover:border-gray-200'
                          }`}
                      >
                        <div className="relative flex items-center">
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
                            className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 border-gray-300 cursor-pointer"
                          />
                        </div>
                        <div className="ml-3">
                          <p className={`text-sm font-bold ${processPayrollData.selectedEmployeeIds.includes(employee.id) ? 'text-blue-900' : 'text-gray-700'}`}>
                            {employee.user?.fullName || employee.user?.username || `${employee.firstName} ${employee.lastName}`}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">{employee.position} • {employee.department}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-400 px-1">
                  <span>Selected</span>
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{processPayrollData.selectedEmployeeIds.length} employees</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Internal Notes (Optional)</label>
                <textarea
                  value={processPayrollData.notes}
                  onChange={(e) => setProcessPayrollData({ ...processPayrollData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300 resize-none shadow-sm"
                  placeholder="Additional information for this payroll run..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowProcessPayrollModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || processPayrollData.selectedEmployeeIds.length === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  Process Payroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {showViewEmployeeModal && viewingEmployee && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-12 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all scale-100 my-8">
            {/* Header with Gradient */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FaEye className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Employee Profile</h3>
                    <p className="text-sm text-blue-100 mt-0.5">Reference ID: {viewingEmployee.employeeId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full border-2 ${viewingEmployee.status === 'active'
                      ? 'bg-green-500/20 text-white border-green-400'
                      : 'bg-red-500/20 text-white border-red-400'
                    }`}>
                    {viewingEmployee.status}
                  </span>
                  <button
                    onClick={() => {
                      setShowViewEmployeeModal(false);
                      setViewingEmployee(null);
                    }}
                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 bg-gray-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal & Contact Information */}
                <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-[0.2em]">
                    Personal Information
                  </div>
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                      <p className="text-lg font-black text-gray-900 leading-tight">
                        {viewingEmployee.user?.fullName || viewingEmployee.user?.username || `${viewingEmployee.firstName} ${viewingEmployee.lastName}`}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                      <p className="font-bold text-gray-700">{viewingEmployee.user?.email || viewingEmployee.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</label>
                      <p className="font-bold text-gray-700">{viewingEmployee.user?.phone || viewingEmployee.phone || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Job & Department Details */}
                <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-[0.2em]">
                    Position Details
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Position</label>
                        <p className="font-bold text-gray-900">{viewingEmployee.position}</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Department</label>
                        <p className="font-bold text-gray-900">{viewingEmployee.department}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employment</label>
                        <p className="text-sm font-bold text-gray-900 capitalize px-2 py-0.5 bg-gray-100 rounded inline-block">
                          {viewingEmployee.employmentType.replace('-', ' ')}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hire Date</label>
                        <p className="font-bold text-gray-900">{new Date(viewingEmployee.hireDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial & Payment Information */}
                <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm md:col-span-2 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black text-green-600 uppercase tracking-[0.2em]">
                    Financial & Banking Details
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <label className="text-[10px] font-black text-green-700 uppercase tracking-widest block mb-1">Monthly Salary</label>
                      <p className="text-xl font-black text-green-900">{formatCurrency(viewingEmployee.salary)}</p>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bank Name</label>
                          <p className="font-bold text-gray-900">{viewingEmployee.bankName || '-'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bank Account</label>
                          <p className="font-mono font-bold text-gray-900">{viewingEmployee.bankAccount || '-'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Social Security ID (RSSB)</label>
                        <p className="font-bold text-gray-900">{viewingEmployee.socialSecurityId || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                {viewingEmployee.notes && (
                  <div className="bg-gray-50/50 p-5 rounded-2xl border-2 border-dashed border-gray-200 md:col-span-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Employment Notes</label>
                    <p className="text-sm text-gray-600 italic leading-relaxed">"{viewingEmployee.notes}"</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowViewEmployeeModal(false);
                    handleEditEmployee(viewingEmployee);
                  }}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <FaEdit className="text-lg" /> Edit Employee File
                </button>
                <button
                  onClick={() => {
                    setShowViewEmployeeModal(false);
                    setViewingEmployee(null);
                  }}
                  className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
