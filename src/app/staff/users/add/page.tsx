"use client";
import React, { useState } from 'react';

export default function AddUserPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role, fullName }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`User '${data.user.username}' created successfully!`);
        setUsername('');
        setPassword('');
        setRole('staff');
        setFullName('');
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Add New User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold">Full Name</label>
          <input
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="border rounded px-3 py-2 mb-4 w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Username (one word, no spaces)</label>
          <input
            value={username}
            onChange={e => {
              setUsername(e.target.value);
              setUsernameError(/\s/.test(e.target.value) ? 'Username must be one word, no spaces' : '');
            }}
            className="border rounded px-3 py-2 mb-4 w-full"
            required
          />
          {usernameError && <div className="text-red-600 mb-2">{usernameError}</div>}
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="staff">Sales & Marketing</option>
            <option value="accountant">Accountant</option>
            <option value="transport-officer">Transport Officer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add User'}
        </button>
        {message && <div className="text-green-600 font-medium">{message}</div>}
        {error && <div className="text-red-600 font-medium">{error}</div>}
      </form>
    </div>
  );
} 