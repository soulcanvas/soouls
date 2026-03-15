'use client';

import type { ReactNode } from 'react';

export function StatCard({
  icon,
  value,
  label,
  trend,
}: {
  icon: ReactNode;
  value: number | string;
  label: string;
  trend?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.05]">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-400/[0.04] blur-2xl transition-all group-hover:bg-amber-400/[0.08]" />
      <div className="relative">
        <div className="text-amber-300/80">{icon}</div>
        <div className="mt-3 font-display text-3xl font-bold text-white">{value}</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</span>
          {trend && (
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-white">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    revoked: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
    pending: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
    invited: 'bg-blue-400/10 text-blue-300 border-blue-400/20',
    locked: 'bg-orange-400/10 text-orange-300 border-orange-400/20',
    suspended: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
    beta: 'bg-violet-400/10 text-violet-300 border-violet-400/20',
    free: 'bg-slate-400/10 text-slate-300 border-slate-400/20',
    premium: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
    enterprise: 'bg-violet-400/10 text-violet-300 border-violet-400/20',
    accepted: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    expired: 'bg-slate-400/10 text-slate-500 border-slate-400/20',
    delivered: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    queued: 'bg-blue-400/10 text-blue-300 border-blue-400/20',
    failed: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
    draft: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
    sent: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  };

  const colorClass =
    colors[status.toLowerCase()] ?? 'bg-slate-400/10 text-slate-400 border-slate-400/20';

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${colorClass}`}
    >
      {status}
    </span>
  );
}

export function ToggleSwitch({
  enabled,
  onToggle,
  disabled,
}: {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
        enabled ? 'bg-emerald-500/60' : 'bg-slate-600/60'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] py-12 text-center">
      <div className="text-slate-600">{icon}</div>
      <div className="mt-3 text-sm font-medium text-slate-400">{title}</div>
      <div className="mt-1 text-xs text-slate-600">{description}</div>
    </div>
  );
}

export function ActionButton({
  children,
  onClick,
  variant = 'default',
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
}) {
  const colors = {
    default: 'border-white/10 text-white hover:bg-white/[0.06]',
    primary:
      'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30',
    danger: 'border-rose-400/30 text-rose-300 hover:bg-rose-400/10',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-4 py-2.5 text-sm transition-all duration-200 ${
        variant === 'primary' ? 'border-transparent' : ''
      } ${colors[variant]} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      {children}
    </button>
  );
}
