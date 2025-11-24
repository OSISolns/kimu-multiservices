"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Logout() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  // Ensure we're on the client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    // Only access localStorage after mounting to avoid hydration mismatch
    if (!isMounted) return;
    
    localStorage.removeItem('isStaff');
    localStorage.removeItem('user');
    router.push('/staff/login');
  }, [router, isMounted]);
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Logging out...</h1>
    </div>
  );
} 