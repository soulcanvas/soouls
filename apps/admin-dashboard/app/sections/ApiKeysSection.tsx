'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound } from 'lucide-react';
import { useShell } from '../components/ClientShell';
import { PermissionGate } from '../components/PermissionGate';
import { ActionButton, EmptyState, Panel, StatusBadge } from '../components/ui';
import { type ApiKeyRecord, api } from '../lib/api';

export function ApiKeysSection() {
  const { setFlash } = useShell();
  const queryClient = useQueryClient();

  const { data: keys } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => api<ApiKeyRecord[]>('/command-api/api-keys'),
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['api-keys'] });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">Developer API Keys</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage public API keys. Creating and revoking requires permission.
          </p>
        </div>
        <PermissionGate permission="mutate:api_keys">
          <ActionButton
            variant="primary"
            onClick={() => {
              void api<{ rawKey: string }>('/command-api/api-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  label: `Internal Key - ${new Date().toLocaleDateString()}`,
                  rateLimitPerMinute: 120,
                }),
              }).then((res) => {
                setFlash(`Created! Secret (copy now!): ${res.rawKey}`);
                invalidate();
              });
            }}
          >
            Generate New Key
          </ActionButton>
        </PermissionGate>
      </div>

      <Panel title="Active & Revoked Keys">
        {!keys ? (
          <div className="animate-pulse space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-white/[0.03]" />
            ))}
          </div>
        ) : keys.length === 0 ? (
          <EmptyState
            icon={<KeyRound className="h-10 w-10" />}
            title="No API keys"
            description="Generate your first API key to authenticate external systems."
          />
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-5 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                    <KeyRound className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{key.label}</div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono">
                        {key.keyPrefix}...
                      </code>
                      <span>{key.rateLimitPerMinute} req/min</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={key.status} />
                  <PermissionGate permission="mutate:api_keys">
                    {key.status === 'active' && (
                      <ActionButton
                        variant="danger"
                        onClick={() => {
                          if (!confirm(`Revoke "${key.label}"?`)) return;
                          void api(`/command-api/api-keys/${key.id}/revoke`, {
                            method: 'POST',
                          }).then(() => {
                            setFlash(`Revoked: ${key.label}`);
                            invalidate();
                          });
                        }}
                      >
                        Revoke
                      </ActionButton>
                    )}
                  </PermissionGate>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
