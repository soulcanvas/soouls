'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  Clock,
  DollarSign,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { useShell } from '../components/ClientShell';
import { ActionButton, Panel, StatusBadge, ToggleSwitch } from '../components/ui';
import { type AiTelemetryPayload, api } from '../lib/api';

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
      <title>Refresh</title>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function StatCard({
  icon,
  value,
  label,
  trend,
  color = 'indigo',
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: string;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-400/15 text-indigo-400',
    amber: 'bg-amber-400/15 text-amber-400',
    emerald: 'bg-emerald-400/15 text-emerald-400',
    rose: 'bg-rose-400/15 text-rose-400',
  };

  return (
    <div
      className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 ${trend ? 'border-rose-400/20 bg-rose-400/5' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClasses[color]}`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-semibold text-white">{value}</div>
        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
          {label}
          {trend && <span className="text-rose-400">{trend}</span>}
        </div>
      </div>
    </div>
  );
}

export function AiSection() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'actions' | 'recent'>(
    'overview',
  );
  const { setFlash } = useShell();
  const queryClient = useQueryClient();

  const { data, isPending, refetch } = useQuery({
    queryKey: ['ai-telemetry'],
    queryFn: () => api<AiTelemetryPayload>('/command-api/ai-telemetry'),
    refetchInterval: 30_000,
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

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'models', label: 'By Model' },
    { id: 'actions', label: 'By Action' },
    { id: 'recent', label: 'Recent Logs' },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">AI Telemetry</h1>
          <p className="mt-1 text-sm text-slate-500">
            Complete AI usage analytics, token burn rates, and cost attribution across all services.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${data.killSwitchEnabled ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}
          >
            <div
              className={`h-2 w-2 rounded-full ${data.killSwitchEnabled ? 'bg-emerald-400' : 'bg-rose-400'}`}
            />
            <span
              className={`text-[11px] font-medium ${data.killSwitchEnabled ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              {data.killSwitchEnabled ? 'AI Online' : 'AI Offline'}
            </span>
          </div>
          <ActionButton variant="default" onClick={handleManualSync} disabled={isSyncing}>
            <div className="flex items-center gap-2">
              <RefreshIcon className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync
            </div>
          </ActionButton>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          value={`$${data.globalTotalUsd.toFixed(4)}`}
          label="Total AI Spend"
          color="indigo"
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          value={data.globalTotalTokens.toLocaleString()}
          label="Total Tokens"
          color="amber"
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          value={data.totalRequests.toLocaleString()}
          label="Total Requests"
          color="emerald"
        />
        <StatCard
          icon={<Zap className="h-5 w-5" />}
          value={`$${data.avgCostPerRequest.toFixed(6)}`}
          label="Avg Cost/Request"
          color="amber"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          value={`$${data.weeklyCost.toFixed(4)}`}
          label="Last 7 Days"
          color="indigo"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          value={`$${data.monthlyCost.toFixed(4)}`}
          label="Last 30 Days"
          color="indigo"
        />
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-400/20 text-rose-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-rose-200">Kill Switch</div>
                <div className="text-xs text-rose-300/60">
                  {data.killSwitchEnabled ? 'AI Weaver is ONLINE' : 'AI Weaver is OFFLINE'}
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

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl border px-4 py-2 text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
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
                      <div
                        key={i}
                        className="group relative flex flex-1 flex-col items-center gap-2"
                      >
                        <div className="z-10 -top-14 absolute hidden rounded bg-slate-800 px-3 py-1.5 text-xs text-white shadow-xl group-hover:block whitespace-nowrap">
                          <div className="font-semibold text-amber-300">${day.cost.toFixed(4)}</div>
                          <div className="text-[10px] text-slate-400">
                            {day.tokens.toLocaleString()} tok · {day.requests} req
                          </div>
                        </div>
                        <div
                          className="w-full rounded-t-sm bg-gradient-to-t from-indigo-500/20 to-indigo-400/60 transition-all group-hover:from-indigo-500/40 group-hover:to-indigo-400/80"
                          style={{ height: `${Math.max(height, 2)}%` }}
                        />
                        <div className="w-full truncate text-center text-[10px] text-slate-500">
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
            <Panel title="Top Cost by User">
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
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-[10px] font-bold text-slate-300">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-white">
                            {user.email}
                          </div>
                          <div className="truncate text-[10px] text-slate-500">
                            {user.totalRequests} req · {(user.totalTokens / 1000).toFixed(1)}k tok
                          </div>
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
      )}

      {activeTab === 'models' && (
        <Panel title="Cost Breakdown by Model">
          {data.costByModel.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No model usage data found.
            </div>
          ) : (
            <div className="space-y-4">
              {data.costByModel.map((model) => {
                const percentage =
                  data.globalTotalUsd > 0 ? (model.totalCost / data.globalTotalUsd) * 100 : 0;
                return (
                  <div key={model.model} className="rounded-xl bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <BrainCircuit className="h-5 w-5 text-indigo-400" />
                        <div>
                          <div className="font-medium text-white">{model.model}</div>
                          <div className="text-xs text-slate-500">
                            {model.totalRequests.toLocaleString()} requests
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-indigo-400">
                          ${model.totalCost.toFixed(4)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {(model.totalTokens / 1000).toFixed(1)}k tokens
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/5">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="mt-1 text-right text-[10px] text-slate-500">
                      {percentage.toFixed(1)}% of total
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      )}

      {activeTab === 'actions' && (
        <Panel title="Cost Breakdown by Action">
          {data.costByAction.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">No action data found.</div>
          ) : (
            <div className="space-y-3">
              {data.costByAction.map((action) => {
                const percentage =
                  data.globalTotalUsd > 0 ? (action.totalCost / data.globalTotalUsd) * 100 : 0;
                return (
                  <div
                    key={action.action}
                    className="flex items-center justify-between rounded-xl bg-white/[0.02] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-amber-400" />
                      <div>
                        <div className="text-sm font-medium text-white">{action.action}</div>
                        <div className="text-xs text-slate-500">
                          {action.totalRequests.toLocaleString()} requests
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-1.5 w-24 rounded-full bg-white/5">
                        <div
                          className="h-1.5 rounded-full bg-amber-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-20 text-right font-mono text-sm text-amber-400">
                        ${action.totalCost.toFixed(4)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      )}

      {activeTab === 'recent' && (
        <Panel title="Recent AI Requests">
          {data.recentLogs.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">No recent requests.</div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-4 border-b border-white/[0.06] pb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                <div className="col-span-3">User</div>
                <div className="col-span-2">Action</div>
                <div className="col-span-2">Model</div>
                <div className="col-span-2 text-right">Tokens</div>
                <div className="col-span-2 text-right">Cost</div>
                <div className="col-span-1 text-right">Time</div>
              </div>
              {data.recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-12 items-center gap-4 border-b border-white/[0.04] py-3 text-sm last:border-0"
                >
                  <div className="col-span-3 truncate text-slate-300">{log.email}</div>
                  <div className="col-span-2">
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                      {log.action}
                    </span>
                  </div>
                  <div className="col-span-2 truncate font-mono text-xs text-indigo-400">
                    {log.model}
                  </div>
                  <div className="col-span-2 text-right font-mono text-xs text-slate-400">
                    {log.totalTokens.toLocaleString()}
                  </div>
                  <div className="col-span-2 text-right font-mono text-xs text-amber-400">
                    ${log.estimatedCostUsd.toFixed(6)}
                  </div>
                  <div className="col-span-1 text-right text-[10px] text-slate-500">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
