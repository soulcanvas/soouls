'use client';

import { useUser } from '@clerk/nextjs';
import { AnimatePresence, type PanInfo, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { trpc } from '../../../src/utils/trpc';

type FolderItem = {
  id: string;
  title: string;
  entryCount: number;
  updatedAtLabel: string;
};

type DroppedItem = FolderItem & {
  instanceId: number;
  x: number;
  y: number;
};

const FolderIcon = ({ className, count = '0' }: { className?: string; count?: string }) => (
  <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M10 25C10 22.2386 12.2386 20 15 20H38.5C39.6935 20 40.8443 20.4261 41.745 21.2014L50.255 28.5486C51.1557 29.3239 52.3065 29.75 53.5 29.75H85C87.7614 29.75 90 31.9886 90 34.75V70C90 72.7614 87.7614 75 85 75H15C12.2386 75 10 72.7614 10 70V25Z"
      fill="rgba(var(--soouls-accent-rgb), 0.18)"
      stroke="rgba(255,255,255,0.55)"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <rect
      x="18"
      y="58"
      width="26"
      height="9"
      rx="4"
      fill="transparent"
      stroke="var(--soouls-accent)"
      strokeWidth="0.8"
      opacity="0.7"
    />
    <text
      x="20"
      y="64.5"
      fill="var(--soouls-accent)"
      fontSize="4"
      fontWeight="600"
      style={{ fontFamily: 'sans-serif' }}
    >
      {count} Entries
    </text>
  </svg>
);

export default function CanvasPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  const { data } = trpc.private.home.getClusters.useQuery(undefined);
  const [query, setQuery] = useState('');
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const folders = useMemo(() => {
    return (data?.folders ?? []).filter((folder) =>
      folder.title.toLowerCase().includes(query.toLowerCase()),
    );
  }, [data?.folders, query]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    folder: FolderItem,
  ) => {
    const dropZone = dropZoneRef.current?.getBoundingClientRect();
    if (!dropZone) return;

    const { x, y } = info.point;
    if (x >= dropZone.left && x <= dropZone.right && y >= dropZone.top && y <= dropZone.bottom) {
      setDroppedItems((prev) => [
        ...prev,
        {
          ...folder,
          instanceId: Date.now(),
          x: x - dropZone.left - 60,
          y: y - dropZone.top - 50,
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
      <div className="absolute top-10 left-0 right-0 flex justify-center pointer-events-none opacity-25 select-none z-0 overflow-hidden whitespace-nowrap">
        <span
          className="text-[20vw] leading-none text-transparent tracking-tighter"
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
          <span style={{ color: 'var(--soouls-accent)' }}>Canvas</span>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="w-9 h-9 rounded-full border border-white/10 bg-zinc-800 overflow-hidden hover:border-white/30 transition-all cursor-pointer"
        >
          {user?.imageUrl && (
            <img src={user.imageUrl} alt="Profile" className="w-9 h-9 rounded-full" />
          )}
        </button>
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
            className="flex-[1.2] rounded-[28px] border shadow-2xl flex flex-col overflow-hidden"
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
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="search for entries"
                  className="bg-transparent w-full focus:outline-none text-sm placeholder:text-[var(--soouls-text-faint)]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                {folders.map((folder) => (
                  <div key={folder.id} className="relative">
                    <motion.div
                      drag
                      dragSnapToOrigin
                      onDoubleClick={() => router.push(`/home/canvas/${folder.id}`)}
                      onDragStart={() => setIsDraggingOver(true)}
                      onDragEnd={(event, info) => handleDragEnd(event, info, folder)}
                      whileDrag={{ scale: 1.1, zIndex: 50, opacity: 0.82 }}
                      className="flex flex-col items-start group cursor-grab active:cursor-grabbing z-20 relative"
                    >
                      <div className="relative w-full aspect-[1.1/1] mb-3 pointer-events-none">
                        <FolderIcon
                          className="w-full h-full drop-shadow-xl"
                          count={String(folder.entryCount)}
                        />
                      </div>
                      <p className="text-[12px] font-medium px-1 leading-tight pointer-events-none text-[var(--soouls-text-muted)] group-hover:text-[var(--soouls-text-strong)]">
                        {folder.title}
                      </p>
                      <p className="text-[10px] px-1 mt-1 text-[var(--soouls-text-faint)]">
                        {folder.updatedAtLabel}
                      </p>
                    </motion.div>
                  </div>
                ))}
              </div>

              {folders.length === 0 && (
                <p className="text-sm text-center mt-10 text-[var(--soouls-text-faint)]">
                  No matching folders
                </p>
              )}
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
              {droppedItems.map((item) => (
                <motion.button
                  key={item.instanceId}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  drag
                  dragMomentum={false}
                  dragConstraints={dropZoneRef}
                  style={{ left: item.x, top: item.y, position: 'absolute' }}
                  onDoubleClick={() => router.push(`/home/canvas/${item.id}`)}
                  className="w-28 flex flex-col items-center cursor-move group z-30"
                >
                  <FolderIcon
                    className="w-full h-auto drop-shadow-2xl"
                    count={String(item.entryCount)}
                  />
                  <p className="mt-1 text-[10px] text-center font-medium backdrop-blur-sm truncate w-full px-2 py-1 rounded-md text-[var(--soouls-text-muted)]">
                    {item.title}
                  </p>
                </motion.button>
              ))}
            </AnimatePresence>

            {droppedItems.length === 0 && (
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
                  Drag folders or double click to begin
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
