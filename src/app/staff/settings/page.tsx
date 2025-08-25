'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/UserContext';
import { FaUser, FaShieldAlt, FaBell, FaMobile, FaDesktop, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';

interface UserProfile {
  id: number;
  username: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  department: string | null;
  profilePicture: string | null;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
}

interface TrustedDevice {
  id: number;
  deviceName: string;
  deviceType: string;
  lastUsed: string;
  ipAddress: string;
  userAgent: string;
}

export default function SettingsPage() {
  const { user, isLoading: userLoading, resetInactivityTimer } = useUser();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    emailNotifications: true,
    whatsappNotifications: true
  });

  const fetchUserProfile = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      const response = await fetch(`/api/users/${currentUser.id}`);
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
        setProfileForm({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          emailNotifications: userData.emailNotifications || false,
          whatsappNotifications: userData.whatsappNotifications || false
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [currentUser?.id]);

  const fetchTrustedDevices = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      const response = await fetch(`/api/trusted-devices?userId=${currentUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setTrustedDevices(data.devices || []);
      }
    } catch (error) {
      console.error('Error fetching trusted devices:', error);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (user && !userLoading) {
      setCurrentUser(user);
      setLoading(false);
    }
  }, [user, userLoading]);

  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
      fetchTrustedDevices();
    }
  }, [currentUser, fetchUserProfile, fetchTrustedDevices]);

  // Reset inactivity timer on user activity
  useEffect(() => {
    const handleActivity = () => {
      if (user) {
        resetInactivityTimer();
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, resetInactivityTimer]);

  const handleProfileUpdate = async () => {
    if (!currentUser?.id) return;
    
    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setCurrentUser(updatedUser);
        setEditingProfile(false);
        // Update the global user context
        // This would typically be done through a context update function
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const removeTrustedDevice = async (deviceId: number) => {
    try {
      const response = await fetch(`/api/trusted-devices/${deviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTrustedDevices(prev => prev.filter(device => device.id !== deviceId));
      }
    } catch (error) {
      console.error('Error removing trusted device:', error);
    }
  };

  if (userLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    router.push('/staff/login');
    return null;
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile': return <FaMobile className="text-blue-600" />;
      case 'desktop': return <FaDesktop className="text-green-600" />;
      case 'tablet': return <FaMobile className="text-purple-600" />;
      default: return <FaDesktop className="text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings, preferences, and security.
          </p>
        </div>

    <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaUser className="text-blue-600 text-xl" />
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                </div>
                {!editingProfile && (
              <button
                    onClick={() => setEditingProfile(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaEdit className="mr-2" />
                    Edit
                </button>
              )}
        </div>
      </div>

            <div className="p-6">
              {editingProfile ? (
                <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
            <input
              type="text"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
            <input
              type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
            <input
              type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
            <input
              type="text"
                        value={currentUser?.role || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
          </div>
                  
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
            <input
                        type="checkbox"
                        checked={profileForm.emailNotifications}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Email Notifications</span>
                    </label>
                    <label className="flex items-center">
            <input
                        type="checkbox"
                        checked={profileForm.whatsappNotifications}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, whatsappNotifications: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">WhatsApp Notifications</span>
                    </label>
    </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleProfileUpdate}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaSave className="mr-2" />
                      Save Changes
                    </button>
            <button 
                      onClick={() => {
                        setEditingProfile(false);
                        setProfileForm({
                          fullName: currentUser?.fullName || '',
                          email: currentUser?.email || '',
                          phone: currentUser?.phone || '',
                          emailNotifications: currentUser?.emailNotifications || false,
                          whatsappNotifications: currentUser?.whatsappNotifications || false
                        });
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      <FaTimes className="mr-2" />
                      Cancel
            </button>
          </div>
        </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="mt-1 text-sm text-gray-900">{currentUser?.fullName || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-sm text-gray-900">{currentUser?.email || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="mt-1 text-sm text-gray-900">{currentUser?.phone || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Role</h3>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{currentUser?.role}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email Notifications</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {currentUser?.emailNotifications ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
          <div>
                    <h3 className="text-sm font-medium text-gray-500">WhatsApp Notifications</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {currentUser?.whatsappNotifications ? 'Enabled' : 'Disabled'}
                    </p>
            </div>
          </div>
              )}
            </div>
          </div>
          
          {/* Trusted Devices */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <FaShieldAlt className="text-green-600 text-xl" />
                <h2 className="text-lg font-semibold text-gray-900">Trusted Devices</h2>
              </div>
            </div>
            
            <div className="p-6">
              {trustedDevices.length > 0 ? (
                <div className="space-y-4">
                  {trustedDevices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {getDeviceIcon(device.deviceType)}
                        </div>
          <div>
                          <h3 className="font-medium text-gray-900">{device.deviceName}</h3>
                          <p className="text-sm text-gray-500">{device.deviceType}</p>
                          <p className="text-xs text-gray-400">
                            Last used: {new Date(device.lastUsed).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">IP: {device.ipAddress}</p>
            </div>
          </div>
          
          <button
                        onClick={() => removeTrustedDevice(device.id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        title="Remove trusted device"
                      >
                        <FaTrash className="mr-2" />
                        Remove
          </button>
        </div>
                  ))}
            </div>
              ) : (
                <div className="text-center py-8">
                  <FaShieldAlt className="text-gray-400 text-4xl mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No trusted devices</h3>
                  <p className="text-gray-500">
                    Trusted devices will appear here when you log in from new locations.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <FaShieldAlt className="text-red-600 text-xl" />
                <h2 className="text-lg font-semibold text-gray-900">Security</h2>
      </div>
    </div>
            
            <div className="p-6">
              <div className="space-y-4">
          <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">Secure your account with TOTP</p>
        </div>
          <button
                    onClick={() => router.push('/staff/settings/2fa')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Configure
          </button>
        </div>
        
                <div className="flex items-center justify-between">
              <div>
                    <h3 className="text-sm font-medium text-gray-900">Password Change</h3>
                    <p className="text-sm text-gray-500">Update your account password</p>
              </div>
                  <button
                    onClick={() => router.push('/staff/settings/password')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Change
                  </button>
          </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 