import { useAuth, useUser } from '@clerk/nextjs';
import { Badge, DayCell, IconButton } from '@soouls/ui-kit';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Check, ChevronLeft, ChevronRight, Loader2, PenSquare, Search, X } from 'lucide-react';
import LZString from 'lz-string';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { trpc } from '../../../src/utils/trpc';
import { SymbolLogo } from '../../components/SymbolLogo';
import { WeeklyTimeGrid } from './WeeklyTimeGrid';
import { DailyTimeGrid } from './DailyTimeGrid';

// ─── Types ──────────────────────────────────────────────────────────────────

type CalendarEntry = {
  id: string;
  title: string;
  createdAt: Date;
};

type GCalEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
  colorId?: string;
};

type ViewMode = 'Monthly' | 'Weekly' | 'Daily';

const GCAL_COLORS: Record<string, string> = {
  '1': '#B86B4E', '2': '#AE8B7E', '3': '#D46B4E', '4': '#A67C52',
  '5': '#E6B89C', '6': '#845C44', '7': '#C5906E', '8': '#5D5D5D',
  '9': '#E27D60', '10': '#4E342E', '11': '#BF360C',
};
const GCAL_DEFAULT_COLOR = '#D46B4E';

// ─── Helpers ────────────────────────────────────────────────────────────────

function decodeEntryContent(rawContent: string | null | undefined): string {
  if (!rawContent) return '';
  try {
    const decompressed = LZString.decompressFromUTF16(rawContent) || rawContent;
    const parsed = JSON.parse(decompressed);
    return parsed.textContent || '';
  } catch {
    return rawContent;
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(start);
    dd.setDate(start.getDate() + i);
    return dd;
  });
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const SHORT_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyDay({ onNewEntry }: { onNewEntry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center bg-white/5">
        <PenSquare size={20} className="text-gray-500" />
      </div>
      <p className="text-xs text-gray-500 text-center leading-relaxed max-w-[180px]">
        No entries on this day yet.
      </p>
      <button onClick={onNewEntry} className="text-xs text-[#e67e65] hover:underline underline-offset-2">
        Write one now →
      </button>
    </div>
  );
}

// ─── Google Calendar Connect Modal ──────────────────────────────────────────

function GCalModal({
  onClose,
  isConnected,
  isConfigured,
  onConnect,
  onDisconnect,
  connecting,
}: {
  onClose: () => void;
  isConnected: boolean;
  isConfigured: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  connecting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-md bg-[#1c1c1c] border border-white/10 rounded-3xl p-8 relative shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors z-10">
          <X size={18} />
        </button>

        <SymbolLogo className="absolute -top-12 -right-12 w-48 h-48 text-white/5 opacity-40 pointer-events-none" variant="solid" />

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10 ${isConnected
          ? 'bg-[#D46B4E]/10 border border-[#D46B4E]/30'
          : 'bg-white/5 border border-white/10'
          }`}>
          {isConnected ? (
            <Check size={28} className="text-[#D46B4E]" />
          ) : (
            <Calendar size={28} className="text-white/60" />
          )}
        </div>

        {isConnected ? (
          <div className="relative z-10">
            <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Google Calendar Connected</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-8">
              Your Google Calendar events are showing in the calendar view alongside your Soouls entries.
            </p>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                Close
              </button>
              <button onClick={onDisconnect} className="px-5 py-3 rounded-xl border border-red-500/20 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10">
            <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Connect Google Calendar</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              See your Google Calendar events alongside your Soouls entries — birthdays, meetings, and milestones, all in one view.
            </p>

            <ul className="space-y-2 mb-8">
              {['View events without leaving Soouls', 'Colour-coded Google events in the calendar grid', 'Your journal data stays private — read-only access'].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#D46B4E] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {!isConfigured && (
              <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-400">
                Google Calendar OAuth is not yet configured on this server. Add{' '}
                <code className="font-mono text-amber-300">GOOGLE_CLIENT_ID</code> and{' '}
                <code className="font-mono text-amber-300">GOOGLE_CLIENT_SECRET</code> to your <code>.env</code>.
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={onConnect} disabled={connecting || !isConfigured} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#D46B4E] py-3 text-sm font-semibold text-white hover:bg-[#c35b3e] transition-all shadow-lg shadow-[#D46B4E]/20 disabled:opacity-50 disabled:cursor-not-allowed">
                {connecting ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
                {connecting ? 'Redirecting…' : 'Authorize with Google'}
              </button>
              <button onClick={onClose} className="px-5 py-3 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-colors">
                Not now
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Main Modal Component ────────────────────────────────────────────────────

export function CalendarModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const today = useMemo(() => new Date(), []);

  const [view, setView] = useState<ViewMode>('Monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [showGCalModal, setShowGCalModal] = useState(false);
  const [gcalConnected, setGcalConnected] = useState(false);
  const [gcalConfigured, setGcalConfigured] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [gcalEvents, setGcalEvents] = useState<GCalEvent[]>([]);
  const statusChecked = useRef(false);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  // ── Check GCal connection status ────────────────────────────────────────

  useEffect(() => {
    if (statusChecked.current) return;
    statusChecked.current = true;

    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${BACKEND_URL}/google-calendar/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: { connected: boolean; configured: boolean } = await res.json();
        setGcalConnected(data.connected);
        setGcalConfigured(data.configured);
      } catch {
        // silently ignore — status is non-critical
      }
    })();
  }, [getToken]);

  // ── Fetch GCal events when connected ───────────────────────────────────

  useEffect(() => {
    if (!gcalConnected) return;
    (async () => {
      try {
        const token = await getToken();
        const timeMin = new Date(year, month, 1).toISOString();
        const timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
        const res = await fetch(
          `${BACKEND_URL}/google-calendar/events?timeMin=${timeMin}&timeMax=${timeMax}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) {
          const data: { events: GCalEvent[] } = await res.json();
          setGcalEvents(data.events ?? []);
        }
      } catch {
        // silently ignore
      }
    })();
  }, [gcalConnected, month, year, getToken]);

  // ── Connect handler ─────────────────────────────────────────────────────

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    try {
      const token = await getToken();
      window.location.href = `${BACKEND_URL}/google-calendar/connect?clerk_token=${token}`;
    } catch {
      setConnecting(false);
    }
  }, [getToken]);

  const handleDisconnect = useCallback(async () => {
    try {
      const token = await getToken();
      await fetch(`${BACKEND_URL}/google-calendar/disconnect`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGcalConnected(false);
      setGcalEvents([]);
      setShowGCalModal(false);
    } catch {
      // Handle error
    }
  }, [getToken]);

  // ── Entry data ────────────────────────────────────────────────────────

  const { data: galaxyData, isLoading } = trpc.private.entries.getGalaxy.useQuery({ limit: 500 });

  const entries = useMemo<CalendarEntry[]>(() => {
    if (!galaxyData?.items) return [];
    return galaxyData.items.map((entry) => {
      const decoded = decodeEntryContent(entry.content);
      const firstLine = decoded.split('\n').map((l) => l.trim()).find(Boolean);
      return { id: entry.id, title: firstLine || 'Untitled entry', createdAt: new Date(entry.createdAt) };
    });
  }, [galaxyData]);

  const entriesByDay = useMemo(() => {
    const map = new Map<number, CalendarEntry[]>();
    for (const entry of entries) {
      if (entry.createdAt.getMonth() !== month || entry.createdAt.getFullYear() !== year) continue;
      const day = entry.createdAt.getDate();
      map.set(day, [...(map.get(day) ?? []), entry]);
    }
    return map;
  }, [entries, month, year]);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const entry of entries) {
      const key = `${entry.createdAt.getFullYear()}-${entry.createdAt.getMonth()}-${entry.createdAt.getDate()}`;
      map.set(key, [...(map.get(key) ?? []), entry]);
    }
    return map;
  }, [entries]);

  // ── GCal events by date ───────────────────────────────────────────────

  const gcalEventsByDay = useMemo(() => {
    const map = new Map<number, GCalEvent[]>();
    for (const ev of gcalEvents) {
      const d = new Date(ev.start);
      if (d.getMonth() !== month || d.getFullYear() !== year) continue;
      const day = d.getDate();
      map.set(day, [...(map.get(day) ?? []), ev]);
    }
    return map;
  }, [gcalEvents, month, year]);

  const gcalEventsByDate = useMemo(() => {
    const map = new Map<string, GCalEvent[]>();
    for (const ev of gcalEvents) {
      const d = new Date(ev.start);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      map.set(key, [...(map.get(key) ?? []), ev]);
    }
    return map;
  }, [gcalEvents]);

  const selectedEntries = useMemo(() => selectedDay ? (entriesByDay.get(selectedDay) ?? []) : [], [selectedDay, entriesByDay]);
  const selectedGcalEvents = useMemo(() => selectedDay ? (gcalEventsByDay.get(selectedDay) ?? []) : [], [selectedDay, gcalEventsByDay]);

  // ── Calendar grid ─────────────────────────────────────────────────────

  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const items: Array<{ day: number | null; key: string; events?: Array<{ id: string; title: string; color?: string }> }> = [];

    for (let i = 0; i < firstDay; i++) items.push({ day: null, key: `empty-${i}` });

    for (let d = 1; d <= daysInMonth; d++) {
      const soulEvents = (entriesByDay.get(d) ?? []).slice(0, 3).map((e: CalendarEntry) => ({ id: e.id, title: e.title }));
      const gEvents = (gcalEventsByDay.get(d) ?? []).slice(0, 2).map((e: GCalEvent) => ({
        id: `gcal-${e.id}`, title: e.summary, color: GCAL_COLORS[e.colorId ?? ''] ?? GCAL_DEFAULT_COLOR,
      }));
      items.push({ day: d, key: `day-${d}`, events: [...soulEvents, ...gEvents] });
    }
    return items;
  }, [month, year, entriesByDay, gcalEventsByDay]);

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  const navigate = useCallback((dir: number) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === 'Monthly') { d.setDate(1); d.setMonth(d.getMonth() + dir); }
      else if (view === 'Weekly') { d.setDate(d.getDate() + dir * 7); }
      else { d.setDate(d.getDate() + dir); setSelectedDay(d.getDate()); }
      return d;
    });
  }, [view]);

  const openEntry = useCallback((id: string) => {
    onClose();
    router.push(`/home?id=${id}`);
  }, [router, onClose]);

  const newEntry = useCallback(() => {
    onClose();
    router.push('/home/new-entry');
  }, [router, onClose]);

  const periodLabel = useMemo(() => {
    if (view === 'Monthly') return `${MONTHS[month]} ${year}`;
    if (view === 'Weekly') {
      const s = weekDates[0]; const e = weekDates[6];
      if (!s || !e) return '';
      return `${MONTHS[s.getMonth()]?.slice(0, 3)} ${s.getDate()} – ${MONTHS[e.getMonth()]?.slice(0, 3)} ${e.getDate()}`;
    }
    return `${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
  }, [view, month, year, weekDates, currentDate]);

  const dailyKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
  const dailyEntries = useMemo(() => entriesByDate.get(dailyKey) ?? [], [entriesByDate, dailyKey]);
  const dailyGcal = useMemo(() => gcalEventsByDate.get(dailyKey) ?? [], [gcalEventsByDate, dailyKey]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-6xl h-[90vh] md:h-[85vh] bg-[#141414]/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-white/5 shrink-0 relative">
          <div className="flex items-center gap-8 w-full justify-center relative">
            <button onClick={() => navigate(-1)} className="text-[#e67e65] hover:opacity-80 transition-opacity p-2">
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight min-w-[200px] text-center text-white relative">
              {periodLabel}
              {isLoading && (
                <span className="absolute -right-8 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-[#e67e65]" size={16} />
                </span>
              )}
            </h2>
            <button onClick={() => navigate(1)} className="text-[#e67e65] hover:opacity-80 transition-opacity p-2">
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex items-center gap-4 absolute right-6">
            <button
              onClick={() => setShowGCalModal(true)}
              className={`hidden sm:inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${gcalConnected
                ? 'border-[#D46B4E]/40 bg-[#D46B4E]/10 text-[#f4b29f] hover:bg-[#D46B4E]/20'
                : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
                }`}
            >
              {gcalConnected ? <Check size={12} className="text-[#D46B4E]" /> : <Calendar size={12} />}
              <span>{gcalConnected ? 'Connected' : 'Connect Google Calendar'}</span>
            </button>

            <div className="bg-black/40 p-1 rounded-full border border-white/5 flex items-center shrink-0">
              {(['Monthly', 'Weekly', 'Daily'] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${view === v ? 'bg-[#e67e65] text-neutral-900 shadow-lg shadow-[#e67e65]/20' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors ml-2 hidden">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative p-6">
          <AnimatePresence mode="wait">
            {/* Monthly */}
            {view === 'Monthly' && (
              <motion.div key="monthly" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="h-full flex flex-col lg:flex-row gap-6">
                <div className="flex-1 flex flex-col h-full overflow-y-auto pr-2">
                  <div className="grid grid-cols-7 mb-4">
                    {SHORT_DAYS.map((day) => (
                      <div key={day} className="flex justify-center">
                        <span className="text-[11px] text-gray-400 font-medium tracking-widest uppercase">
                          {day}
                        </span>
                      </div>
                    ))}
                  </div>
                  {isLoading ? (
                    <div className="grid grid-cols-7 gap-y-4">
                      {Array.from({ length: 35 }).map((_, i) => <div key={i} className="flex justify-center"><div className="w-14 h-16 rounded-2xl bg-white/5 animate-pulse" /></div>)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-7 gap-y-4">
                      {calendarGrid.map((item) => {
                        const isTodayCell = item.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                        const isSelectedCell = item.day === selectedDay;
                        return (
                          <DayCell
                            key={item.key}
                            day={item.day}
                            isToday={isTodayCell}
                            isSelected={isSelectedCell}
                            events={item.events}
                            onClick={() => setSelectedDay(item.day)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-[320px] shrink-0 h-full">
                  <div className="bg-black/20 border border-white/15 rounded-3xl p-6 h-full flex flex-col backdrop-blur-md">
                    <div className="text-[10px] text-[#e67e65] font-bold uppercase tracking-widest mb-1">Schedule</div>
                    <div className="text-2xl font-bold mb-1 text-white">
                      {selectedDay ? `${MONTHS[month]} ${selectedDay}` : 'Pick a day'}
                    </div>
                    <div className="text-sm text-gray-500 mb-6 font-medium">
                      {selectedEntries.length + selectedGcalEvents.length}{' '}
                      {selectedEntries.length + selectedGcalEvents.length === 1 ? 'event' : 'events'}
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                      {/* GCal events */}
                      {selectedGcalEvents.map((ev) => {
                        const color = GCAL_COLORS[ev.colorId ?? ''] ?? GCAL_DEFAULT_COLOR;
                        return (
                          <div key={ev.id} className="rounded-2xl border px-4 py-3 shadow-lg" style={{ borderColor: `${color}30`, backgroundColor: `${color}10` }}>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: color, color }} />
                              <p className="text-sm text-white font-medium line-clamp-1">{ev.summary}</p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5 ml-4">
                              {new Date(ev.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </p>
                          </div>
                        );
                      })}
                      {/* Soouls entries */}
                      {selectedEntries.map((entry) => (
                        <button
                          key={entry.id}
                          onClick={() => openEntry(entry.id)}
                          className="w-full text-left rounded-2xl border border-white/10 px-4 py-3 bg-white/[0.02] hover:border-[#e67e65]/40 hover:bg-[#e67e65]/10 transition-all shadow-lg group"
                        >
                          <div className="line-clamp-2 text-sm text-gray-200 group-hover:text-white font-medium">{entry.title}</div>
                          <div className="mt-1.5 text-xs text-gray-500">{formatTime(entry.createdAt)}</div>
                        </button>
                      ))}
                      {selectedEntries.length === 0 && selectedGcalEvents.length === 0 && (
                        <EmptyDay onNewEntry={newEntry} />
                      )}
                    </div>

                    {/* GCal CTA */}
                    {!gcalConnected && (
                      <div className="border border-[#D46B4E]/30 bg-[#D46B4E]/5 rounded-2xl p-4 text-center mt-6">
                        <div className="text-xs text-gray-400 mb-3 font-medium">Want to see all your events?</div>
                        <button
                          onClick={() => setShowGCalModal(true)}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#D46B4E] py-2.5 text-sm font-semibold text-white hover:bg-[#c35b3e] transition-all shadow-lg"
                        >
                          <Calendar size={14} />
                          Connect Calendar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Weekly */}
            {view === 'Weekly' && (
              <motion.div key="weekly" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="h-full">
                {isLoading ? (
                  <div className="w-full h-full animate-pulse rounded-2xl bg-white/5" />
                ) : (
                  <WeeklyTimeGrid
                    weekDates={weekDates}
                    entriesByDate={entriesByDate}
                    gcalEventsByDate={gcalEventsByDate}
                    today={today}
                    selectedDay={selectedDay}
                    onSelectDay={setSelectedDay}
                    onOpenEntry={openEntry}
                  />
                )}
              </motion.div>
            )}

            {/* Daily */}
            {view === 'Daily' && (
              <motion.div key="daily" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="h-full">
                {isLoading ? (
                  <div className="w-full h-full animate-pulse rounded-2xl bg-white/5" />
                ) : (
                  <DailyTimeGrid
                    date={currentDate}
                    entries={dailyEntries}
                    gcalEvents={dailyGcal}
                    onOpenEntry={openEntry}
                    onNewEntry={newEntry}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* GCal Modal */}
      <AnimatePresence>
        {showGCalModal && (
          <GCalModal
            onClose={() => setShowGCalModal(false)}
            isConnected={gcalConnected}
            isConfigured={gcalConfigured}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            connecting={connecting}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
