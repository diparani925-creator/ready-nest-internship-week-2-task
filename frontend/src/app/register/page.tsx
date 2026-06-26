'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Lock, Mail, User, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';

export default function RegisterPage() {
  const { registerUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [avatar, setAvatar] = useState('avatar1');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const avatars = [
    { id: 'avatar1', label: 'Teal Blue' },
    { id: 'avatar2', label: 'Bright Indigo' },
    { id: 'avatar3', label: 'Soft Purple' },
    { id: 'avatar4', label: 'Coral Rose' },
    { id: 'avatar5', label: 'Warm Amber' },
  ];

  const avatarColors: { [key: string]: string } = {
    avatar1: 'bg-teal-500',
    avatar2: 'bg-blue-500',
    avatar3: 'bg-purple-500',
    avatar4: 'bg-rose-500',
    avatar5: 'bg-amber-500',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await registerUser(name, email, password, role, avatar);
    } catch (err: any) {
      setErrorMsg(typeof err === 'string' ? err : 'Registration failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-brand-navy via-brand-navy-light to-brand-teal-dark p-4">
      <div className="w-full max-w-md animate-fade-in my-6">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20 mb-3">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-teal-300 text-xs mt-1">Smart Campus Student & Admin Sign Up</p>
        </div>

        <Card className="border-0 shadow-2xl glass">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold text-[var(--foreground)]">Sign Up</CardTitle>
            <CardDescription className="text-xs">Enter your details to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-[var(--radius)] text-xs text-rose-500 flex gap-2 items-center">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="w-full text-sm pl-9 pr-4 py-2.5 bg-black/10 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-[var(--foreground)]"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    id="email"
                    type="email"
                    placeholder="john@campus.edu"
                    className="w-full text-sm pl-9 pr-4 py-2.5 bg-black/10 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-[var(--foreground)]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="password">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full text-sm pl-9 pr-4 py-2.5 bg-black/10 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-[var(--foreground)]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="w-full text-sm pl-9 pr-4 py-2.5 bg-black/10 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-[var(--foreground)]"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Select Role (For convenient sandbox admin/student toggling) */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 p-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-black/10 dark:bg-white/5 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={role === 'student'}
                      onChange={() => setRole('student')}
                      className="accent-teal-500"
                    />
                    <span>Student</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-black/10 dark:bg-white/5 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={role === 'admin'}
                      onChange={() => setRole('admin')}
                      className="accent-teal-500"
                    />
                    <span>Admin</span>
                  </label>
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold mb-2 text-[var(--foreground)]">
                  Choose Profile Theme
                </label>
                <div className="flex gap-3 justify-center">
                  {avatars.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatar(av.id)}
                      className={`h-8 w-8 rounded-full ${avatarColors[av.id]} flex items-center justify-center text-white border-2 transition-all cursor-pointer ${
                        avatar === av.id ? 'border-white scale-110 ring-2 ring-[var(--primary)]' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                      title={av.label}
                    >
                      {av.label[0]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm rounded-[var(--radius)] transition-colors shadow-md hover:shadow-lg focus:outline-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="text-center text-xs mt-6 text-[var(--muted-foreground)]">
              Already have an account?{' '}
              <Link href="/login" className="text-teal-600 hover:text-teal-500 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
