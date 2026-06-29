'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/UserContext';
import { FaUserPlus, FaSave, FaTimes, FaEye, FaEyeSlash, FaShieldAlt, FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';
import BackButton from '@/components/BackButton';

interface UserFormData {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: string;
  department: string;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
}

const roles = [
  { value: 'staff', label: 'Sales Staff', color: 'bg-blue-100 text-blue-700' },
  { value: 'transport-officer', label: 'Transport Officer', color: 'bg-amber-100 text-amber-700' },
  { value: 'accountant', label: 'Accountant', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'admin', label: 'System Admin', color: 'bg-rose-100 text-rose-700' },
  { value: 'manager', label: 'Manager', color: 'bg-violet-100 text-violet-700' },
  { value: 'agent', label: 'Field Agent', color: 'bg-orange-100 text-orange-700' },
];

export default function AddUserPage() {
  const { user, isLoading: userLoading, resetInactivityTimer } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
    department: '',
    emailNotifications: true,
    whatsappNotifications: true
  });

  useEffect(() => {
    const handleActivity = () => { if (user) resetInactivityTimer(); };
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(e => document.addEventListener(e, handleActivity, true));
    return () => events.forEach(e => document.removeEventListener(e, handleActivity, true));
  }, [user, resetInactivityTimer]);

  if (userLoading) return <LoadingSpinner />;
  if (!user) { router.push('/staff/login'); return null; }
  if (user.role !== 'admin' && user.role !== 'staff' && user.role !== 'accountant') {
    router.push('/staff/admin-dashboard'); return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!formData.username.trim()) errors.push('Username is required');
    if (!formData.fullName.trim()) errors.push('Full name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.phone.trim()) errors.push('Phone is required');
    if (!formData.password) errors.push('Password is required');
    if (formData.password.length < 6) errors.push('Password must be at least 6 characters');
    if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
    if (!formData.role) errors.push('Role is required');
    if (!formData.department.trim()) errors.push('Department is required');
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      setToastMsg({ type: 'error', text: errors[0] });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-username': user.username },
        body: JSON.stringify({
          username: formData.username.trim(),
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          role: formData.role,
          department: formData.department.trim(),
          emailNotifications: formData.emailNotifications,
          whatsappNotifications: formData.whatsappNotifications
        }),
      });
      if (response.ok) {
        setToastMsg({ type: 'success', text: 'User created successfully!' });
        setTimeout(() => router.push('/staff/users'), 1500);
      } else {
        const errorData = await response.json();
        setToastMsg({ type: 'error', text: errorData.error || 'Error creating user' });
      }
    } catch (error) {
      setToastMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all duration-200";
  const labelClass = "block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5";

  return (
    <div className="min-h-screen bg-[#f0f2f8] p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <BackButton href="/staff/users" label="Back to Users" className="mb-5" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FaUserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Add New User</h1>
              <p className="text-sm text-slate-500 font-medium">Create a new staff account with role-based access</p>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toastMsg && (
          <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold animate-in slide-in-from-top-2 ${
            toastMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${toastMsg.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {toastMsg.text}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-slate-50">
            
            {/* Personal Info */}
            <div className="p-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Username *</label>
                  <div className="relative">
                    <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} className={`${inputClass} pl-10`} placeholder="e.g. john.doe" required />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <div className="relative">
                    <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={`${inputClass} pl-10`} placeholder="Enter full name" required />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={`${inputClass} pl-10`} placeholder="name@kimu.rw" required />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <div className="relative">
                    <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={`${inputClass} pl-10`} placeholder="+250 78X XXX XXX" required />
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="p-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Security Credentials</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Password *</label>
                  <div className="relative">
                    <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} className={`${inputClass} pl-10 pr-10`} placeholder="Min. 6 characters" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Confirm Password *</label>
                  <div className="relative">
                    <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className={`${inputClass} pl-10 pr-10`} placeholder="Repeat password" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Role & Department */}
            <div className="p-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Role & Department</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Role *</label>
                  <select name="role" value={formData.role} onChange={handleInputChange} className={inputClass} required>
                    {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Department *</label>
                  <input type="text" name="department" value={formData.department} onChange={handleInputChange} className={inputClass} placeholder="e.g. Sales Operations" required />
                </div>
              </div>
              {/* Role badge preview */}
              <div className="mt-3">
                <span className="text-xs text-slate-400 font-medium">Selected role preview: </span>
                <span className={`inline-block ml-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${roles.find(r => r.value === formData.role)?.color || 'bg-slate-100 text-slate-600'}`}>
                  {roles.find(r => r.value === formData.role)?.label}
                </span>
              </div>
            </div>

            {/* Notifications */}
            <div className="p-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Notification Preferences</h3>
              <div className="space-y-3">
                {[
                  { name: 'emailNotifications', checked: formData.emailNotifications, label: 'Email Notifications', sub: 'Receive alerts via email address' },
                  { name: 'whatsappNotifications', checked: formData.whatsappNotifications, label: 'WhatsApp Notifications', sub: 'Receive alerts via WhatsApp' },
                ].map(pref => (
                  <label key={pref.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
                    <div className="relative flex-shrink-0">
                      <input type="checkbox" name={pref.name} checked={pref.checked} onChange={handleInputChange} className="sr-only peer" />
                      <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-500 transition-colors duration-200" />
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-700">{pref.label}</div>
                      <div className="text-xs text-slate-400">{pref.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-slate-50 flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push('/staff/users')} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm">
                <FaTimes className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-200 shadow-sm">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>
                ) : (
                  <><FaSave className="w-3.5 h-3.5" />Create User</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}