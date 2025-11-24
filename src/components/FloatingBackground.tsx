"use client"
import React, { useEffect, useState } from 'react';

export default function FloatingBackground() {
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we're on the client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Simple floating elements with fixed positions */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }}></div>
    </div>
  );
} 