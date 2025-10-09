"use client"
import { useState, useEffect } from 'react';
import { FaHistory, FaFilter, FaDownload, FaSearch, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useUser } from '../../UserContext';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ActivityLog {
  id: number;
  userId: number | null;
  action: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ActivityLogsPage() {
  const { user } = useUser();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  useEffect(() => {
    const fetchActivityLogs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.action) params.append('action', filters.action);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        params.append('page', filters.page.toString());
        params.append('limit', filters.limit.toString());
        
        const response = await fetch(`/api/activity-log?${params.toString()}`, {
          headers: {
            'x-username': user?.username || '',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch activity logs');
        const data = await response.json();
        setActivityLogs(data.activityLogs);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Error fetching activity logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLogs();
  }, [filters, user?.username]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 50
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login': return '🔐';
      case 'logout': return '🚪';
      case 'booking_created': return '📋';
      case 'booking_updated': return '✏️';
      case 'vehicle_added': return '🚗';
      case 'notification_created': return '🔔';
      case 'settings_updated': return '⚙️';
      case 'user_created': return '👤';
      default: return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login': return 'bg-green-100 text-green-800';
      case 'logout': return 'bg-gray-100 text-gray-800';
      case 'booking_created': return 'bg-blue-100 text-blue-800';
      case 'booking_updated': return 'bg-yellow-100 text-yellow-800';
      case 'vehicle_added': return 'bg-purple-100 text-purple-800';
      case 'notification_created': return 'bg-orange-100 text-orange-800';
      case 'settings_updated': return 'bg-indigo-100 text-indigo-800';
      case 'user_created': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDetails = (details: string | null) => {
    if (!details) return 'No details';
    try {
      const parsed = JSON.parse(details);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return details;
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['ID', 'User ID', 'Action', 'Details', 'IP Address', 'User Agent', 'Created At'].join(','),
      ...activityLogs.map(log => [
        log.id,
        log.userId || '',
        log.action,
        `"${(log.details || '').replace(/"/g, '""')}"`,
        log.ipAddress || '',
        `"${(log.userAgent || '').replace(/"/g, '""')}"`,
        log.createdAt
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-4">
          <Link href="/staff/dashboard" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">&larr; Back to Dashboard</Link>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <FaHistory className="text-3xl text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
              <p className="text-gray-600">Track and monitor user activities across the system</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  showFilters ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FaFilter />
                Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            </div>
            <button
              onClick={exportLogs}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FaDownload />
              Export CSV
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-4">Filter Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                  <select
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Actions</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="booking_created">Booking Created</option>
                    <option value="booking_updated">Booking Updated</option>
                    <option value="vehicle_added">Vehicle Added</option>
                    <option value="notification_created">Notification Created</option>
                    <option value="settings_updated">Settings Updated</option>
                    <option value="user_created">User Created</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                    <option value={200}>200</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Activity Logs Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <LoadingSpinner message="Loading activity logs..." size="md" />
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="text-center py-8">
                <FaHistory className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No activity logs found</p>
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-left border-b">
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Created At</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getActionIcon(log.action)}</span>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {log.userId ? `User ${log.userId}` : 'Anonymous'}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {log.ipAddress || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                          title="View details"
                        >
                          <FaEye />
                        </button>
                      </td>
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

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Activity Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <p className="text-lg">{selectedLog.action.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <p>{selectedLog.userId ? `User ${selectedLog.userId}` : 'Anonymous'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                <p className="font-mono">{selectedLog.ipAddress || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Agent</label>
                <p className="text-sm break-all">{selectedLog.userAgent || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <p>{new Date(selectedLog.createdAt).toLocaleString()}</p>
              </div>
              {selectedLog.details && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {formatDetails(selectedLog.details)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 