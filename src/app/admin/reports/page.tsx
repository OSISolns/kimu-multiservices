"use client";
import { useUser } from '../../UserContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// This is a dedicated admin reports page to avoid layout conflicts
export default function AdminReportsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.replace('/admin/login');
      return;
    }

    if (user && user.role === 'admin') {
      setRedirecting(true);
      // Redirect to staff reports page but maintain admin context
      window.location.href = '/staff/reports';
    }
  }, [user, isLoading, router]);

  if (isLoading || redirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return null;
}
