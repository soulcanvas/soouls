'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, Database, Globe, Heart, Mail, MessageSquare, Server, Zap } from 'lucide-react';
import { Panel, StatCard, StatusBadge } from '../components/ui';
import { type HealthPayload, api } from '../lib/api';

function ServiceStatus({
  name,
  healthy,
  latency,
  details,
}: {
  name: string;
  healthy: boolean;
  latency?: number;
  details?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-2 w-2 rounded-full ${healthy ? 'bg-emerald-400' : 'bg-rose-400'}`}
        />
        <div>
          <div className="text-sm font-medium text-white">{name}</div>
          {details && <div className="text-xs text-slate-500">{details}</div>}
        </div>
      </div>
      <div className="text-right">
        {latency !== undefined && latency >= 0 ? (
          <span className="font-mono text-sm text-slate-300">{latency}ms</span>
        ) : (
          <StatusBadge status={healthy ? 'active' : 'offline'} />
        )}
      </div>
    </div>
  );
}

export function HealthSection() {
  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => api<HealthPayload>('/command-api/health'),
    refetchInterval: 10_000,
  });

  if (!health) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-32 rounded-2xl bg-white/[0.03]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/[0.03]" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 rounded-2xl bg-white/[0.03]" />
          <div className="h-64 rounded-2xl bg-white/[0.03]" />
        </div>
      </div>
    );
  }

  const { queue, telemetry, messaging, redis } = health;
  const totalQueue = (queue.active ?? 0) + (queue.waiting ?? 0) + (queue.delayed ?? 0);

  return (
    <div className="space-y-8">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Database className="h-5 w-5" />}
          value={`${telemetry.databaseLatencyMs ?? 0}ms`}
          label="PostgreSQL Latency"
          trend={telemetry.databaseHealthy ? 'Healthy' : 'Degraded'}
        />
        <StatCard
          icon={<Server className="h-5 w-5" />}
          value={telemetry.databaseConnections ?? 0}
          label="DB Connections"
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          value={totalQueue}
          label="Queue Backlog"
          trend={queue.failed > 0 ? `${queue.failed} failed` : undefined}
        />
        <StatCard
          icon={<Zap className="h-5 w-5" />}
          value={redis.latencyMs >= 0 ? `${redis.latencyMs}ms` : 'N/A'}
          label="Redis Latency"
          trend={redis.connected ? 'Connected' : 'Disconnected'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Core Services">
          <div className="space-y-4">
            <ServiceStatus
              name="PostgreSQL"
              healthy={telemetry.databaseHealthy}
              latency={telemetry.databaseLatencyMs}
              details={`${telemetry.databaseConnections} active connections`}
            />
            <ServiceStatus
              name="Redis (Upstash)"
              healthy={redis.connected}
              latency={redis.latencyMs >= 0 ? redis.latencyMs : undefined}
              details={
                redis.connected
                  ? `${redis.connectedClients} clients · ${redis.usedMemory} used`
                  : 'Connection failed'
              }
            />
            <ServiceStatus
              name="BullMQ Queue"
              healthy={queue.failed === 0}
              details={`${queue.active} active · ${queue.waiting} waiting · ${queue.delayed} delayed`}
            />
          </div>
        </Panel>

        <Panel title="External Providers">
          <div className="space-y-4">
            <ServiceStatus
              name="Email (Resend)"
              healthy={messaging.providerHealth.emailConfigured}
              details="Transactional & campaign emails"
            />
            <ServiceStatus
              name="WhatsApp (Twilio)"
              healthy={messaging.providerHealth.whatsappConfigured}
              details="SMS & WhatsApp messaging"
            />
            <ServiceStatus
              name="Newsletter Sync"
              healthy={messaging.providerHealth.newsletterConfigured}
              details="Audience synchronization"
            />
          </div>
        </Panel>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="mb-4 font-display text-lg text-white">BullMQ Worker Queues</h2>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="WebSocket Connections">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Active WebSocket Sessions</span>
              <span className="font-mono text-2xl font-bold text-white">
                {telemetry.websocketConnections}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Connection Mode</span>
              <span className="text-slate-300">Real-time Updates</span>
            </div>
          </div>
        </Panel>

        <Panel title="Redis Details">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Status</span>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${redis.connected ? 'bg-emerald-400' : 'bg-rose-400'}`}
                />
                <span className={redis.connected ? 'text-emerald-400' : 'text-rose-400'}>
                  {redis.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Latency</span>
              <span className="font-mono text-slate-300">
                {redis.latencyMs >= 0 ? `${redis.latencyMs}ms` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Memory Used</span>
              <span className="font-mono text-slate-300">{redis.usedMemory}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Connected Clients</span>
              <span className="font-mono text-slate-300">{redis.connectedClients}</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
