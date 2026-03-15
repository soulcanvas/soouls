'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, Database, Heart, Mail, MessageSquare } from 'lucide-react';
import { Panel, StatCard, StatusBadge } from '../components/ui';
import { type HealthPayload, api } from '../lib/api';

export default function HealthPage() {
  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => api<HealthPayload>('/command-api/health'),
    refetchInterval: 10_000,
  });

  if (!health) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-32 rounded-2xl bg-white/[0.03]" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-64 rounded-2xl bg-white/[0.03]" />
          <div className="h-64 rounded-2xl bg-white/[0.03]" />
        </div>
      </div>
    );
  }

  const { queue, telemetry, messaging } = health;

  return (
    <div className="animate-slide-up space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">System Health</h1>
          <p className="mt-1 text-sm text-slate-500">
            Live telemetry and infrastructure status · Auto-refreshes every 10s
          </p>
        </div>
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

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Database className="h-5 w-5" />}
          value={`${telemetry.databaseLatencyMs ?? 0}ms`}
          label="Database Latency"
          trend={telemetry.databaseHealthy ? 'Healthy' : 'Degraded'}
        />
        <StatCard
          icon={<Heart className="h-5 w-5" />}
          value={telemetry.databaseConnections ?? 0}
          label="Active DB Connections"
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          value={(queue.active ?? 0) + (queue.waiting ?? 0)}
          label="Total Queue Backlog"
          trend={queue.failed > 0 ? `${queue.failed} failed` : undefined}
        />
      </div>

      {/* Queue Radar */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="font-display text-lg text-white mb-4">BullMQ Worker Queues</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: 'Waiting',
              value: queue.waiting,
              color: 'text-slate-300 bg-slate-400/10 border-slate-400/20',
            },
            {
              label: 'Active',
              value: queue.active,
              color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
            },
            {
              label: 'Delayed',
              value: queue.delayed,
              color: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
            },
            {
              label: 'Failed',
              value: queue.failed,
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
        <Panel title="WebSocket Connections">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Active WebSocket Sessions</span>
              <span className="font-mono text-2xl font-bold text-white">
                {telemetry.websocketConnections}
              </span>
            </div>
          </div>
        </Panel>

        <Panel title="External Providers">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-amber-300" />
                <div>
                  <div className="text-sm font-medium text-white">Email Provider (Resend)</div>
                  <div className="text-xs text-slate-500">Transactional & Campaigns</div>
                </div>
              </div>
              <StatusBadge
                status={messaging.providerHealth.emailConfigured ? 'active' : 'offline'}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-emerald-400" />
                <div>
                  <div className="text-sm font-medium text-white">WhatsApp Provider (Twilio)</div>
                  <div className="text-xs text-slate-500">SMS & WhatsApp Delivery</div>
                </div>
              </div>
              <StatusBadge
                status={messaging.providerHealth.whatsappConfigured ? 'active' : 'offline'}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-sm font-medium text-white">Newsletter Sync</div>
                  <div className="text-xs text-slate-500">Audience synchronization</div>
                </div>
              </div>
              <StatusBadge
                status={messaging.providerHealth.newsletterConfigured ? 'active' : 'offline'}
              />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
