"use client"
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { QRCodeCanvas } from 'qrcode.react';
import { FaCar, FaHotel, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useUser } from '../../UserContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { generateDeviceFingerprint, generateDeviceName, isDeviceFingerprintingAvailable } from '@/lib/deviceFingerprint';

const ISSUER = 'KIMU Transport';

export default function StaffLogin() {
  const [step, setStep] = useState<'credentials' | 'code'>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState<{ username: string; totpSecret: string | null; role: string } | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showTrustPrompt, setShowTrustPrompt] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [isFirstTimeDevice, setIsFirstTimeDevice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { loginUser } = useUser();

  // Ensure we're on the client side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Step 1: Handle credentials submit
  const handleCredentials = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError('Invalid username or password.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      
      // If user doesn't have TOTP set up, generate one automatically
      if (!data.totpSecret) {
        console.log(`No TOTP secret found for ${username}, generating new one...`);
        try {
          const totpSetupRes = await fetch('/api/users/totp-setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
          });
          
          if (totpSetupRes.ok) {
            const totpData = await totpSetupRes.json();
            // Update the staff data with the new TOTP secret
            data.totpSecret = totpData.secret;
            console.log(`Generated TOTP secret for ${username}:`, totpData.secret);
          } else {
            console.error('Failed to generate TOTP secret:', totpSetupRes.status);
          }
        } catch (totpError) {
          console.warn('Error setting up TOTP:', totpError);
        }
      } else {
        console.log(`TOTP secret already exists for ${username}`);
      }
      
      setStaff(data);

      // Check if device is trusted (skip TOTP if trusted)
      // Only check on client side after hydration
      if (isClient && isDeviceFingerprintingAvailable()) {
        const deviceId = generateDeviceFingerprint();
        if (deviceId) {
          try {
            const trustCheckRes = await fetch('/api/check-trusted-device', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, deviceId }),
            });
            
            if (trustCheckRes.ok) {
              const trustData = await trustCheckRes.json();
              if (trustData.trusted) {
                // Device is trusted, skip TOTP and login directly
                console.log(`Device is trusted for ${username}, skipping TOTP`);
                await loginDirectly(data);
                return;
              } else {
                // Device is not trusted - this is a first-time device
                setIsFirstTimeDevice(true);
                // QR code is hidden by default, user must click to show
                setShowQR(false);
              }
            }
          } catch (trustError) {
            console.warn('Error checking trusted device:', trustError);
            // Continue with normal TOTP flow if trust check fails
            setIsFirstTimeDevice(true);
            setShowQR(false);
          }
        } else {
          setIsFirstTimeDevice(true);
          setShowQR(false);
        }
      } else {
        setIsFirstTimeDevice(true);
        setShowQR(false);
      }

      // Continue with TOTP verification
      setStep('code');
    } catch (e) {
      setError('Error verifying credentials.');
    }
    setLoading(false);
  };

  // Helper function to login directly (used for trusted devices)
  const loginDirectly = async (staffData: any) => {
    const userData = {
      id: Date.now(),
      username: username,
      fullName: username,
      email: null,
      phone: null,
      passwordHash: '',
      role: staffData?.role || 'staff',
      department: null,
      status: 'active',
      profilePicture: null,
      createdAt: new Date(),
      totpSecret: staffData?.totpSecret || null,
      emailNotifications: false,
      whatsappNotifications: false
    };
    
    // Add trusted device if requested
    if (trustDevice && isClient && isDeviceFingerprintingAvailable()) {
      const deviceId = generateDeviceFingerprint();
      const deviceName = generateDeviceName();
      if (deviceId && deviceName) {
        try {
          await fetch('/api/trusted-devices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, deviceId, deviceName }),
          });
        } catch (error) {
          console.warn('Failed to save trusted device:', error);
        }
      }
    }

    await loginUser(userData);
    router.push('/staff/dashboard');
  };

  // Step 2: Handle TOTP code submit
  const handleLogin = async () => {
    setLoading(true);
    setError('');
    console.log(`Attempting TOTP verification for ${username} with code: ${code}`);
    try {
      const res = await fetch('/api/staff/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, code, trustDevice }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || 'Invalid verification code.');
        setLoading(false);
        return;
      }

      const data = await res.json();
      
      // Add trusted device if requested
      if (trustDevice && isClient && isDeviceFingerprintingAvailable()) {
        const deviceId = generateDeviceFingerprint();
        const deviceName = generateDeviceName();
        if (deviceId && deviceName) {
          try {
            await fetch('/api/trusted-devices', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, deviceId, deviceName }),
            });
          } catch (error) {
            console.warn('Failed to save trusted device:', error);
          }
        }
      }

      await loginUser(data);
      router.push('/staff/dashboard');
    } catch (e) {
      setError('Error verifying code.');
    }
    setLoading(false);
  };

  // Generate OTP Auth URL for QR code
  const otpauthUrl = staff?.totpSecret 
    ? `otpauth://totp/${ISSUER}:${staff.username}?secret=${staff.totpSecret}&issuer=${ISSUER}`
    : '';

  // Don't render anything until mounted to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden py-12 px-4">
        <div className="bg-white/90 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl shadow-blue-500/20 p-6 w-full max-w-sm flex flex-col items-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-300 rounded-full mb-4"></div>
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-4"></div>
            <div className="h-12 bg-gray-300 rounded mb-4"></div>
            <div className="h-12 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center overflow-hidden py-12 px-4"
      style={{
        backgroundImage: 'url(/BG.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background Overlay for Better Readability */}
      <div className="absolute inset-0 bg-black/30 -z-10"></div>
      
      <div className="bg-white/90 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl shadow-blue-500/20 p-6 w-full max-w-sm flex flex-col items-center">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          {/* Logo */}
          <div className="mb-4">
            <Image src="/logo.png" alt="KIMU Logo" width={60} height={60} className="drop-shadow-lg" />
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-blue-700 mb-2">KIMU</h1>
          <p className="text-sm text-gray-600 text-center">
            Transport & Multiservices Management
          </p>
          <div className="mt-2">
            <span className="text-xs text-white font-bold tracking-widest uppercase px-3 py-1 bg-orange-600 rounded-full">
              Staff Portal
            </span>
          </div>
        </div>
        {step === 'credentials' && (
          <form
            className="w-full"
            onSubmit={e => {
              e.preventDefault();
              handleCredentials();
            }}
          >
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded mb-4 w-full flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" /></svg>
                <span>{error}</span>
              </div>
            )}
            
            <div className="relative mb-3 w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            <input
              type="text"
              placeholder="Staff Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border-3 border-orange-500 rounded-2xl bg-orange-50 focus:ring-4 focus:ring-orange-600 focus:border-orange-600 focus:bg-white text-center text-base font-medium placeholder-orange-600 transition-all duration-300 shadow-lg"
              disabled={loading}
              autoFocus
            />
            </div>
            
            <div className="relative mb-4 w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            <input
                type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-14 py-2 border-3 border-blue-500 rounded-2xl bg-blue-50 focus:ring-4 focus:ring-blue-600 focus:border-blue-600 focus:bg-white text-center text-base font-medium placeholder-blue-600 transition-all duration-300 shadow-lg"
              disabled={loading}
            />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                                 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-600 hover:text-orange-800 focus:outline-none focus:text-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 p-2 rounded-lg hover:bg-orange-100 shadow-md"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5" />
                ) : (
                  <FaEye className="h-5 w-5" />
                )}
              </button>
            </div>
            
            <button
              type="submit"
                             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading || !username || !password}
            >
              <div className="flex items-center gap-3">
                {loading ? (
                  <>
                    <LoadingSpinner size="xs" inline variant="spinner" color="blue" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </div>
            </button>
          </form>
        )}
        {step === 'code' && staff && (
          <form
            className="w-full"
            onSubmit={e => {
              e.preventDefault();
              handleLogin();
            }}
          >
            {isFirstTimeDevice && !staff.totpSecret ? (
              <div className="mb-6 text-center">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">🔐 First-Time Device Setup</h3>
                  <p className="text-blue-700 text-sm">This is your first time logging in on this device. Please set up two-factor authentication to continue.</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="text-md font-semibold text-green-800 mb-2">📱 Setup Instructions</h4>
                  <ol className="text-green-700 text-sm text-left list-decimal list-inside space-y-1">
                    <li>Download Google Authenticator or any TOTP app</li>
                    <li>Scan the QR code below with your app</li>
                    <li>Enter the 6-digit code that appears in your app</li>
                    <li>Optionally trust this device for future logins</li>
                  </ol>
                </div>
              </div>
            ) : (
              <p className="mb-6 text-gray-500 text-sm text-center">Enter the 6-digit code from your Google Authenticator app.</p>
            )}
            {showQR && (
              <div className="mb-6 flex flex-col items-center">
                <QRCodeCanvas value={otpauthUrl} size={180} />
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
                  type="button"
                  onClick={() => setShowQR(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  📱 Show QR Code for Setup
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Click to reveal the QR code for setting up your authenticator app
                </p>
              </div>
            )}
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded mb-4 w-full flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" /></svg>
                <span>{error}</span>
              </div>
            )}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="6-digit code"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              className="border w-full p-3 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-xl tracking-widest mb-4"
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-3 rounded-lg w-full font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && <LoadingSpinner size="xs" inline variant="spinner" color="blue" />}
              Login
            </button>
            
            {/* Trust Device Option for First-Time Devices */}
            {isFirstTimeDevice && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={trustDevice}
                    onChange={(e) => setTrustDevice(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    🔒 Trust this device for 7 days (skip 2FA on future logins)
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  This will remember this device and skip two-factor authentication for the next 7 days.
                </p>
              </div>
            )}
            <button
              className="mt-4 text-sm text-gray-500 underline"
              type="button"
              onClick={() => { setStep('credentials'); setCode(''); setError(''); }}
            >
              Back to credentials
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 