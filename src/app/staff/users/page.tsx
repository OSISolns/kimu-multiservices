"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '../../UserContext';
import ExcelJS from 'exceljs';

interface User {
  username: string;
  fullName?: string;
  role: string;
}

export default function UsersPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/staff/login');
    } else if (!isLoading && user && user.role !== 'admin') {
      router.push('/staff/dashboard');
    } else if (!isLoading && user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user, isLoading, router]);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        headers: {
          'x-username': user?.username || '',
        },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setUsers([]);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  function exportUsersToExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Users');
    sheet.columns = [
      { header: 'Username', key: 'username', width: 30 },
      { header: 'Full Name', key: 'fullName', width: 30 },
      { header: 'Role', key: 'role', width: 20 },
    ];
    users.forEach(u => {
      sheet.addRow({ username: u.username, fullName: u.fullName, role: u.role });
    });
    // Style header
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    // Add totals row with formula
    const lastRow = sheet.lastRow ? sheet.lastRow.number + 1 : users.length + 2;
    sheet.getCell(`A${lastRow}`).value = 'Total Users';
    sheet.getCell(`B${lastRow}`).value = { formula: `COUNTA(A2:A${lastRow-1})`, result: users.length };
    sheet.getRow(lastRow).font = { bold: true };
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message if user is not admin
  if (!user || user.role !== 'admin') {
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
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
            <button onClick={exportUsersToExcel} className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors mr-2">Export to Excel</button>
            <Link href="/staff/users/add" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Add New User
            </Link>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-gray-600">Loading users...</p>
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
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Username</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Full Name</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Role</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(users) ? users : []).map((user) => (
                    <tr key={user.username} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium">
                        <Link href={`/staff/users/${user.username}`} className="text-blue-600 hover:underline">
                          {user.username}
                        </Link>
                      </td>
                      <td className="py-4 px-6 font-medium">{user.fullName || '-'}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' ? 'bg-red-100 text-red-700' :
                          user.role === 'staff' ? 'bg-blue-100 text-blue-700' :
                          user.role === 'transport-officer' ? 'bg-green-100 text-green-700' :
                          user.role === 'accountant' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {users.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No users found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 