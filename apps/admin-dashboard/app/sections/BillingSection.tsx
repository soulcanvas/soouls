'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, CheckCircle2, DollarSign, Loader2, Users } from 'lucide-react';
import { Panel } from '../components/ui';
import { type BillingPayload, api, formatRelativeTime } from '../lib/api';

export function BillingSection() {
  const { data, isPending } = useQuery({
    queryKey: ['billing-overview'],
    queryFn: () => api<BillingPayload>('/command-api/billing'),
  });

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
          <h1 className="font-display text-3xl text-white">Financial & Billing Hub</h1>
          <p className="mt-1 text-sm text-slate-500">
            Revenue metrics and Stripe webhook activity.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20">
            <DollarSign className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-white">${data.mrr.toLocaleString()}</div>
            <div className="mt-1 text-sm text-slate-500">Monthly Recurring Revenue</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400/20 to-cyan-500/20">
            <Users className="h-6 w-6 text-blue-400" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-white">{data.activeSubscribers}</div>
            <div className="mt-1 text-sm text-slate-500">Active Subscribers</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400/20 to-orange-500/20">
            <Activity className="h-6 w-6 text-rose-400" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-white">{data.churnRate}%</div>
            <div className="mt-1 text-sm text-slate-500">Monthly Churn Rate</div>
          </div>
        </div>
      </div>

      <Panel title="7-Day Revenue">
        <div className="mt-4 flex h-40 items-end justify-around gap-2">
          {data.recentRevenue.map((item) => (
            <div key={item.date} className="flex flex-col items-center gap-2">
              <div
                className="w-8 rounded-t-lg bg-gradient-to-t from-amber-400/40 to-amber-400/10 transition-all hover:from-amber-400/60"
                style={{ height: `${Math.max((item.amount / 700) * 100, 5)}%` }}
              />
              <span className="text-[10px] text-slate-500">{item.date}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Recent Stripe Webhooks"
        action={<span className="text-xs text-slate-500">{data.recentWebhooks.length} events</span>}
      >
        <div className="mt-4 space-y-2">
          {data.recentWebhooks.length === 0 ? (
            <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-white/[0.08] text-sm text-slate-500">
              No Stripe webhooks recorded yet.
            </div>
          ) : (
            data.recentWebhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <div>
                    <div className="text-sm text-white">{webhook.eventType}</div>
                    <div className="text-xs text-slate-500">
                      {formatRelativeTime(webhook.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {webhook.amount != null && (
                    <div className="text-sm font-medium text-white">
                      ${(webhook.amount / 100).toFixed(2)}
                    </div>
                  )}
                  <div className="text-xs text-slate-500">{webhook.status}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
