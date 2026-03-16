'use client';

import { Search, Users as UsersIcon } from 'lucide-react';
import { useDeferredValue, useEffect, useState } from 'react';
import { useShell } from '../components/ClientShell';
import { ActionButton, EmptyState, Panel, StatusBadge } from '../components/ui';
import { type UserProfile, type UserRecord, api, formatDate } from '../lib/api';

export default function UsersPage() {
  const { viewer, setFlash } = useShell();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!deferredSearch.trim()) {
      setUsers([]);
      return;
    }
    const timeout = setTimeout(() => {
      void api<UserRecord[]>(
        `/command-api/users?q=${encodeURIComponent(deferredSearch.trim())}`,
      ).then(setUsers);
    }, 200);
    return () => clearTimeout(timeout);
  }, [deferredSearch]);

  return (
    <div className="animate-slide-up space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-white">User Galaxy</h1>
        <p className="mt-1 text-sm text-slate-500">
          Search and manage platform users. Raw journal text is never exposed.
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-3">
        <Search className="h-4 w-4 text-amber-300/60" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email, user ID, Stripe ID, or wallet address…"
          className="w-full bg-transparent text-sm text-white placeholder:text-slate-600 outline-none"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        {/* User list */}
        <div className="space-y-2">
          {users.length === 0 && deferredSearch.trim() && (
            <EmptyState
              icon={<UsersIcon className="h-10 w-10" />}
              title="No users found"
              description="Try a different search term."
            />
          )}
          {users.length === 0 && !deferredSearch.trim() && (
            <EmptyState
              icon={<Search className="h-10 w-10" />}
              title="Search for users"
              description="Use the search bar above to find users by email, ID, or wallet."
            />
          )}
          {users.map((user) => (
            <button
              type="button"
              key={user.id}
              onClick={() =>
                void api<UserProfile>(`/command-api/users/${user.id}`).then(setSelectedUser)
              }
              className={`w-full rounded-xl border px-5 py-4 text-left transition-all duration-200 ${
                selectedUser?.id === user.id
                  ? 'border-amber-400/20 bg-amber-400/[0.06]'
                  : 'border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 text-xs font-bold text-white">
                    {(user.name || user.email)[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{user.email}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {user.totalEntries} entries · {user.totalNodes} nodes · Joined{' '}
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={user.accountStatus} />
                  <StatusBadge status={user.billingTier} />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* User detail panel */}
        <div className="sticky top-8">
          <Panel title="User Profile">
            {selectedUser ? (
              <div className="animate-fade-in space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-lg font-bold text-amber-300">
                    {(selectedUser.name || selectedUser.email)[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-white">{selectedUser.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={selectedUser.accountStatus} />
                      <StatusBadge status={selectedUser.billingTier} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                    <div className="text-slate-500">Theme</div>
                    <div className="text-slate-300">{selectedUser.themePreference ?? 'aurora'}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                    <div className="text-slate-500">Mascot</div>
                    <div className="text-slate-300">{selectedUser.mascot ?? 'Lumi'}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                    <div className="text-slate-500">Entries</div>
                    <div className="text-slate-300">{selectedUser.totalEntries}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                    <div className="text-slate-500">Nodes</div>
                    <div className="text-slate-300">{selectedUser.totalNodes}</div>
                  </div>
                </div>

                {/* Privacy notice */}
                <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.05] px-4 py-3 text-xs text-amber-200/80">
                  Raw journal text is hidden. Only metadata and sentiment aggregates are exposed.
                </div>

                {/* Sentiment */}
                {selectedUser.sentimentSummary.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-wider text-slate-500">
                      Sentiment Distribution
                    </div>
                    {selectedUser.sentimentSummary.map((item) => (
                      <div
                        key={`${item.label ?? 'unknown'}-${item.count}`}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-300">{item.label ?? 'Unknown'}</span>
                        <span className="text-slate-500">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <ActionButton
                    onClick={() =>
                      void api(`/command-api/users/${selectedUser.id}/password-reset`, {
                        method: 'POST',
                      }).then(() => setFlash('Password reset queued.'))
                    }
                  >
                    Password Reset
                  </ActionButton>
                  <ActionButton
                    onClick={() =>
                      void api(`/command-api/users/${selectedUser.id}/force-logout`, {
                        method: 'POST',
                      }).then(() => setFlash('Sessions revoked.'))
                    }
                  >
                    Force Logout
                  </ActionButton>

                  {/* Zero-Knowledge Masquerade */}
                  <ActionButton
                    variant="primary"
                    onClick={() => {
                      // Opens the frontend URL with the masquerade trigger
                      const frontendUrl =
                        process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001';
                      window.open(`${frontendUrl}/?masquerade=${selectedUser.clerkId}`, '_blank');
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <Search className="h-3 w-3" />
                      Impersonate
                    </div>
                  </ActionButton>
                  <ActionButton
                    variant="primary"
                    onClick={() =>
                      void api(`/command-api/users/${selectedUser.id}/billing-tier`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ billingTier: 'premium' }),
                      }).then(() => setFlash('Upgraded to Premium.'))
                    }
                  >
                    Upgrade Premium
                  </ActionButton>
                  {viewer?.permissions?.includes('mutate:users') && (
                    <>
                      <ActionButton
                        variant="danger"
                        onClick={() =>
                          void api(`/command-api/users/${selectedUser.id}/account-status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              status:
                                selectedUser.accountStatus === 'suspended' ? 'active' : 'suspended',
                            }),
                          }).then(() => {
                            setFlash(
                              selectedUser.accountStatus === 'suspended'
                                ? 'User reactivated.'
                                : 'User suspended.',
                            );
                            void api<UserProfile>(`/command-api/users/${selectedUser.id}`).then(
                              setSelectedUser,
                            );
                          })
                        }
                      >
                        {selectedUser.accountStatus === 'suspended' ? 'Reactivate' : 'Suspend'}
                      </ActionButton>
                      <ActionButton
                        variant="primary"
                        onClick={() =>
                          void api(`/command-api/users/${selectedUser.id}/gdpr-export`, {
                            method: 'POST',
                          }).then(() => setFlash('GDPR Export queued. ZIP will be emailed.'))
                        }
                      >
                        1-Click GDPR Export
                      </ActionButton>
                      <ActionButton
                        variant="danger"
                        onClick={() =>
                          void api(`/command-api/users/${selectedUser.id}/hard-delete`, {
                            method: 'POST',
                          }).then(() => {
                            setSelectedUser(null);
                            setFlash('User hard-deleted (GDPR).');
                          })
                        }
                      >
                        GDPR Delete
                      </ActionButton>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[300px] items-center justify-center text-sm text-slate-600">
                Select a user to view their profile and actions.
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
