'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { User, Lock, Mail, CheckCircle2, ShieldAlert } from 'lucide-react';

const AVATARS = [
  { id: 'avatar1', label: 'Teal Theme', color: 'bg-teal-500' },
  { id: 'avatar2', label: 'Indigo Theme', color: 'bg-blue-500' },
  { id: 'avatar3', label: 'Purple Theme', color: 'bg-purple-500' },
  { id: 'avatar4', label: 'Rose Theme', color: 'bg-rose-500' },
  { id: 'avatar5', label: 'Amber Theme', color: 'bg-amber-500' },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  
  // Profile info states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || 'avatar1');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password reset states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const getAvatarInitials = (n: string) => {
    if (!n) return 'U';
    const parts = n.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    if (!name || !email) {
      setProfileMsg({ type: 'error', text: 'Name and email are required.' });
      return;
    }

    setUpdatingProfile(true);
    try {
      const res = await api.put('/users/profile', { name, email, avatar });
      updateUser(res.data);
      setProfileMsg({ type: 'success', text: 'Profile details updated successfully!' });
    } catch (err: any) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Error updating profile details',
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'All password fields are required.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setUpdatingPassword(true);
    try {
      await api.put('/users/password', { currentPassword, newPassword });
      setPasswordMsg({ type: 'success', text: 'Password reset successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      if (confirmPassword) setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.message || 'Error changing password',
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const userInitials = getAvatarInitials(name);
  const activeAvatarColor = AVATARS.find((av) => av.id === avatar)?.color || 'bg-teal-500';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Profile Settings</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Manage your personal settings, reset passwords, and customize themes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar display widget */}
        <div className="md:col-span-1 space-y-6">
          <Card className="text-center p-6 flex flex-col items-center">
            <div className={`h-24 w-24 rounded-full flex items-center justify-center font-extrabold text-2xl select-none text-white border-4 border-[var(--border)] shadow-md ${activeAvatarColor}`}>
              {userInitials}
            </div>
            <h2 className="text-lg font-bold mt-4 text-[var(--foreground)]">{name}</h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{email}</p>
            <div className="mt-4">
              <span className="inline-block text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-[var(--radius)] bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                Role: {user?.role}
              </span>
            </div>
          </Card>
        </div>

        {/* Right Column: Profile details form & Password changer */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Edit Profile details card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Account Details</CardTitle>
              <CardDescription className="text-xs">Update your student identity parameters</CardDescription>
            </CardHeader>
            <CardContent>
              {profileMsg && (
                <div className={`mb-4 p-3 rounded-[var(--radius)] text-xs flex gap-2 items-center ${
                  profileMsg.type === 'success' 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-500'
                }`}>
                  {profileMsg.type === 'success' ? <CheckCircle2 size={14} className="shrink-0" /> : <ShieldAlert size={14} className="shrink-0" />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="profile-name">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-foreground)]" />
                    <input
                      id="profile-name"
                      type="text"
                      className="w-full text-sm pl-9 pr-4 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email address */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="profile-email">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-foreground)]" />
                    <input
                      id="profile-email"
                      type="email"
                      className="w-full text-sm pl-9 pr-4 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Avatar selection */}
                <div>
                  <label className="block text-xs font-semibold mb-2 text-[var(--foreground)]">
                    Profile Theme Color
                  </label>
                  <div className="flex gap-2.5">
                    {AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setAvatar(av.id)}
                        className={`h-7 w-7 rounded-full flex items-center justify-center text-white border-2 cursor-pointer transition-all ${
                          avatar === av.id ? 'border-white scale-110 ring-2 ring-[var(--primary)]' : 'border-transparent opacity-80 hover:opacity-100'
                        } ${av.color}`}
                        title={av.label}
                      >
                        {av.label[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-[var(--border)]">
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-[var(--radius)] shadow-sm transition-colors cursor-pointer"
                  >
                    {updatingProfile ? 'Saving Details...' : 'Save Settings'}
                  </button>
                </div>

              </form>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Reset Password</CardTitle>
              <CardDescription className="text-xs">Update your credentials security key</CardDescription>
            </CardHeader>
            <CardContent>
              {passwordMsg && (
                <div className={`mb-4 p-3 rounded-[var(--radius)] text-xs flex gap-2 items-center ${
                  passwordMsg.type === 'success' 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-500'
                }`}>
                  {passwordMsg.type === 'success' ? <CheckCircle2 size={14} className="shrink-0" /> : <ShieldAlert size={14} className="shrink-0" />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="pw-current">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-foreground)]" />
                    <input
                      id="pw-current"
                      type="password"
                      className="w-full text-sm pl-9 pr-4 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="pw-new">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-foreground)]" />
                    <input
                      id="pw-new"
                      type="password"
                      className="w-full text-sm pl-9 pr-4 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="pw-confirm">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-foreground)]" />
                    <input
                      id="pw-confirm"
                      type="password"
                      className="w-full text-sm pl-9 pr-4 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-[var(--border)]">
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-[var(--radius)] shadow-sm transition-colors cursor-pointer"
                  >
                    {updatingPassword ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>

              </form>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}
