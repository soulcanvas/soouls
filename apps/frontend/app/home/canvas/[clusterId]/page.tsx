'use client';

import { useUser } from '@clerk/nextjs';
import type { UserEntry } from '@soouls/api/router';
import { AnimatePresence, type PanInfo, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { clusterMatchesEntry, getEntryTitle, truncateText } from '../../../../src/utils/home';
import { trpc } from '../../../../src/utils/trpc';

type DroppedEntry = Pick<UserEntry, 'id' | 'content' | 'title' | 'createdAt'> & {
  instanceId: number;
  x: number;
  y: number;
};

export default function CanvasClusterPage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams<{ clusterId: string }>();
  const clusterId = typeof params?.clusterId === 'string' ? params.clusterId : '';
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [droppedEntries, setDroppedEntries] = useState<DroppedEntry[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const { data: clusterDetail } = trpc.private.home.getClusterDetail.useQuery(
    { clusterId },
    { enabled: clusterId.length > 0 },
  );
  const { data: allEntries } = trpc.private.entries.getAll.useQuery({ limit: 150, cursor: 0 });

  const entries = useMemo(() => {
    if (!clusterDetail) return [];
    const highlightIds = new Set(clusterDetail.highlights.map((highlight) => highlight.id));

    return (allEntries?.items ?? [])
      .filter(
        (entry) => highlightIds.has(entry.id) || clusterMatchesEntry(clusterDetail.cluster, entry),
      )
      .filter((entry) => {
        const corpus = `${entry.title ?? ''} ${entry.content}`.toLowerCase();
        return corpus.includes(query.toLowerCase());
      });
  }, [allEntries?.items, clusterDetail, query]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    entry: Pick<UserEntry, 'id' | 'content' | 'title' | 'createdAt'>,
  ) => {
    const dropZone = dropZoneRef.current?.getBoundingClientRect();
    if (!dropZone) return;

    const { x, y } = info.point;
    if (x >= dropZone.left && x <= dropZone.right && y >= dropZone.top && y <= dropZone.bottom) {
      setDroppedEntries((prev) => [
        ...prev,
        {
          ...entry,
          instanceId: Date.now(),
          x: x - dropZone.left - 90,
          y: y - dropZone.top - 60,
        },
      ]);
    }

    setIsDraggingOver(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden font-sans select-none"
      style={{ backgroundColor: 'var(--soouls-bg)', color: 'var(--soouls-text-strong)' }}
    >
      <div className="absolute top-10 left-0 right-0 flex justify-center pointer-events-none opacity-18 select-none z-0 overflow-hidden whitespace-nowrap">
        <span
          className="text-[18vw] leading-none text-transparent tracking-tighter"
          style={{
            fontFamily: 'serif',
            WebkitTextStroke: '1px rgba(255,255,255,0.35)',
          }}
        >
          Soouls
        </span>
      </div>

      <header className="px-8 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 text-sm text-[var(--soouls-text-muted)]">
          <button
            onClick={() => router.push('/home')}
            className="transition hover:text-[var(--soouls-accent)]"
          >
            Home
          </button>
          <span>/</span>
          <button
            onClick={() => router.push('/home/canvas')}
            className="transition hover:text-[var(--soouls-accent)]"
          >
            Canvas
          </button>
          <span>/</span>
          <span style={{ color: 'var(--soouls-accent)' }}>
            {clusterDetail?.cluster.name ?? 'Cluster'}
          </span>
        </div>

        <div
          className="w-9 h-9 rounded-full border overflow-hidden"
          style={{
            borderColor: 'var(--soouls-border)',
            backgroundColor: 'var(--soouls-bg-elevated)',
          }}
        >
          {user?.imageUrl && (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 relative z-10 flex flex-col mt-10 md:mt-14 pb-8">
        <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-[1.05] rounded-[28px] border shadow-2xl flex flex-col overflow-hidden"
            style={{
              backgroundColor: 'var(--soouls-bg-surface)',
              borderColor: 'var(--soouls-border)',
            }}
          >
            <div className="p-5 border-b border-white/[0.06]">
              <div
                className="flex items-center gap-3 px-4 py-2 rounded-full focus-within:ring-1 transition"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--soouls-border)',
                }}
              >
                <Search className="w-4 h-4 text-[var(--soouls-text-faint)]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="search for entries"
                  className="bg-transparent w-full focus:outline-none text-sm placeholder:text-[var(--soouls-text-faint)]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-3xl font-semibold mb-2">
                {clusterDetail?.cluster.name ?? 'Entries'}
              </p>
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  drag
                  dragSnapToOrigin
                  onDoubleClick={() => router.push(`/home/new-entry?id=${entry.id}`)}
                  onDragStart={() => setIsDraggingOver(true)}
                  onDragEnd={(event, info) => handleDragEnd(event, info, entry)}
                  whileDrag={{ scale: 1.04, zIndex: 50, opacity: 0.84 }}
                  className="rounded-[28px] border p-6 cursor-grab active:cursor-grabbing"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderColor: 'var(--soouls-border)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-2xl font-serif">{getEntryTitle(entry)}</h3>
                    <span className="text-xs text-[var(--soouls-text-faint)]">
                      {new Date(entry.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--soouls-text-muted)]">
                    {truncateText(entry.content, 160)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            ref={dropZoneRef}
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: 1,
              x: 0,
              borderColor: isDraggingOver
                ? 'rgba(var(--soouls-accent-rgb), 0.4)'
                : 'rgba(255,255,255,0.08)',
              backgroundColor: isDraggingOver
                ? 'rgba(var(--soouls-accent-rgb), 0.03)'
                : 'transparent',
            }}
            className="flex-[2] rounded-[28px] border shadow-2xl relative overflow-hidden flex items-center justify-center transition"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_75%_80%,rgba(255,255,255,0.04),transparent_50%)]" />
            <div
              className="absolute inset-0 backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(15,15,15,0.86)' }}
            />

            <AnimatePresence>
              {droppedEntries.map((entry) => (
                <motion.button
                  key={entry.instanceId}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  drag
                  dragMomentum={false}
                  dragConstraints={dropZoneRef}
                  onDoubleClick={() => router.push(`/home/new-entry?id=${entry.id}`)}
                  className="w-44 rounded-2xl border p-4 text-left backdrop-blur-md z-30"
                  style={{
                    left: entry.x,
                    top: entry.y,
                    position: 'absolute',
                    borderColor: 'rgba(var(--soouls-accent-rgb), 0.28)',
                    backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.12)',
                  }}
                >
                  <p className="text-sm font-semibold mb-2">{getEntryTitle(entry)}</p>
                  <p className="text-xs leading-relaxed text-[var(--soouls-text-muted)]">
                    {truncateText(entry.content, 96)}
                  </p>
                </motion.button>
              ))}
            </AnimatePresence>

            {droppedEntries.length === 0 && (
              <div className="relative z-10 text-center px-6 max-w-xl pointer-events-none">
                <p
                  className="text-[22px] md:text-[26px] leading-relaxed text-white/75"
                  style={{ fontFamily: 'serif' }}
                >
                  “Your thoughts are not separate.
                  <br />
                  They are waiting to connect.”
                </p>

                <div className="mt-6 text-[10px] tracking-[0.3em] uppercase text-[var(--soouls-text-faint)]">
                  Double click
                </div>

                <p className="mt-2 text-sm text-[var(--soouls-text-muted)]">
                  Drag entries or double click to begin
                </p>
              </div>
            )}

            {isDraggingOver && (
              <div
                className="absolute inset-0 border-2 border-dashed m-4 rounded-[20px] flex items-center justify-center pointer-events-none z-50"
                style={{ borderColor: 'rgba(var(--soouls-accent-rgb), 0.2)' }}
              >
                <span
                  className="text-xs font-bold tracking-[0.5em] uppercase"
                  style={{ color: 'rgba(var(--soouls-accent-rgb), 0.45)' }}
                >
                  Drop Here
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
