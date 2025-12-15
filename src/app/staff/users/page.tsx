"use client";

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '../../UserContext';
import ExcelJS from 'exceljs';
import { FaPlus, FaEdit, FaTrash, FaUser } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import PasswordInput from '@/components/PasswordInput';

interface User {
  id: number;
  username: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  department: string | null;
  status: string;
  profilePicture: string | null;
  createdAt: Date;
  lastLogin?: Date | null;
  totpSecret: string | null;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
}

// Centralized role mapping function
const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    'admin': 'Administrator',
    'manager': 'Manager',
    'sales-representative': 'Sales Representative',
    'agent': 'Sales Representative',
    'accountant': 'Accountant',
    'transport-officer': 'Transport Officer',
    'driver': 'Driver',
    'customer-service': 'Customer Service',
    'operations': 'Operations'
  };
  return roleMap[role] || role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Centralized role styling function
const getRoleBadgeStyle = (role: string): string => {
  const styleMap: Record<string, string> = {
    'admin': 'bg-red-100 text-red-700',
    'manager': 'bg-orange-100 text-orange-700',
    'sales-representative': 'bg-blue-100 text-blue-700',
    'agent': 'bg-blue-100 text-blue-700',
    'transport-officer': 'bg-green-100 text-green-700',
    'accountant': 'bg-purple-100 text-purple-700',
    'driver': 'bg-yellow-100 text-yellow-700',
    'customer-service': 'bg-pink-100 text-pink-700',
    'operations': 'bg-indigo-100 text-indigo-700'
  };
  return styleMap[role] || 'bg-gray-100 text-gray-700';
};

// Centralized status styling function
const getStatusBadgeStyle = (status: string): string => {
  const styleMap: Record<string, string> = {
    'active': 'bg-green-100 text-green-700',
    'inactive': 'bg-gray-100 text-gray-700',
    'suspended': 'bg-red-100 text-red-700'
  };
  return styleMap[status] || 'bg-gray-100 text-gray-700';
};

export default function UsersPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<keyof User>('username');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'sales-representative',
    department: '',
    password: '',
    confirmPassword: ''
  });
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'sales-representative',
    department: '',
    status: 'active'
  });
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordResetUser, setPasswordResetUser] = useState({
    username: '',
    fullName: ''
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    console.log('UsersPage: fetchUsers called with user:', user ? { username: user.username, role: user.role } : null);
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        headers: {
          'x-username': user?.username || '',
        },
      });
      console.log('UsersPage: API response status:', res.status);
      const data = await res.json();
      console.log('UsersPage: API response data:', data);
      if (res.ok && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('UsersPage: fetchUsers error:', err);
      setUsers([]);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('UsersPage: useEffect triggered', { isLoading, user: user ? { username: user.username, role: user.role } : null });
    if (!isLoading && !user) {
      console.log('UsersPage: No user, redirecting to login');
      router.push('/staff/login');
    } else if (!isLoading && user && !['admin', 'manager', 'accountant'].includes(user.role)) {
      console.log('UsersPage: User is not admin, manager or accountant, redirecting to dashboard', { role: user.role });
      router.push('/staff/sales-dashboard');
    } else if (!isLoading && user && ['admin', 'manager', 'accountant'].includes(user.role)) {
      console.log('UsersPage: User is admin or manager, fetching users');
      fetchUsers();
    }
  }, [user, isLoading, router, fetchUsers]);

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      const aRaw = a[sortBy as keyof User];
      const bRaw = b[sortBy as keyof User];

      // Handle different data types properly
      let aValue: string | number = '';
      let bValue: string | number = '';

      if (aRaw instanceof Date) {
        aValue = aRaw.getTime();
        bValue = (bRaw as Date)?.getTime() || 0;
      } else if (typeof aRaw === 'string') {
        aValue = aRaw.toLowerCase();
        bValue = (typeof bRaw === 'string' ? bRaw.toLowerCase() : '') || '';
      } else if (typeof aRaw === 'number') {
        aValue = aRaw;
        bValue = (typeof bRaw === 'number' ? bRaw : 0) || 0;
      } else {
        aValue = String(aRaw || '');
        bValue = String(bRaw || '');
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Handle user selection
  const toggleUserSelection = (username: string) => {
    setSelectedUsers(prev =>
      prev.includes(username)
        ? prev.filter(u => u !== username)
        : [...prev, username]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(filteredAndSortedUsers.map(u => u.username));
  };

  const deselectAllUsers = () => {
    setSelectedUsers([]);
  };

  // Bulk actions
  const bulkActivate = async () => {
    try {
      await Promise.all(selectedUsers.map(username =>
        fetch(`/api/users/update`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, status: 'active' })
        })
      ));
      fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      console.error('Bulk activate failed:', error);
    }
  };

  const bulkDeactivate = async () => {
    try {
      await Promise.all(selectedUsers.map(username =>
        fetch(`/api/users/update`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, status: 'inactive' })
        })
      ));
      fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      console.error('Bulk deactivate failed:', error);
    }
  };

  const bulkDelete = async () => {
    // Filter out admin and accountant users from selection
    const usersToDelete = filteredAndSortedUsers.filter(user =>
      selectedUsers.includes(user.username) &&
      user.role !== 'admin' &&
      user.role !== 'accountant'
    );

    const protectedUsers = filteredAndSortedUsers.filter(user =>
      selectedUsers.includes(user.username) &&
      (user.role === 'admin' || user.role === 'accountant')
    );

    if (protectedUsers.length > 0) {
      alert(`Cannot delete ${protectedUsers.length} user(s) with admin or accountant roles. They have been removed from the selection.`);
    }

    if (usersToDelete.length === 0) {
      alert('No users can be deleted. Admin and accountant users cannot be deleted.');
      setSelectedUsers([]);
      return;
    }

    if (confirm(`Are you sure you want to delete ${usersToDelete.length} user(s)? This action cannot be undone.`)) {
      try {
        await Promise.all(usersToDelete.map(user =>
          fetch(`/api/users`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'x-username': user?.username || '',
            },
            body: JSON.stringify({ username: user.username })
          })
        ));
        fetchUsers();
        setSelectedUsers([]);
        alert(`${usersToDelete.length} user(s) deleted successfully!`);
      } catch (error) {
        console.error('Bulk delete failed:', error);
        alert('Failed to delete some users');
      }
    }
  };

  // View user details
  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Handle new user form changes
  const handleNewUserChange = (field: string, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };

  // Add new user
  const handleAddUser = async () => {
    if (newUser.password !== newUser.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!newUser.username || !newUser.password) {
      alert('Username and password are required');
      return;
    }

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-username': user?.username || '',
        },
        body: JSON.stringify({
          username: newUser.username,
          fullName: newUser.fullName,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          department: newUser.department,
          password: newUser.password,
          status: 'active'
        })
      });

      if (response.ok) {
        // Reset form and close modal
        setNewUser({
          username: '',
          fullName: '',
          email: '',
          phone: '',
          role: 'sales-representative',
          department: '',
          password: '',
          confirmPassword: ''
        });
        setShowAddUserModal(false);
        fetchUsers(); // Refresh the users list
        alert('User created successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  // Edit user
  const handleEditUser = (user: User) => {
    setEditingUser({
      username: user.username,
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
      department: user.department || '',
      status: user.status || 'active'
    });
    setShowEditUserModal(true);
  };

  // Handle edit user form changes
  const handleEditUserChange = (field: string, value: string) => {
    setEditingUser(prev => ({ ...prev, [field]: value }));
  };

  // Update user
  const handleUpdateUser = async () => {
    if (!editingUser.username) {
      alert('Username is required');
      return;
    }

    try {
      console.log('Sending update request for user:', editingUser.username);
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-username': user?.username || '',
        },
        body: JSON.stringify({
          username: editingUser.username,
          fullName: editingUser.fullName,
          email: editingUser.email,
          phone: editingUser.phone,
          role: editingUser.role,
          department: editingUser.department,
          status: editingUser.status
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('Update successful:', result);
        setShowEditUserModal(false);
        fetchUsers(); // Refresh the users list
        alert('User updated successfully!');
      } else {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        let errorMessage = 'Failed to update user';
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.error || errorMessage;
        } catch (e) {
          console.log('Could not parse error response as JSON');
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  // Delete user
  const handleDeleteUser = async (userToDelete: User) => {
    // Check if user is admin or accountant
    if (userToDelete.role === 'admin' || userToDelete.role === 'accountant') {
      alert('Cannot delete admin or accountant users');
      return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete user "${userToDelete.username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log('Sending delete request for user:', userToDelete.username);
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-username': user?.username || '',
        },
        body: JSON.stringify({
          username: userToDelete.username
        })
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        console.log('Delete successful');
        fetchUsers(); // Refresh the users list
        alert('User deleted successfully!');
      } else {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        let errorMessage = 'Failed to delete user';
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.error || errorMessage;
        } catch (e) {
          console.log('Could not parse error response as JSON');
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    setPasswordResetLoading(true);
    try {
      const response = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-username': user?.username || '',
        },
        body: JSON.stringify({
          username: passwordResetUser.username,
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Password reset successfully!');
        setShowPasswordResetModal(false);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordResetUser({ username: '', fullName: '' });
      } else {
        alert(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password');
    } finally {
      setPasswordResetLoading(false);
    }
  };

  function exportUsersToExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Users');
    sheet.columns = [
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Full Name', key: 'fullName', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Last Login', key: 'lastLogin', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    filteredAndSortedUsers.forEach(u => {
      sheet.addRow({
        username: u.username,
        fullName: u.fullName || '-',
        email: u.email || '-',
        phone: u.phone || '-',
        role: u.role,
        status: u.status,
        department: u.department || '-',
        lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '-',
        createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-',
      });
    });

    // Style header
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };

    // Add summary statistics
    const lastRow = sheet.lastRow ? sheet.lastRow.number + 2 : filteredAndSortedUsers.length + 3;

    // Role statistics
    const roleStats = filteredAndSortedUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(roleStats).forEach(([role, count], index) => {
      sheet.getCell(`A${lastRow + index}`).value = `${role}: ${count}`;
    });

    // Status statistics
    const statusStats = filteredAndSortedUsers.reduce((acc, user) => {
      const status = user.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(statusStats).forEach(([status, count], index) => {
      sheet.getCell(`D${lastRow + index}`).value = `${status}: ${count}`;
    });

    // Download
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Loading..." size="lg" fullScreen={true} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Redirecting..." size="lg" fullScreen={true} />
      </div>
    );
  }

  // Show unauthorized message if user is not admin or manager
  if (!user || !['admin', 'manager', 'accountant'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Not Authorized</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have permission to access this page.</p>
          <Link href="/staff/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
            <div className="flex gap-2">
              <button onClick={exportUsersToExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Export to Excel
              </button>
              {(user.role === 'admin' || user.role === 'accountant') && (
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Add New User
                </button>
              )}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Filter</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="sales-representative">Sales Representative</option>
                  <option value="accountant">Accountant</option>
                  <option value="transport-officer">Transport Officer</option>
                  <option value="driver">Driver</option>
                  <option value="customer-service">Customer Service</option>
                  <option value="operations">Operations</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as keyof User)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="username">Username</option>
                  <option value="fullName">Full Name</option>
                  <option value="role">Role</option>
                  <option value="status">Status</option>
                  <option value="lastLogin">Last Login</option>
                  <option value="createdAt">Created At</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {user.role === 'admin' && selectedUsers.length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={bulkActivate}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Activate
                  </button>
                  <button
                    onClick={bulkDeactivate}
                    className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={bulkDelete}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={deselectAllUsers}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner message="Loading users..." size="sm" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredAndSortedUsers.length && filteredAndSortedUsers.length > 0}
                        onChange={selectedUsers.length === filteredAndSortedUsers.length ? deselectAllUsers : selectAllUsers}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Profile</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Username</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Full Name</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Email</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Role</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Status</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Last Login</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedUsers.map((tableUser) => (
                    <tr key={tableUser.username} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(tableUser.username)}
                          onChange={() => toggleUserSelection(tableUser.username)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                          {tableUser.profilePicture ? (
                            <Image
                              src={tableUser.profilePicture}
                              alt={`${tableUser.fullName || tableUser.username}'s profile`}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              onError={() => {
                                // Fallback to default icon if image fails to load
                                console.warn('Failed to load profile picture for user:', tableUser.username);
                              }}
                            />
                          ) : (
                            <FaUser className="text-gray-400" size={16} />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium">
                        <button
                          onClick={() => viewUserDetails(tableUser)}
                          className="text-blue-600 hover:underline"
                        >
                          {tableUser.username}
                        </button>
                      </td>
                      <td className="py-4 px-6 font-medium">{tableUser.fullName || '-'}</td>
                      <td className="py-4 px-6 text-sm">{tableUser.email || '-'}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeStyle(tableUser.role)}`}>
                          {getRoleDisplayName(tableUser.role)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeStyle(tableUser.status)}`}>
                          {tableUser.status.charAt(0).toUpperCase() + tableUser.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {tableUser.lastLogin ? new Date(tableUser.lastLogin).toLocaleString() : 'Never'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewUserDetails(tableUser)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </button>
                          {/* Show Edit/Delete buttons only if the current logged-in user is an admin */}
                          {user?.role === 'admin' && (
                            <>
                              <button
                                onClick={() => handleEditUser(tableUser)}
                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(tableUser)}
                                disabled={tableUser.role === 'admin' || tableUser.role === 'accountant'}
                                className={`text-sm font-medium ${tableUser.role === 'admin' || tableUser.role === 'accountant'
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-red-600 hover:text-red-800'
                                  }`}
                                title={
                                  tableUser.role === 'admin' || tableUser.role === 'accountant'
                                    ? 'Cannot delete admin or accountant users'
                                    : 'Delete user'
                                }
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredAndSortedUsers.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No users found.</p>
            </div>
          )}

          {/* User Details Modal */}
          {showUserModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
              <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <span className="text-blue-600">👤</span>
                    User Details
                  </h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                      <div className="text-lg font-semibold text-gray-800">{selectedUser.username}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                      <div className="text-lg font-semibold text-gray-800">{selectedUser.fullName || 'Not provided'}</div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                      <div className="text-lg font-semibold text-gray-800">{selectedUser.email || 'Not provided'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                      <div className="text-lg font-semibold text-gray-800">{selectedUser.phone || 'Not provided'}</div>
                    </div>
                  </div>

                  {/* Role and Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeStyle(selectedUser.role)}`}>
                        {getRoleDisplayName(selectedUser.role)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeStyle(selectedUser.status)}`}>
                        {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                      </div>
                    </div>
                  </div>

                  {/* Department and Permissions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
                      <div className="text-lg font-semibold text-gray-800">{selectedUser.department || 'Not assigned'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Permissions</label>
                      <div className="text-sm text-gray-700">
                        {/* Permissions are not directly stored in the User interface,
                            so this section will be empty or need to be re-evaluated
                            based on the actual data structure if permissions are needed.
                            For now, it's removed as per the new User interface. */}
                        No specific permissions
                      </div>
                    </div>
                  </div>

                  {/* Activity Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Last Login</label>
                      <div className="text-lg font-semibold text-gray-800">
                        {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never logged in'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Account Created</label>
                      <div className="text-lg font-semibold text-gray-800">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </div>

                  {/* Account Statistics */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Account Statistics</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm text-gray-600">Login Count</div>
                        <div className="text-xl font-bold text-blue-600">-</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Actions Performed</div>
                        <div className="text-xl font-bold text-green-600">-</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Last Activity</div>
                        <div className="text-xl font-bold text-purple-600">-</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      handleEditUser(selectedUser);
                      setShowUserModal(false);
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit User
                  </button>
                  <button
                    onClick={() => {
                      setPasswordResetUser({
                        username: selectedUser.username,
                        fullName: selectedUser.fullName || ''
                      });
                      setShowPasswordResetModal(true);
                      setShowUserModal(false);
                    }}
                    className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add User Modal */}
          {showAddUserModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
              <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <span className="text-green-600">➕</span>
                    Add New User
                  </h3>
                  <button
                    onClick={() => setShowAddUserModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                      <input
                        type="text"
                        value={newUser.username}
                        onChange={(e) => handleNewUserChange('username', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter username"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={newUser.fullName}
                        onChange={(e) => handleNewUserChange('fullName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => handleNewUserChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={newUser.phone}
                        onChange={(e) => handleNewUserChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* Role and Department */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => handleNewUserChange('role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="sales-representative">Sales Representative</option>
                        <option value="admin">Administrator</option>
                        <option value="manager">Manager</option>
                        <option value="accountant">Accountant</option>
                        <option value="transport-officer">Transport Officer</option>
                        <option value="driver">Driver</option>
                        <option value="customer-service">Customer Service</option>
                        <option value="operations">Operations</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={newUser.department}
                        onChange={(e) => handleNewUserChange('department', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter department"
                      />
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <PasswordInput
                        value={newUser.password}
                        onChange={(value) => handleNewUserChange('password', value)}
                        placeholder="Enter password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                      <PasswordInput
                        value={newUser.confirmPassword}
                        onChange={(value) => handleNewUserChange('confirmPassword', value)}
                        placeholder="Confirm password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* User Permissions Preview */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Default Permissions</h4>
                    <div className="text-sm text-gray-600">
                      <p>This user will have access to:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {newUser.role === 'admin' && (
                          <>
                            <li>All system features and user management</li>
                            <li>Complete administrative control</li>
                            <li>Access to all reports and analytics</li>
                          </>
                        )}
                        {newUser.role === 'manager' && (
                          <>
                            <li>Team management and oversight</li>
                            <li>Performance monitoring and reporting</li>
                            <li>Strategic planning and decision making</li>
                            <li>Access to management dashboards</li>
                          </>
                        )}
                        {(newUser.role === 'sales-representative' || newUser.role === 'agent') && (
                          <>
                            <li>Sales dashboard access</li>
                            <li>View and manage bookings</li>
                            <li>Access to customer information</li>
                            <li>Sales reporting and analytics</li>
                          </>
                        )}
                        {newUser.role === 'accountant' && (
                          <>
                            <li>Financial dashboard access</li>
                            <li>View and manage transactions</li>
                            <li>Access to financial reports</li>
                          </>
                        )}
                        {newUser.role === 'transport-officer' && (
                          <>
                            <li>Transport management features</li>
                            <li>Vehicle and driver management</li>
                            <li>Route planning and scheduling</li>
                          </>
                        )}
                        {newUser.role === 'driver' && (
                          <>
                            <li>Vehicle assignment and routes</li>
                            <li>Trip logging and reporting</li>
                            <li>Customer service during transport</li>
                          </>
                        )}
                        {newUser.role === 'customer-service' && (
                          <>
                            <li>Customer support and inquiries</li>
                            <li>Booking assistance and modifications</li>
                            <li>Customer feedback management</li>
                          </>
                        )}
                        {newUser.role === 'operations' && (
                          <>
                            <li>Operational planning and coordination</li>
                            <li>Resource allocation and scheduling</li>
                            <li>Process optimization and monitoring</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddUser}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Create User
                  </button>
                  <button
                    onClick={() => {
                      setNewUser({
                        username: '',
                        fullName: '',
                        email: '',
                        phone: '',
                        role: 'sales-representative',
                        department: '',
                        password: '',
                        confirmPassword: ''
                      });
                      setShowAddUserModal(false);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {showEditUserModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
              <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <span className="text-blue-600">✏️</span>
                    Edit User
                  </h3>
                  <button
                    onClick={() => setShowEditUserModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        value={editingUser.username}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        placeholder="Username cannot be changed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editingUser.fullName}
                        onChange={(e) => handleEditUserChange('fullName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editingUser.email}
                        onChange={(e) => handleEditUserChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={editingUser.phone}
                        onChange={(e) => handleEditUserChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* Role, Department, and Status */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={editingUser.role}
                        onChange={(e) => handleEditUserChange('role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="sales-representative">Sales Representative</option>
                        <option value="admin">Administrator</option>
                        <option value="manager">Manager</option>
                        <option value="accountant">Accountant</option>
                        <option value="transport-officer">Transport Officer</option>
                        <option value="driver">Driver</option>
                        <option value="customer-service">Customer Service</option>
                        <option value="operations">Operations</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={editingUser.department}
                        onChange={(e) => handleEditUserChange('department', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter department"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={editingUser.status}
                        onChange={(e) => handleEditUserChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  {/* Profile Picture Section */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Profile Picture</h4>
                    <ProfilePictureUpload
                      userId={selectedUser?.id || 0}
                      currentProfilePicture={selectedUser?.profilePicture}
                      adminUsername={user?.username || ''}
                      onUploadSuccess={(profilePicture) => {
                        // Update the selected user's profile picture
                        if (selectedUser) {
                          setSelectedUser({ ...selectedUser, profilePicture });
                          // Also update in the users list
                          setUsers(users.map(u =>
                            u.id === selectedUser.id
                              ? { ...u, profilePicture }
                              : u
                          ));
                        }
                      }}
                      onRemoveSuccess={() => {
                        // Remove profile picture from selected user
                        if (selectedUser) {
                          setSelectedUser({ ...selectedUser, profilePicture: null });
                          // Also update in the users list
                          setUsers(users.map(u =>
                            u.id === selectedUser.id
                              ? { ...u, profilePicture: null }
                              : u
                          ));
                        }
                      }}
                      className="mb-4"
                    />
                  </div>

                  {/* Current User Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Current Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Username:</span>
                        <span className="ml-2 font-medium">{editingUser.username}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Role:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${getRoleBadgeStyle(editingUser.role)}`}>
                          {getRoleDisplayName(editingUser.role)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeStyle(editingUser.status)}`}>
                          {editingUser.status.charAt(0).toUpperCase() + editingUser.status.slice(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Department:</span>
                        <span className="ml-2 font-medium">{editingUser.department || 'Not assigned'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Role Permissions Preview */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Role Permissions</h4>
                    <div className="text-sm text-gray-600">
                      <p>This user will have access to:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {editingUser.role === 'admin' && (
                          <>
                            <li>All system features and user management</li>
                            <li>Complete administrative control</li>
                            <li>Access to all reports and analytics</li>
                          </>
                        )}
                        {editingUser.role === 'manager' && (
                          <>
                            <li>Team management and oversight</li>
                            <li>Performance monitoring and reporting</li>
                            <li>Strategic planning and decision making</li>
                            <li>Access to management dashboards</li>
                          </>
                        )}
                        {(editingUser.role === 'sales-representative' || editingUser.role === 'agent') && (
                          <>
                            <li>Sales dashboard access</li>
                            <li>View and manage bookings</li>
                            <li>Access to customer information</li>
                            <li>Sales reporting and analytics</li>
                          </>
                        )}
                        {editingUser.role === 'accountant' && (
                          <>
                            <li>Financial dashboard access</li>
                            <li>View and manage transactions</li>
                            <li>Access to financial reports</li>
                          </>
                        )}
                        {editingUser.role === 'transport-officer' && (
                          <>
                            <li>Transport management features</li>
                            <li>Vehicle and driver management</li>
                            <li>Route planning and scheduling</li>
                          </>
                        )}
                        {editingUser.role === 'driver' && (
                          <>
                            <li>Vehicle assignment and routes</li>
                            <li>Trip logging and reporting</li>
                            <li>Customer service during transport</li>
                          </>
                        )}
                        {editingUser.role === 'customer-service' && (
                          <>
                            <li>Customer support and inquiries</li>
                            <li>Booking assistance and modifications</li>
                            <li>Customer feedback management</li>
                          </>
                        )}
                        {editingUser.role === 'operations' && (
                          <>
                            <li>Operational planning and coordination</li>
                            <li>Resource allocation and scheduling</li>
                            <li>Process optimization and monitoring</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpdateUser}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update User
                  </button>
                  <button
                    onClick={() => setShowEditUserModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Password Reset Modal */}
          {showPasswordResetModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <span className="text-yellow-600">🔐</span>
                    Reset Password
                  </h3>
                  <button
                    onClick={() => {
                      setShowPasswordResetModal(false);
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordResetUser({ username: '', fullName: '' });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>User:</strong> {passwordResetUser.fullName || passwordResetUser.username}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Username:</strong> {passwordResetUser.username}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                      minLength={6}
                    />
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Warning:</strong> This action will immediately change the user&apos;s password.
                      The user will need to use this new password to log in.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handlePasswordReset}
                    disabled={passwordResetLoading || !newPassword || !confirmPassword}
                    className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {passwordResetLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordResetModal(false);
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordResetUser({ username: '', fullName: '' });
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
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