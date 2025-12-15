"use client";
import { useState, useEffect } from 'react';
import { FaDatabase, FaHistory, FaFilter, FaDownload, FaPlus, FaUserShield } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface SystemLog {
  id: number;
  action: string;
  details: string | null;
  createdBy: number | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function SystemLogsAdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filters, setFilters] = useState({
    action: '',
    page: 1,
    limit: 50
  });
  const [showFilters, setShowFilters] = useState(false);
  const [addLogOpen, setAddLogOpen] = useState(false);
  const [newLog, setNewLog] = useState({ action: '', details: '' });
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupResult, setBackupResult] = useState<string | null>(null);

  // Check admin status on mount
  useEffect(() => {
    async function checkAdminStatus() {
      try {
        // Make a test request to a protected endpoint
        const response = await fetch('/api/system-logs?page=1&limit=1');

        if (response.status === 403) {
          // Not authorized
          setIsAdmin(false);
          router.replace('/');
          return;
        }

        if (response.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          router.replace('/');
        }
      } catch (error) {
        console.error('Admin check failed:', error);
        setIsAdmin(false);
        router.replace('/');
      }
    }

    checkAdminStatus();
  }, [router]);

  useEffect(() => {
    if (isAdmin === true) {
      fetchSystemLogs();
    }
    // eslint-disable-next-line
  }, [filters, isAdmin]);

  const fetchSystemLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());
      const response = await fetch(`/api/system-logs?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch system logs');
      const data = await response.json();
      setSystemLogs(data.systemLogs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching system logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ action: '', page: 1, limit: 50 });
  };

  const handleAddLog = async () => {
    if (!newLog.action) return;
    try {
      const res = await fetch('/api/system-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: newLog.action, details: newLog.details }),
      });
      if (res.ok) {
        setAddLogOpen(false);
        setNewLog({ action: '', details: '' });
        fetchSystemLogs();
      }
    } catch (error) {
      // handle error
    }
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    setBackupResult(null);
    try {
      // Simulate DB backup (replace with real backup logic)
      await new Promise(res => setTimeout(res, 2000));
      // Log the backup event
      await fetch('/api/system-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'db_backup', details: 'Manual DB backup triggered from admin panel.' }),
      });
      setBackupResult('Database backup completed and logged.');
      fetchSystemLogs();
    } catch (error) {
      setBackupResult('Backup failed.');
    } finally {
      setBackupLoading(false);
    }
  };

  // Show loading while checking admin status
  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">Access denied.</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <FaUserShield className="text-3xl text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Logs (Admin)</h1>
              <p className="text-gray-600">Monitor and manage system-level events and backups</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                <FaFilter />
                Filters
              </button>
              <button
                onClick={() => setAddLogOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FaPlus />
                Add Log
              </button>
              <button
                onClick={handleBackup}
                disabled={backupLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <FaDatabase />
                {backupLoading ? 'Backing up...' : 'Backup DB'}
              </button>
              <a
                href="/api/system-logs/download"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <FaDownload />
                Download DB Backup
              </a>
            </div>
          </div>

          {backupResult && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
              {backupResult}
            </div>
          )}

          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Action</label>
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Actions</option>
                  <option value="db_backup">DB Backup</option>
                  <option value="user_usage_report">User Usage Report</option>
                  <option value="system_update">System Update</option>
                  <option value="manual_log">Manual Log</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Items per page</label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          )}

          {/* System Logs Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading system logs...</p>
              </div>
            ) : systemLogs.length === 0 ? (
              <div className="text-center py-8">
                <FaHistory className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No system logs found</p>
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-left border-b">
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4">Created By</th>
                    <th className="py-3 px-4">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {systemLogs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold">{log.action.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-4 font-mono text-xs whitespace-pre-wrap">
                        {log.details ? (() => { try { return JSON.stringify(JSON.parse(log.details), null, 2); } catch { return log.details; } })() : 'No details'}
                      </td>
                      <td className="py-3 px-4">{log.createdBy ? `Admin ${log.createdBy}` : 'System'}</td>
                      <td className="py-3 px-4">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange('page', pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handleFilterChange('page', pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Log Modal */}
      {addLogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Add System Log</h3>
              <button
                onClick={() => setAddLogOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select
                  value={newLog.action}
                  onChange={e => setNewLog(l => ({ ...l, action: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Action</option>
                  <option value="db_backup">DB Backup</option>
                  <option value="user_usage_report">User Usage Report</option>
                  <option value="system_update">System Update</option>
                  <option value="manual_log">Manual Log</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                <textarea
                  value={newLog.details}
                  onChange={e => setNewLog(l => ({ ...l, details: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              <button
                onClick={handleAddLog}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Add Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}