"use client";

import { useEffect, useState } from 'react';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden py-12 px-4 bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="bg-white/90 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl shadow-blue-500/20 p-6 w-full max-w-sm flex flex-col items-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-300 rounded-full mb-4"></div>
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-4"></div>
            <div className="h-12 bg-gray-300 rounded mb-4"></div>
            <div className="h-12 bg-gray-300 rounded"></div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return <LoginForm />;
}