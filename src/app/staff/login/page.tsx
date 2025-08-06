"use client"
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { QRCodeCanvas } from 'qrcode.react';
import { FaCar, FaHotel } from 'react-icons/fa';

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
  const router = useRouter();

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
      setStaff(data);
      setStep('code');
    } catch (e) {
      setError('Error verifying credentials.');
    }
    setLoading(false);
  };

  // Step 2: Handle TOTP code submit
  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      if (code.length !== 6) {
        setError('Please enter a 6-digit code.');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, username }),
      });
      const data = await res.json();
      if (data.valid) {
        localStorage.setItem('isStaff', 'true');
        // Store user data in localStorage for UserContext
        localStorage.setItem('user', JSON.stringify({
          id: 0, // We don't have the actual ID from the login response
          username: username,
          fullName: null, // Add fullName property
          passwordHash: '', // Add empty passwordHash
          role: staff?.role || 'staff',
          profilePicture: null, // Add profilePicture property
          createdAt: new Date().toISOString(), // Add createdAt property
          totpSecret: staff?.totpSecret || null, // Add totpSecret property
          emailNotifications: false, // Add emailNotifications property
          whatsappNotifications: false // Add whatsappNotifications property
        }));
        router.push('/staff/dashboard');
      } else {
        setError(data.error || 'Invalid code. Please try again. Make sure your device time is synchronized.');
      }
    } catch (e) {
      setError('Error verifying code. Please check your connection and try again.');
    }
    setLoading(false);
  };

  // Generate otpauth URL for QR code (if staff and no secret)
  const otpauthUrl = staff && !staff.totpSecret
    ? `otpauth://totp/${encodeURIComponent(ISSUER)}:${encodeURIComponent(staff.username)}?secret=PLACEHOLDER&issuer=${encodeURIComponent(ISSUER)}`
    : staff && staff.totpSecret
    ? `otpauth://totp/${encodeURIComponent(ISSUER)}:${encodeURIComponent(staff.username)}?secret=${staff.totpSecret}&issuer=${encodeURIComponent(ISSUER)}`
    : '';

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden py-12 px-4">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 animate-fade-in">
        <svg width="100%" height="100%" className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0 }}>
          <circle cx="20%" cy="20%" r="120" fill="#e0f2fe" opacity="0.5">
            <animate attributeName="r" values="120;140;120" dur="6s" repeatCount="indefinite" />
          </circle>
          <circle cx="80%" cy="80%" r="100" fill="#fef9c3" opacity="0.4">
            <animate attributeName="r" values="100;120;100" dur="7s" repeatCount="indefinite" />
          </circle>
        </svg>
        {/* Car Icon Animation */}
        <FaCar className="text-blue-200 absolute left-10 top-10 text-[120px] animate-bounce-slow" style={{ filter: 'blur(1px)' }} />
        {/* Hotel Icon Animation */}
        <FaHotel className="text-yellow-200 absolute right-10 bottom-10 text-[100px] animate-bounce-slower" style={{ filter: 'blur(1px)' }} />
        {/* Company Logo Animation */}
        <div className="absolute right-10 top-10 animate-fade-scale">
          <Image src="/logo.png" alt="Company Logo" width={90} height={90} className="opacity-60" style={{ filter: 'blur(0.5px)' }} />
        </div>
      </div>
      <div
        className="bg-white/80 backdrop-blur-md border border-blue-100 rounded-3xl shadow-2xl p-10 w-full max-w-md flex flex-col items-center transition-all duration-300 hover:shadow-blue-200 hover:border-blue-300"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="bg-white/70 rounded-full p-2 shadow-md mb-2 border border-blue-100">
            <Image src="/logo.png" alt="KIMU Logo" width={64} height={64} />
          </div>
          <h1 className="text-3xl font-extrabold text-blue-900 mb-1 tracking-tight text-center">CAMS</h1>
          <span className="text-xs text-blue-700 font-semibold tracking-wide uppercase mb-1 block text-center">Company Administration & Management System</span>
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
            <input
              type="text"
              placeholder="Staff Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="border w-full p-3 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg mb-4"
              disabled={loading}
              autoFocus
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="border w-full p-3 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg mb-4"
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-3 rounded-lg w-full font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              disabled={loading || !username || !password}
            >
              {loading && <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>}
              Next
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
            <p className="mb-6 text-gray-500 text-sm text-center">Enter the 6-digit code from your Google Authenticator app.</p>
            {(!staff.totpSecret || showQR) && (
              <div className="mb-6 flex flex-col items-center">
                <QRCodeCanvas value={otpauthUrl} size={180} />
                <p className="mt-2 text-xs text-gray-600 text-center">Scan this QR code with Google Authenticator or any TOTP app.<br/>Account: <span className="font-mono">{staff.username}</span></p>
                <p className="mt-1 text-xs text-gray-500">If you need the secret: <span className="font-mono">{staff.totpSecret || 'PLACEHOLDER'}</span></p>
              </div>
            )}
            <div className="w-full flex justify-end">
            <button
                className="text-blue-600 underline text-[10px] hover:text-orange-600 mt-2"
              type="button"
              onClick={() => setShowQR(v => !v)}
                style={{ position: 'absolute', right: '1.5rem', bottom: '1.5rem' }}
            >
              {showQR ? 'Hide Setup QR Code' : 'Show QR code for setup'}
            </button>
            </div>
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
              {loading && <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>}
              Login
            </button>
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