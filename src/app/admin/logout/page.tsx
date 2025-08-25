"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../UserContext';

export default function AdminLogout() {
  const { logoutUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Clear user session
    logoutUser();
    
    // Redirect to main page after logout
    setTimeout(() => {
      router.replace('/');
    }, 1000);
  }, [logoutUser, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  );
}
