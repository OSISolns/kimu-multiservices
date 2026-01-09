"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaShieldAlt, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { useUser } from '@/app/UserContext';

interface Staff {
  id: number;
  username: string;
  role: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  department: string | null;
  status: string;
  profilePicture: string | null;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
}

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { loginUser } = useUser();

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  // Handle login
  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await res.json();

      // Login successful - update user context
      const userData = {
        id: data.staff.id,
        username: data.staff.username,
        role: data.staff.role,
        fullName: data.staff.fullName,
        email: data.staff.email,
        phone: data.staff.phone,
        passwordHash: '', // Not needed for client
        department: data.staff.department,
        status: data.staff.status,
        profilePicture: data.staff.profilePicture,
        createdAt: new Date(),
        lastLogin: new Date(),
        totpSecret: null,
        emailNotifications: data.staff.emailNotifications,
        whatsappNotifications: data.staff.whatsappNotifications
      };

      loginUser(userData);

      // Redirect based on role
      switch (data.staff.role) {
        case 'accountant':
          router.push('/staff/accountant-dashboard');
          break;
        case 'admin':
          router.push('/staff/admin-dashboard');
          break;
        case 'sales':
          router.push('/staff/sales-dashboard');
          break;
        case 'transport-officer':
          router.push('/staff/transport_officer-dashboard');
          break;
        case 'manager':
          router.push('/staff/manager-dashboard');
          break;
        default:
          router.push('/staff/sales-dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center overflow-hidden py-12 px-4 bg-gradient-to-br from-blue-50 to-orange-50"
      style={{
        backgroundImage: 'url(/BG.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Login form */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl shadow-blue-500/20 p-8">
          {/* Logo and header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg border-2 border-gray-100">
              <Image
                src="/logo.png"
                alt="KIMU Transport Logo"
                width={64}
                height={64}
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  // Fallback to gradient K if logo fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center"><span class="text-2xl font-bold text-white">K</span></div>';
                  }
                }}
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">KIMU Transport</h1>
            <p className="text-gray-600 text-sm">Staff Login Portal</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Login form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your username"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading || !username || !password}
              className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <FaShieldAlt />
                  Sign In
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
