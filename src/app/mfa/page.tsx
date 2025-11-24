'use client';

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic'

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { FaShieldAlt, FaClock, FaLock, FaMobileAlt } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MfaPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const router = useRouter();
  const [next, setNext] = useState('/staff/sales-dashboard');
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we're on the client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Get search params on client side to avoid SSR issues
    if (!isMounted) return;

    const urlParams = new URLSearchParams(window.location.search);
    setNext(urlParams.get('next') || '/staff/sales-dashboard');
  }, [isMounted]);

  // Get current user from localStorage (simplified session management)
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Only access localStorage after mounting to avoid hydration mismatch
    if (!isMounted) return;

    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/staff/login');
      }
    } else {
      router.push('/staff/login');
    }
  }, [router, isMounted]);

  // Countdown timer for code expiry
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 30; // Reset to 30 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Session expired. Please login again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/mfa/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id?.toString() || 'temp-user-id',
          totp: code,
          trustDevice: trustDevice
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        // MFA verification successful
        console.log('MFA verification successful, redirecting to:', next);
        router.push(next);
      } else {
        setError(data.error || 'Invalid verification code');
        setCode(''); // Clear the code input
      }
    } catch (error) {
      console.error('MFA verification error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser, code, trustDevice, router, next]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setCode(value);
    }
  };

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (code.length === 6 && !loading) {
      handleSubmit(new Event('submit') as any);
    }
  }, [code, loading, handleSubmit]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <FaShieldAlt className="text-blue-600 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h1>
          <p className="text-gray-600">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <div className="relative">
              <input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={code}
                onChange={handleCodeChange}
                placeholder="000000"
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                autoComplete="one-time-code"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <FaMobileAlt className="text-gray-400" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
              <span>Code expires in {timeLeft}s</span>
              <div className="flex items-center">
                <FaClock className="mr-1" />
                <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <input
              id="trustDevice"
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="trustDevice" className="flex-1 text-sm text-gray-700">
              <div className="flex items-center">
                <FaLock className="mr-2 text-gray-400" />
                <div>
                  <div className="font-medium">Trust this device</div>
                  <div className="text-gray-500">Remember for 8 hours</div>
                </div>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${loading || code.length !== 6
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner />
                <span className="ml-2">Verifying...</span>
              </div>
            ) : (
              'Verify Code'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Don&apos;t have access to your authenticator?{' '}
            <button
              onClick={() => router.push('/staff/login')}
              className="text-blue-600 hover:underline"
            >
              Sign in again
            </button>
          </p>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <FaShieldAlt className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Security Tip</p>
              <p>
                Only check &quot;Trust this device&quot; on your personal devices.
                Your session will be secured with additional encryption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
