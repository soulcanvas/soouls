'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings } from 'lucide-react';
import { useShell } from '../components/ClientShell';
import { PermissionGate } from '../components/PermissionGate';
import { EmptyState, Panel, ToggleSwitch } from '../components/ui';
import { type Overview, api } from '../lib/api';

export function ServiceControlsSection() {
  const { setFlash } = useShell();
  const queryClient = useQueryClient();

  const { data: overviewData } = useQuery({
    queryKey: ['overview'],
    queryFn: () => api<Overview>('/command-api/overview'),
    refetchInterval: 15_000,
  });

  const controls = overviewData?.serviceControls ?? null;

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['overview'] });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-white">Emergency Service Controls</h1>
        <p className="mt-1 text-sm text-slate-500">
          Kill switches and pause controls. Toggling requires permission.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {!controls ? (
          [1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl bg-white/[0.03]" />)
        ) : controls.length === 0 ? (
          <div className="col-span-3">
            <EmptyState
              icon={<Settings className="h-10 w-10" />}
              title="No service controls"
              description="There are currently no service controls defined."
            />
          </div>
        ) : (
          controls.map((control) => (
            <Panel key={control.id} title={control.label}>
              <div className="mt-1 flex items-start justify-between gap-4">
                <div className="text-sm text-slate-500">{control.description}</div>
                <PermissionGate permission="mutate:service_controls">
                  <ToggleSwitch
                    enabled={control.enabled}
                    onToggle={() => {
                      void api(`/command-api/service-controls/${control.key}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ enabled: !control.enabled }),
                      }).then(() => {
                        setFlash(`${control.label} → ${control.enabled ? 'paused' : 'resumed'}`);
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
