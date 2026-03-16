'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, Loader2, RefreshCw, ShieldAlert, Zap } from 'lucide-react';
import { useState } from 'react';
import { ActionButton, Panel } from '../components/ui';
import { type RateLimitEntry, api } from '../lib/api';

export default function RateLimitsPage() {
  const [isSyncing, setIsSyncing] = useState(false);

  const { data, isPending, refetch } = useQuery({
    queryKey: ['rate-limits'],
    queryFn: () => api<RateLimitEntry[]>('/command-api/rate-limits'),
    refetchInterval: 10000, // auto poll
  });

  const handleManualSync = async () => {
    setIsSyncing(true);
    await refetch();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const totalTrackedIPs = new Set(data?.map((d) => d.key.split(':')[0])).size;
  const activeWindows = data?.length || 0;
  const highestTrafficWindow = data?.length ? [...data].sort((a, b) => b.count - a.count)[0] : null;

  if (isPending || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400/50" />
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">Rate Limit Visualizer</h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time monitoring of API throughput and TRPC sliding window thresholds.
          </p>
        </div>
        <ActionButton variant="default" onClick={handleManualSync} disabled={isSyncing}>
          <div className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Telemetry
          </div>
        </ActionButton>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400/20 to-purple-500/20">
              <Zap className="h-6 w-6 text-indigo-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-white">
              {activeWindows.toLocaleString()}
            </div>
            <div className="mt-1 text-sm text-slate-500">Active Sliding Windows</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20">
              <Activity className="h-6 w-6 text-amber-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-white">
              {totalTrackedIPs.toLocaleString()}
            </div>
            <div className="mt-1 text-sm text-slate-500">Tracked IP Addresses</div>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-6 backdrop-blur-md flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-400/20 text-rose-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-rose-200">Peak Saturation</div>
                <div className="text-xs text-rose-300/60 max-w-[150px] truncate">
                  {highestTrafficWindow ? highestTrafficWindow.key : 'None'}
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-400">
              {highestTrafficWindow?.count || 0}
            </div>
          </div>
        </div>
      </div>

      <Panel title="Active IP Tracking Zones">
        <div className="space-y-4 pt-4">
          {data.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              No active TRPC requests detected in the current sliding window.
            </div>
          ) : (
            data
              .sort((a, b) => b.count - a.count)
              .map((item) => (
                <div
                  key={item.key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 w-full max-w-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-[10px] font-bold text-slate-300">
                      {item.count}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">
                        {item.key.split(':')[1]}
                      </div>
                      <div className="truncate text-[10px] text-slate-500">
                        IP: {item.key.split(':')[0]}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 w-full flex items-center gap-2">
                    <div className="w-full bg-white/[0.05] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-400 h-1.5 rounded-full"
                        style={{ width: `${Math.min((item.count / 60) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 w-12 text-right">
                      {item.count} / 60
                    </span>
                  </div>
                </div>
              ))
          )}
        </div>
      </Panel>
    </div>
  );
}
