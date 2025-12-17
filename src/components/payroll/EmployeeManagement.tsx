'use client';

import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaToggleOn, FaToggleOff, FaTrash } from 'react-icons/fa';
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingEmployee ? 'Edit Employee' : 'Add Employee'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* User Selection Toggle */}
                {!editingEmployee && (
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
                )}

                {!isNewUser ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Select User
                    </label>
                    <select
                      value={formData.userId || ''}
                      onChange={(e) => setFormData({ ...formData, userId: parseInt(e.target.value) })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={!isNewUser}
                      disabled={!!editingEmployee}
                    >
                      <option value="">Select a user...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName || u.username} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required={isNewUser}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required={isNewUser}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={isNewUser}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Position
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700">
                    Employment Type
                  </label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Salary
                  </label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    value={formData.hireDate.toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, hireDate: new Date(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingEmployee(null);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingEmployee ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Employee Details</h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingEmployee(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingEmployee.employeeId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${viewingEmployee.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : viewingEmployee.status === 'inactive'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                      {viewingEmployee.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {viewingEmployee.user?.fullName || viewingEmployee.user?.username || `${viewingEmployee.firstName} ${viewingEmployee.lastName}`}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingEmployee.user?.email || viewingEmployee.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingEmployee.user?.phone || viewingEmployee.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingEmployee.position}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingEmployee.department}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingEmployee.employmentType}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hire Date</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(viewingEmployee.hireDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Salary</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(viewingEmployee.salary)}</p>
                  </div>
                </div>

                {viewingEmployee.bankName && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingEmployee.bankName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bank Account</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingEmployee.bankAccount || '-'}</p>
                    </div>
                  </div>
                )}

                {viewingEmployee.taxId && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingEmployee.taxId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Social Security ID</label>
                      <p className="mt-1 text-sm text-gray-900">{viewingEmployee.socialSecurityId || '-'}</p>
                    </div>
                  </div>
                )}

                {viewingEmployee.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingEmployee.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 mt-4 border-t">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingEmployee(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
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

