'use client';

import { useUser } from '@clerk/nextjs';
import type { UserEntry } from '@soouls/api/router';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Calendar, CircleOff, LayoutGrid, Search, User, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { SymbolLogo } from '../components/SymbolLogo';
import { CanvasLoopIcon, LeafIcon } from '../components/Icons';
import { CalendarModal } from './components/CalendarModal';
import { useSidebar } from '../../src/providers/sidebar-provider';
import { buildActivityBars, formatCurrentMonthRange } from '../../src/utils/home';
import { trpc } from '../../src/utils/trpc';

function avatarFor(seed?: string | null) {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed || 'Soouls')}&backgroundColor=1c1c1c,e07a5f&radius=50`;
}

function entryTitle(entry: UserEntry) {
  try {
    const parsed = JSON.parse(entry.content) as { textContent?: string; title?: string };
    const text = parsed.title || parsed.textContent || entry.title || '';
    return text.trim().split(/\s+/).slice(0, 5).join(' ') || 'Untitled entry';
  } catch {
    return entry.title || entry.content.slice(0, 38) || 'Untitled entry';
  }
}

function entryDate(entry: UserEntry) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(entry.createdAt));
}

function SearchPreview({ entry }: { entry?: UserEntry }) {
  return (
    <div className="grid h-full grid-cols-2 gap-2 rounded-[6px] border border-[#222] bg-[rgba(15,15,15,0.5)] p-2 backdrop-blur">
      <div className="rounded-md bg-[#222] p-3">
        <p className="text-xs text-[#d8d8d8]">{entry ? entryTitle(entry) : 'Hey! Today I am feeling great.'}</p>
        <div className="mt-4 h-20 rounded bg-[linear-gradient(135deg,rgba(224,122,95,0.28),rgba(239,235,221,0.08))]" />
        <p className="mt-2 text-[10px] text-[#b7ff8d]">Entry preview</p>
      </div>
      <div className="rounded-md bg-[#222] p-3">
        <div className="mb-3 h-8 rounded bg-[#1c1c1c]" />
        <p className="text-center text-xs text-[#7a7a7a]">Add more</p>
        <div className="mt-3 flex items-end gap-1">
          {[16, 24, 14, 28, 20, 12, 26, 18].map((height, index) => (
            <span key={index} className="w-2 rounded bg-[#e07a5f]" style={{ height }} />
          ))}
        </div>
      </div>
      <div className="col-span-2 rounded-md bg-[#222] p-3">
        <div className="mb-3 inline-flex rounded-full border border-[#d8d8d8] px-3 py-1 text-xs text-[#d8d8d8]">
          I will complete the design system task today
        </div>
        <p className="text-2xl text-[#e07a5f]">00:01:48 <span className="text-xs">pm</span></p>
        <p className="mt-2 text-[10px] text-[#b7ff8d]">Goal set</p>
      </div>
    </div>
  );
}

function SearchPopup({ entries, onClose }: { entries: UserEntry[]; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const filtered = entries
    .filter((entry) => entryTitle(entry).toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);
  const active = filtered[selected] ?? filtered[0] ?? entries[0];

  return (
    <motion.div className="fixed inset-0 z-[70] flex items-end justify-start bg-black/30 p-4 backdrop-blur-sm sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="relative grid w-full max-w-[986px] grid-cols-1 gap-6 rounded-[16px] bg-[rgba(14,14,14,0.92)] p-6 shadow-2xl backdrop-blur-[30px] md:grid-cols-[1.2fr_0.9fr] md:p-10" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}>
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Close search">
          <X className="h-5 w-5" />
        </button>
        <div>
          <label className="flex items-center gap-6 border-b border-white/15 pb-4 text-[#d8d8d8]">
            <Search className="h-10 w-10 shrink-0" />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setSelected(0); }} placeholder="Search or find entries" className="w-full bg-transparent text-2xl outline-none placeholder:text-[#d8d8d8]" autoFocus />
          </label>
          <p className="mb-5 mt-10 text-2xl text-[#d8d8d8]">Recent Entries</p>
          <div className="space-y-4">
            {(filtered.length ? filtered : entries.slice(0, 4)).map((entry, index) => (
              <button key={entry.id} type="button" onMouseEnter={() => setSelected(index)} onClick={() => setSelected(index)} className="flex w-full items-center justify-between rounded-2xl border border-[#222] bg-[rgba(15,15,15,0.5)] px-7 py-4 text-left transition-colors hover:border-[#333]">
                <span className="font-playfair text-2xl text-[#efebdd]">{entryTitle(entry)}</span>
                <span className="text-sm uppercase text-[#7a7a7a]">{entryDate(entry)}</span>
              </button>
            ))}
            {!entries.length ? <p className="rounded-2xl border border-[#222] px-6 py-5 text-[#7a7a7a]">Your recent entries will appear here after you write.</p> : null}
          </div>
        </div>
        <div className="min-h-[300px] border-t border-white/10 pt-6 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <SearchPreview entry={active} />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HomePage() {
  const { user } = useUser();
  const { setIsOpen } = useSidebar();
  const [scrolled, setScrolled] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { data: insights } = trpc.private.home.getInsights.useQuery(undefined);
  const { data: entries } = trpc.private.entries.getAll.useQuery({ limit: 120, cursor: 0 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const search = window.location.search;
    if (search.includes('gcal_connected=1') || search.includes('gcal_error=')) {
      setIsCalendarOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const activityBars = buildActivityBars(entries?.items ?? []);
  const thoughtThemes = insights?.thoughtThemes ?? [];
  const coreThemes = insights?.coreThemes ?? [];
  const shiftMetrics = useMemo(() => {
    return (coreThemes.length ? coreThemes : thoughtThemes.map((theme) => ({ label: theme.label, percent: theme.progress }))).slice(0, 4).map((theme, index) => ({
      label: theme.label,
      icon: index === 0 ? <ArrowUpRight className="h-4 w-4" style={{ color: 'var(--soouls-accent)' }} /> : index === 1 ? <ArrowDownRight className="h-4 w-4 text-white/40" /> : index === 2 ? <span className="rounded-full border px-2 py-0.5 text-[8px] tracking-widest" style={{ borderColor: 'rgba(var(--soouls-accent-rgb),0.35)', color: 'var(--soouls-accent)' }}>EMERGING</span> : <CircleOff className="h-4 w-4 text-white/30" />,
    }));
  }, [coreThemes, thoughtThemes]);

  const avatarUrl = user?.imageUrl || avatarFor(user?.primaryEmailAddress?.emailAddress || user?.id);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden" style={{ backgroundColor: 'var(--soouls-bg)', color: 'var(--soouls-text-strong)' }}>
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
        <Image src="/images/tree-bg.png" alt="" fill style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.46 }} priority={false} />
      </div>

      <header className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 transition-all duration-300 md:px-12 ${scrolled ? 'border-b py-4 backdrop-blur-md' : 'bg-transparent py-6'}`} style={{ backgroundColor: scrolled ? 'rgba(20,20,20,0.76)' : 'transparent', borderColor: scrolled ? 'var(--soouls-border)' : 'transparent' }}>
        <Link href="/home" className="relative flex h-8 w-24 items-center text-xl font-bold text-white">Soouls</Link>
        <div className="flex items-center gap-4">
          <Link href="/home/canvas" className="flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm shadow-md" style={{ backgroundColor: 'rgba(17,17,17,0.86)', borderColor: 'var(--soouls-border)', color: 'var(--soouls-text-muted)' }}>
            <CanvasLoopIcon className="h-[18px] w-[18px]" />
            <span className="hidden font-medium tracking-wide sm:inline">Canvas</span>
          </Link>
          <button onClick={() => setIsOpen(true)} className="h-10 w-10 overflow-hidden rounded-full border-2 shadow-md" style={{ backgroundColor: 'var(--soouls-bg-elevated)', borderColor: 'rgba(255,255,255,0.12)' }} aria-label="Open profile menu">
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center">
        <section className="relative z-10 w-full max-w-[1600px] px-4 pb-44 pt-32 md:px-8 md:pb-64">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-[2.5rem] font-light leading-[1.08] tracking-tight text-white md:text-[3.5rem]">
            You do not need clarity to start. <br className="hidden md:block" />
            Clarity comes after you{' '}
            <Link href="/home/new-entry" className="font-playfair italic underline underline-offset-4" style={{ color: 'var(--soouls-accent)' }}>
              make entry
            </Link>
          </motion.h1>
        </section>

        <section className="relative z-10 mt-8 flex w-full max-w-[1600px] justify-center px-4 pb-28 md:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }} className="w-full rounded-[2rem] p-4 md:p-8" style={{ backgroundColor: 'var(--soouls-bg-surface)' }}>
            <div className="mb-6 flex justify-end gap-2 text-[11px] font-medium tracking-wider text-[var(--soouls-text-faint)]">
              <Calendar className="h-3.5 w-3.5" />
              {formatCurrentMonthRange()}
            </div>
            <div className="mb-6 rounded-2xl p-7 md:p-10" style={{ backgroundColor: 'var(--soouls-bg-panel)' }}>
              <LeafIcon className="mb-6 h-5 w-5 text-[#86A861]" />
              <p className="font-playfair text-2xl italic leading-[1.25] text-[var(--soouls-text-strong)] md:text-5xl">
                "{insights?.monthlyNarrative ?? 'Your entries are beginning to show a more coherent direction.'}"
              </p>
              <p className="mt-6 max-w-5xl text-sm leading-relaxed text-[var(--soouls-text-muted)]">
                {insights ? `You have ${insights.overview.entryCount} entries in your archive, ${insights.overview.weeklyEntryCount} entries this week, and a ${insights.overview.currentStreak}-day reflective streak.` : 'Your home summary evolves from your real writing as soon as you start capturing entries.'}
              </p>
            </div>

            <div className="mb-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl p-7" style={{ backgroundColor: 'var(--soouls-bg-panel)' }}>
                <h2 className="mb-8 text-base font-medium">Thought Themes</h2>
                <div className="space-y-5">
                  {thoughtThemes.length ? thoughtThemes.slice(0, 4).map((theme) => (
                    <div key={theme.key}>
                      <div className="mb-2 flex justify-between text-[10px] font-medium tracking-wider text-[var(--soouls-text-faint)]">
                        <span>{theme.label.toUpperCase()}</span>
                        <span>{theme.count} ENTRIES</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-black/50">
                        <div className="h-full rounded-full" style={{ width: `${theme.progress}%`, background: 'linear-gradient(90deg,var(--soouls-accent),orange)' }} />
                      </div>
                    </div>
                  )) : <p className="rounded-2xl border border-[var(--soouls-border)] p-5 text-sm text-[var(--soouls-text-muted)]">Your theme graph will begin filling in after your first few real entries.</p>}
                </div>
              </div>

              <div className="rounded-2xl p-7" style={{ backgroundColor: 'var(--soouls-bg-panel)' }}>
                <h2 className="mb-5 text-base font-medium">Reflection Patterns</h2>
                <p className="mb-8 text-sm leading-relaxed text-[var(--soouls-text-muted)]">You tend to reflect most during {insights?.overview.mostActivePeriod ?? 'late evenings'}, when your thoughts become more structured.</p>
                <div className="flex h-28 items-end justify-center gap-2 border-b border-white/10">
                  {(activityBars.length ? activityBars : [20, 34, 50, 70, 84, 64, 38]).slice(0, 7).map((value, index) => {
                    return <span key={index} className="w-7 bg-[rgba(var(--soouls-accent-rgb),0.75)]" style={{ height: `${Math.max(16, value)}%`, opacity: 0.35 + index * 0.08 }} />;
                  })}
                </div>
              </div>
            </div>

            <div className="mb-6 grid gap-6 lg:grid-cols-[0.8fr_1fr]">
              <div className="rounded-2xl p-7" style={{ backgroundColor: 'var(--soouls-bg-panel)' }}>
                <h2 className="text-base font-semibold">How your Thoughts connect</h2>
                <p className="mb-6 text-[10px] tracking-wider text-[var(--soouls-text-faint)]">RELATIONSHIP MAP</p>
                <div className="relative h-56 overflow-hidden rounded bg-[#181818]">
                  {thoughtThemes.slice(0, 5).map((theme, index) => <span key={theme.key} className="absolute h-3 w-3 rounded-full bg-[#e8c7b4] shadow-[0_0_18px_rgba(224,122,95,0.8)]" style={{ left: `${20 + index * 14}%`, top: `${25 + (index % 3) * 18}%` }} />)}
                </div>
              </div>
              <div className="rounded-2xl p-7" style={{ backgroundColor: 'var(--soouls-bg-panel)' }}>
                <h2 className="text-base font-semibold">Your thinking is shifting</h2>
                <p className="mb-6 text-[10px] tracking-wider text-[var(--soouls-text-faint)]">EVOLUTION CYCLE</p>
                <div className="space-y-4">
                  {shiftMetrics.map((item) => <div key={item.label} className="flex items-center justify-between"><span className="text-sm uppercase text-[var(--soouls-text-muted)]">{item.label}</span>{item.icon}</div>)}
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-8 text-center md:p-10" style={{ backgroundColor: 'var(--soouls-bg-panel)' }}>
              <LeafIcon className="mx-auto mb-6 h-6 w-6 text-[#86A861]" />
              <p className="mb-4 text-[11px] tracking-widest" style={{ color: 'var(--soouls-accent)' }}>FINAL SYNTHESIS</p>
              <p className="font-playfair text-2xl italic md:text-4xl">"{insights?.finalSynthesis ?? 'Your writing suggests a meaningful transition is underway.'}"</p>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--soouls-text-muted)]">This summary updates from your actual entries, settings, and reflective cadence.</p>
            </div>
          </motion.div>
        </section>
      </main>

      <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex w-full max-w-[1600px] -translate-x-1/2 items-center justify-between px-5 md:px-12">
        <button onClick={() => setIsSearchOpen(true)} className="pointer-events-auto flex items-center gap-3 rounded-full px-5 py-3 text-sm shadow-2xl" style={{ color: 'var(--soouls-text-muted)', backgroundColor: 'rgba(17,17,17,0.9)' }}>
          <Search className="h-[18px] w-[18px]" />
          <span className="hidden font-light tracking-wide sm:inline">Search Entries</span>
        </button>
        <Link href="/home" className="pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-center justify-center text-[#BDBBAF] transition-colors hover:text-white">
          <SymbolLogo className="h-14 w-14" variant="solid" />
        </Link>
        <button onClick={() => setIsCalendarOpen(true)} className="pointer-events-auto flex items-center gap-3 rounded-full border px-5 py-3 text-sm text-white shadow-[0_0_25px_rgba(212,107,78,0.15)]" style={{ backgroundColor: 'rgba(17,17,17,0.9)', borderColor: 'rgba(var(--soouls-accent-rgb),0.4)' }}>
          <Calendar className="h-5 w-5" />
          <span className="hidden font-medium tracking-wide sm:inline">Calendar</span>
        </button>
      </div>

      <AnimatePresence>{isSearchOpen && <SearchPopup entries={entries?.items ?? []} onClose={() => setIsSearchOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{isCalendarOpen && <CalendarModal onClose={() => setIsCalendarOpen(false)} />}</AnimatePresence>
    </div>
  );
}
