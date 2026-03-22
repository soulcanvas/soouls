'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ToggleRight } from 'lucide-react';
import { useShell } from '../components/ClientShell';
import { PermissionGate } from '../components/PermissionGate';
import { EmptyState, Panel, ToggleSwitch } from '../components/ui';
import { type Overview, api } from '../lib/api';

export function FeatureFlagsSection() {
  const { setFlash } = useShell();
  const queryClient = useQueryClient();

  const { data: overviewData } = useQuery({
    queryKey: ['overview'],
    queryFn: () => api<Overview>('/command-api/overview'),
  });

  const flags = overviewData?.featureFlags ?? null;

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['overview'] });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-white">Feature Flags</h1>
        <p className="mt-1 text-sm text-slate-500">
          Control feature rollouts. Toggle switches require permission.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {!flags ? (
          <div className="col-span-2 animate-pulse space-y-4">
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
                <PermissionGate permission="mutate:feature_flags">
                  <ToggleSwitch
                    enabled={flag.enabled}
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
                </PermissionGate>
              </div>
            </Panel>
          ))
        )}
      </div>
    </div>
  );
}
