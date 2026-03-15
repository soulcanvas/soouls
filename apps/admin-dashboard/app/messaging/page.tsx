'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, MessageSquareShare } from 'lucide-react';
import { useState } from 'react';
import { useShell } from '../components/ClientShell';
import { ActionButton, Panel, StatusBadge } from '../components/ui';
import { type Messaging, api, formatDate, formatRelativeTime } from '../lib/api';

export default function MessagingPage() {
  const { setFlash } = useShell();
  const queryClient = useQueryClient();

  const { data: messaging } = useQuery({
    queryKey: ['messaging'],
    queryFn: () => api<Messaging>('/command-api/messaging'),
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['messaging'] });
  }

  // Compose state
  const [isComposing, setIsComposing] = useState(false);
  const [composeBrand, setComposeBrand] = useState<
    'soulcanvas' | 'soulcanvas-studio' | 'founder-desk'
  >('soulcanvas');
  const [composeTitle, setComposeTitle] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeChannels, setComposeChannels] = useState<Array<'email' | 'whatsapp'>>(['email']);

  async function handleQueue() {
    if (!composeTitle || !composeSubject || !composeBody) return;

    await api('/command-api/messaging/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brandKey: composeBrand,
        title: composeTitle,
        subject: composeSubject,
        markdownBody: composeBody,
        channels: composeChannels,
      }),
    });

    setFlash('Campaign successfully queued for processing.');
    setIsComposing(false);
    setComposeTitle('');
    setComposeSubject('');
    setComposeBody('');
    invalidate();
  }

  if (!messaging) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-64 rounded-2xl bg-white/[0.03]" />
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">Central Messaging</h1>
          <p className="mt-1 text-sm text-slate-500">
            Queue mass campaigns and broadcast messages across email and WhatsApp.
          </p>
        </div>
        {!isComposing && (
          <ActionButton variant="primary" onClick={() => setIsComposing(true)}>
            <div className="flex items-center gap-2">
              <MessageSquareShare className="h-4 w-4" />
              New Broadcast
            </div>
          </ActionButton>
        )}
      </div>

      {isComposing && (
        <Panel title="Compose Campaign">
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="composeTitle"
                  className="mb-1.5 block text-xs font-medium text-slate-400"
                >
                  Internal Title
                </label>
                <input
                  id="composeTitle"
                  value={composeTitle}
                  onChange={(e) => setComposeTitle(e.target.value)}
                  placeholder="e.g. March 2026 Feature Release"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-400/30"
                />
              </div>
              <div>
                <label
                  htmlFor="composeBrand"
                  className="mb-1.5 block text-xs font-medium text-slate-400"
                >
                  Brand Persona
                </label>
                <select
                  id="composeBrand"
                  value={composeBrand}
                  onChange={(e) =>
                    setComposeBrand(
                      e.target.value as 'soulcanvas' | 'soulcanvas-studio' | 'founder-desk',
                    )
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none"
                >
                  {messaging.brands.map((b) => (
                    <option key={b.key} value={b.key}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="composeSubject"
                className="mb-1.5 block text-xs font-medium text-slate-400"
              >
                Email Subject / Notification Header
              </label>
              <input
                id="composeSubject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="SoulCanvas Release Update"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-400/30"
              />
            </div>

            <div>
              <label
                htmlFor="composeBody"
                className="mb-1.5 block text-xs font-medium text-slate-400"
              >
                Markdown Body
              </label>
              <textarea
                id="composeBody"
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="# Hello World\n\nWrite your markdown body here..."
                rows={6}
                className="w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm font-mono text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-400/30"
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.06] pt-5">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={composeChannels.includes('email')}
                    onChange={(e) => {
                      if (e.target.checked) setComposeChannels((prev) => [...prev, 'email']);
                      else setComposeChannels((prev) => prev.filter((c) => c !== 'email'));
                    }}
                    className="accent-amber-400"
                  />
                  Email Delivery
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={composeChannels.includes('whatsapp')}
                    onChange={(e) => {
                      if (e.target.checked) setComposeChannels((prev) => [...prev, 'whatsapp']);
                      else setComposeChannels((prev) => prev.filter((c) => c !== 'whatsapp'));
                    }}
                    className="accent-amber-400"
                  />
                  WhatsApp Delivery
                </label>
              </div>
              <div className="flex items-center gap-3">
                <ActionButton onClick={() => setIsComposing(false)}>Cancel</ActionButton>
                <ActionButton
                  variant="primary"
                  onClick={handleQueue}
                  disabled={
                    !composeTitle || !composeSubject || !composeBody || composeChannels.length === 0
                  }
                >
                  Queue Broadcast
                </ActionButton>
              </div>
            </div>
          </div>
        </Panel>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <Panel title="Recent Campaigns">
          <div className="space-y-2 mt-4">
            {messaging.campaigns.length === 0 ? (
              <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-white/[0.08] text-sm text-slate-500">
                No campaigns yet.
              </div>
            ) : (
              messaging.campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-start justify-between rounded-xl bg-white/[0.02] px-5 py-4"
                >
                  <div>
                    <div className="text-sm font-medium text-white">{campaign.title}</div>
                    <div className="mt-1 text-xs text-slate-400">{campaign.subject}</div>
                  </div>
                  <StatusBadge status={campaign.status} />
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Delivery Log">
          <div className="space-y-4">
            {messaging.recentDeliveries.length === 0 ? (
              <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-white/[0.08] text-sm text-slate-500">
                No deliveries yet.
              </div>
            ) : (
              messaging.recentDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-center justify-between border-l-2 border-amber-400/50 pl-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {delivery.channel === 'email' ? (
                        <Mail className="h-3 w-3 text-slate-400" />
                      ) : (
                        <MessageSquareShare className="h-3 w-3 text-slate-400" />
                      )}
                      <span className="text-xs text-white">{delivery.recipient}</span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-500">
                      {formatRelativeTime(delivery.createdAt)}
                    </div>
                  </div>
                  <StatusBadge status={delivery.status} />
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
