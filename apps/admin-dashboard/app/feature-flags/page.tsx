'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ToggleRight } from 'lucide-react';
import { useShell } from '../components/ClientShell';
import { EmptyState, Panel, ToggleSwitch } from '../components/ui';
import { type Overview, api } from '../lib/api';

export default function FeatureFlagsPage() {
  const { viewer, setFlash } = useShell();
  const queryClient = useQueryClient();

  const { data: overviewData } = useQuery({
    queryKey: ['overview'],
    queryFn: () => api<Overview>('/command-api/overview'),
  });

  const flags = overviewData?.featureFlags ?? null;

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['overview'] });
  }

  const canManage = viewer?.permissions?.includes('mutate:feature_flags');

  if (viewer && !canManage) {
    return (
      <div className="animate-slide-up">
        <EmptyState
          icon={<ToggleRight className="h-12 w-12" />}
          title="Access Restricted"
          description="Feature flags are restricted to Engineers and Super Admins."
        />
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-8">
      <div>
        <h1 className="font-display text-3xl text-white">Feature Flags</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gradually roll out or disable features without deploying new code.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {!flags ? (
          <div className="animate-pulse space-y-4 col-span-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/[0.03]" />
            ))}
          </div>
        ) : flags.length === 0 ? (
          <div className="col-span-2">
            <EmptyState
              icon={<ToggleRight className="h-10 w-10" />}
              title="No feature flags"
              description="There are currently no feature flags defined in the system."
            />
          </div>
        ) : (
          flags.map((flag) => (
            <Panel key={flag.id} title={flag.key}>
              <div className="mt-2 flex items-start justify-between gap-6">
                <div className="text-sm text-slate-400">
                  {flag.description ?? 'No description provided.'}
                </div>
                <div className="flex shrink-0 items-center justify-end">
                  <ToggleSwitch
                    enabled={flag.enabled}
                    disabled={!canManage}
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
              </div>
              <div className="mt-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                    flag.enabled
                      ? 'bg-emerald-400/10 text-emerald-400'
                      : 'bg-slate-400/10 text-slate-500'
                  }`}
                >
                  {flag.enabled ? 'Enabled globally' : 'Disabled globally'}
                </span>
              </div>
            </Panel>
          ))
        )}
      </div>
    </div>
  );
}
