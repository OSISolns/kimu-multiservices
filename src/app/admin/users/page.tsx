"use client";
import { useUser } from '../../UserContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// This is a dedicated admin users page to avoid layout conflicts
export default function AdminUsersPage() {
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
      // Redirect to staff users page but maintain admin context
      window.location.href = '/staff/users';
    }
  }, [user, isLoading, router]);

  if (isLoading || redirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return null;
}
