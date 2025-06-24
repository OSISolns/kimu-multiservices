"use client"
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { QRCodeCanvas } from 'qrcode.react';

const ISSUER = 'KIMU Transport';

export default function AgentLogin() {
  const [step, setStep] = useState<'credentials' | 'code'>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState<{ username: string; totpSecret: string | null } | null>(null);
  const [showQR, setShowQR] = useState(false);
  const router = useRouter();

  // Step 1: Handle credentials submit
  const handleCredentials = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/agent/login', {
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
      setAgent(data);
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
        localStorage.setItem('isAgent', 'true');
        router.push('/agent/dashboard');
      } else {
        setError('Invalid code. Please try again.');
      }
    } catch (e) {
      setError('Error verifying code.');
    }
    setLoading(false);
  };

  // Generate otpauth URL for QR code (if agent and no secret)
  const otpauthUrl = agent && !agent.totpSecret
    ? `otpauth://totp/${encodeURIComponent(ISSUER)}:${encodeURIComponent(agent.username)}?secret=PLACEHOLDER&issuer=${encodeURIComponent(ISSUER)}`
    : agent && agent.totpSecret
    ? `otpauth://totp/${encodeURIComponent(ISSUER)}:${encodeURIComponent(agent.username)}?secret=${agent.totpSecret}&issuer=${encodeURIComponent(ISSUER)}`
    : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center">
        <Image src="/logo.png" alt="KIMU Logo" width={70} height={70} className="mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-orange-600">KIMU Agent Login</h1>
        {step === 'credentials' && (
          <>
            <p className="mb-6 text-gray-500 text-sm text-center">Enter your agent username and password to continue.</p>
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded mb-4 w-full flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" /></svg>
                <span>{error}</span>
              </div>
            )}
            <input
              type="text"
              placeholder="Agent username"
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
              onClick={handleCredentials}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg w-full font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              disabled={loading || !username || !password}
            >
              {loading && <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>}
              Next
            </button>
          </>
        )}
        {step === 'code' && agent && (
          <>
            <p className="mb-6 text-gray-500 text-sm text-center">Enter the 6-digit code from your Google Authenticator app.</p>
            {(!agent.totpSecret || showQR) && (
              <div className="mb-6 flex flex-col items-center">
                <QRCodeCanvas value={otpauthUrl} size={180} />
                <p className="mt-2 text-xs text-gray-600 text-center">Scan this QR code with Google Authenticator or any TOTP app.<br/>Account: <span className="font-mono">{agent.username}</span></p>
                <p className="mt-1 text-xs text-gray-500">If you need the secret: <span className="font-mono">{agent.totpSecret || 'PLACEHOLDER'}</span></p>
              </div>
            )}
            <button
              className="mb-4 text-blue-600 underline text-sm hover:text-orange-600"
              onClick={() => setShowQR(v => !v)}
            >
              {showQR ? 'Hide Setup QR Code' : 'Show QR code for setup'}
            </button>
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
              onClick={handleLogin}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg w-full font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>}
              Login
            </button>
            <button
              className="mt-4 text-sm text-gray-500 underline"
              onClick={() => { setStep('credentials'); setCode(''); setError(''); }}
            >
              Back to credentials
            </button>
            <div className="mt-6 text-xs text-gray-500 text-center">
              Need help? Contact your administrator.<br/>
              Powered by Google Authenticator (TOTP)
            </div>
          </>
        )}
      </div>
    </div>
  );
} 