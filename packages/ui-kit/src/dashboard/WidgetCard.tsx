'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface WidgetCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  delay?: number;
}

export function WidgetCard({
  title,
  subtitle,
  children,
  actionText,
  onAction,
  className = '',
  delay = 0,
}: WidgetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`group relative overflow-hidden rounded-3xl border border-white/5 bg-[#0F0F0F] p-6 transition-colors hover:bg-white/[0.02] ${className}`}
    >
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="font-editorial text-xl text-base-cream">{title}</h3>
          {subtitle && <p className="mt-1 font-clarity text-sm text-slate-400">{subtitle}</p>}
        </div>
        {actionText && (
          <button
            type="button"
            onClick={onAction}
            className="group/btn flex items-center gap-2 rounded-full px-3 py-1 font-clarity text-xs font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-base-cream"
          >
            {actionText}
            <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        )}
      </div>

      <div className="relative z-10">{children}</div>

      {/* Subtle gradient glow effect */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent blur-3xl" />
      </div>
    </motion.div>
  );
}
