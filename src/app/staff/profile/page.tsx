"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/UserContext';
import Image from 'next/image';
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaBuilding,
    FaShieldAlt,
    FaBell,
    FaKey,
    FaEdit,
    FaSave,
    FaTimes,
    FaCalendar,
    FaChartLine,
    FaCheckCircle,
    FaExclamationCircle,
    FaClock,
    FaCamera,
    FaUsers,
    FaFileAlt,
    FaMoneyBillWave,
    FaCar,
} from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';

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
    status: string;
    createdAt: string;
    lastLogin: string | null;
}

interface AccountStats {
    totalQuotes?: number;
    totalLeads?: number;
    conversionRate?: number;
    totalUsers?: number;
    systemLogs?: number;
    transactionsProcessed?: number;
    reportsGenerated?: number;
    vehiclesManaged?: number;
    bookingsHandled?: number;
    accountAge?: number;
    totalLogins?: number;
}

export default function ProfilePage() {
    const { user, isLoading: userLoading } = useUser();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<AccountStats>({});
    const [loading, setLoading] = useState(true);
    const [editingProfile, setEditingProfile] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [profileForm, setProfileForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        department: '',
        emailNotifications: true,
        whatsappNotifications: true,
    });

    const fetchProfile = useCallback(async () => {
        if (!user?.id) return;

        try {
            const response = await fetch(`/api/users/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
                setProfileForm({
                    fullName: data.fullName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    department: data.department || '',
                    emailNotifications: data.emailNotifications || false,
                    whatsappNotifications: data.whatsappNotifications || false,
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const fetchStats = useCallback(async () => {
        if (!user?.id || !profile) return;

        try {
            // Fetch role-specific statistics
            const accountAge = profile.createdAt
                ? Math.floor((new Date().getTime() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))
                : 0;

            const baseStats: AccountStats = {
                accountAge,
                totalLogins: 0, // This would come from activity logs
            };

            // Role-specific stats
            if (user.role === 'admin') {
                const [usersRes, logsRes] = await Promise.all([
                    fetch('/api/users', { headers: { 'x-username': user.username } }),
                    fetch('/api/system-logs'),
                ]);

                const usersData = usersRes.ok ? await usersRes.json() : { users: [] };
                const logsData = logsRes.ok ? await logsRes.json() : { systemLogs: [] };

                baseStats.totalUsers = usersData.users?.length || 0;
                baseStats.systemLogs = logsData.systemLogs?.length || 0;
            } else if (user.role === 'sales-representative' || user.role === 'agent' || user.role === 'sales') {
                const [quotesRes, leadsRes] = await Promise.all([
                    fetch('/api/quotes'),
                    fetch('/api/leads'),
                ]);

                const quotesData = quotesRes.ok ? await quotesRes.json() : { quotes: [] };
                const leadsData = leadsRes.ok ? await leadsRes.json() : { leads: [] };

                baseStats.totalQuotes = quotesData.quotes?.length || 0;
                baseStats.totalLeads = leadsData.leads?.length || 0;
                baseStats.conversionRate = (baseStats.totalLeads || 0) > 0
                    ? Math.round((quotesData.quotes?.filter((q: any) => q.status === 'accepted').length / (baseStats.totalLeads || 1)) * 100)
                    : 0;
            } else if (user.role === 'accountant') {
                const [paymentsRes, reportsRes] = await Promise.all([
                    fetch('/api/payments'),
                    fetch('/api/reports'),
                ]);

                const paymentsData = paymentsRes.ok ? await paymentsRes.json() : { data: [] };

                baseStats.transactionsProcessed = paymentsData.data?.length || 0;
                baseStats.reportsGenerated = 0; // Would come from reports API
            } else if (user.role === 'transport-officer') {
                const [vehiclesRes, bookingsRes] = await Promise.all([
                    fetch('/api/vehicles'),
                    fetch('/api/bookings'),
                ]);

                const vehiclesData = vehiclesRes.ok ? await vehiclesRes.json() : { data: [] };
                const bookingsData = bookingsRes.ok ? await bookingsRes.json() : { data: [] };

                baseStats.vehiclesManaged = vehiclesData.data?.length || 0;
                baseStats.bookingsHandled = bookingsData.data?.length || 0;
            }

            setStats(baseStats);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, [user, profile]);

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/staff/login');
        } else if (user) {
            fetchProfile();
        }
    }, [user, userLoading, router, fetchProfile]);

    useEffect(() => {
        if (profile) {
            fetchStats();
        }
    }, [profile, fetchStats]);

    const handleSaveProfile = async () => {
        if (!user?.id) return;

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/users/update-profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-username': user.username,
                },
                body: JSON.stringify({
                    userId: user.id,
                    ...profileForm,
                }),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setProfile(updatedUser.user || updatedUser);
                setSuccess('Profile updated successfully!');
                setEditingProfile(false);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingProfile(false);
        setProfileForm({
            fullName: profile?.fullName || '',
            email: profile?.email || '',
            phone: profile?.phone || '',
            department: profile?.department || '',
            emailNotifications: profile?.emailNotifications || false,
            whatsappNotifications: profile?.whatsappNotifications || false,
        });
        setError('');
    };

    const getRoleBadgeStyle = (role: string) => {
        const styles: Record<string, string> = {
            'admin': 'bg-gradient-to-r from-red-500 to-red-600 text-white',
            'accountant': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
            'sales-representative': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
            'agent': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
            'sales': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
            'transport-officer': 'bg-gradient-to-r from-green-500 to-green-600 text-white',
            'manager': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
        };
        return styles[role] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    };

    const getRoleDisplayName = (role: string) => {
        const names: Record<string, string> = {
            'admin': 'Administrator',
            'accountant': 'Accountant',
            'sales-representative': 'Sales Representative',
            'agent': 'Sales Agent',
            'sales': 'Sales',
            'transport-officer': 'Transport Officer',
            'manager': 'Manager',
        };
        return names[role] || role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (userLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50/50 bg-[url('/subtle-prism.svg')] bg-cover bg-fixed flex-col flex items-center justify-center">
                <LoadingSpinner message="Loading profile..." size="lg" fullScreen={true} />
            </div>
        );
    }

    if (!user || !profile) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Success/Error Messages */}
                {success && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center gap-2">
                        <FaCheckCircle />
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2">
                        <FaExclamationCircle />
                        {error}
                    </div>
                )}

                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 backdrop-blur-sm bg-opacity-90">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-xl">
                                    {profile.profilePicture ? (
                                        <Image
                                            src={profile.profilePicture}
                                            alt={profile.fullName || profile.username}
                                            width={128}
                                            height={128}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white text-4xl font-bold">
                                            {(profile.fullName || profile.username).charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {profile.fullName || profile.username}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-md ${getRoleBadgeStyle(profile.role)}`}>
                                    {getRoleDisplayName(profile.role)}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${profile.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {profile.status === 'active' ? '● Active' : '○ Inactive'}
                                </span>

                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <FaUser className="text-gray-400" />
                                    <span>@{profile.username}</span>
                                </div>
                                {profile.department && (
                                    <div className="flex items-center gap-2">
                                        <FaBuilding className="text-gray-400" />
                                        <span>{profile.department}</span>
                                    </div>
                                )}
                                {profile.lastLogin && (
                                    <div className="flex items-center gap-2">
                                        <FaClock className="text-gray-400" />
                                        <span>Last login: {new Date(profile.lastLogin).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-90">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                        <FaUser className="text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                                </div>
                                {!editingProfile && (
                                    <button
                                        onClick={() => setEditingProfile(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                )}
                            </div>

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
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
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
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
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
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Department
                                            </label>
                                            <input
                                                type="text"
                                                value={profileForm.department}
                                                onChange={(e) => setProfileForm(prev => ({ ...prev, department: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h3 className="text-sm font-medium text-gray-700 mb-3">Notification Preferences</h3>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={profileForm.emailNotifications}
                                                    onChange={(e) => setProfileForm(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">Email Notifications</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={profileForm.whatsappNotifications}
                                                    onChange={(e) => setProfileForm(prev => ({ ...prev, whatsappNotifications: e.target.checked }))}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">WhatsApp Notifications</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={saving}
                                            className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            <FaTimes /> Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                                        <p className="text-gray-900">{profile.fullName || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                                        <p className="text-gray-900 flex items-center gap-2">
                                            <FaEnvelope className="text-gray-400" />
                                            {profile.email || 'Not set'}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                                        <p className="text-gray-900 flex items-center gap-2">
                                            <FaPhone className="text-gray-400" />
                                            {profile.phone || 'Not set'}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Department</h3>
                                        <p className="text-gray-900 flex items-center gap-2">
                                            <FaBuilding className="text-gray-400" />
                                            {profile.department || 'Not set'}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Email Notifications</h3>
                                        <p className="text-gray-900 flex items-center gap-2">
                                            <FaBell className="text-gray-400" />
                                            {profile.emailNotifications ? 'Enabled' : 'Disabled'}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">WhatsApp Notifications</h3>
                                        <p className="text-gray-900 flex items-center gap-2">
                                            <FaBell className="text-gray-400" />
                                            {profile.whatsappNotifications ? 'Enabled' : 'Disabled'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Picture Management */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-90">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                    <FaCamera className="text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Profile Picture</h2>
                            </div>
                            <ProfilePictureUpload
                                userId={profile.id}
                                currentProfilePicture={profile.profilePicture}
                                adminUsername={user.username}
                                onUploadSuccess={(newPicture) => {
                                    setProfile(prev => prev ? { ...prev, profilePicture: newPicture } : null);
                                    setSuccess('Profile picture updated successfully!');
                                    setTimeout(() => setSuccess(''), 3000);
                                }}
                                onRemoveSuccess={() => {
                                    setProfile(prev => prev ? { ...prev, profilePicture: null } : null);
                                    setSuccess('Profile picture removed successfully!');
                                    setTimeout(() => setSuccess(''), 3000);
                                }}
                            />
                        </div>
                    </div>

                    {/* Right Column - Stats & Info */}
                    <div className="space-y-6">
                        {/* Account Statistics */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-90">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                    <FaChartLine className="text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Statistics</h2>
                            </div>
                            <div className="space-y-4">
                                {/* Role-specific stats */}
                                {user.role === 'admin' && (
                                    <>
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FaUsers className="text-blue-600 text-xl" />
                                                    <span className="text-sm text-gray-700">Total Users</span>
                                                </div>
                                                <span className="text-2xl font-bold text-blue-600">{stats.totalUsers || 0}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FaFileAlt className="text-purple-600 text-xl" />
                                                    <span className="text-sm text-gray-700">System Logs</span>
                                                </div>
                                                <span className="text-2xl font-bold text-purple-600">{stats.systemLogs || 0}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {(user.role === 'sales-representative' || user.role === 'agent' || user.role === 'sales') && (
                                    <>
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FaFileAlt className="text-blue-600 text-xl" />
                                                    <span className="text-sm text-gray-700">Total Quotes</span>
                                                </div>
                                                <span className="text-2xl font-bold text-blue-600">{stats.totalQuotes || 0}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FaUsers className="text-green-600 text-xl" />
                                                    <span className="text-sm text-gray-700">Total Leads</span>
                                                </div>
                                                <span className="text-2xl font-bold text-green-600">{stats.totalLeads || 0}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FaChartLine className="text-purple-600 text-xl" />
                                                    <span className="text-sm text-gray-700">Conversion Rate</span>
                                                </div>
                                                <span className="text-2xl font-bold text-purple-600">{stats.conversionRate || 0}%</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {user.role === 'accountant' && (
                                    <>
                                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FaMoneyBillWave className="text-green-600 text-xl" />
                                                    <span className="text-sm text-gray-700">Transactions</span>
                                                </div>
                                                <span className="text-2xl font-bold text-green-600">{stats.transactionsProcessed || 0}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FaFileAlt className="text-blue-600 text-xl" />
                                                    <span className="text-sm text-gray-700">Reports Generated</span>
                                                </div>
                                                <span className="text-2xl font-bold text-blue-600">{stats.reportsGenerated || 0}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {user.role === 'transport-officer' && (
                                    <>
                                        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FaCar className="text-orange-600 text-xl" />
                                                    <span className="text-sm text-gray-700">Vehicles Managed</span>
                                                </div>
                                                <span className="text-2xl font-bold text-orange-600">{stats.vehiclesManaged || 0}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FaCalendar className="text-blue-600 text-xl" />
                                                    <span className="text-sm text-gray-700">Bookings Handled</span>
                                                </div>
                                                <span className="text-2xl font-bold text-blue-600">{stats.bookingsHandled || 0}</span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Common stats for all roles */}
                                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FaCalendar className="text-gray-600 text-xl" />
                                            <span className="text-sm text-gray-700">Account Age</span>
                                        </div>
                                        <span className="text-2xl font-bold text-gray-600">{stats.accountAge || 0} days</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Info */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-90">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                                    <FaCalendar className="text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Account Info</h2>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Username</span>
                                    <span className="font-medium text-gray-900">@{profile.username}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Role</span>
                                    <span className="font-medium text-gray-900">{getRoleDisplayName(profile.role)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status</span>
                                    <span className={`font-medium ${profile.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                                        {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Member Since</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(profile.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                {profile.lastLogin && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Last Login</span>
                                        <span className="font-medium text-gray-900">
                                            {new Date(profile.lastLogin).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
