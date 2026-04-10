'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Mail, MessageSquareShare, RefreshCw, Search, Send, Zap } from 'lucide-react';
import { useState } from 'react';
import { useShell } from '../components/ClientShell';
import { PermissionGate } from '../components/PermissionGate';
import { ActionButton, Panel, StatusBadge } from '../components/ui';
import { type Messaging, api, formatRelativeTime } from '../lib/api';

type AudienceEstimate = {
  total: number;
  breakdown: {
    all: number;
    last7Days: number;
    last30Days: number;
    premium: number;
    enterprise: number;
  };
};

export function MessagingSection() {
  const { setFlash } = useShell();
  const queryClient = useQueryClient();

  const { data: messaging, isLoading: messagingLoading } = useQuery({
    queryKey: ['messaging'],
    queryFn: () => api<Messaging>('/command-api/messaging'),
  });

  const { data: audience } = useQuery({
    queryKey: ['messaging-audience'],
    queryFn: () =>
      api<{ count: number; premium: number; enterprise: number; last7Days: number }>(
        '/command-api/users?limit=1',
      ),
    enabled: true,
    staleTime: 60000,
  });

  const [isComposing, setIsComposing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showTestDialog, setShowTestDialog] = useState(false);

  const [composeBrand, setComposeBrand] = useState<
    'soouls' | 'soouls-studio' | 'founder-desk'
  >('soouls');
  const [composeTitle, setComposeTitle] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeCtaLabel, setComposeCtaLabel] = useState('');
  const [composeCtaUrl, setComposeCtaUrl] = useState('');
  const [composeChannels, setComposeChannels] = useState<Array<'email' | 'whatsapp'>>(['email']);
  const [targetNodeCount, setTargetNodeCount] = useState<string>('any');
  const [targetSignupDate, setTargetSignupDate] = useState<string>('any');
  const [targetBillingTier, setTargetBillingTier] = useState<string>('all');

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['messaging'] });
  }

  async function handleSendTest() {
    if (!testEmail || !composeSubject || !composeBody) return;

    setSendingTest(true);
    try {
      await api('/command-api/messaging/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail,
          subject: composeSubject,
          markdownBody: composeBody,
          ctaLabel: composeCtaLabel,
          ctaUrl: composeCtaUrl,
          brandKey: composeBrand,
        }),
      });
      setFlash(`Test email sent to ${testEmail}`);
      setShowTestDialog(false);
      setTestEmail('');
    } catch {
      setFlash('Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  }

  async function handleQueue() {
    if (!composeTitle || !composeSubject || !composeBody) return;

    try {
      await api('/command-api/messaging/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandKey: composeBrand,
          title: composeTitle,
          subject: composeSubject,
          markdownBody: composeBody,
          ctaLabel: composeCtaLabel || undefined,
          ctaUrl: composeCtaUrl || undefined,
          channels: composeChannels,
          targeting: {
            nodeCount: targetNodeCount,
            signupDate: targetSignupDate,
            billingTier: targetBillingTier,
          },
        }),
      });

      setFlash('Campaign queued for processing.');
      setIsComposing(false);
      setComposeTitle('');
      setComposeSubject('');
      setComposeBody('');
      setComposeCtaLabel('');
      setComposeCtaUrl('');
      invalidate();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : 'Failed to queue campaign');
    }
  }

  if (!messaging) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 w-full rounded-2xl bg-white/[0.03]" />
        <div className="h-64 rounded-2xl bg-white/[0.03]" />
      </div>
    );
  }

  const estimatedAudience =
    targetSignupDate === 'last_7_days'
      ? 50
      : targetSignupDate === 'last_30_days'
        ? 200
        : audience?.count || 500;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">Central Messaging</h1>
          <p className="mt-1 text-sm text-slate-500">
            Broadcast emails, manage campaigns, and track deliveries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PermissionGate permission="mutate:messaging">
            <ActionButton
              variant="default"
              onClick={() => setShowTestDialog(true)}
              disabled={!composeSubject || !composeBody}
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Send Test
              </div>
            </ActionButton>
          </PermissionGate>
          <PermissionGate permission="mutate:messaging">
            {!isComposing && (
              <ActionButton variant="primary" onClick={() => setIsComposing(true)}>
                <div className="flex items-center gap-2">
                  <MessageSquareShare className="h-4 w-4" />
                  New Campaign
                </div>
              </ActionButton>
            )}
          </PermissionGate>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Email Status</h3>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                messaging.providerHealth.emailConfigured
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                  : 'bg-rose-400 shadow-sm shadow-rose-400/50'
              }`}
            />
            <span className="text-xs text-slate-400">
              {messaging.providerHealth.emailConfigured ? 'Connected' : 'Not configured'}
            </span>
          </div>
          <div className="mt-3 text-[10px] text-slate-500">
            Via Resend API
            <br />
            Sender: onboarding@resend.dev
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">WhatsApp Status</h3>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                messaging.providerHealth.whatsappConfigured
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                  : 'bg-slate-400 shadow-sm shadow-slate-400/50'
              }`}
            />
            <span className="text-xs text-slate-400">
              {messaging.providerHealth.whatsappConfigured ? 'Connected' : 'Not configured'}
            </span>
          </div>
          <div className="mt-3 text-[10px] text-slate-500">Via Twilio</div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Send className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Total Campaigns</h3>
          </div>
          <div className="font-display text-3xl font-bold text-white">
            {messaging.campaigns.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {messaging.campaigns.filter((c) => c.status === 'sent').length} sent
          </div>
        </div>
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
                  Internal Title *
                </label>
                <input
                  id="composeTitle"
                  value={composeTitle}
                  onChange={(e) => setComposeTitle(e.target.value)}
                  placeholder="e.g. March Feature Announcement"
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
                      e.target.value as 'soouls' | 'soouls-studio' | 'founder-desk',
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
                Email Subject / Header *
              </label>
              <input
                id="composeSubject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="What's new in Soouls - March 2026"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-400/30"
              />
            </div>

            <div>
              <label
                htmlFor="composeBody"
                className="mb-1.5 block text-xs font-medium text-slate-400"
              >
                Message Body (Markdown) *
              </label>
              <textarea
                id="composeBody"
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="# Hello&#10;&#10;Write your message here using **markdown** formatting..."
                rows={8}
                className="w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm font-mono text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-400/30"
              />
              <p className="mt-1.5 text-[10px] text-slate-500">
                Supports: **bold**, *italic*, # headings, - lists, [links](url)
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="composeCtaLabel"
                  className="mb-1.5 block text-xs font-medium text-slate-400"
                >
                  CTA Button Label <span className="text-slate-500">(optional)</span>
                </label>
                <input
                  id="composeCtaLabel"
                  value={composeCtaLabel}
                  onChange={(e) => setComposeCtaLabel(e.target.value)}
                  placeholder="Get Started"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-400/30"
                />
              </div>
              <div>
                <label
                  htmlFor="composeCtaUrl"
                  className="mb-1.5 block text-xs font-medium text-slate-400"
                >
                  CTA URL <span className="text-slate-500">(optional)</span>
                </label>
                <input
                  id="composeCtaUrl"
                  value={composeCtaUrl}
                  onChange={(e) => setComposeCtaUrl(e.target.value)}
                  placeholder="https://soouls.app/dashboard"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-400/30"
                />
              </div>
            </div>

            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-5">
              <h3 className="mb-4 text-sm font-semibold text-amber-200">Audience Targeting</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">
                    Billing Tier
                  </label>
                  <select
                    value={targetBillingTier}
                    onChange={(e) => setTargetBillingTier(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none"
                  >
                    <option value="all">All Users</option>
                    <option value="premium">Premium Only</option>
                    <option value="enterprise">Enterprise Only</option>
                    <option value="free">Free Only</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">
                    Signup Date
                  </label>
                  <select
                    value={targetSignupDate}
                    onChange={(e) => setTargetSignupDate(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none"
                  >
                    <option value="any">Any Time</option>
                    <option value="last_7_days">Last 7 Days</option>
                    <option value="last_30_days">Last 30 Days</option>
                    <option value="older_than_30">Older than 30 Days</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">
                    Node Count
                  </label>
                  <select
                    value={targetNodeCount}
                    onChange={(e) => setTargetNodeCount(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none"
                  >
                    <option value="any">Any</option>
                    <option value="gt_5">More than 5 nodes</option>
                    <option value="gt_50">Power users (&gt; 50)</option>
                    <option value="eq_0">Zero nodes</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
                <span className="text-xs text-amber-300">
                  Estimated recipients: ~{estimatedAudience.toLocaleString()}
                </span>
              </div>
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
                  Email
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
                  WhatsApp
                </label>
              </div>
              <div className="flex items-center gap-3">
                <ActionButton onClick={() => setIsComposing(false)}>Cancel</ActionButton>
                <ActionButton
                  variant="default"
                  onClick={() => setShowPreview(true)}
                  disabled={!composeSubject || !composeBody}
                >
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </div>
                </ActionButton>
                <PermissionGate permission="mutate:messaging">
                  <ActionButton
                    variant="primary"
                    onClick={handleQueue}
                    disabled={
                      !composeTitle ||
                      !composeSubject ||
                      !composeBody ||
                      composeChannels.length === 0
                    }
                  >
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Queue Campaign
                    </div>
                  </ActionButton>
                </PermissionGate>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {showPreview && (
        <Panel title="Email Preview">
          <div className="rounded-xl border border-white/[0.08] bg-gradient-to-b from-slate-900 to-slate-950 p-6">
            <div className="mb-4 border-b border-white/[0.06] pb-4">
              <div className="text-xs text-slate-500">From</div>
              <div className="text-sm text-white">Soouls &lt;onboarding@resend.dev&gt;</div>
            </div>
            <div className="mb-4 border-b border-white/[0.06] pb-4">
              <div className="text-xs text-slate-500">Subject</div>
              <div className="text-lg font-medium text-white">{composeSubject}</div>
            </div>
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm text-slate-300">{composeBody}</div>
            </div>
            {composeCtaLabel && composeCtaUrl && (
              <div className="mt-6">
                <a
                  href={composeCtaUrl}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-medium text-black transition-colors hover:bg-amber-300"
                >
                  {composeCtaLabel} →
                </a>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <ActionButton onClick={() => setShowPreview(false)}>Close Preview</ActionButton>
          </div>
        </Panel>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <Panel
          title="Campaigns"
          action={
            <button
              type="button"
              onClick={() => invalidate()}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          }
        >
          <div className="mt-4 space-y-2">
            {messaging.campaigns.length === 0 ? (
              <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-white/[0.08] text-sm text-slate-500">
                No campaigns yet. Create your first campaign above.
              </div>
            ) : (
              messaging.campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-start justify-between rounded-xl bg-white/[0.02] px-5 py-4 transition-colors hover:bg-white/[0.04]"
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

        <Panel
          title="Recent Deliveries"
          action={
            <span className="text-xs text-slate-500">
              {messaging.recentDeliveries.length} recent
            </span>
          }
        >
          <div className="space-y-3">
            {messaging.recentDeliveries.length === 0 ? (
              <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-white/[0.08] text-sm text-slate-500">
                No deliveries yet.
              </div>
            ) : (
              messaging.recentDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-start justify-between border-l-2 border-amber-400/50 pl-3"
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

      {showTestDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0a0f1e] p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-white">Send Test Email</h3>
            <p className="mb-4 text-sm text-slate-400">
              Enter an email address to receive a test preview of your campaign.
            </p>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="mb-4 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-400/30"
            />
            <div className="flex justify-end gap-3">
              <ActionButton onClick={() => setShowTestDialog(false)}>Cancel</ActionButton>
              <ActionButton
                variant="primary"
                onClick={handleSendTest}
                disabled={!testEmail || sendingTest}
              >
                {sendingTest ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Send Test
                  </div>
                )}
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
