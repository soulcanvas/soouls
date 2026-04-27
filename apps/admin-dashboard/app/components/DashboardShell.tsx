'use client';

import {
  Activity,
  Cpu,
  CreditCard,
  FileText,
  Heart,
  KeyRound,
  LayoutDashboard,
  Mail,
  Settings,
  Shield,
  ShieldAlert,
  ToggleRight,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { AdminRole, Viewer } from '../lib/api';
import {
  AiSection,
  ApiKeysSection,
  AuditLogsSection,
  BillingSection,
  DashboardSection,
  EntriesSection,
  FeatureFlagsSection,
  HealthSection,
  MessagingSection,
  RateLimitsSection,
  type SectionName,
  ServiceControlsSection,
  TeamSection,
  UsersSection,
} from '../sections';

type NavItem = {
  label: string;
  section: SectionName | '';
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission?: string;
  divider?: boolean;
  groupLabel?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', section: 'dashboard', icon: LayoutDashboard },
  { label: 'Platform', section: '', icon: Activity, divider: true, groupLabel: true },
  { label: 'Users', section: 'users', icon: Users },
  { label: 'Entries', section: 'entries', icon: FileText },
  { label: 'Communication', section: '', icon: Activity, divider: true, groupLabel: true },
  { label: 'Messaging', section: 'messaging', icon: Mail },
  { label: 'Access & Security', section: '', icon: Activity, divider: true, groupLabel: true },
  { label: 'Team', section: 'team', icon: Shield },
  { label: 'Feature Flags', section: 'feature-flags', icon: ToggleRight },
  { label: 'Service Controls', section: 'service-controls', icon: Settings },
  { label: 'API Keys', section: 'api-keys', icon: KeyRound },
  { label: 'Operations', section: '', icon: Activity, divider: true, groupLabel: true },
  { label: 'Health', section: 'health', icon: Heart },
  { label: 'Billing', section: 'billing', icon: CreditCard },
  { label: 'AI Telemetry', section: 'ai', icon: Cpu },
  { label: 'Rate Limits', section: 'rate-limits', icon: ShieldAlert },
  { label: 'Audit Logs', section: 'audit-logs', icon: FileText },
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

const SECTION_ROUTE_MAP: Record<SectionName, string> = {
  dashboard: '/',
  users: '/users',
  entries: '/entries',
  messaging: '/messaging',
  team: '/settings/team',
  billing: '/billing',
  ai: '/ai-telemetry',
  health: '/health',
  'rate-limits': '/rate-limits',
  'feature-flags': '/feature-flags',
  'service-controls': '/service-controls',
  'api-keys': '/api-keys',
  'audit-logs': '/audit-logs',
};

function getActiveSectionFromPath(pathname: string): SectionName {
  const path = pathname.replace(/^\/+|\/+$/g, '');

  const sectionMap: Record<string, SectionName> = {
    '': 'dashboard',
    dashboard: 'dashboard',
    users: 'users',
    entries: 'entries',
    messaging: 'messaging',
    'settings/team': 'team',
    billing: 'billing',
    'ai-telemetry': 'ai',
    health: 'health',
    'rate-limits': 'rate-limits',
    'feature-flags': 'feature-flags',
    'service-controls': 'service-controls',
    'api-keys': 'api-keys',
    'audit-logs': 'audit-logs',
    'dashboard/settings': 'team',
  };

  return sectionMap[path] ?? 'dashboard';
}

interface DashboardShellProps {
  viewer: Viewer | null;
}

export function DashboardShell({ viewer }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activeSection = getActiveSectionFromPath(pathname);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.divider || item.groupLabel) return true;
    return true;
  });

  const handleNavigate = (section: string) => {
    const route = SECTION_ROUTE_MAP[section as SectionName];
    if (route) {
      router.push(route);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection onNavigate={handleNavigate} />;
      case 'users':
        return <UsersSection />;
      case 'entries':
        return <EntriesSection />;
      case 'messaging':
        return <MessagingSection />;
      case 'team':
        return <TeamSection />;
      case 'billing':
        return <BillingSection />;
      case 'ai':
        return <AiSection />;
      case 'health':
        return <HealthSection />;
      case 'rate-limits':
        return <RateLimitsSection />;
      case 'feature-flags':
        return <FeatureFlagsSection />;
      case 'service-controls':
        return <ServiceControlsSection />;
      case 'api-keys':
        return <ApiKeysSection />;
      case 'audit-logs':
        return <AuditLogsSection />;
      default:
        return <DashboardSection onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#04080f]">
      {/* Sidebar */}
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

        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {visibleItems.map((item, index) => {
            if (item.groupLabel) {
              const prevItem = visibleItems[index - 1];
              const nextItem = visibleItems[index + 1];
              if (nextItem?.section && (prevItem?.groupLabel || !prevItem)) {
                return (
                  <div key={item.label} className="pt-4 first:pt-0">
                    <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      {item.label}
                    </div>
                  </div>
                );
              }
              return null;
            }

            if (item.divider) {
              return (
                <div
                  key={item.label}
                  className="my-2 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
                />
              );
            }

            const isActive = activeSection === item.section;
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() =>
                  item.section && router.push(SECTION_ROUTE_MAP[item.section as SectionName])
                }
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
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
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                )}
              </button>
            );
          })}
        </nav>

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

      {/* Main Content */}
      <main className="ml-[260px] flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-7xl">{renderSection()}</div>
      </main>
    </div>
  );
}
