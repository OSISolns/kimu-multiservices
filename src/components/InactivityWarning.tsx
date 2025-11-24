'use client';

import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaClock } from 'react-icons/fa';

interface InactivityWarningProps {
  isVisible: boolean;
  timeLeft: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export default function InactivityWarning({ 
  isVisible, 
  timeLeft, 
  onStayLoggedIn, 
  onLogout 
}: InactivityWarningProps) {
  const [countdown, setCountdown] = useState(timeLeft);

  useEffect(() => {
    setCountdown(timeLeft);
  }, [timeLeft]);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, onLogout]);

  if (!isVisible) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-4">
            <FaExclamationTriangle className="text-5xl text-orange-500 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-gray-800">Session Timeout Warning</h2>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              You will be automatically logged out due to inactivity.
            </p>
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-red-600">
              <FaClock />
              <span>
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onLogout}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Logout Now
            </button>
            <button
              onClick={onStayLoggedIn}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
