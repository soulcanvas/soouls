'use client';

import { useUser } from '@clerk/nextjs';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CanvasPage() {
  const router = useRouter();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const query = searchParams.get('q') || '';

  const entries = [
    { title: 'The Midnight Ecos' },
    { title: 'Quiet Ambitions' },
    { title: 'Digital Solitude' },
  ];

  // 🔍 Search sync with URL
  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set('q', value);
    else params.delete('q');

    router.replace(`?${params.toString()}`);
  };

  // ⌨️ Cmd/Ctrl + K
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

  const filtered = entries.filter((e) =>
    e.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden font-sans">
      {/* Watermark */}
      <div className="absolute top-10 left-0 right-0 flex justify-center pointer-events-none opacity-25 select-none z-0 overflow-hidden whitespace-nowrap">
        <span
          className="text-[20vw] leading-none text-transparent tracking-tighter"
          style={{
            fontFamily: 'Playfair Display, serif',
            WebkitTextStroke: '1px rgba(255,255,255,0.35)',
          }}
        >
          Soulcanvas
        </span>
      </div>

      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <button
            onClick={() => router.back()}
            className="hover:text-[#FF5C35] transition"
          >
            Home
          </button>
          <span>/</span>
          <span className="text-[#FF5C35]">Canvas</span>
        </div>

        {user?.imageUrl && (
          <img
            src={user.imageUrl}
            alt={user?.fullName || 'User'}
            className="w-9 h-9 rounded-full border border-white/10"
          />
        )}
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 relative z-10 flex flex-col mt-10 md:mt-14 pb-8">
        <div className="flex flex-col md:flex-row gap-6 flex-1">
          {/* LEFT PANEL */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-[1] rounded-[28px] bg-[#111] border border-white/[0.08] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Search */}
            <div className="p-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3 bg-[#1a1a1a] px-4 py-2 rounded-full border border-white/[0.06] focus-within:ring-1 focus-within:ring-[#FF5C35]/40 transition">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  ref={inputRef}
                  defaultValue={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="search for entries"
                  className="bg-transparent w-full focus:outline-none text-sm placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Entries */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filtered.map((entry, i) => (
                <div
                  key={i}
                  className="group cursor-pointer"
                >
                  <div className="bg-[#1b1b1b] border border-white/[0.06] rounded-xl p-4 hover:border-white/20 transition">
                    <div className="w-full h-16 rounded-md bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] mb-3 relative">
                      <span className="absolute bottom-1 left-1 text-[10px] bg-[#FF5C35]/20 text-[#FF5C35] px-2 py-[2px] rounded">
                        Entry
                      </span>
                    </div>
                    <p className="text-sm text-white/80 group-hover:text-white transition">
                      {entry.title}
                    </p>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <p className="text-sm text-white/30 text-center mt-10">
                  No matching entries
                </p>
              )}
            </div>
          </motion.div>

          {/* RIGHT PANEL */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-[2] rounded-[28px] border border-white/[0.08] shadow-2xl relative overflow-hidden flex items-center justify-center hover:border-white/20 transition"
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_75%_80%,rgba(255,255,255,0.04),transparent_50%)]" />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-[#0f0f0f]/90 backdrop-blur-sm" />

            {/* Content */}
            <div className="relative z-10 text-center px-6 max-w-xl">
              <p
                className="text-[22px] md:text-[26px] leading-relaxed text-white/75"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                “Your thoughts are not separate.
                <br />
                They are waiting to connect.”
              </p>

              <div className="mt-6 text-[10px] text-white/25 tracking-[0.3em] uppercase">
                Double click
              </div>

              <p className="mt-2 text-sm text-white/40">
                Drag entries or double click to begin
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}