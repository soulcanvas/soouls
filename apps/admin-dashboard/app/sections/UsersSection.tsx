'use client';

import { Search, Users as UsersIcon } from 'lucide-react';
import { useDeferredValue, useEffect, useState } from 'react';
import { useShell } from '../components/ClientShell';
import { PermissionGate } from '../components/PermissionGate';
import { ActionButton, EmptyState, Panel, StatusBadge } from '../components/ui';
import { type UserProfile, type UserRecord, api, formatDate } from '../lib/api';

export function UsersSection() {
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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-white">User Galaxy</h1>
        <p className="mt-1 text-sm text-slate-500">
          Search and manage platform users. Click a user to see details.
        </p>
      </div>

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
                    <div className="mt-1 flex items-center gap-2">
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
                    <div className="text-slate-300">{selectedUser.mascot ?? '—'}</div>
                  </div>
                </div>

                {selectedUser.sentimentSummary && selectedUser.sentimentSummary.length > 0 && (
                  <div>
                    <div className="mb-2 text-xs font-medium text-slate-500">Mood Summary</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.sentimentSummary.map((s) => (
                        <span
                          key={s.label}
                          className="flex items-center gap-1.5 rounded-full bg-white/[0.03] px-2.5 py-1 text-xs text-slate-300"
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: s.label || '#888' }}
                          />
                          {s.label ?? 'neutral'}: {s.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 border-t border-white/[0.06] pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">User ID</span>
                    <span className="truncate font-mono text-slate-400">{selectedUser.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Clerk ID</span>
                    <span className="truncate font-mono text-slate-400">
                      {selectedUser.clerkId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Total Entries</span>
                    <span className="text-slate-400">{selectedUser.totalEntries}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Total Nodes</span>
                    <span className="text-slate-400">{selectedUser.totalNodes}</span>
                  </div>
                </div>

                <PermissionGate permission="mutate:users">
                  <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-4">
                    <ActionButton
                      onClick={() =>
                        void api(`/command-api/users/${selectedUser.id}/password-reset`, {
                          method: 'POST',
                        }).then(() => setFlash('Secure access link sent.'))
                      }
                    >
                      Send Password Reset
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
                      GDPR Export
                    </ActionButton>
                    <ActionButton
                      variant="danger"
                      onClick={() => {
                        if (
                          !confirm(
                            `Permanently delete ${selectedUser.email}? This is irreversible.`,
                          )
                        )
                          return;
                        void api(`/command-api/users/${selectedUser.id}/hard-delete`, {
                          method: 'POST',
                        }).then(() => {
                          setFlash('User permanently deleted.');
                          setSelectedUser(null);
                          setSearch('');
                        });
                      }}
                    >
                      Hard Delete User
                    </ActionButton>
                  </div>
                </PermissionGate>
              </div>
            ) : (
              <EmptyState
                icon={<UsersIcon className="h-8 w-8" />}
                title="Select a user"
                description="Search and click on a user to view their profile."
              />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
