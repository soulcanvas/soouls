'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, BrainCircuit, Cpu, Loader2, ShieldAlert, Zap } from 'lucide-react';
import { useState } from 'react';
import { useShell } from '../components/ClientShell';
import { ActionButton, Panel, ToggleSwitch } from '../components/ui';
import { type AiTelemetryPayload, api } from '../lib/api';

export default function AiTelemetryPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { setFlash } = useShell();
  const queryClient = useQueryClient();

  const { data, isPending, refetch } = useQuery({
    queryKey: ['ai-telemetry'],
    queryFn: () => api<AiTelemetryPayload>('/command-api/ai-telemetry'),
  });

  const toggleKillSwitchMut = useMutation({
    mutationFn: (enabled: boolean) =>
      api('/command-api/service-controls/ai_weaver', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-telemetry'] });
      setFlash('AI Kill Switch updated.');
    },
  });

  const handleManualSync = async () => {
    setIsSyncing(true);
    await refetch();
    setTimeout(() => setIsSyncing(false), 500);
  };

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
          <h1 className="font-display text-3xl text-white">AI Weaver Telemetry</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor API token burn rates, attribute USD costs to users, and control the global kill
            switch.
          </p>
        </div>
        <ActionButton variant="default" onClick={handleManualSync} disabled={isSyncing}>
          <div className="flex items-center gap-2">
            <RefreshIcon className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Telemetry
          </div>
        </ActionButton>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Cost USD */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400/20 to-purple-500/20">
              <Activity className="h-6 w-6 text-indigo-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-white">
              ${data.globalTotalUsd.toFixed(4)}
            </div>
            <div className="mt-1 text-sm text-slate-500">Global AI Spend (USD)</div>
          </div>
        </div>

        {/* Total Tokens */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20">
              <Zap className="h-6 w-6 text-amber-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-white">
              {data.globalTotalTokens.toLocaleString()}
            </div>
            <div className="mt-1 text-sm text-slate-500">Total Tokens Generated</div>
          </div>
        </div>

        {/* Kill Switch */}
        <div className="flex flex-col justify-center rounded-2xl border border-rose-400/20 bg-rose-400/5 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-400/20 text-rose-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-rose-200">AI Kill Switch</div>
                <div className="text-xs text-rose-300/60">
                  {data.killSwitchEnabled ? 'Weaver is ONLINE' : 'Weaver is OFFLINE'}
                </div>
              </div>
            </div>
            <ToggleSwitch
              enabled={data.killSwitchEnabled}
              onToggle={() => toggleKillSwitchMut.mutate(!data.killSwitchEnabled)}
              disabled={toggleKillSwitchMut.isPending}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Token Burn Rate (Last 30 Days)">
            <div className="flex h-[300px] items-end gap-2 pt-6">
              {data.burnRateGraph.length === 0 ? (
                <div className="flex w-full items-center justify-center text-sm text-slate-500">
                  No telemetry recorded yet.
                </div>
              ) : (
                data.burnRateGraph.map((day, i) => {
                  const maxCost = Math.max(...data.burnRateGraph.map((d) => d.cost));
                  const height = maxCost > 0 ? (day.cost / maxCost) * 100 : 0;
                  return (
                    <div key={i} className="group relative flex flex-1 flex-col items-center gap-2">
                      <div className="absolute -top-12 hidden rounded bg-slate-800 px-3 py-1.5 text-xs text-white shadow-xl group-hover:block z-10 whitespace-nowrap">
                        <div className="font-semibold text-amber-300">${day.cost.toFixed(4)}</div>
                        <div className="text-[10px] text-slate-400">
                          {day.tokens.toLocaleString()} tok
                        </div>
                      </div>
                      <div
                        className="w-full rounded-t-sm bg-gradient-to-t from-indigo-500/20 to-indigo-400/60 transition-all group-hover:from-indigo-500/40 group-hover:to-indigo-400/80"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                      <div className="text-[10px] text-slate-500 truncate w-full text-center">
                        {new Date(day.date).getDate()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-1">
          <Panel title="Top Cost by User (CPU)">
            <div className="space-y-4 pt-2">
              {data.costPerUser.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  No user usage data found.
                </div>
              ) : (
                data.costPerUser.map((user, idx) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between border-b border-white/[0.04] pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-[10px] font-bold text-slate-300">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-white">{user.email}</div>
                        <div className="truncate text-[10px] text-slate-500">{user.userId}</div>
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-semibold text-indigo-400">
                      ${user.totalCost.toFixed(4)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
