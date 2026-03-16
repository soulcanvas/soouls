'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, ArrowUpRight, CheckCircle2, DollarSign, Loader2, Users } from 'lucide-react';
import { useState } from 'react';
import { ActionButton, Panel } from '../components/ui';
import { type BillingPayload, api, formatRelativeTime } from '../lib/api';

export default function BillingPage() {
  const [isSyncing, setIsSyncing] = useState(false);

  const { data, isPending, refetch } = useQuery({
    queryKey: ['billing-overview'],
    queryFn: () => api<BillingPayload>('/command-api/billing'),
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
          <h1 className="font-display text-3xl text-white">Financial & Billing Hub</h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time MRR, active subscribers, and Stripe webhook observability.
          </p>
        </div>
        <ActionButton variant="default" onClick={handleManualSync} disabled={isSyncing}>
          <div className="flex items-center gap-2">
            <RefreshIcon className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Stripe Data
          </div>
        </ActionButton>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* MRR Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20">
              <DollarSign className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              +12.5%
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-white">${data.mrr.toLocaleString()}</div>
            <div className="mt-1 text-sm text-slate-500">Monthly Recurring Revenue</div>
          </div>
        </div>

        {/* Subscribers Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400/20 to-cyan-500/20">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-blue-400/10 px-2.5 py-1 text-xs font-medium text-blue-400">
              <ArrowUpRight className="h-3 w-3" />
              +4.2%
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-white">
              {data.activeSubscribers.toLocaleString()}
            </div>
            <div className="mt-1 text-sm text-slate-500">Active Subscribers</div>
          </div>
        </div>

        {/* Churn Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400/20 to-pink-500/20">
              <Activity className="h-6 w-6 text-rose-400" />
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-rose-400/10 px-2.5 py-1 text-xs font-medium text-rose-400">
              <ArrowUpRight className="h-3 w-3" />
              +0.1%
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-white">{data.churnRate}%</div>
            <div className="mt-1 text-sm text-slate-500">Monthly Churn Rate</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Revenue Snapshot (Last 7 Days)">
            <div className="flex h-[300px] items-end gap-2 pt-6">
              {data.recentRevenue.map((day, i) => {
                const height =
                  (day.amount / (Math.max(...data.recentRevenue.map((d) => d.amount)) || 1)) * 100;
                return (
                  <div key={i} className="group relative flex flex-1 flex-col items-center gap-2">
                    <div className="absolute -top-8 hidden rounded bg-slate-800 px-2 py-1 text-xs text-white group-hover:block">
                      ${day.amount}
                    </div>
                    <div
                      className="w-full rounded-t-sm bg-gradient-to-t from-emerald-500/20 to-emerald-400/60 transition-all group-hover:from-emerald-500/40 group-hover:to-emerald-400/80"
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-xs text-slate-500">{day.date}</div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-1">
          <Panel title="Recent Stripe Webhooks">
            <div className="space-y-4 pt-2">
              {data.recentWebhooks.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  No webhooks received yet.
                </div>
              ) : (
                data.recentWebhooks.map((hook) => (
                  <div
                    key={hook.id}
                    className="flex items-center justify-between border-b border-white/[0.04] pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          hook.status === 'success' ? 'bg-emerald-400/10' : 'bg-rose-400/10'
                        }`}
                      >
                        {hook.status === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Activity className="h-4 w-4 text-rose-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{hook.eventType}</div>
                        <div className="text-xs text-slate-500">
                          {hook.customerId || 'No Customer'} •{' '}
                          {formatRelativeTime(hook.processedAt)}
                        </div>
                      </div>
                    </div>
                    {(hook.amount ?? 0) > 0 && (
                      <div className="text-sm font-semibold text-emerald-400">
                        +${hook.amount?.toFixed(2)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 border-t border-white/[0.06] pt-4">
              <button className="w-full text-center text-sm text-slate-400 hover:text-white transition-colors">
                View all webhooks &rarr;
              </button>
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
