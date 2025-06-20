"use client"
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 10;

export default function AgentLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const lockout = localStorage.getItem('agentLockout');
    if (lockout) {
      const until = parseInt(lockout, 10);
      const now = Date.now();
      if (now < until) {
        setLocked(true);
        setTimeLeft(Math.ceil((until - now) / 1000));
        const interval = setInterval(() => {
          const left = Math.ceil((until - Date.now()) / 1000);
          setTimeLeft(left > 0 ? left : 0);
          if (left <= 0) {
            setLocked(false);
            localStorage.removeItem('agentLockout');
            localStorage.removeItem('agentAttempts');
            clearInterval(interval);
          }
        }, 1000);
        return () => clearInterval(interval);
      } else {
        localStorage.removeItem('agentLockout');
        localStorage.removeItem('agentAttempts');
      }
    }
  }, []);

  const handleLogin = () => {
    if (locked) return;
    if (password === 'admin123') {
      localStorage.setItem('isAgent', 'true');
      localStorage.removeItem('agentAttempts');
      localStorage.removeItem('agentLockout');
      router.push('/agent/dashboard');
    } else {
      let attempts = parseInt(localStorage.getItem('agentAttempts') || '0', 10) + 1;
      localStorage.setItem('agentAttempts', attempts.toString());
      if (attempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
        localStorage.setItem('agentLockout', until.toString());
        setLocked(true);
        setTimeLeft(LOCKOUT_MINUTES * 60);
        setError(`Too many failed attempts. Locked for ${LOCKOUT_MINUTES} minutes.`);
      } else {
        setError(`Wrong password. Attempt ${attempts} of ${MAX_ATTEMPTS}.`);
      }
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Agent Login</h1>
      {locked ? (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          Too many failed attempts. Please try again in {Math.ceil(timeLeft/60)} minute(s) and {timeLeft%60} second(s).
        </div>
      ) : error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border w-full p-2 rounded"
        disabled={locked}
      />
      <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2 rounded mt-4 w-full" disabled={locked}>
        Login
      </button>
    </div>
  );
} 