"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaShieldAlt, FaQrcode, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react';
import { useUser } from '@/app/UserContext';
import { generateDeviceFingerprint, generateDeviceName, isDeviceFingerprintingAvailable } from '@/lib/deviceFingerprint';

const ISSUER = 'KIMU Transport';

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
  totpSecret: string | null;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
}

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'credentials' | 'totp'>('credentials');
  const [staff, setStaff] = useState<Staff | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showTrustPrompt, setShowTrustPrompt] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [isFirstTimeDevice, setIsFirstTimeDevice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { loginUser } = useUser();

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'credentials') {
        handleCredentials();
      } else if (step === 'totp') {
        handleTotp();
      }
    }
  };

  // Step 1: Handle credentials submit
  const handleCredentials = async () => {
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
      
      if (data.requiresTotp) {
        setStaff(data.staff);
        setStep('totp');
        
        // Check if device is trusted (skip TOTP if trusted)
        if (isDeviceFingerprintingAvailable()) {
          const deviceId = generateDeviceFingerprint();
          if (deviceId) {
            try {
              const trustCheckRes = await fetch('/api/check-trusted-device', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  username: data.staff.username, 
                  deviceId 
                })
              });
              
              if (trustCheckRes.ok) {
                const trustData = await trustCheckRes.json();
                if (trustData.trusted) {
                  // Device is trusted, skip TOTP and login directly
                  await handleDirectLogin(data.staff, false);
                  return;
                } else {
                  // Device not trusted, show trust prompt for first-time devices
                  setIsFirstTimeDevice(true);
                  setShowTrustPrompt(true);
                }
              }
            } catch (error) {
              console.error('Error checking trusted device:', error);
              // Continue with TOTP flow if trust check fails
            }
          }
        }
      } else {
        // No TOTP required, login directly
        await handleDirectLogin(data.staff, false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle TOTP verification
  const handleTotp = async () => {
    if (!staff) return;
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: staff.username, 
          code: totpCode.trim(),
          trustDevice: trustDevice
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Invalid TOTP code');
      }

      const data = await res.json();
      
      // Add trusted device if requested
      if (trustDevice && isDeviceFingerprintingAvailable()) {
        const deviceId = generateDeviceFingerprint();
        const deviceName = generateDeviceName();
        if (deviceId && deviceName) {
          try {
            await fetch('/api/trusted-devices', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                username: staff.username, 
                deviceId, 
                deviceName 
              })
            });
          } catch (error) {
            console.error('Error adding trusted device:', error);
            // Continue with login even if trusted device fails
          }
        }
      }

      await handleDirectLogin(staff, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TOTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle direct login after successful authentication
  const handleDirectLogin = async (staffData: Staff, usedTotp: boolean) => {
    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: staffData.username, 
          password: password,
          skipTotp: !usedTotp // Skip TOTP if device is trusted
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await res.json();
      
      // Add trusted device if requested
      if (trustDevice && isDeviceFingerprintingAvailable()) {
        const deviceId = generateDeviceFingerprint();
        const deviceName = generateDeviceName();
        if (deviceId && deviceName) {
          try {
            await fetch('/api/trusted-devices', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                username: staffData.username, 
                deviceId, 
                deviceName 
              })
            });
          } catch (error) {
            console.error('Error adding trusted device:', error);
            // Continue with login even if trusted device fails
          }
        }
      }

      // Login successful
      const userData = {
        id: staffData.id,
        username: staffData.username,
        role: staffData.role,
        fullName: staffData.fullName,
        email: staffData.email,
        phone: staffData.phone,
        passwordHash: '', // Not needed for client
        department: staffData.department,
        status: staffData.status,
        profilePicture: staffData.profilePicture,
        createdAt: new Date(),
        lastLogin: new Date(),
        totpSecret: staffData.totpSecret,
        emailNotifications: staffData.emailNotifications,
        whatsappNotifications: staffData.whatsappNotifications
      };
      
      loginUser(userData);
      
      // Redirect based on role (you might want to get this from the API response)
      router.push('/staff/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  // Generate OTP Auth URL for QR code
  const otpauthUrl = staff?.totpSecret 
    ? `otpauth://totp/${ISSUER}:${staff.username}?secret=${staff.totpSecret}&issuer=${ISSUER}`
    : '';

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

          {/* Step 1: Credentials */}
          {step === 'credentials' && (
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
                onClick={handleCredentials}
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
          )}

          {/* Step 2: TOTP */}
          {step === 'totp' && staff && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FaShieldAlt className="text-white text-xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Two-Factor Authentication</h2>
                <p className="text-gray-600 text-sm">Enter the 6-digit code from your authenticator app</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authentication Code
                </label>
                <input
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-mono tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                />
              </div>

              {/* Trust device prompt */}
              {showTrustPrompt && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="trustDevice"
                      checked={trustDevice}
                      onChange={(e) => setTrustDevice(e.target.checked)}
                      className="mt-1"
                    />
                    <label htmlFor="trustDevice" className="text-sm text-blue-800">
                      <strong>Trust this device</strong><br />
                      Skip 2FA for 30 days on this device
                    </label>
                  </div>
                </div>
              )}

              <button
                onClick={handleTotp}
                disabled={loading || totpCode.length !== 6}
                className="w-full bg-gradient-to-r from-green-600 to-blue-500 text-white py-3 rounded-xl font-medium hover:from-green-700 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Verify & Sign In
                  </>
                )}
              </button>

              {/* Back to credentials */}
              <button
                onClick={() => {
                  setStep('credentials');
                  setTotpCode('');
                  setError('');
                }}
                className="w-full text-gray-600 hover:text-gray-800 transition-colors text-sm"
                disabled={loading}
              >
                ← Back to login
              </button>
            </div>
          )}

          {/* QR Code for TOTP setup */}
          {step === 'totp' && staff && (
            <>
              {staff.totpSecret ? (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <FaQrcode className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">TOTP Setup</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">Your TOTP is already configured. Use your authenticator app to generate codes.</p>
                </div>
              ) : (
                <p className="mb-6 text-gray-500 text-sm text-center">Enter the 6-digit code from your Google Authenticator app.</p>
              )}
              {(!staff.totpSecret || showQR) && (
                <div className="mb-6 flex flex-col items-center">
                  {typeof window !== 'undefined' && (
                    <QRCodeCanvas value={otpauthUrl} size={180} />
                  )}
                  <p className="mt-2 text-xs text-gray-600 text-center">Scan this QR code with Google Authenticator or any TOTP app.<br/>Account: <span className="font-mono">{staff.username}</span></p>
                  <p className="mt-1 text-xs text-gray-500">If you need the secret: <span className="font-mono">{staff.totpSecret || 'PLACEHOLDER'}</span></p>
                  {staff.totpSecret && (
                    <button
                      className="text-blue-600 underline text-[10px] hover:text-orange-600 mt-2"
                      type="button"
                      onClick={() => setShowQR(v => !v)}
                    >
                      {showQR ? 'Hide Setup QR Code' : 'Show QR code for setup'}
                    </button>
                  )}
                </div>
              )}
              
              {/* Show QR Code Button for First-Time Devices */}
              {isFirstTimeDevice && !showQR && (
                <div className="mb-6 text-center">
                  <button
                    className="text-blue-600 underline text-sm hover:text-orange-600"
                    type="button"
                    onClick={() => setShowQR(true)}
                  >
                    Show QR code for TOTP setup
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
