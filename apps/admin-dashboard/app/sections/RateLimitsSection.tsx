'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, Globe, Loader2, RefreshCw, ShieldAlert, Zap } from 'lucide-react';
import { useState } from 'react';
import { ActionButton, Panel, StatusBadge } from '../components/ui';
import { api } from '../lib/api';

type RateLimitEntry = {
  key: string;
  ip: string;
  route: string;
  count: number;
  oldest: number | null;
  newest: number | null;
};

type Violation = {
  ip: string;
  route: string;
  timestamp: number;
  count: number;
};

type RateLimitStats = {
  mode: string;
  entries: RateLimitEntry[];
  violations: Violation[];
  totalKeys?: number;
  topIPs?: Array<{ ip: string; count: number; route: string }>;
  endpoints?: Array<{ route: string; type: string; limit: number }>;
};

export function RateLimitsSection() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'violations' | 'endpoints'>('overview');

  const { data, isPending, refetch } = useQuery({
    queryKey: ['rate-limits'],
    queryFn: () => api<RateLimitStats>('/command-api/rate-limits'),
    refetchInterval: 10000,
  });

  const handleManualSync = async () => {
    setIsSyncing(true);
    await refetch();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const totalTrackedIPs = new Set(data?.entries.map((d) => d.ip)).size;
  const activeWindows = data?.entries.length || 0;
  const _highestTraffic = data?.entries.length
    ? [...data.entries].sort((a, b) => b.count - a.count)[0]
    : null;
  const recentViolations =
    data?.violations?.filter((v) => v.timestamp > Date.now() - 60 * 60 * 1000).length || 0;

  if (isPending || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400/50" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">Rate Limit Monitor</h1>
          <p className="mt-1 text-sm text-slate-500">
            API throughput monitoring, TRPC sliding window tracking, and violation detection.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded bg-white/5 px-2 py-1 text-xs text-slate-400">
            Mode: {data.mode === 'redis' ? 'Redis' : 'In-Memory'}
          </span>
          <ActionButton variant="default" onClick={handleManualSync} disabled={isSyncing}>
            <div className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync
            </div>
          </ActionButton>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-400/15 text-indigo-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-white">
                {activeWindows.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">Active Windows</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-white">
                {totalTrackedIPs.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">Tracked IPs</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-white">
                {data.totalKeys?.toLocaleString() ?? activeWindows}
              </div>
              <div className="text-xs text-slate-500">Total Keys</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-400/20 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-rose-400">{recentViolations}</div>
              <div className="text-xs text-rose-300/60">Violations (1h)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(['overview', 'violations', 'endpoints'] as const).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl border px-4 py-2 text-sm capitalize transition-colors ${
              activeTab === tab
                ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {data.topIPs && data.topIPs.length > 0 && (
            <Panel title="Top Traffic Sources">
              <div className="space-y-3">
                {data.topIPs.map((item, i) => (
                  <div
                    key={item.ip}
                    className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-[10px] font-bold text-slate-400">
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-mono text-sm text-white">{item.ip}</div>
                        <div className="text-[10px] text-slate-500">{item.route}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-24 rounded-full bg-white/5">
                        <div
                          className="h-1.5 rounded-full bg-indigo-400"
                          style={{ width: `${Math.min((item.count / 60) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-sm text-slate-300">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          <Panel title="Active Rate Limit Windows">
            {data.entries.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                No active TRPC requests detected in the current sliding window.
              </div>
            ) : (
              <div className="space-y-3">
                {data.entries
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 50)
                  .map((item) => (
                    <div
                      key={item.key}
                      className="flex flex-col gap-2 border-b border-white/[0.04] pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-xs font-bold text-slate-300">
                          {item.count}
                        </div>
                        <div>
                          <div className="truncate text-sm font-medium text-white">
                            {item.route}
                          </div>
                          <div className="truncate text-[10px] text-slate-500">IP: {item.ip}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-32 rounded-full bg-white/[0.05]">
                          <div
                            className={`h-1.5 rounded-full ${
                              item.count > 50
                                ? 'bg-rose-400'
                                : item.count > 30
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min((item.count / 60) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="w-16 text-right font-mono text-xs text-slate-500">
                          {item.count} / 60
                        </span>
                        {item.count > 50 && <ShieldAlert className="h-4 w-4 text-rose-400" />}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Panel>
        </>
      )}

      {activeTab === 'violations' && (
        <Panel title="Rate Limit Violations">
          {!data.violations || data.violations.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No rate limit violations detected.
            </div>
          ) : (
            <div className="space-y-2">
              {data.violations.map((v, i) => (
                <div
                  key={`${v.ip}-${v.timestamp}-${i}`}
                  className="flex items-center justify-between rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <div>
                      <div className="font-mono text-sm text-white">{v.ip}</div>
                      <div className="text-[10px] text-slate-500">{v.route}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-rose-400">{v.count} req</div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(v.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {activeTab === 'endpoints' && (
        <Panel title="Rate Limit Configuration">
          <div className="space-y-3">
            {data.endpoints?.map((ep) => (
              <div
                key={ep.route}
                className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <div className="text-sm font-medium text-white">{ep.route}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{ep.type} tier</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-400/15 px-2 py-1 font-mono text-xs text-indigo-300">
                    {ep.limit} req/min
                  </span>
                  <StatusBadge status="active" />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
