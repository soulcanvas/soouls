'use client';

import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary';
}

export function ActionButton({
  children,
  icon: Icon,
  variant = 'primary',
  className = '',
  ...props
}: ActionButtonProps) {
  const baseStyles =
    'flex items-center justify-center gap-2 rounded-full px-6 py-3 font-clarity text-sm font-medium transition-all active:scale-95';
  const variants = {
    primary:
      'bg-[#1A1A1A] text-amber-400 border border-amber-500/20 hover:bg-[#222] hover:border-amber-500/40 shadow-lg shadow-amber-900/10',
    secondary: 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white',
  };

  return (
    <button type="button" className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}
