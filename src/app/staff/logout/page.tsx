"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Logout() {
  const router = useRouter();
  useEffect(() => {
    localStorage.removeItem('isStaff');
    localStorage.removeItem('user');
    router.push('/staff/login');
  }, [router]);
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Logging out...</h1>
    </div>
  );
} 