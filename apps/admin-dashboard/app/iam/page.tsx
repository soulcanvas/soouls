'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import { useState } from 'react';
import { useShell } from '../components/ClientShell';
import { ActionButton, EmptyState, Panel, StatusBadge } from '../components/ui';
import { type AdminRole, type IamPayload, api, formatDate } from '../lib/api';

const ROLE_COLORS: Record<AdminRole, string> = {
  super_admin: 'bg-amber-400/15 text-amber-300 border-amber-400/20',
  engineer: 'bg-blue-400/15 text-blue-300 border-blue-400/20',
  support: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20',
};

export default function IamPage() {
  const { viewer, setFlash } = useShell();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('support');

  const { data: iam } = useQuery({
    queryKey: ['iam'],
    queryFn: () => api<IamPayload>('/command-api/iam'),
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['iam'] });
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    await api('/command-api/iam/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
    });
    setInviteEmail('');
    setFlash(`Invite sent to ${inviteEmail}`);
    invalidate();
  }

  async function handleRevoke(adminId: string, email: string) {
    await api(`/command-api/iam/${adminId}/revoke`, { method: 'POST' });
    setFlash(`${email} access revoked.`);
    invalidate();
  }

  if (!viewer?.permissions?.includes('mutate:invites')) {
    return (
      <div className="animate-slide-up">
        <EmptyState
          icon={<Shield className="h-12 w-12" />}
          title="Access Restricted"
          description="IAM management is available only to Super Admins."
        />
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-8">
      <div>
        <h1 className="font-display text-3xl text-white">Identity & Access Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Invite team members, manage roles, and control access to the Command Center.
        </p>
      </div>

      {/* Invite Form */}
      <Panel title="Invite New Admin">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[280px] flex-1">
            <label className="mb-1 block text-xs text-slate-500">Email Address</label>
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-400/30"
            />
          </div>
          <div className="min-w-[200px]">
            <label className="mb-1 block text-xs text-slate-500">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as AdminRole)}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="support">Tier 1 Support</option>
              <option value="engineer">Senior Engineer</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <ActionButton variant="primary" onClick={handleInvite}>
            Send Invite
          </ActionButton>
        </div>
      </Panel>

      {/* Active Admins */}
      <Panel title="Active Admins">
        {!iam ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-white/[0.03]" />
            ))}
          </div>
        ) : iam.admins.length === 0 ? (
          <EmptyState
            icon={<Shield className="h-10 w-10" />}
            title="No admins yet"
            description="Start by inviting a team member."
          />
        ) : (
          <div className="space-y-2">
            {iam.admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between rounded-xl bg-white/[0.02] px-5 py-4 transition-colors hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 text-xs font-bold text-white">
                    {admin.email[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{admin.email}</div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${ROLE_COLORS[admin.role]}`}
                      >
                        {admin.role.replace('_', ' ')}
                      </span>
                      <StatusBadge status={admin.status} />
                    </div>
                  </div>
                </div>
                {admin.status !== 'revoked' && admin.id !== viewer?.id && (
                  <ActionButton
                    variant="danger"
                    onClick={() => void handleRevoke(admin.id, admin.email)}
                  >
                    Kill Switch
                  </ActionButton>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Pending Invites */}
      {iam && iam.invites.length > 0 && (
        <Panel title="Pending Invitations">
          <div className="space-y-2">
            {iam.invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between rounded-xl bg-white/[0.02] px-5 py-4"
              >
                <div>
                  <div className="text-sm text-white">{invite.email}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${ROLE_COLORS[invite.role]}`}
                    >
                      {invite.role.replace('_', ' ')}
                    </span>
                    <StatusBadge status={invite.status} />
                    <span>Expires {formatDate(invite.expiresAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
