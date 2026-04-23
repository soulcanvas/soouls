'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, Clock, Shield, UserPlus, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useShell } from '../components/ClientShell';
import { PermissionGate } from '../components/PermissionGate';
import { ActionButton, EmptyState, Panel, StatusBadge } from '../components/ui';
import { type AdminRole, type IamPayload, api, formatDate } from '../lib/api';

type PermissionRequestStatus = 'pending' | 'approved' | 'denied';

interface PermissionRequest {
  id: string;
  requestedByClerkId: string;
  requestedByEmail: string;
  requestedByName: string | null;
  requestedPermission: string;
  status: PermissionRequestStatus;
  reviewedByClerkId: string | null;
  reviewedByEmail: string | null;
  reviewedAt: string | null;
  responseNote: string | null;
  createdAt: string;
  expiresAt: string;
}

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

const PERMISSION_LABELS: Record<string, string> = {
  'view:all': 'View All Data',
  'mutate:users': 'Manage Users',
  'mutate:invites': 'Manage Invites',
  'mutate:api_keys': 'Manage API Keys',
  'mutate:feature_flags': 'Toggle Feature Flags',
  'mutate:service_controls': 'Control Services',
  'mutate:queues': 'Manage Queues',
  'mutate:messaging': 'Send Campaigns',
  can_invite: 'Can Invite',
};

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

const ASSIGNABLE_ROLES: Record<AdminRole, AdminRole[]> = {
  super_admin: ['support', 'engineer', 'super_admin'],
  engineer: ['support'],
  support: [],
};

export function TeamSection() {
  const { viewer, setFlash } = useShell();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('support');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['view:all']);
  const [isInviting, setIsInviting] = useState(false);
  const [activeTab, setActiveTab] = useState<'admins' | 'requests'>('admins');

  const isSuperAdmin = viewer?.role === 'super_admin';
  const viewerPermissions = viewer?.permissions ?? [];
  const hasWildcard = viewerPermissions.includes('*');

  const { data: iam } = useQuery({
    queryKey: ['iam'],
    queryFn: () => api<IamPayload>('/command-api/iam'),
  });

  const { data: permissionRequests, refetch: refetchRequests } = useQuery({
    queryKey: ['permission-requests'],
    queryFn: () => api<PermissionRequest[]>('/command-api/permission-requests'),
    enabled: isSuperAdmin,
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['iam'] });
    void queryClient.invalidateQueries({ queryKey: ['permission-requests'] });
  }

  const availablePermissions = GRANTABLE_PERMISSIONS.filter(
    (perm) => hasWildcard || viewerPermissions.includes(perm.key),
  );

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

  async function handleReviewRequest(requestId: string, decision: 'approved' | 'denied') {
    try {
      await api(`/command-api/permission-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      setFlash(`Permission request ${decision}.`);
      void refetchRequests();
      invalidate();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : 'Failed to review request');
    }
  }

  const pendingRequests = permissionRequests?.filter((r) => r.status === 'pending') || [];
  const approvedRequests = permissionRequests?.filter((r) => r.status === 'approved') || [];
  const deniedRequests = permissionRequests?.filter((r) => r.status === 'denied') || [];

  const _canManageInvites =
    hasWildcard ||
    viewerPermissions.includes('mutate:invites') ||
    viewerPermissions.includes('can_invite');

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white">Identity & Access Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Invite team members, manage roles, and control access to the Command Center.
          </p>
        </div>
        {isSuperAdmin && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('admins')}
              className={`rounded-xl border px-4 py-2 text-sm transition-colors ${
                activeTab === 'admins'
                  ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Active Admins ({iam?.admins.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`rounded-xl border px-4 py-2 text-sm transition-colors ${
                activeTab === 'requests'
                  ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Requests
              {pendingRequests.length > 0 && (
                <span className="ml-2 rounded-full bg-amber-400/20 px-2 py-0.5 text-xs text-amber-300">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {activeTab === 'admins' ? (
        <>
          <PermissionGate permission="mutate:invites">
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

                {!isSuperAdmin && availablePermissions.length > 0 && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-amber-400/70" />
                      <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Delegated Permissions
                      </span>
                    </div>
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
              </div>
            </Panel>
          </PermissionGate>

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
                      <th className="px-5 py-3.5">Permissions</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {iam.admins.map((admin) => (
                      <tr key={admin.id} className="transition-colors hover:bg-white/[0.02]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 text-xs font-bold text-white shadow-sm">
                              {admin.email[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-slate-200">{admin.email}</div>
                              <div className="text-xs text-slate-500">
                                Last login:{' '}
                                {admin.lastLoginAt ? formatDate(admin.lastLoginAt) : 'Never'}
                              </div>
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
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                              admin.status === 'active'
                                ? 'bg-emerald-400/15 text-emerald-400'
                                : admin.status === 'invited'
                                  ? 'bg-amber-400/15 text-amber-400'
                                  : 'bg-rose-400/15 text-rose-400'
                            }`}
                          >
                            {admin.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {(admin.permissions || []).slice(0, 3).map((perm) => (
                              <span
                                key={perm}
                                className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400"
                              >
                                {PERMISSION_LABELS[perm] || perm}
                              </span>
                            ))}
                            {(admin.permissions || []).length > 3 && (
                              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">
                                +{(admin.permissions || []).length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <PermissionGate permission="mutate:invites">
                            {admin.status === 'active' && (
                              <ActionButton
                                variant="danger"
                                onClick={() => handleRevoke(admin.id, admin.email)}
                              >
                                Revoke
                              </ActionButton>
                            )}
                          </PermissionGate>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </>
      ) : (
        <div className="space-y-6">
          {pendingRequests.length === 0 &&
          approvedRequests.length === 0 &&
          deniedRequests.length === 0 ? (
            <EmptyState
              icon={<Clock className="h-12 w-12" />}
              title="No permission requests"
              description="Permission requests will appear here when admins request elevated access."
            />
          ) : (
            <>
              {pendingRequests.length > 0 && (
                <Panel title={`Pending Requests (${pendingRequests.length})`}>
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-start justify-between rounded-xl border border-amber-400/20 bg-amber-400/5 p-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-400" />
                            <span className="font-medium text-white">
                              {request.requestedByName || request.requestedByEmail}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-slate-400">
                            {request.requestedByEmail}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="rounded bg-white/5 px-2 py-1 text-xs text-amber-300">
                              {PERMISSION_LABELS[request.requestedPermission] ||
                                request.requestedPermission}
                            </span>
                            <span className="text-xs text-slate-500">
                              Requested {formatDate(request.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <ActionButton
                            variant="primary"
                            onClick={() => handleReviewRequest(request.id, 'approved')}
                          >
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </span>
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            onClick={() => handleReviewRequest(request.id, 'denied')}
                          >
                            <span className="flex items-center gap-1">
                              <XCircle className="h-4 w-4" />
                              Deny
                            </span>
                          </ActionButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              {approvedRequests.length > 0 && (
                <Panel title={`Approved (${approvedRequests.length})`}>
                  <div className="space-y-2">
                    {approvedRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-emerald-400" />
                          <div>
                            <span className="font-medium text-white">
                              {request.requestedByName || request.requestedByEmail}
                            </span>
                            <span className="ml-2 text-sm text-slate-400">
                              {request.requestedByEmail}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="rounded bg-white/5 px-2 py-1 text-xs text-emerald-300">
                            {PERMISSION_LABELS[request.requestedPermission] ||
                              request.requestedPermission}
                          </span>
                          <span className="text-xs text-slate-500">
                            Approved {formatDate(request.reviewedAt || request.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              {deniedRequests.length > 0 && (
                <Panel title={`Denied (${deniedRequests.length})`}>
                  <div className="space-y-2">
                    {deniedRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between rounded-xl border border-rose-400/20 bg-rose-400/5 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <XCircle className="h-5 w-5 text-rose-400" />
                          <div>
                            <span className="font-medium text-white">
                              {request.requestedByName || request.requestedByEmail}
                            </span>
                            <span className="ml-2 text-sm text-slate-400">
                              {request.requestedByEmail}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="rounded bg-white/5 px-2 py-1 text-xs text-rose-300">
                            {PERMISSION_LABELS[request.requestedPermission] ||
                              request.requestedPermission}
                          </span>
                          <span className="text-xs text-slate-500">
                            Denied {formatDate(request.reviewedAt || request.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}
            </>
          )}
        </div>
      )}

      {iam?.invites && iam.invites.length > 0 && (
        <Panel title="Pending Invites">
          <div className="space-y-3">
            {iam.invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 text-xs font-bold text-white shadow-sm">
                    {invite.email[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-white">{invite.email}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] uppercase ${ROLE_COLORS[invite.role as AdminRole]}`}
                      >
                        {ROLE_LABELS[invite.role as AdminRole]}
                      </span>
                      <span>Expires {formatDate(invite.expiresAt)}</span>
                    </div>
                  </div>
                </div>
                <PermissionGate permission="mutate:invites">
                  <span className="rounded bg-amber-400/15 px-2 py-1 text-xs text-amber-400">
                    Pending
                  </span>
                </PermissionGate>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
