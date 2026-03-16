'use client';

import {
  Activity,
  Cpu,
  CreditCard,
  FileText,
  Heart,
  KeyRound,
  LayoutGrid,
  LogOut,
  Mail,
  Settings,
  Shield,
  ShieldAlert,
  ToggleRight,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AdminRole, Viewer } from '../lib/api';

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Permission required to see this nav item. If omitted, always visible. */
  requiredPermission?: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/', icon: LayoutGrid },
  { label: 'Users', href: '/users', icon: Users, requiredPermission: 'view:all' },
  { label: 'Team', href: '/settings/team', icon: Shield, requiredPermission: 'mutate:invites' },
  {
    label: 'Feature Flags',
    href: '/feature-flags',
    icon: ToggleRight,
    requiredPermission: 'mutate:feature_flags',
  },
  {
    label: 'Service Controls',
    href: '/service-controls',
    icon: Settings,
    requiredPermission: 'mutate:service_controls',
  },
  {
    label: 'API Keys',
    href: '/api-keys',
    icon: KeyRound,
    requiredPermission: 'mutate:api_keys',
  },
  { label: 'Billing', href: '/billing', icon: CreditCard, requiredPermission: 'view:all' },
  { label: 'AI Telemetry', href: '/ai-telemetry', icon: Cpu, requiredPermission: 'view:all' },
  { label: 'Messaging', href: '/messaging', icon: Mail, requiredPermission: 'view:all' },
  {
    label: 'Audit Logs',
    href: '/audit-logs',
    icon: FileText,
    requiredPermission: 'view:all',
  },
  {
    label: 'Rate Limits',
    href: '/rate-limits',
    icon: ShieldAlert,
    requiredPermission: 'view:all',
  },
  {
    label: 'Health',
    href: '/health',
    icon: Heart,
    requiredPermission: 'view:all',
  },
];

const ROLE_COLORS: Record<AdminRole, string> = {
  super_admin: 'bg-amber-400/15 text-amber-300 border-amber-400/20',
  engineer: 'bg-blue-400/15 text-blue-300 border-blue-400/20',
  support: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20',
};

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  engineer: 'Engineer',
  support: 'Support',
};

export default function Sidebar({ viewer }: { viewer: Viewer | null }) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.requiredPermission) return true;
    if (!viewer) return false;
    return viewer.permissions?.includes(item.requiredPermission);
  });

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-white/[0.06] bg-[#060c18]/95 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">SoulLabs</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Command Center
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400/15 to-orange-400/10 text-amber-200 shadow-inner'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] transition-colors ${
                  isActive ? 'text-amber-300' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* User info */}
      {viewer && (
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-3 transition-colors hover:bg-white/[0.05]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-500/20 text-xs font-bold text-amber-200">
              {(viewer.name || viewer.email)[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-white">
                {viewer.name || viewer.email}
              </div>
              <div
                className={`mt-0.5 inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${ROLE_COLORS[viewer.role]}`}
              >
                {ROLE_LABELS[viewer.role]}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
