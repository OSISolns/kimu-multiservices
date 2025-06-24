'use client';

import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function Settings() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // User management state
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [showTotpUser, setShowTotpUser] = useState<any | null>(null);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [deleteUser, setDeleteUser] = useState<any | null>(null);
  const [addUserOpen, setAddUserOpen] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Kimu@2025') {
      setUnlocked(true);
      setError('');
    } else {
      setError('Incorrect password.');
    }
  };

  // Fetch users on unlock
  useEffect(() => {
    if (unlocked) {
      setLoading(true);
      fetch('/api/users')
        .then(res => res.json())
        .then(data => {
          setUsers(data);
          setLoading(false);
        })
        .catch(() => {
          setFetchError('Failed to load users.');
          setLoading(false);
        });
    }
  }, [unlocked]);

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4 text-orange-600">Agent Settings</h1>
          <p className="mb-6 text-gray-500 text-sm text-center">This page is protected. Please enter the password to continue.</p>
          <form onSubmit={handleUnlock} className="w-full flex flex-col gap-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="border w-full p-3 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg"
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m1.664-2.664A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125 4.575m-1.664 2.664A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6 0a6 6 0 1112 0 6 6 0 01-12 0z" /></svg>
                )}
              </button>
            </div>
            {error && <div className="bg-red-100 text-red-700 p-2 rounded text-center text-sm">{error}</div>}
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-3 rounded-lg w-full font-semibold hover:bg-blue-700 transition-colors"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      {loading ? (
        <div className="text-gray-500">Loading users...</div>
      ) : fetchError ? (
        <div className="text-red-500">{fetchError}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-blue-50 text-left">
                <th className="py-2 px-4">Username</th>
                <th className="py-2 px-4">Role</th>
                <th className="py-2 px-4">Created</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b">
                  <td className="py-2 px-4 font-mono">{user.username}</td>
                  <td className="py-2 px-4">{user.role}</td>
                  <td className="py-2 px-4">{new Date(user.createdAt).toLocaleString()}</td>
                  <td className="py-2 px-4 flex gap-2">
                    <button className="text-blue-600 underline text-xs" onClick={() => setShowTotpUser(user)}>Show TOTP</button>
                    <button className="text-yellow-600 underline text-xs" onClick={() => setEditUser(user)}>Edit</button>
                    <button className="text-red-600 underline text-xs" onClick={() => setDeleteUser(user)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors" onClick={() => setAddUserOpen(true)}>+ Add User</button>

      {/* Show TOTP Modal */}
      {showTotpUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowTotpUser(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">TOTP Secret for {showTotpUser.username}</h3>
            {showTotpUser.totpSecret ? (
              <>
                <QRCodeCanvas value={`otpauth://totp/KIMU:${showTotpUser.username}?secret=${showTotpUser.totpSecret}&issuer=KIMU`} size={180} />
                <p className="mt-4 text-center font-mono text-lg">{showTotpUser.totpSecret}</p>
                <p className="text-xs text-gray-500 text-center mt-2">Scan QR with Google Authenticator or enter the secret manually.</p>
              </>
            ) : (
              <p className="text-red-500">No TOTP secret set for this user.</p>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setEditUser(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Edit User: {editUser.username}</h3>
            <form className="flex flex-col gap-4">
              <input type="text" className="border p-2 rounded" defaultValue={editUser.username} placeholder="Username" disabled />
              <select className="border p-2 rounded" defaultValue={editUser.role} disabled>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
              <input type="password" className="border p-2 rounded" placeholder="New Password (leave blank to keep)" disabled />
              <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold cursor-not-allowed">Save Changes (coming soon)</button>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setDeleteUser(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-red-600">Delete User</h3>
            <p>Are you sure you want to delete user <span className="font-mono">{deleteUser.username}</span>? This action cannot be undone.</p>
            <div className="flex gap-4 mt-6">
              <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold" onClick={() => setDeleteUser(null)}>Cancel</button>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold cursor-not-allowed">Delete (coming soon)</button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {addUserOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setAddUserOpen(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Add New User</h3>
            <form className="flex flex-col gap-4">
              <input type="text" className="border p-2 rounded" placeholder="Username" disabled />
              <select className="border p-2 rounded" defaultValue="agent" disabled>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
              <input type="password" className="border p-2 rounded" placeholder="Password" disabled />
              <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold cursor-not-allowed">Create User (coming soon)</button>
            </form>
          </div>
        </div>
      )}

      <hr className="my-8" />
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>
      <form className="max-w-md flex flex-col gap-4 mb-8">
        <input type="password" placeholder="Current password" className="border p-3 rounded" disabled />
        <input type="password" placeholder="New password" className="border p-3 rounded" disabled />
        <input type="password" placeholder="Confirm new password" className="border p-3 rounded" disabled />
        <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold cursor-not-allowed">Change Password (coming soon)</button>
      </form>

      <hr className="my-8" />
      <h2 className="text-xl font-semibold mb-4">TOTP (2FA) Setup</h2>
      <div className="mb-8">
        <p className="text-gray-600 mb-2">Set up or reset your Google Authenticator (TOTP) code for extra security.</p>
        <button className="bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold cursor-not-allowed">Show QR Code / Reset (coming soon)</button>
      </div>

      <hr className="my-8" />
      <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
      <div className="mb-8">
        <p className="text-gray-600">Username: <span className="font-mono">(coming soon)</span></p>
        <p className="text-gray-600">Role: <span className="font-mono">(coming soon)</span></p>
        <button className="mt-2 bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold cursor-not-allowed">Edit Profile (coming soon)</button>
      </div>

      <hr className="my-8" />
      <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
      <div className="mb-8">
        <label className="flex items-center gap-2 mb-2">
          <input type="checkbox" disabled className="accent-blue-600" /> Email Notifications (coming soon)
        </label>
        <label className="flex items-center gap-2 mb-2">
          <input type="checkbox" disabled className="accent-green-600" /> WhatsApp Notifications (coming soon)
        </label>
      </div>

      <hr className="my-8" />
      <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
      <div className="mb-8">
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold cursor-not-allowed">Delete My Account (coming soon)</button>
        <button className="ml-4 bg-red-400 text-white px-4 py-2 rounded-lg font-semibold cursor-not-allowed">Reset All Agent Data (admin only, coming soon)</button>
      </div>
    </div>
  );
} 