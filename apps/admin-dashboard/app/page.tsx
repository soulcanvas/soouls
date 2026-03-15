'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, Database, Mail, Shield, ToggleRight, Users, Zap } from 'lucide-react';
import { useShell } from './components/ClientShell';
import { Panel, StatCard, StatusBadge, ToggleSwitch } from './components/ui';
import { type Overview, api, formatRelativeTime } from './lib/api';

export default function OverviewPage() {
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

  const canManageEngineering = viewer?.permissions?.includes('mutate:feature_flags');

  const queueTotal = overview.queue.waiting + overview.queue.active + overview.queue.delayed;

  return (
    <div className="animate-slide-up space-y-8">
      {/* Header */}
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

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          value={overview.stats.totalUsers.toLocaleString()}
          label="Total Users"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          value={overview.stats.activeUsers.toLocaleString()}
          label="Active Users"
          trend={
            overview.stats.totalUsers > 0
              ? `${Math.round((overview.stats.activeUsers / overview.stats.totalUsers) * 100)}%`
              : undefined
          }
        />
        <StatCard
          icon={<Shield className="h-5 w-5" />}
          value={overview.stats.activeAdmins}
          label="Active Admins"
        />
        <StatCard
          icon={<Mail className="h-5 w-5" />}
          value={overview.stats.pendingInvites}
          label="Pending Invites"
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          value={queueTotal}
          label="Queue Jobs"
          trend={
            overview.queue.failed > 0
              ? `${overview.queue.failed} failed`
              : queueTotal === 0
                ? 'Idle'
                : undefined
          }
        />
        <StatCard
          icon={<Database className="h-5 w-5" />}
          value={`${overview.telemetry.databaseLatencyMs ?? 0}ms`}
          label="DB Latency"
          trend={overview.telemetry.databaseHealthy ? 'Healthy' : 'Degraded'}
        />
      </div>

      {/* Queue Radar */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="h-5 w-5 text-amber-300" />
          <h2 className="font-display text-lg text-white">BullMQ Radar</h2>
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
        {/* Feature Flags Quick View */}
        <Panel
          title="Feature Flags"
          action={
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ToggleRight className="h-3.5 w-3.5" />
              <span>
                {overview.featureFlags.filter((f) => f.enabled).length}/
                {overview.featureFlags.length} enabled
              </span>
            </div>
          }
        >
          <div className="space-y-2">
            {overview.featureFlags.map((flag) => (
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
          </div>
        </Panel>

        {/* Recent Audit Logs */}
        <Panel
          title="Recent Activity"
          action={
            <span className="text-xs text-slate-500">{overview.recentAuditLogs.length} events</span>
          }
        >
          <div className="space-y-2">
            {overview.recentAuditLogs.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-600">No activity yet.</p>
            ) : (
              overview.recentAuditLogs.map((log) => (
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

      {/* Service Controls - Kill Switches */}
      <Panel
        title="Emergency Kill Switches"
        action={
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={
                overview.serviceControls.every((c) => c.enabled)
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }
            >
              {overview.serviceControls.filter((c) => c.enabled).length}/
              {overview.serviceControls.length} online
            </span>
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
                    className={`h-2 w-2 rounded-full ${control.enabled ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-rose-400 shadow-sm shadow-rose-400/50'}`}
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
