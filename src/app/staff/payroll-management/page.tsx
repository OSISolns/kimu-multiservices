'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../UserContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import PayrollDashboard from '@/components/payroll/PayrollDashboard';
import EmployeeManagement from '@/components/payroll/EmployeeManagement';
import PayrollProcessing from '@/components/payroll/PayrollProcessing';
import PayrollReports from '@/components/payroll/PayrollReports';

export default function PayrollManagementPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/staff/login');
    } else if (!isLoading && user && user.role !== 'accountant' && user.role !== 'admin') {
      router.push('/staff/dashboard');
    }
  }, [router, user, isLoading]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'employees', name: 'Employees', icon: '👥' },
    { id: 'processing', name: 'Process Payroll', icon: '💰' },
    { id: 'reports', name: 'Reports', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="mt-2 text-gray-600">
            Manage employee payroll, salary structures, and generate reports
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
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
            {activeTab === 'dashboard' && <PayrollDashboard user={user} />}
            {activeTab === 'employees' && <EmployeeManagement user={user} />}
            {activeTab === 'processing' && <PayrollProcessing user={user} />}
            {activeTab === 'reports' && <PayrollReports user={user} />}
          </div>
        </div>
      </div>
    </div>
  );
}

