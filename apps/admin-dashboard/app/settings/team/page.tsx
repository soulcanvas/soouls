'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Shield, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useShell } from '../../components/ClientShell';
import { ActionButton, EmptyState, Panel, StatusBadge } from '../../components/ui';
import { type AdminRole, type IamPayload, api, formatDate } from '../../lib/api';

const ROLE_COLORS: Record<AdminRole, string> = {
  super_admin: 'bg-amber-400/15 text-amber-300 border-amber-400/20',
  engineer: 'bg-blue-400/15 text-blue-300 border-blue-400/20',
  support: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20',
};

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  engineer: 'Engineer',
  support: 'Support',
};

/** All grantable permissions (displayed in the invite form for delegation). */
const GRANTABLE_PERMISSIONS = [
  { key: 'view:all', label: 'View All Data', description: 'Read-only access to all dashboards' },
  {
    key: 'mutate:users',
    label: 'Manage Users',
    description: 'Edit user accounts, billing, and status',
  },
  {
    key: 'mutate:invites',
    label: 'Manage Invites',
    description: 'Send and revoke admin invitations',
  },
  { key: 'can_invite', label: 'Can Invite', description: 'Allowed to invite subordinate roles' },
  {
    key: 'mutate:api_keys',
    label: 'Manage API Keys',
    description: 'Create and revoke developer API keys',
  },
  {
    key: 'mutate:feature_flags',
    label: 'Manage Feature Flags',
    description: 'Toggle feature flags',
  },
  {
    key: 'mutate:service_controls',
    label: 'Manage Service Controls',
    description: 'Toggle kill switches',
  },
  { key: 'mutate:messaging', label: 'Manage Messaging', description: 'Create and send campaigns' },
] as const;

/** Roles that can be assigned by each role tier. */
const ASSIGNABLE_ROLES: Record<AdminRole, AdminRole[]> = {
  super_admin: ['support', 'engineer', 'super_admin'],
  engineer: ['support'],
  support: [],
};

export default function IamPage() {
  const { viewer, setFlash } = useShell();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('support');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['view:all']);
  const [isInviting, setIsInviting] = useState(false);

  const { data: iam } = useQuery({
    queryKey: ['iam'],
    queryFn: () => api<IamPayload>('/command-api/iam'),
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['iam'] });
  }

  const isSuperAdmin = viewer?.role === 'super_admin';
  const viewerPermissions = viewer?.permissions ?? [];
  const hasWildcard = viewerPermissions.includes('*');

  // Filter grantable permissions to only what the viewer has
  const availablePermissions = GRANTABLE_PERMISSIONS.filter(
    (perm) => hasWildcard || viewerPermissions.includes(perm.key),
  );

  // Filter assignable roles based on viewer's role
  const assignableRoles = viewer?.role ? ASSIGNABLE_ROLES[viewer.role] : [];

  function togglePermission(key: string) {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || isInviting) return;
    setIsInviting(true);
    try {
      await api('/command-api/iam/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
          permissions: selectedPermissions,
        }),
      });
      setInviteEmail('');
      setSelectedPermissions(['view:all']);
      setFlash(`Invite sent to ${inviteEmail}`);
      invalidate();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRevoke(adminId: string, email: string) {
    await api(`/command-api/iam/${adminId}/revoke`, { method: 'POST' });
    setFlash(`${email} access revoked.`);
    invalidate();
  }

  // Check if viewer can manage invites
  const canManageInvites =
    hasWildcard ||
    viewerPermissions.includes('mutate:invites') ||
    viewerPermissions.includes('can_invite');

  if (!canManageInvites) {
    return (
      <div className="animate-slide-up">
        <EmptyState
          icon={<Shield className="h-12 w-12" />}
          title="Access Restricted"
          description="IAM management requires the 'mutate:invites' or 'can_invite' permission."
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
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[280px] flex-1">
              <label className="mb-1 block text-xs text-slate-500" htmlFor="invite-email">
                Email Address
              </label>
              <input
                id="invite-email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-400/30"
              />
            </div>
            <div className="min-w-[200px]">
              <label className="mb-1 block text-xs text-slate-500" htmlFor="invite-role">
                Role
              </label>
              <select
                id="invite-role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
              >
                {assignableRoles.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>
            <ActionButton variant="primary" onClick={handleInvite} disabled={isInviting}>
              <span className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                {isInviting ? 'Sending...' : 'Send Invite'}
              </span>
            </ActionButton>
          </div>

          {/* Delegated Permission Selection */}
          {!isSuperAdmin && availablePermissions.length > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-400/70" />
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Delegated Permissions
                </span>
              </div>
              <p className="mb-3 text-xs text-slate-500">
                You can only grant permissions you currently hold. The invitee will receive the
                selected permissions.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {availablePermissions.map((perm) => (
                  <label
                    key={perm.key}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.key)}
                      onChange={() => togglePermission(perm.key)}
                      className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-amber-400 accent-amber-400"
                    />
                    <div>
                      <div className="text-xs font-medium text-slate-200">{perm.label}</div>
                      <div className="text-[10px] text-slate-500">{perm.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Super Admin gets a simpler message */}
          {isSuperAdmin && (
            <p className="text-xs text-slate-600">
              As Super Admin, the invitee inherits the default permissions for the selected role.
            </p>
          )}
        </div>
      </Panel>

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
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#040814]/50">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-semibold text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {iam.admins.map((admin: any) => (
                  <tr key={admin.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 text-xs font-bold text-white shadow-sm">
                          {admin.email[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">{admin.email}</div>
                          {admin.name && (
                            <div className="mt-0.5 text-[11px] text-slate-500">{admin.name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${ROLE_COLORS[admin.role as AdminRole]}`}
                      >
                        {ROLE_LABELS[admin.role as AdminRole]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={admin.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {admin.status !== 'revoked' && admin.id !== viewer?.id && (
                        <button
                          onClick={() => void handleRevoke(admin.id, admin.email)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-400/10 transition-colors"
                        >
                          Revoke Access
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Pending Invites */}
      {iam && iam.invites.length > 0 && (
        <Panel title="Pending Invitations">
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#040814]/50">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-semibold text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Expiration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {iam.invites.map((invite: any) => (
                  <tr key={invite.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-medium text-slate-200">{invite.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${ROLE_COLORS[invite.role as AdminRole]}`}
                      >
                        {ROLE_LABELS[invite.role as AdminRole]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={invite.status} />
                    </td>
                    <td className="px-5 py-4 text-right text-xs text-slate-500">
                      {formatDate(invite.expiresAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
