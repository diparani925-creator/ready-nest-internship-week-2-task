'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-4">
        {/* Loading Spinner */}
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--primary)]"></div>
        <p className="text-sm font-semibold text-[var(--muted-foreground)]">Redirecting to portal...</p>
      </div>
    </div>
  );
}
