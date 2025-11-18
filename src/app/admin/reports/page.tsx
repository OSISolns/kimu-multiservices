'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../UserContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import ReportsDashboard from '@/components/admin/ReportsDashboard';

export default function AdminReportsPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/staff/login');
    } else if (!isLoading && user && user.role !== 'admin') {
      router.push('/staff/dashboard');
    }
  }, [router, user, isLoading]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReportsDashboard user={user} />
      </div>
    </div>
  );
}