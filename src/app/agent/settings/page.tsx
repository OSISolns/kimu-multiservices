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

  // Add state for Add User modal
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('agent');
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState('');
  const [addUserSuccess, setAddUserSuccess] = useState('');

  // Change Password state
  const [changePwCurrentPassword, setChangePwCurrentPassword] = useState('');
  const [changePwNewPassword, setChangePwNewPassword] = useState('');
  const [changePwConfirmPassword, setChangePwConfirmPassword] = useState('');
  const [changePwLoading, setChangePwLoading] = useState(false);
  const [changePwError, setChangePwError] = useState('');
  const [changePwSuccess, setChangePwSuccess] = useState('');

  // TOTP Setup state
  const [totpLoading, setTotpLoading] = useState(false);
  const [totpError, setTotpError] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [totpOtpauth, setTotpOtpauth] = useState('');
  const [showTotpSetup, setShowTotpSetup] = useState(false);

  // Edit Profile state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editUsername, setEditUsername] = useState(users[0]?.username || '');
  const [editRole, setEditRole] = useState(users[0]?.role || 'agent');
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [editProfileError, setEditProfileError] = useState('');
  const [editProfileSuccess, setEditProfileSuccess] = useState('');

  // Notification Preferences state
  const [emailNotifications, setEmailNotifications] = useState(users[0]?.emailNotifications || false);
  const [whatsappNotifications, setWhatsappNotifications] = useState(users[0]?.whatsappNotifications || false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState('');
  const [notifSuccess, setNotifSuccess] = useState('');

  // Delete Account state
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState('');

  // Reset Agent Data state
  const [resetAgentsOpen, setResetAgentsOpen] = useState(false);
  const [resetAgentsLoading, setResetAgentsLoading] = useState(false);
  const [resetAgentsError, setResetAgentsError] = useState('');
  const [resetAgentsSuccess, setResetAgentsSuccess] = useState('');

  // Edit User Modal state
  const [editUserModal, setEditUserModal] = useState<any | null>(null);
  const [editUserUsername, setEditUserUsername] = useState('');
  const [editUserRole, setEditUserRole] = useState('agent');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserError, setEditUserError] = useState('');
  const [editUserSuccess, setEditUserSuccess] = useState('');

  // Delete User Modal state
  const [deleteUserModal, setDeleteUserModal] = useState<any | null>(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);
  const [deleteUserError, setDeleteUserError] = useState('');

  // DB Backup state
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupError, setBackupError] = useState('');
  const [backupSuccess, setBackupSuccess] = useState('');
  const [showBackupModal, setShowBackupModal] = useState(false);

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
          setUsers(Array.isArray(data.users) ? data.users : []);
          setLoading(false);
        })
        .catch(() => {
          setFetchError('Failed to load users.');
          setLoading(false);
        });
    }
  }, [unlocked]);

  // Sync state with users[0] when users change
  useEffect(() => {
    setEmailNotifications(users[0]?.emailNotifications || false);
    setWhatsappNotifications(users[0]?.whatsappNotifications || false);
  }, [users]);

  // Add user handler
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserLoading(true);
    setAddUserError('');
    setAddUserSuccess('');
    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddUserSuccess(`User '${data.user.username}' created!`);
        setNewUsername('');
        setNewPassword('');
        setNewRole('agent');
        // Refresh user list
        fetch('/api/users')
          .then(res => res.json())
          .then(data => setUsers(Array.isArray(data.users) ? data.users : []));
        setTimeout(() => {
          setAddUserOpen(false);
          setAddUserSuccess('');
        }, 1200);
      } else {
        setAddUserError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setAddUserError('Network error');
    } finally {
      setAddUserLoading(false);
    }
  };

  // Change Password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePwError('');
    setChangePwSuccess('');
    if (changePwNewPassword !== changePwConfirmPassword) {
      setChangePwError('New passwords do not match');
      return;
    }
    setChangePwLoading(true);
    try {
      const username = users[0]?.username;
      if (!username) {
        setChangePwError('No user selected');
        setChangePwLoading(false);
        return;
      }
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, currentPassword: changePwCurrentPassword, newPassword: changePwNewPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setChangePwSuccess('Password changed successfully!');
        setChangePwCurrentPassword('');
        setChangePwNewPassword('');
        setChangePwConfirmPassword('');
      } else {
        setChangePwError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setChangePwError('Network error');
    } finally {
      setChangePwLoading(false);
    }
  };

  const handleTotpSetup = async () => {
    setTotpLoading(true);
    setTotpError('');
    setTotpSecret('');
    setTotpOtpauth('');
    try {
      const username = users[0]?.username;
      if (!username) {
        setTotpError('No user selected');
        setTotpLoading(false);
        return;
      }
      const res = await fetch('/api/users/totp-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (res.ok) {
        setTotpSecret(data.secret);
        setTotpOtpauth(data.otpauth_url);
        setShowTotpSetup(true);
      } else {
        setTotpError(data.error || 'Failed to generate TOTP secret');
      }
    } catch (err) {
      setTotpError('Network error');
    } finally {
      setTotpLoading(false);
    }
  };

  const handleEditProfileOpen = () => {
    setEditUsername(users[0]?.username || '');
    setEditRole(users[0]?.role || 'agent');
    setEditProfileError('');
    setEditProfileSuccess('');
    setEditProfileOpen(true);
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditProfileLoading(true);
    setEditProfileError('');
    setEditProfileSuccess('');
    try {
      const username = users[0]?.username;
      if (!username) {
        setEditProfileError('No user selected');
        setEditProfileLoading(false);
        return;
      }
      const res = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, newUsername: editUsername, newRole: editRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditProfileSuccess('Profile updated!');
        // Refresh user list
        fetch('/api/users')
          .then(res => res.json())
          .then(data => setUsers(Array.isArray(data.users) ? data.users : []));
        setTimeout(() => {
          setEditProfileOpen(false);
          setEditProfileSuccess('');
        }, 1200);
      } else {
        setEditProfileError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setEditProfileError('Network error');
    } finally {
      setEditProfileLoading(false);
    }
  };

  const handleNotifChange = async (type: 'email' | 'whatsapp', value: boolean) => {
    setNotifLoading(true);
    setNotifError('');
    setNotifSuccess('');
    try {
      const username = users[0]?.username;
      if (!username) {
        setNotifError('No user selected');
        setNotifLoading(false);
        return;
      }
      const res = await fetch('/api/users/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          emailNotifications: type === 'email' ? value : emailNotifications,
          whatsappNotifications: type === 'whatsapp' ? value : whatsappNotifications,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotifSuccess('Preferences updated!');
        setEmailNotifications(data.emailNotifications);
        setWhatsappNotifications(data.whatsappNotifications);
      } else {
        setNotifError(data.error || 'Failed to update preferences');
      }
    } catch (err) {
      setNotifError('Network error');
    } finally {
      setNotifLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteAccountLoading(true);
    setDeleteAccountError('');
    try {
      const username = users[0]?.username;
      if (!username) {
        setDeleteAccountError('No user selected');
        setDeleteAccountLoading(false);
        return;
      }
      const res = await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (res.ok) {
        // Optionally, log out or redirect
        window.location.href = '/logout';
      } else {
        const data = await res.json();
        setDeleteAccountError(data.error || 'Failed to delete account');
      }
    } catch (err) {
      setDeleteAccountError('Network error');
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  const handleResetAgents = async () => {
    setResetAgentsLoading(true);
    setResetAgentsError('');
    setResetAgentsSuccess('');
    try {
      const username = users[0]?.username;
      if (!username) {
        setResetAgentsError('No user selected');
        setResetAgentsLoading(false);
        return;
      }
      const res = await fetch('/api/agents/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (res.ok) {
        setResetAgentsSuccess('All agent data has been reset!');
        // Refresh user list
        fetch('/api/users')
          .then(res => res.json())
          .then(data => setUsers(Array.isArray(data.users) ? data.users : []));
        setTimeout(() => {
          setResetAgentsOpen(false);
          setResetAgentsSuccess('');
        }, 1500);
      } else {
        const data = await res.json();
        setResetAgentsError(data.error || 'Failed to reset agent data');
      }
    } catch (err) {
      setResetAgentsError('Network error');
    } finally {
      setResetAgentsLoading(false);
    }
  };

  // Open Edit User Modal
  const handleOpenEditUser = (user: any) => {
    setEditUserModal(user);
    setEditUserUsername(user.username);
    setEditUserRole(user.role);
    setEditUserPassword('');
    setEditUserError('');
    setEditUserSuccess('');
  };

  // Save Edit User
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditUserLoading(true);
    setEditUserError('');
    setEditUserSuccess('');
    try {
      const res = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editUserModal.id,
          username: editUserModal.username,
          newUsername: editUserUsername,
          newRole: editUserRole,
          newPassword: editUserPassword || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditUserSuccess('User updated!');
        // Refresh user list
        fetch('/api/users')
          .then(res => res.json())
          .then(data => setUsers(Array.isArray(data.users) ? data.users : []));
        setTimeout(() => {
          setEditUserModal(null);
          setEditUserSuccess('');
        }, 1200);
      } else {
        setEditUserError(data.error || 'Failed to update user');
      }
    } catch (err) {
      setEditUserError('Network error');
    } finally {
      setEditUserLoading(false);
    }
  };

  // Open Delete User Modal
  const handleOpenDeleteUser = (user: any) => {
    setDeleteUserModal(user);
    setDeleteUserError('');
  };

  // Delete User handler
  const handleDeleteUser = async () => {
    setDeleteUserLoading(true);
    setDeleteUserError('');
    try {
      const username = deleteUserModal?.username;
      if (!username) {
        setDeleteUserError('No user selected');
        setDeleteUserLoading(false);
        return;
      }
      const res = await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (res.ok) {
        // Refresh user list
        fetch('/api/users')
          .then(res => res.json())
          .then(data => setUsers(Array.isArray(data.users) ? data.users : []));
        setTimeout(() => {
          setDeleteUserModal(null);
          setDeleteUserError('');
        }, 1200);
      } else {
        const data = await res.json();
        setDeleteUserError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setDeleteUserError('Network error');
    } finally {
      setDeleteUserLoading(false);
    }
  };

  // DB Backup handler
  const handleBackup = async () => {
    setBackupLoading(true);
    setBackupError('');
    setBackupSuccess('');
    try {
      const res = await fetch('/api/system-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'Database Backup',
          details: 'Manual backup initiated from settings',
          level: 'INFO'
        }),
      });
      
      if (res.ok) {
        setBackupSuccess('Database backup completed successfully! A system log entry has been created.');
        // Log the backup activity
        await fetch('/api/activity-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'Database Backup',
            details: 'Manual backup initiated from settings page',
            userId: users[0]?.username || 'unknown',
            ipAddress: '127.0.0.1'
          }),
        });
      } else {
        setBackupError('Failed to create backup log entry');
      }
    } catch (err) {
      setBackupError('Network error during backup');
    } finally {
      setBackupLoading(false);
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center">
          <img src="/logo.png" alt="Company Logo" className="h-16 mb-4" />
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
                <tr key={user.id ?? user.username} className="border-b">
                  <td className="py-2 px-4 font-mono">{user.username}</td>
                  <td className="py-2 px-4">{user.role}</td>
                  <td className="py-2 px-4">{new Date(user.createdAt).toLocaleString()}</td>
                  <td className="py-2 px-4 flex gap-2">
                    <button className="text-blue-600 underline text-xs" onClick={() => setShowTotpUser(user)}>Show TOTP</button>
                    <button className="text-yellow-600 underline text-xs" onClick={() => handleOpenEditUser(user)}>Edit</button>
                    <button className="text-red-600 underline text-xs" onClick={() => handleOpenDeleteUser(user)}>Delete</button>
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
      {editUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setEditUserModal(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Edit User: {editUserModal.username}</h3>
            <form className="flex flex-col gap-4" onSubmit={handleEditUser}>
              <input
                type="text"
                className="border p-2 rounded"
                value={editUserUsername}
                onChange={e => setEditUserUsername(e.target.value)}
                required
                disabled={editUserLoading}
              />
              <select
                className="border p-2 rounded"
                value={editUserRole}
                onChange={e => setEditUserRole(e.target.value)}
                disabled={editUserLoading}
              >
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="password"
                className="border p-2 rounded"
                placeholder="New Password (leave blank to keep)"
                value={editUserPassword}
                onChange={e => setEditUserPassword(e.target.value)}
                disabled={editUserLoading}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={editUserLoading}
              >
                {editUserLoading ? 'Saving...' : 'Save Changes'}
              </button>
              {editUserSuccess && <div className="text-green-600 font-medium text-center">{editUserSuccess}</div>}
              {editUserError && <div className="text-red-600 font-medium text-center">{editUserError}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setDeleteUserModal(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-red-600">Delete User</h3>
            <p>Are you sure you want to delete user <span className="font-mono">{deleteUserModal.username}</span>? This action cannot be undone.</p>
            {deleteUserError && <div className="text-red-600 font-medium mt-2">{deleteUserError}</div>}
            <div className="flex gap-4 mt-6">
              <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold" onClick={() => setDeleteUserModal(null)}>Cancel</button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                onClick={handleDeleteUser}
                disabled={deleteUserLoading}
              >
                {deleteUserLoading ? 'Deleting...' : 'Delete'}
              </button>
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
            <form className="flex flex-col gap-4" onSubmit={handleAddUser}>
              <input
                type="text"
                className="border p-2 rounded"
                placeholder="Username"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                required
                disabled={addUserLoading}
              />
              <select
                className="border p-2 rounded"
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                disabled={addUserLoading}
              >
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="password"
                className="border p-2 rounded"
                placeholder="Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                disabled={addUserLoading}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={addUserLoading}
              >
                {addUserLoading ? 'Creating...' : 'Create User'}
              </button>
              {addUserSuccess && <div className="text-green-600 font-medium text-center">{addUserSuccess}</div>}
              {addUserError && <div className="text-red-600 font-medium text-center">{addUserError}</div>}
            </form>
          </div>
        </div>
      )}

      <hr className="my-8" />
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>
      <form className="max-w-md flex flex-col gap-4 mb-8" onSubmit={handleChangePassword}>
        <input
          type="password"
          placeholder="Current password"
          className="border p-3 rounded"
          value={changePwCurrentPassword}
          onChange={e => setChangePwCurrentPassword(e.target.value)}
          required
          disabled={changePwLoading}
        />
        <input
          type="password"
          placeholder="New password"
          className="border p-3 rounded"
          value={changePwNewPassword}
          onChange={e => setChangePwNewPassword(e.target.value)}
          required
          disabled={changePwLoading}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          className="border p-3 rounded"
          value={changePwConfirmPassword}
          onChange={e => setChangePwConfirmPassword(e.target.value)}
          required
          disabled={changePwLoading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={changePwLoading}
        >
          {changePwLoading ? 'Changing...' : 'Change Password'}
        </button>
        {changePwSuccess && <div className="text-green-600 font-medium text-center">{changePwSuccess}</div>}
        {changePwError && <div className="text-red-600 font-medium text-center">{changePwError}</div>}
      </form>

      <hr className="my-8" />
      <h2 className="text-xl font-semibold mb-4">TOTP (2FA) Setup</h2>
      <div className="mb-8">
        <p className="text-gray-600 mb-2">Set up or reset your Google Authenticator (TOTP) code for extra security.</p>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          onClick={handleTotpSetup}
          disabled={totpLoading}
        >
          {totpLoading ? 'Generating...' : 'Show QR Code / Reset'}
        </button>
        {totpError && <div className="text-red-600 font-medium mt-2">{totpError}</div>}
      </div>

      {/* TOTP Setup Modal */}
      {showTotpSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowTotpSetup(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">TOTP Setup</h3>
            {totpOtpauth ? (
              <>
                <QRCodeCanvas value={totpOtpauth} size={180} />
                <p className="mt-4 text-center font-mono text-lg">{totpSecret}</p>
                <p className="text-xs text-gray-500 text-center mt-2">Scan QR with Google Authenticator or enter the secret manually.</p>
              </>
            ) : (
              <p className="text-red-500">No TOTP secret generated.</p>
            )}
          </div>
        </div>
      )}

      <hr className="my-8" />
      <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
      <div className="mb-8">
        <p className="text-gray-600">Username: <span className="font-mono">{users[0]?.username || '(unknown)'}</span></p>
        <p className="text-gray-600">Role: <span className="font-mono">{users[0]?.role || '(unknown)'}</span></p>
        <button
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          onClick={handleEditProfileOpen}
        >
          Edit Profile
        </button>
      </div>

      {/* Edit Profile Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setEditProfileOpen(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
            <form className="flex flex-col gap-4" onSubmit={handleEditProfile}>
              <input
                type="text"
                className="border p-2 rounded"
                placeholder="Username"
                value={editUsername}
                onChange={e => setEditUsername(e.target.value)}
                required
                disabled={editProfileLoading}
              />
              {/* Only allow role change if current user is admin */}
              {users[0]?.role === 'admin' && (
                <select
                  className="border p-2 rounded"
                  value={editRole}
                  onChange={e => setEditRole(e.target.value)}
                  disabled={editProfileLoading}
                >
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                </select>
              )}
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={editProfileLoading}
              >
                {editProfileLoading ? 'Saving...' : 'Save Changes'}
              </button>
              {editProfileSuccess && <div className="text-green-600 font-medium text-center">{editProfileSuccess}</div>}
              {editProfileError && <div className="text-red-600 font-medium text-center">{editProfileError}</div>}
            </form>
          </div>
        </div>
      )}

      <hr className="my-8" />
      <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
      <div className="mb-8">
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={e => handleNotifChange('email', e.target.checked)}
            disabled={notifLoading}
            className="accent-blue-600"
          />
          Email Notifications
        </label>
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={whatsappNotifications}
            onChange={e => handleNotifChange('whatsapp', e.target.checked)}
            disabled={notifLoading}
            className="accent-green-600"
          />
          WhatsApp Notifications
        </label>
        {notifSuccess && <div className="text-green-600 font-medium mt-2">{notifSuccess}</div>}
        {notifError && <div className="text-red-600 font-medium mt-2">{notifError}</div>}
      </div>

      <hr className="my-8" />
      <h2 className="text-xl font-semibold mb-4">Database Management</h2>
      <div className="mb-8">
        <p className="text-gray-600 mb-4">Create a backup of the database and log the action for audit purposes.</p>
        <div className="flex flex-wrap gap-4">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            onClick={handleBackup}
            disabled={backupLoading}
          >
            {backupLoading ? 'Creating Backup...' : 'Create Database Backup'}
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            onClick={() => setShowBackupModal(true)}
          >
            View Backup History
          </button>
        </div>
        {backupSuccess && <div className="text-green-600 font-medium mt-2">{backupSuccess}</div>}
        {backupError && <div className="text-red-600 font-medium mt-2">{backupError}</div>}
      </div>

      {/* Backup History Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl w-full relative max-h-[80vh] overflow-y-auto">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowBackupModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Database Backup History</h3>
            <p className="text-gray-600 mb-4">Recent database backup activities and system logs.</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> This feature creates system log entries for backup activities. 
                For actual database backup files, please contact your system administrator.
              </p>
            </div>
            <div className="mt-4">
              <a 
                href="/admin/system-logs" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View System Logs
              </a>
            </div>
          </div>
        </div>
      )}

      <hr className="my-8" />
      <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
      <div className="mb-8 flex flex-wrap gap-4">
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          onClick={() => setDeleteAccountOpen(true)}
        >
          Delete My Account
        </button>
        <button
          className={`bg-red-400 text-white px-4 py-2 rounded-lg font-semibold ${users[0]?.role === 'admin' ? 'hover:bg-red-500 transition-colors' : 'cursor-not-allowed'}`}
          disabled={users[0]?.role !== 'admin'}
          onClick={() => users[0]?.role === 'admin' && setResetAgentsOpen(true)}
        >
          Reset All Agent Data (admin only)
        </button>
      </div>
      {/* Delete Account Modal */}
      {deleteAccountOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setDeleteAccountOpen(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-red-600">Delete My Account</h3>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            {deleteAccountError && <div className="text-red-600 font-medium mt-2">{deleteAccountError}</div>}
            <div className="flex gap-4 mt-6">
              <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold" onClick={() => setDeleteAccountOpen(false)}>Cancel</button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
                onClick={handleDeleteAccount}
                disabled={deleteAccountLoading}
              >
                {deleteAccountLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reset Agent Data Modal */}
      {resetAgentsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setResetAgentsOpen(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-red-600">Reset All Agent Data</h3>
            <p>Are you sure you want to delete all agent accounts? This action cannot be undone. (Admins will not be deleted.)</p>
            {resetAgentsError && <div className="text-red-600 font-medium mt-2">{resetAgentsError}</div>}
            {resetAgentsSuccess && <div className="text-green-600 font-medium mt-2">{resetAgentsSuccess}</div>}
            <div className="flex gap-4 mt-6">
              <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold" onClick={() => setResetAgentsOpen(false)}>Cancel</button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
                onClick={handleResetAgents}
                disabled={resetAgentsLoading}
              >
                {resetAgentsLoading ? 'Resetting...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 