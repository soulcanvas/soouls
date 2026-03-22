'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Database,
  FileText,
  Mail,
  Shield,
  ShieldAlert,
  ToggleRight,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useShell } from '../components/ClientShell';
import { ActionButton, Panel, StatCard, StatusBadge, ToggleSwitch } from '../components/ui';
import { type Overview, api, formatRelativeTime } from '../lib/api';

interface DashboardSectionProps {
  onNavigate?: (section: string | SectionName) => void;
}

import type { SectionName } from './index';

export function DashboardSection({ onNavigate }: DashboardSectionProps) {
  const { viewer, setFlash } = useShell();
  const queryClient = useQueryClient();

  const { data: overview, isLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: () => api<Overview>('/command-api/overview'),
    refetchInterval: 15_000,
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['overview'] });
  }

  const canManageEngineering = viewer?.permissions?.includes('mutate:feature_flags');
  const queueTotal =
    (overview?.queue.waiting ?? 0) + (overview?.queue.active ?? 0) + (overview?.queue.delayed ?? 0);

  if (isLoading || !overview) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-12 w-64 rounded-xl bg-white/[0.03]" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/[0.03]" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-72 rounded-2xl bg-white/[0.03]" />
          <div className="h-72 rounded-2xl bg-white/[0.03]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">Command Center</h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time platform overview · Auto-refreshes every 15s
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-400">
              Live
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <button type="button" onClick={() => onNavigate?.('users')} className="group text-left">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-amber-400/20 hover:bg-white/[0.05]">
            <Users className="h-5 w-5 text-amber-300/80" />
            <div className="mt-3 font-display text-3xl font-bold text-white">
              {overview.stats.totalUsers.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Total Users
              </span>
            </div>
          </div>
        </button>

        <button type="button" onClick={() => onNavigate?.('users')} className="group text-left">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-amber-400/20 hover:bg-white/[0.05]">
            <Users className="h-5 w-5 text-emerald-300/80" />
            <div className="mt-3 font-display text-3xl font-bold text-white">
              {overview.stats.activeUsers.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Active Users
              </span>
              <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                {overview.stats.totalUsers > 0
                  ? `${Math.round((overview.stats.activeUsers / overview.stats.totalUsers) * 100)}%`
                  : '0%'}
              </span>
            </div>
          </div>
        </button>

        <button type="button" onClick={() => onNavigate?.('team')} className="group text-left">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-amber-400/20 hover:bg-white/[0.05]">
            <Shield className="h-5 w-5 text-blue-300/80" />
            <div className="mt-3 font-display text-3xl font-bold text-white">
              {overview.stats.activeAdmins}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Active Admins
              </span>
            </div>
          </div>
        </button>

        <button type="button" onClick={() => onNavigate?.('team')} className="group text-left">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-amber-400/20 hover:bg-white/[0.05]">
            <Mail className="h-5 w-5 text-amber-300/80" />
            <div className="mt-3 font-display text-3xl font-bold text-white">
              {overview.stats.pendingInvites}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Pending Invites
              </span>
            </div>
          </div>
        </button>

        <button type="button" onClick={() => onNavigate?.('health')} className="group text-left">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-amber-400/20 hover:bg-white/[0.05]">
            <Activity className="h-5 w-5 text-orange-300/80" />
            <div className="mt-3 font-display text-3xl font-bold text-white">{queueTotal}</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Queue Jobs</span>
              {overview.queue.failed > 0 && (
                <span className="rounded-full bg-rose-400/10 px-2 py-0.5 text-[10px] font-medium text-rose-400">
                  {overview.queue.failed} failed
                </span>
              )}
            </div>
          </div>
        </button>

        <button type="button" onClick={() => onNavigate?.('health')} className="group text-left">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-amber-400/20 hover:bg-white/[0.05]">
            <Database className="h-5 w-5 text-sky-300/80" />
            <div className="mt-3 font-display text-3xl font-bold text-white">
              {overview.telemetry.databaseLatencyMs ?? 0}ms
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">DB Latency</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  overview.telemetry.databaseHealthy
                    ? 'bg-emerald-400/10 text-emerald-400'
                    : 'bg-rose-400/10 text-rose-400'
                }`}
              >
                {overview.telemetry.databaseHealthy ? 'Healthy' : 'Degraded'}
              </span>
            </div>
          </div>
        </button>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="mb-4 flex items-center gap-3">
          <Zap className="h-5 w-5 text-amber-300" />
          <h2 className="font-display text-lg text-white">BullMQ Radar</h2>
          <Link
            href="/health"
            className="ml-auto text-xs text-slate-500 hover:text-amber-400 transition-colors"
          >
            View Health →
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: 'Waiting',
              value: overview.queue.waiting,
              color: 'text-slate-300 bg-slate-400/10 border-slate-400/20',
            },
            {
              label: 'Active',
              value: overview.queue.active,
              color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
            },
            {
              label: 'Delayed',
              value: overview.queue.delayed,
              color: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
            },
            {
              label: 'Failed',
              value: overview.queue.failed,
              color: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border px-4 py-3 text-center ${item.color}`}
            >
              <div className="font-mono text-2xl font-bold">{item.value}</div>
              <div className="mt-1 text-[10px] uppercase tracking-widest opacity-70">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Feature Flags"
          action={
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ToggleRight className="h-3.5 w-3.5" />
              <span>
                {overview.featureFlags.filter((f) => f.enabled).length}/
                {overview.featureFlags.length} enabled
              </span>
              <Link href="/feature-flags" className="ml-2 text-amber-400 hover:text-amber-300">
                Manage →
              </Link>
            </div>
          }
        >
          <div className="space-y-2">
            {overview.featureFlags.slice(0, 5).map((flag) => (
              <div
                key={flag.id}
                className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
              >
                <div>
                  <div className="text-sm text-white">{flag.key}</div>
                  <div className="text-xs text-slate-500">{flag.description}</div>
                </div>
                <ToggleSwitch
                  enabled={flag.enabled}
                  disabled={!canManageEngineering}
                  onToggle={() => {
                    void api(`/command-api/feature-flags/${flag.key}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ enabled: !flag.enabled }),
                    }).then(() => {
                      setFlash(`${flag.key} → ${!flag.enabled ? 'enabled' : 'disabled'}`);
                      invalidate();
                    });
                  }}
                />
              </div>
            ))}
            {overview.featureFlags.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-600">No feature flags defined.</p>
            )}
          </div>
        </Panel>

        <Panel
          title="Recent Activity"
          action={
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {overview.recentAuditLogs.length} events
              </span>
              <Link href="/audit-logs" className="text-xs text-amber-400 hover:text-amber-300">
                View All →
              </Link>
            </div>
          }
        >
          <div className="space-y-2">
            {overview.recentAuditLogs.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-600">No activity yet.</p>
            ) : (
              overview.recentAuditLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-xl bg-white/[0.02] px-4 py-3"
                >
                  <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-400/50" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm text-white">{log.actorEmail}</span>
                      <StatusBadge status={log.action.split('.').pop() ?? log.action} />
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {log.targetType} · {formatRelativeTime(log.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <Panel
        title="Emergency Kill Switches"
        action={
          <div className="flex items-center gap-1.5 text-xs">
            <Link href="/service-controls" className="text-amber-400 hover:text-amber-300">
              View All →
            </Link>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {overview.serviceControls.map((control) => (
            <div
              key={control.id}
              className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      control.enabled
                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                        : 'bg-rose-400 shadow-sm shadow-rose-400/50'
                    }`}
                  />
                  <span className="text-sm text-white">{control.label}</span>
                </div>
                <div className="mt-0.5 text-xs text-slate-500">{control.description}</div>
              </div>
              <ToggleSwitch
                enabled={control.enabled}
                disabled={!canManageEngineering}
                onToggle={() => {
                  void api(`/command-api/service-controls/${control.key}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ enabled: !control.enabled }),
                  }).then(() => {
                    setFlash(`${control.label} → ${!control.enabled ? 'online' : 'paused'}`);
                    invalidate();
                  });
                }}
              />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
