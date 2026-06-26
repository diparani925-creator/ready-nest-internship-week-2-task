import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none';
  
  const variants = {
    default: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
    secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-850 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
    outline: 'border border-[var(--border)] text-[var(--foreground)]',
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
