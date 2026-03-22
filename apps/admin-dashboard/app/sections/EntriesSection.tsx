'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronLeft, ChevronRight, Eye, Image, Search } from 'lucide-react';
import { useState } from 'react';
import { useShell } from '../components/ClientShell';
import {
  ActionButton,
  Dialog,
  DialogContent,
  EmptyState,
  Panel,
  StatusBadge,
} from '../components/ui';
import { type EntriesPayload, api, formatDate, formatRelativeTime } from '../lib/api';

export function EntriesSection() {
  const { viewer } = useShell();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState<EntriesPayload['items'][number] | null>(null);
  const pageSize = 25;

  const { data, isLoading } = useQuery({
    queryKey: ['entries', page],
    queryFn: () =>
      api<EntriesPayload>(`/command-api/entries?limit=${pageSize}&offset=${page * pageSize}`),
    refetchInterval: 30_000,
  });

  const canView = viewer?.permissions?.includes('view:all');

  if (viewer && !canView) {
    return (
      <EmptyState
        icon={<BookOpen className="h-12 w-12" />}
        title="Access Restricted"
        description="Entries view is restricted to Engineers and Super Admins."
      />
    );
  }

  const filteredItems = data?.items.filter((entry) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      entry.content.toLowerCase().includes(term) ||
      entry.userEmail.toLowerCase().includes(term) ||
      (entry.userName?.toLowerCase() ?? '').includes(term) ||
      (entry.title?.toLowerCase() ?? '').includes(term)
    );
  });

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <>
      <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        {selectedEntry && (
          <DialogContent title={selectedEntry.title || 'Entry Details'}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-400">
                  {selectedEntry.userEmail}
                </div>
                <StatusBadge status={selectedEntry.type} />
                {selectedEntry.sentimentLabel && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider"
                    style={
                      selectedEntry.sentimentColor
                        ? {
                            borderColor: `${selectedEntry.sentimentColor}40`,
                            color: selectedEntry.sentimentColor,
                          }
                        : {}
                    }
                  >
                    {selectedEntry.sentimentLabel}
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
                  {selectedEntry.content}
                </div>
              </div>

              {selectedEntry.mediaUrl && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 text-sm text-sky-400">
                    <Image className="h-4 w-4" />
                    <span>Media attached</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs text-slate-500">
                <span>Created: {formatDate(selectedEntry.createdAt)}</span>
                <span>{formatRelativeTime(selectedEntry.createdAt)}</span>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-white">Journal Entries</h1>
            <p className="mt-1 text-sm text-slate-500">
              All user entries across the platform · {data?.total ?? 0} total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search entries..."
                className="w-72 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-amber-400/30"
              />
            </div>
          </div>
        </div>

        <Panel
          title="All Entries"
          action={
            <span className="text-xs text-slate-500">
              Page {page + 1} of {totalPages || 1}
            </span>
          }
        >
          {isLoading || !filteredItems ? (
            <div className="animate-pulse space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={`skeleton-${i}`} className="h-20 rounded-xl bg-white/[0.03]" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-10 w-10" />}
              title="No entries found"
              description={
                searchTerm ? 'No entries match your search.' : 'No journal entries exist yet.'
              }
            />
          ) : (
            <div className="space-y-2">
              {filteredItems.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-white/[0.04] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04] rounded-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs text-slate-500">{entry.userEmail}</span>
                        <StatusBadge status={entry.type} />
                        {entry.sentimentLabel && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider"
                            style={
                              entry.sentimentColor
                                ? {
                                    borderColor: `${entry.sentimentColor}40`,
                                    color: entry.sentimentColor,
                                  }
                                : {}
                            }
                          >
                            {entry.sentimentLabel}
                          </span>
                        )}
                      </div>
                      <h3 className="max-w-3xl truncate text-sm font-medium text-white">
                        {entry.title || entry.content.slice(0, 80) || 'Untitled'}
                      </h3>
                      <p className="mt-1 line-clamp-2 max-w-3xl text-xs leading-relaxed text-slate-500">
                        {entry.content}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <ActionButton variant="default" onClick={() => setSelectedEntry(entry)}>
                        <span className="flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </span>
                      </ActionButton>
                      <span className="text-[11px] text-slate-400">
                        {formatRelativeTime(entry.createdAt)}
                      </span>
                      {entry.mediaUrl && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-sky-400/70">
                          <Image className="h-3 w-3" /> Media
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-xs text-slate-500">
                Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data?.total ?? 0)} of{' '}
                {data?.total ?? 0}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
