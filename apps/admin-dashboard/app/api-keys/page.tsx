'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound } from 'lucide-react';
import { useShell } from '../components/ClientShell';
import { ActionButton, EmptyState, Panel, StatusBadge } from '../components/ui';
import { type ApiKeyRecord, api } from '../lib/api';

export default function ApiKeysPage() {
  const { viewer, setFlash } = useShell();
  const queryClient = useQueryClient();

  const { data: keys } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => api<ApiKeyRecord[]>('/command-api/api-keys'),
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['api-keys'] });
  }

  const canManage = viewer?.permissions?.includes('mutate:api_keys');

  if (viewer && !canManage) {
    return (
      <div className="animate-slide-up">
        <EmptyState
          icon={<KeyRound className="h-12 w-12" />}
          title="Access Restricted"
          description="API key management is restricted to Engineers and Super Admins."
        />
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">Developer API Keys</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage public API keys for external integrations.
          </p>
        </div>
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
                className="flex items-center justify-between rounded-xl bg-white/[0.02] px-5 py-4 transition-colors hover:bg-white/[0.04]"
              >
                <div>
                  <div className="flex items-center gap-2 text-white">
                    <KeyRound className="h-4 w-4 text-amber-300" />
                    {key.label}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-mono">{key.keyPrefix}••••••••••••</span>
                    <span>{key.rateLimitPerMinute} req/min</span>
                    <StatusBadge status={key.status} />
                  </div>
                </div>
                {key.status !== 'revoked' && (
                  <ActionButton
                    variant="danger"
                    onClick={() => {
                      void api(`/command-api/api-keys/${key.id}/revoke`, {
                        method: 'POST',
                      }).then(() => {
                        setFlash('API key revoked immediately.');
                        invalidate();
                      });
                    }}
                  >
                    Revoke Key
                  </ActionButton>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
