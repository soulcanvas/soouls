'use client';

import { useUser } from '@clerk/nextjs';
import React, { useEffect, useRef, useState } from 'react';

import { AnimatePresence, type PanInfo, motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface Entry {
  id: string;
  title: string;
}

interface DroppedItem extends Entry {
  instanceId: number;
  x: number;
  y: number;
}

/**
 * Custom Folder Component based on the latest dark-themed design.
 * Features the espresso brown fill, grey stroke, and "Entries" badge.
 */
const FolderIcon = ({ className, count = '12' }: { className?: string; count?: string }) => (
  <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M10 25C10 22.2386 12.2386 20 15 20H38.5C39.6935 20 40.8443 20.4261 41.745 21.2014L50.255 28.5486C51.1557 29.3239 52.3065 29.75 53.5 29.75H85C87.7614 29.75 90 31.9886 90 34.75V70C90 72.7614 87.7614 75 85 75H15C12.2386 75 10 72.7614 10 70V25Z"
      fill="#3A2D28"
      stroke="#7D7D7D"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <rect
      x="18"
      y="58"
      width="22"
      height="8"
      rx="4"
      fill="transparent"
      stroke="#FF5C35"
      strokeWidth="0.8"
      opacity="0.6"
    />
    <text
      x="20"
      y="64.5"
      fill="#FF5C35"
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

  // Replaced searchParams logic with local state for the standalone preview
  const [query, setQuery] = useState('');
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Mock user data to replace Clerk dependency for preview
  // const user = {
  //   imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=soul",
  //   fullName: "Soul User"
  // };

  const entries = [
    { id: '1', title: 'The Midnight Ecos' },
    { id: '2', title: 'Quiet Ambitions' },
    { id: '3', title: 'Digital Solitude' },
  ];

  // 🔍 Local Search logic
  const handleSearch = (value: string) => {
    setQuery(value);
  };

  // ⌨️ Cmd/Ctrl + K (Original Logic Kept)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filtered = entries.filter((e) => e.title.toLowerCase().includes(query.toLowerCase()));

  // Drag and Drop Logic
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    entry: Entry,
  ) => {
    const dropZone = dropZoneRef.current?.getBoundingClientRect();
    if (!dropZone) return;

    const { x, y } = info.point;

    if (x >= dropZone.left && x <= dropZone.right && y >= dropZone.top && y <= dropZone.bottom) {
      const relativeX = x - dropZone.left - 60; // offset for centering
      const relativeY = y - dropZone.top - 50;

      const newItem = {
        ...entry,
        instanceId: Date.now(),
        x: relativeX,
        y: relativeY,
      };

      setDroppedItems((prev) => [...prev, newItem]);
    }
    setIsDraggingOver(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden font-sans select-none">
      {/* Watermark (Original Logic Kept) */}
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

      {/* Header (Original Logic Kept) */}
      <header className="px-8 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <button onClick={() => window.history.back()} className="hover:text-[#FF5C35] transition">
            Home
          </button>
          <span>/</span>
          <span className="text-[#FF5C35]">Canvas</span>
        </div>

        <div className="w-9 h-9 rounded-full border border-white/10 bg-zinc-800 overflow-hidden">
          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt="Profile"
              className="w-9 h-9 rounded-full border border-white/10"
            />
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 relative z-10 flex flex-col mt-10 md:mt-14 pb-8">
        <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
          {/* LEFT PANEL: Grid of Draggable Folders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-[1.2] rounded-[28px] bg-[#111] border border-white/[0.08] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Search (Original Styles Kept) */}
            <div className="p-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3 bg-[#1a1a1a] px-4 py-2 rounded-full border border-white/[0.06] focus-within:ring-1 focus-within:ring-[#FF5C35]/40 transition">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="search for entries"
                  className="bg-transparent w-full focus:outline-none text-sm placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Grid of Folders */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                {filtered.map((entry) => (
                  <div key={entry.id} className="relative">
                    <motion.div
                      drag
                      dragSnapToOrigin
                      onDragStart={() => setIsDraggingOver(true)}
                      onDragEnd={(e, info) => handleDragEnd(e, info, entry)}
                      whileDrag={{ scale: 1.1, zIndex: 50, opacity: 0.8 }}
                      className="flex flex-col items-start group cursor-grab active:cursor-grabbing z-20 relative"
                    >
                      <div className="relative w-full aspect-[1.1/1] mb-3 pointer-events-none">
                        <FolderIcon className="w-full h-full drop-shadow-xl" />
                      </div>
                      <p className="text-[12px] font-medium text-white/70 group-hover:text-white px-1 leading-tight pointer-events-none">
                        {entry.title}
                      </p>
                    </motion.div>

                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <FolderIcon className="w-full aspect-[1.1/1] mb-3 grayscale" />
                    </div>
                  </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <p className="text-sm text-white/30 text-center mt-10">No matching entries</p>
              )}
            </div>
          </motion.div>

          {/* RIGHT PANEL: Drop Zone & Workspace */}
          <motion.div
            ref={dropZoneRef}
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: 1,
              x: 0,
              borderColor: isDraggingOver ? 'rgba(255,92,53,0.3)' : 'rgba(255,255,255,0.08)',
              backgroundColor: isDraggingOver ? 'rgba(255,92,53,0.02)' : 'transparent',
            }}
            className="flex-[2] rounded-[28px] border shadow-2xl relative overflow-hidden flex items-center justify-center hover:border-white/20 transition"
          >
            {/* Gradient background (Original Style Kept) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_75%_80%,rgba(255,255,255,0.04),transparent_50%)]" />

            {/* Dark overlay (Original Style Kept) */}
            <div className="absolute inset-0 bg-[#0f0f0f]/90 backdrop-blur-sm" />

            {/* Dropped Instances */}
            <AnimatePresence>
              {droppedItems.map((item) => (
                <motion.div
                  key={item.instanceId}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  drag
                  dragMomentum={false}
                  dragConstraints={dropZoneRef}
                  style={{ left: item.x, top: item.y, position: 'absolute' }}
                  className="w-28 flex flex-col items-center cursor-move group z-30"
                >
                  <FolderIcon className="w-full h-auto drop-shadow-2xl" />
                  <p className="mt-1 text-[10px] text-white/50 group-hover:text-white text-center font-medium bg-[#0a0a0a]/60 px-2 py-1 rounded-md backdrop-blur-sm truncate w-full">
                    {item.title}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Content (Original Text Kept) */}
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

                <div className="mt-6 text-[10px] text-white/25 tracking-[0.3em] uppercase">
                  Double click
                </div>

                <p className="mt-2 text-sm text-white/40">Drag entries or double click to begin</p>
              </div>
            )}

            {/* Visual Drop Feedback */}
            {isDraggingOver && (
              <div className="absolute inset-0 border-2 border-dashed border-[#FF5C35]/20 m-4 rounded-[20px] flex items-center justify-center pointer-events-none z-50">
                <span className="text-[#FF5C35]/40 text-xs font-bold tracking-[0.5em] uppercase">
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
