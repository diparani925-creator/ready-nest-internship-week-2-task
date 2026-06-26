'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Lock, Mail, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';

function LoginForm() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expiredMsg, setExpiredMsg] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
    if (searchParams.get('expired') === 'true') {
      setExpiredMsg(true);
    }
  }, [isAuthenticated, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setExpiredMsg(false);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(typeof err === 'string' ? err : 'Invalid credentials. Please try again.');
      setSubmitting(false);
    }
  };

  // Helper function for quick credentials injection
  const handleQuickFill = (role: 'student' | 'admin') => {
    if (role === 'student') {
      setEmail('student@campus.edu');
      setPassword('password123');
    } else {
      setEmail('admin@campus.edu');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-brand-navy via-brand-navy-light to-brand-teal-dark p-4">
      <div className="w-full max-w-md animate-fade-in">
        
        {/* Banner Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20 mb-3">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Smart Campus Utility App</h1>
          <p className="text-teal-300 text-xs mt-1">Student Management & Analytics Portal</p>
        </div>

        <Card className="border-0 shadow-2xl glass">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold text-[var(--foreground)]">Welcome Back</CardTitle>
            <CardDescription className="text-xs">Sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Notifications */}
            {expiredMsg && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-[var(--radius)] text-xs text-amber-500 flex gap-2 items-center">
                <AlertTriangle size={14} className="shrink-0" />
                <span>Session expired. Please sign in again.</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-[var(--radius)] text-xs text-rose-500 flex gap-2 items-center">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    id="email"
                    type="email"
                    placeholder="student@campus.edu"
                    className="w-full text-sm pl-9 pr-4 py-2.5 bg-black/10 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-[var(--foreground)]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full text-sm pl-9 pr-10 py-2.5 bg-black/10 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-[var(--foreground)]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
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
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Quick Fill Testing Helper Section */}
            <div className="mt-6 pt-5 border-t border-[var(--border)]">
              <p className="text-center text-[10px] uppercase font-bold tracking-wider text-[var(--muted-foreground)] mb-3">
                Quick Fill (Testing accounts)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleQuickFill('student')}
                  className="py-1.5 px-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold border border-[var(--border)] rounded-[var(--radius)] transition-all cursor-pointer flex flex-col items-center justify-center"
                >
                  <span className="text-teal-600 font-bold text-center">Student Role</span>
                  <span className="text-[10px] text-[var(--muted-foreground)] mt-0.5 text-center">student@campus.edu</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin')}
                  className="py-1.5 px-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold border border-[var(--border)] rounded-[var(--radius)] transition-all cursor-pointer flex flex-col items-center justify-center"
                >
                  <span className="text-amber-500 font-bold text-center">Admin Role</span>
                  <span className="text-[10px] text-[var(--muted-foreground)] mt-0.5 text-center">admin@campus.edu</span>
                </button>
              </div>
            </div>

            {/* Footer Actions */}
            <p className="text-center text-xs mt-6 text-[var(--muted-foreground)]">
              Don't have an account?{' '}
              <Link href="/register" className="text-teal-600 hover:text-teal-500 font-semibold transition-colors">
                Register here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-brand-navy to-brand-navy-light p-4 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
          <p className="text-xs font-semibold text-teal-300">Loading auth configurations...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
