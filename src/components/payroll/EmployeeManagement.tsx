'use client';

import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaToggleOn, FaToggleOff, FaTrash, FaUserPlus, FaTimes, FaSpinner, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa';
import { Employee, CreateEmployeeData, UpdateEmployeeData } from '@/types/payroll';

interface EmployeeManagementProps {
  user: any;
}

export default function EmployeeManagement({ user }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [formData, setFormData] = useState<CreateEmployeeData>({
    userId: undefined,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    position: '',
    department: '',
    employmentType: 'full-time',
    hireDate: new Date(),
    salary: 0,
    hourlyRate: 0,
    workingHours: 40,
    bankAccount: '',
    bankName: '',
    taxId: '',
    socialSecurityId: '',
    notes: '',
  });

  useEffect(() => {
    fetchEmployees();
    fetchUsers();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/payroll/employees');
      const data = await response.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEmployee
        ? `/api/payroll/employees?id=${editingEmployee.id}`
        : '/api/payroll/employees';

      const method = editingEmployee ? 'PUT' : 'POST';

      // Prepare payload
      const payload = { ...formData };
      if (isNewUser) {
        delete payload.userId;
      } else {
        delete payload.firstName;
        delete payload.lastName;
        delete payload.email;
        delete payload.phone;
      }

      console.log('🔍 EmployeeManagement - User object:', user);

      if (!user?.username && !user?.email) {
        alert('User session data is missing (no username or email). Please log out and log in again.');
        return;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-username': user?.username || '',
          'x-user-email': user?.email || '',
          'x-user-id': user?.id?.toString() || '',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        await fetchEmployees();
        setShowModal(false);
        setEditingEmployee(null);
        resetForm();
      } else {
        alert(data.error || 'Failed to save employee');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Failed to save employee');
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsNewUser(!employee.userId);
    setFormData({
      userId: employee.userId,
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      phone: employee.phone || '',
      employeeId: employee.employeeId,
      position: employee.position,
      department: employee.department,
      employmentType: employee.employmentType,
      hireDate: new Date(employee.hireDate),
      salary: employee.salary,
      hourlyRate: employee.hourlyRate || 0,
      workingHours: employee.workingHours || 40,
      bankAccount: employee.bankAccount || '',
      bankName: employee.bankName || '',
      taxId: employee.taxId || '',
      socialSecurityId: employee.socialSecurityId || '',
      notes: employee.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (employeeId: number) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      const response = await fetch(`/api/payroll/employees?id=${employeeId}`, {
        method: 'DELETE',
        headers: {
          'x-username': user.username,
        },
      });

      const data = await response.json();
      if (data.success) {
        await fetchEmployees();
      } else {
        alert(data.error || 'Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee');
    }
  };

  const handleView = (employee: Employee) => {
    setViewingEmployee(employee);
    setShowViewModal(true);
  };

  const handleToggleStatus = async (employee: Employee) => {
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

      const data = await response.json();
      if (data.success) {
        await fetchEmployees();
      } else {
        alert(data.error || 'Failed to update employee status');
      }
    } catch (error) {
      console.error('Error updating employee status:', error);
      alert('Failed to update employee status');
    }
  };

  const resetForm = () => {
    setIsNewUser(false);
    setFormData({
      userId: undefined,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      employeeId: '',
      position: '',
      department: '',
      employmentType: 'full-time',
      hireDate: new Date(),
      salary: 0,
      hourlyRate: 0,
      workingHours: 40,
      bankAccount: '',
      bankName: '',
      taxId: '',
      socialSecurityId: '',
      notes: '',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
    }).format(amount);
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Employee
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
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
                    <div className="text-sm text-gray-500">{employee.employeeId}</div>
                    <div className="text-sm text-gray-500">{employee.user?.email || employee.email}</div>
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
                      onClick={() => handleView(employee)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEdit(employee)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(employee)}
                      className={`p-2 rounded-lg transition-colors ${employee.status === 'active'
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      title={employee.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {employee.status === 'active' ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
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

      {/* Add/Edit Modal */}
      {showModal && (
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
                      {editingEmployee ? `Updating profile for ${formData.firstName || ''}` : 'Register a new member to the payroll system'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEmployee(null);
                    resetForm();
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* System Integration Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wider">
                    <FaToggleOn />
                    System Integration
                  </div>
                  {!editingEmployee && (
                    <label className="flex items-center cursor-pointer group">
                      <span className="mr-3 text-xs font-bold text-gray-500 group-hover:text-blue-600 transition-colors uppercase tracking-widest">
                        {isNewUser ? 'Create New User' : 'Link Existing User'}
                      </span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={!isNewUser}
                          onChange={() => setIsNewUser(!isNewUser)}
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${!isNewUser ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${!isNewUser ? 'translate-x-4' : ''}`}></div>
                      </div>
                    </label>
                  )}
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border-2 border-blue-100/50">
                  {!isNewUser ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Select System User</label>
                      <select
                        value={formData.userId || ''}
                        onChange={(e) => setFormData({ ...formData, userId: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300 disabled:bg-gray-100 font-medium"
                        required={!isNewUser}
                        disabled={!!editingEmployee}
                      >
                        <option value="">Choose a user account...</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.fullName || u.username} ({u.email})
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-[10px] text-blue-600 font-bold uppercase tracking-wider italic">
                        * Linking a user automatically fetches their personal details.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                            placeholder="John"
                            required={isNewUser}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                            placeholder="Doe"
                            required={isNewUser}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                            placeholder="john.doe@example.com"
                            required={isNewUser}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                            placeholder="+250 7XX XXX XXX"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Employment Details Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wider">
                  <FaMoneyBillWave />
                  Employment & Payment Details
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Employee Reference ID</label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300 font-mono"
                      placeholder="EMP001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Position</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                      placeholder="Senior Manager"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300 font-medium"
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Administration">Administration</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Sales">Sales</option>
                      <option value="Customer Service">Customer Service</option>
                      <option value="IT">IT</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Employment Type</label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300 font-medium"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="intern">Intern</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Basic Salary (RWF)</label>
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300 font-bold"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hire Date</label>
                    <input
                      type="date"
                      value={formData.hireDate.toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, hireDate: new Date(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEmployee(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="text-lg" />
                      {editingEmployee ? 'Update Profile' : 'Register Employee'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {showViewModal && viewingEmployee && (
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
                      setShowViewModal(false);
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tax ID</label>
                          <p className="font-bold text-gray-900">{viewingEmployee.taxId || '-'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Social Security ID</label>
                          <p className="font-bold text-gray-900">{viewingEmployee.socialSecurityId || '-'}</p>
                        </div>
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

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingEmployee(null);
                  }}
                  className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
