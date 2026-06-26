'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  FileSpreadsheet,
  Bell,
  StickyNote,
  User,
  LogOut,
  Sun,
  Moon,
  GraduationCap,
  Menu,
  X,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define avatar map
  const avatarColors: { [key: string]: string } = {
    avatar1: 'bg-teal-500 text-white',
    avatar2: 'bg-blue-500 text-white',
    avatar3: 'bg-purple-500 text-white',
    avatar4: 'bg-rose-500 text-white',
    avatar5: 'bg-amber-500 text-white',
  };

  const getAvatarInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  // Nav items configuration
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Timetable', path: '/timetable', icon: Calendar },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Attendance', path: '/attendance', icon: FileSpreadsheet },
    { name: 'Notice Board', path: '/notices', icon: Bell },
    { name: 'Sticky Notes', path: '/notes', icon: StickyNote },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  // If not authenticated or currently loading, let the page level handle redirect
  // We just render children directly for non-authenticated pages like /login or /register
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/';
  
  if (isAuthPage || !isAuthenticated) {
    return <div className="min-h-screen flex flex-col">{children}</div>;
  }

  const userAvatarColor = avatarColors[user?.avatar || 'avatar1'] || 'bg-teal-500 text-white';
  const userInitials = getAvatarInitials(user?.name || 'User');

  return (
    <div className="min-h-screen flex bg-[var(--background)] transition-colors duration-300">
      
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-[var(--card)] border-r border-[var(--border)] z-30 transition-colors duration-300">
        {/* Brand Logo Banner */}
        <div className="h-16 flex items-center px-6 border-b border-[var(--border)] gap-2">
          <GraduationCap className="h-8 w-8 text-[var(--primary)]" />
          <span className="font-bold text-lg tracking-tight text-brand-navy dark:text-teal-400">
            Smart Campus
          </span>
        </div>

        {/* User Identity Info Panel */}
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm select-none ${userAvatarColor}`}>
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate leading-tight">{user?.name}</p>
            <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.25 rounded bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? '' : 'text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar Control Panel */}
        <div className="p-4 border-t border-[var(--border)] flex flex-col gap-2">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--radius)] text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all duration-150"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-5 w-5 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-5 w-5 text-slate-500" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--radius)] text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-150"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Mobile Nav Header Bar & Drawer */}
      <div className="flex flex-col flex-1 md:pl-64 min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 bg-[var(--card)] border-b border-[var(--border)] md:hidden sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-[var(--primary)]" />
            <span className="font-bold text-base tracking-tight">Smart Campus</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark Mode toggle for mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-500" />}
            </button>

            {/* Mobile Menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer Dropdown */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-16 bg-black/50 z-30 md:hidden animate-fade-in">
            <div className="bg-[var(--card)] border-b border-[var(--border)] px-4 py-6 flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${userAvatarColor}`}>
                  {userInitials}
                </div>
                <div>
                  <p className="font-semibold text-sm leading-none">{user?.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">{user?.email}</p>
                </div>
              </div>

              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                          : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-[var(--border)] pt-4">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--radius)] text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Main Content Container */}
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 animate-fade-in">
          {children}
        </main>

        {/* 4. Mobile Sticky Bottom Navigation Bar (Standard SaaS layout) */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[var(--card)] border-t border-[var(--border)] flex items-center justify-around md:hidden z-20 px-2 shadow-lg">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
                  isActive
                    ? 'text-[var(--primary)] bg-[var(--muted)]'
                    : 'text-[var(--muted-foreground)]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium mt-1 truncate max-w-full">
                  {item.name === 'Notice Board' ? 'Notices' : item.name === 'Sticky Notes' ? 'Notes' : item.name}
                </span>
              </Link>
            );
          })}
          {/* Profile link for mobile bottom nav */}
          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              pathname === '/profile' ? 'text-[var(--primary)] bg-[var(--muted)]' : 'text-[var(--muted-foreground)]'
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium mt-1">Profile</span>
          </Link>
        </nav>
      </div>
    </div>
  );
};
export default Layout;
