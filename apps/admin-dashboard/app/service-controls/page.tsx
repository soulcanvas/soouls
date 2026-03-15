'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings } from 'lucide-react';
import { useShell } from '../components/ClientShell';
import { EmptyState, Panel, ToggleSwitch } from '../components/ui';
import { type Overview, api } from '../lib/api';

export default function ServiceControlsPage() {
  const { viewer, setFlash } = useShell();
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

  const canManage = viewer?.permissions?.includes('mutate:service_controls');

  if (viewer && !canManage) {
    return (
      <div className="animate-slide-up">
        <EmptyState
          icon={<Settings className="h-12 w-12" />}
          title="Access Restricted"
          description="Service controls are restricted to Engineers and Super Admins."
        />
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-8">
      <div>
        <h1 className="font-display text-3xl text-white">Emergency Service Controls</h1>
        <p className="mt-1 text-sm text-slate-500">
          Kill switches and pause controls for critical backend services and workers.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {!controls
          ? [1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl bg-white/[0.03]" />)
          : controls.map((control) => (
              <Panel key={control.id} title={control.label}>
                <div className="mt-1 flex items-start justify-between gap-4">
                  <div className="text-sm text-slate-500">{control.description}</div>
                  <ToggleSwitch
                    enabled={control.enabled}
                    disabled={!canManage}
                    onToggle={() => {
                      void api(`/command-api/service-controls/${control.key}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ enabled: !control.enabled }),
                      }).then(() => {
                        setFlash(`${control.label} → ${!control.enabled ? 'online' : 'paused'}`);
                        invalidate();
                      });
                    }}
                  />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      control.enabled
                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                        : 'bg-rose-400 shadow-sm shadow-rose-400/50'
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      control.enabled ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {control.enabled ? 'System Online' : 'System Paused'}
                  </span>
                </div>
              </Panel>
            ))}
      </div>
    </div>
  );
}
