'use client';

import { useAuth, useUser, useClerk } from '@clerk/nextjs';
import { Badge, CalendarCard, DayCell, IconButton } from '@soouls/ui-kit';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PenSquare,
  Search,
  X,
  LogOut,
  Settings,
  Sparkles,
  User,
  UserCircle,
} from 'lucide-react';
import LZString from 'lz-string';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { trpc } from '../../../src/utils/trpc';
import { SymbolLogo } from '../../components/SymbolLogo';

// ─── Custom Icons ───────────────────────────────────────────────────────────

const LeafIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const DiamondIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 16 6 12 10 8 6 12 2" />
    <polygon points="12 14 16 18 12 22 8 18 12 14" />
    <polygon points="2 12 6 16 10 12 6 8 2 12" />
    <polygon points="14 12 18 16 22 12 18 8 14 12" />
  </svg>
);

const CanvasLoopIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 12C9.5 8 5 8 5 12C5 16 9.5 16 12 12Z" />
    <path d="M12 12C14.5 8 19 8 19 12C19 16 14.5 16 12 12Z" />
    <path d="M12 12C8 9.5 8 5 12 5C16 5 16 9.5 12 12Z" />
    <path d="M12 12C8 14.5 8 19 12 19C16 19 16 14.5 12 12Z" />
  </svg>
);

const CompassIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const NetworkIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
    <path d="M14.5 10.5l1.5-1.5" />
    <path d="M9.5 13.5l-1.5 1.5" />
  </svg>
);

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

/** Google Calendar colour palette (colorId → hex) - On Brand: Oranges, Stones, Coppers */
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

// ─── Skeleton ───────────────────────────────────────────────────────────────

function CalendarSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-y-10">
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} className="flex justify-center">
          <div className="w-14 h-16 rounded-2xl bg-white/5 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium backdrop-blur-md border ${type === 'success'
        ? 'bg-green-900/80 border-green-500/30 text-green-200'
        : 'bg-red-900/80 border-red-500/30 text-red-200'
        }`}
    >
      {type === 'success' ? <Check size={16} /> : <X size={16} />}
      {message}
    </motion.div>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
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

        {/* Decorative Butterfly Logo */}
        <SymbolLogo className="absolute -top-12 -right-12 w-48 h-48 text-white/5 opacity-40 pointer-events-none" variant="solid" />

        {/* Google Calendar Icon Container */}
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
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Close
              </button>
              <button
                onClick={onDisconnect}
                className="px-5 py-3 rounded-xl border border-red-500/20 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
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
              {[
                'View events without leaving Soouls',
                'Colour-coded Google events in the calendar grid',
                'Your journal data stays private — read-only access',
              ].map((item) => (
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
              <button
                onClick={onConnect}
                disabled={connecting || !isConfigured}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#D46B4E] py-3 text-sm font-semibold text-white hover:bg-[#c35b3e] transition-all shadow-lg shadow-[#D46B4E]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {connecting ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
                {connecting ? 'Redirecting…' : 'Authorize with Google'}
              </button>
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}


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

// ─── Weekly View ─────────────────────────────────────────────────────────────

function WeeklyView({
  weekDates, entriesByDate, gcalEventsByDate, today, selectedDay, onSelectDay, onOpenEntry,
}: {
  weekDates: Date[];
  entriesByDate: Map<string, CalendarEntry[]>;
  gcalEventsByDate: Map<string, GCalEvent[]>;
  today: Date;
  selectedDay: number | null;
  onSelectDay: (d: number) => void;
  onOpenEntry: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-7 gap-3 w-full">
      {weekDates.map((wd) => {
        const key = `${wd.getFullYear()}-${wd.getMonth()}-${wd.getDate()}`;
        const dayEntries = entriesByDate.get(key) ?? [];
        const gcalEvents = gcalEventsByDate.get(key) ?? [];
        const isToday = wd.toDateString() === today.toDateString();
        const isSelected = wd.getDate() === selectedDay;

        return (
          <div key={key} className="flex flex-col gap-2">
            <div className={`flex flex-col items-center gap-1 pb-2 border-b ${isToday ? 'border-[#e67e65]/50' : 'border-white/5'}`}>
              <span className="text-[10px] text-gray-500 font-medium tracking-widest">
                {SHORT_DAYS[wd.getDay()]}
              </span>
              <button
                onClick={() => onSelectDay(wd.getDate())}
                className={`w-9 h-9 rounded-full text-sm font-semibold flex items-center justify-center transition-all ${isToday ? 'bg-[#e67e65] text-white shadow-lg shadow-[#e67e65]/30'
                  : isSelected ? 'ring-2 ring-[#e67e65] text-white' : 'text-gray-300 hover:bg-white/5'
                  }`}
              >
                {wd.getDate()}
              </button>
            </div>
            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-48">
              {dayEntries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => onOpenEntry(entry.id)}
                  className="w-full text-left rounded-lg bg-[#e67e65]/10 border border-[#e67e65]/20 px-2 py-1.5 text-[10px] text-gray-300 hover:bg-[#e67e65]/20 transition-colors line-clamp-2"
                >
                  {entry.title}
                </button>
              ))}
              {gcalEvents.map((ev) => {
                const color = GCAL_COLORS[ev.colorId ?? ''] ?? GCAL_DEFAULT_COLOR;
                return (
                  <div
                    key={ev.id}
                    className="w-full rounded-lg px-2 py-1.5 text-[10px] text-white line-clamp-1"
                    style={{ backgroundColor: `${color}25`, borderLeft: `2px solid ${color}` }}
                  >
                    {ev.summary}
                  </div>
                );
              })}
              {dayEntries.length === 0 && gcalEvents.length === 0 && (
                <div className="h-8 rounded-lg border border-dashed border-white/5" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Daily View ──────────────────────────────────────────────────────────────

function DailyView({
  date, entries, gcalEvents, onOpenEntry, onNewEntry,
}: {
  date: Date;
  entries: CalendarEntry[];
  gcalEvents: GCalEvent[];
  onOpenEntry: (id: string) => void;
  onNewEntry: () => void;
}) {
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h3 className="text-2xl font-semibold text-white">{MONTHS[date.getMonth()]} {date.getDate()}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{date.toLocaleDateString('en-US', { weekday: 'long' })}</p>
        </div>
        <button
          onClick={onNewEntry}
          className="flex items-center gap-1.5 rounded-full border border-[#e67e65]/40 bg-[#e67e65]/10 px-4 py-2 text-xs font-semibold text-[#f4b29f] hover:bg-[#e67e65]/20 transition-colors"
        >
          <PenSquare size={12} />
          New entry
        </button>
      </div>

      {entries.length === 0 && gcalEvents.length === 0 ? (
        <EmptyDay onNewEntry={onNewEntry} />
      ) : (
        <div className="space-y-3">
          {gcalEvents.map((ev) => {
            const color = GCAL_COLORS[ev.colorId ?? ''] ?? GCAL_DEFAULT_COLOR;
            return (
              <div
                key={ev.id}
                className="w-full rounded-2xl border px-5 py-4"
                style={{ borderColor: `${color}40`, backgroundColor: `${color}10` }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <p className="text-sm font-medium text-gray-200">{ev.summary}</p>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 ml-4">
                  {new Date(ev.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  {' – '}
                  {new Date(ev.end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </p>
              </div>
            );
          })}
          {entries.map((entry) => (
            <motion.button
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onOpenEntry(entry.id)}
              className="w-full text-left rounded-2xl border border-white/10 bg-white/5 px-5 py-4 hover:border-[#e67e65]/40 hover:bg-[#e67e65]/5 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-white transition-colors">{entry.title}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{formatTime(entry.createdAt)}</p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-gray-600 group-hover:text-[#e67e65] transition-colors mt-0.5" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { signOut } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { getToken } = useAuth();
  const today = useMemo(() => new Date(), []);
  const userName = user?.firstName || 'User';

  const [view, setView] = useState<ViewMode>('Monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [showGCalModal, setShowGCalModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [gcalConnected, setGcalConnected] = useState(false);
  const [gcalConfigured, setGcalConfigured] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [gcalEvents, setGcalEvents] = useState<GCalEvent[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const statusChecked = useRef(false);

  // Ctrl+K Search Shortcut Implementation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        router.push('/home'); // Go to search/home
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  // ── Handle callback query params ────────────────────────────────────────

  useEffect(() => {
    const connected = searchParams.get('gcal_connected');
    const error = searchParams.get('gcal_error');
    if (connected === '1') {
      setGcalConnected(true);
      setToast({ message: 'Google Calendar connected!', type: 'success' });
      router.replace('/home/calendar');
    } else if (error) {
      const msgs: Record<string, string> = {
        not_configured: 'Google Calendar is not configured yet.',
        cancelled: 'Connection cancelled.',
        exchange_failed: 'Failed to connect — please try again.',
      };
      setToast({ message: msgs[error] ?? 'Connection failed.', type: 'error' });
      router.replace('/home/calendar');
    }
  }, [searchParams, router]);

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
      setToast({ message: 'Failed to initiate connection.', type: 'error' });
    }
  }, [getToken]);

  // ── Disconnect handler ──────────────────────────────────────────────────

  const handleDisconnect = useCallback(async () => {
    try {
      const token = await getToken();
      await fetch(`${BACKEND_URL}/google-calendar/disconnect`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGcalConnected(false);
      setGcalEvents([]);
      setShowGCalModal(false);
      setToast({ message: 'Google Calendar disconnected.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to disconnect.', type: 'error' });
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
      const soulEvents = (entriesByDay.get(d) ?? []).slice(0, 3).map((e) => ({ id: e.id, title: e.title }));
      const gEvents = (gcalEventsByDay.get(d) ?? []).slice(0, 2).map((e) => ({
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

  const openEntry = useCallback((id: string) => router.push(`/home?id=${id}`), [router]);
  const newEntry = useCallback(() => router.push('/home/new-entry'), [router]);

  const periodLabel = useMemo(() => {
    if (view === 'Monthly') return `${MONTHS[month]} ${year}`;
    if (view === 'Weekly') {
      const s = weekDates[0]; const e = weekDates[6];
      return `${MONTHS[s.getMonth()].slice(0, 3)} ${s.getDate()} – ${MONTHS[e.getMonth()].slice(0, 3)} ${e.getDate()}`;
    }
    return `${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
  }, [view, month, year, weekDates, currentDate]);

  const dailyKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
  const dailyEntries = useMemo(() => entriesByDate.get(dailyKey) ?? [], [entriesByDate, dailyKey]);
  const dailyGcal = useMemo(() => gcalEventsByDate.get(dailyKey) ?? [], [gcalEventsByDate, dailyKey]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans flex flex-col items-center overflow-x-hidden selection:bg-[#e67e65]/30 relative">
      {/* Background Watermark */}
      <div className="absolute top-[10%] left-0 w-full flex justify-center pointer-events-none select-none z-0">
        <h1
          className="text-[16vw] font-bold leading-none tracking-tighter text-transparent opacity-[0.04]"
          style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.5)' }}
        >
          Soouls
        </h1>
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center p-6 z-50 pointer-events-auto">
        <div className="flex items-baseline gap-1 text-sm font-semibold tracking-tight">
          <span onClick={() => router.push('/home')} className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">Home</span>
          <span className="text-gray-600 mx-1">/</span>
          <span className="text-[#e67e65]">Calendar</span>
        </div>

        <div className="flex items-center gap-3">
          {isLoading && <Loader2 className="animate-spin text-[#e67e65]" size={16} />}

          {/* Search Button */}
          <button
            onClick={() => router.push('/home')}
            className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <Search size={14} />
            <span>Search</span>
            <div className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded border border-white/10 bg-black/20 font-mono text-[9px] text-gray-500">
              <span>⌘</span><span>K</span>
            </div>
          </button>
          
          <button
            onClick={() => router.push('/home')}
            className="sm:hidden p-2 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <Search size={14} />
          </button>

          {/* Google Calendar button — shows connected state */}
          <button
            onClick={() => setShowGCalModal(true)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${gcalConnected
              ? 'border-[#D46B4E]/40 bg-[#D46B4E]/10 text-[#f4b29f] hover:bg-[#D46B4E]/20'
              : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
              }`}
          >
            {gcalConnected ? <Check size={12} className="text-[#D46B4E]" /> : <Calendar size={12} />}
            <span className="hidden sm:inline">{gcalConnected ? 'Google Calendar' : 'Connect Google Calendar'}</span>
          </button>

          <button
            onClick={() => setShowSidebar(true)}
            className="w-10 h-10 rounded-full border-2 border-[#D46B4E]/30 p-[2px] overflow-hidden bg-gray-800 shadow-lg hover:border-[#D46B4E] transition-all cursor-pointer"
          >
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full rounded-full bg-zinc-700 flex items-center justify-center text-xs">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
            )}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="w-full max-w-5xl flex-grow flex flex-col justify-center px-4 md:px-6 relative z-10 pt-24 pb-8 min-h-screen">
        <CalendarCard>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <IconButton icon={ChevronLeft} label="Previous" onClick={() => navigate(-1)} />
              <h2 className="text-xl md:text-2xl font-bold tracking-tight min-w-[200px] text-center">{periodLabel}</h2>
              <IconButton icon={ChevronRight} label="Next" onClick={() => navigate(1)} />
            </div>
            <div className="bg-black/60 p-1 rounded-full border border-white/5 flex items-center shrink-0">
              {(['Monthly', 'Weekly', 'Daily'] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${view === v ? 'bg-[#e67e65] text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Monthly */}
            {view === 'Monthly' && (
              <motion.div key="monthly" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                <div className="grid grid-cols-7 mb-6">
                  {SHORT_DAYS.map((day) => (
                    <div key={day} className="flex justify-center"><Badge>{day}</Badge></div>
                  ))}
                </div>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    {isLoading ? <CalendarSkeleton /> : (
                      <div className="grid grid-cols-7 gap-y-6">
                        {calendarGrid.map((item) => {
                          const isTodayCell = item.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                          const isSelectedCell = item.day === selectedDay;
                          return (
                            <DayCell
                              key={item.key}
                              day={item.day}
                              isToday={isTodayCell}
                              isSelected={isSelectedCell && !isTodayCell}
                              events={item.events}
                              onClick={() => setSelectedDay(item.day)}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="w-full lg:w-[280px] shrink-0">
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 h-full">
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Soouls</div>
                      <div className="text-lg font-semibold mb-1">
                        {selectedDay ? `${MONTHS[month]} ${selectedDay}` : 'Pick a day'}
                      </div>
                      <div className="text-xs text-gray-500 mb-4">
                        {selectedEntries.length + selectedGcalEvents.length}{' '}
                        {selectedEntries.length + selectedGcalEvents.length === 1 ? 'item' : 'items'}
                      </div>

                      <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto pr-1">
                        {/* GCal events first */}
                        {selectedGcalEvents.map((ev) => {
                          const color = GCAL_COLORS[ev.colorId ?? ''] ?? GCAL_DEFAULT_COLOR;
                          return (
                            <div key={ev.id} className="rounded-xl border px-3 py-2" style={{ borderColor: `${color}40`, backgroundColor: `${color}10` }}>
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                <p className="text-xs text-gray-200 line-clamp-1">{ev.summary}</p>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-0.5 ml-3">
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
                            className="w-full text-left rounded-xl border border-white/10 px-3 py-2 hover:border-[#e67e65]/40 hover:bg-[#e67e65]/10 transition-colors"
                          >
                            <div className="line-clamp-2 text-xs text-gray-300">{entry.title}</div>
                            <div className="mt-1 text-[10px] text-gray-500">{formatTime(entry.createdAt)}</div>
                          </button>
                        ))}
                        {selectedEntries.length === 0 && selectedGcalEvents.length === 0 && (
                          <EmptyDay onNewEntry={newEntry} />
                        )}
                      </div>

                      {/* GCal CTA */}
                      {!gcalConnected && (
                        <div className="border border-white/10 rounded-xl p-3 text-center mt-4">
                          <div className="text-[10px] text-gray-500 mb-2">Google Calendar</div>
                          <button
                            onClick={() => setShowGCalModal(true)}
                            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20"
                          >
                            <Calendar size={11} className="text-[#D46B4E]" />
                            Connect Google Calendar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Search hint */}
                <div className="flex justify-center mt-10">
                  <button className="bg-[#1a1a1a] border border-white/10 px-8 py-3 rounded-full text-xs text-gray-500 font-bold flex items-center gap-3 hover:border-[#e67e65]/50 hover:text-gray-300 transition-all shadow-2xl group uppercase tracking-widest">
                    <Search size={14} />
                    <span className="opacity-60 group-hover:opacity-100 transition-opacity">Ctrl + K to search</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Weekly */}
            {view === 'Weekly' && (
              <motion.div key="weekly" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                <div className="grid grid-cols-7 mb-4">
                  {SHORT_DAYS.map((day) => <div key={day} className="flex justify-center"><Badge>{day}</Badge></div>)}
                </div>
                {isLoading ? (
                  <div className="grid grid-cols-7 gap-3 animate-pulse">
                    {Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-40 rounded-2xl bg-white/5" />)}
                  </div>
                ) : (
                  <WeeklyView
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
              <motion.div key="daily" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                {isLoading ? (
                  <div className="space-y-3 animate-pulse">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-white/5" />)}
                  </div>
                ) : (
                  <DailyView
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
        </CalendarCard>
      </main>

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

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* ─── Profile Sidebar ─── */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowSidebar(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 w-80 h-full bg-[#222222] shadow-2xl p-8 flex flex-col rounded-l-2xl overflow-hidden"
            >
              <button
                onClick={() => setShowSidebar(false)}
                className="absolute top-6 right-6 text-white hover:text-white/80 transition-colors z-10"
              >
                <X className="w-6 h-6 stroke-[1]" />
              </button>

              {/* Profile Header */}
              <div className="mb-10 pt-2 flex flex-col items-start relative z-10">
                <div className="flex gap-4 items-center mb-2">
                  <div className="w-16 h-16 rounded-full bg-[#1A1A1A] overflow-hidden shrink-0 border-2 border-white/10">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50">U</div>
                    )}
                  </div>
                  <div>
                    <p className="text-[22px] text-white/90 font-playfair italic leading-tight">
                      Hello there,
                    </p>
                  </div>
                </div>
                <h2 className="text-[32px] font-bold text-[#D46B4E] tracking-tight leading-none mb-4">
                  {userName} {user?.lastName || ''}
                </h2>
                <p className="text-xl text-white font-playfair italic leading-snug">
                  &quot;You&apos;ve shown up <span className="text-[#D46B4E]">12 days</span><br />in a row.&quot;
                </p>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 space-y-2 relative z-10">
                {[
                  { label: 'Dashboard', href: '/home', icon: <DiamondIcon className="w-5 h-5" /> },
                  { label: 'Insights', href: '/home', icon: <Sparkles className="w-5 h-5 stroke-[1.5]" /> },
                  { label: 'Clusters', href: '/home', icon: <NetworkIcon className="w-5 h-5" /> },
                  { label: 'Canvas', href: '/home/canvas', icon: <CanvasLoopIcon className="w-5 h-5" /> },
                  { label: 'Account', href: '/home/account', icon: <UserCircle className="w-5 h-5 stroke-[1.5]" /> },
                  { label: 'Settings', href: '/home/settings', icon: <Settings className="w-5 h-5 stroke-[1.5]" /> },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-4 px-2 py-3 text-white hover:text-white/80 transition-all"
                    onClick={() => setShowSidebar(false)}
                  >
                    {item.icon}
                    <span className="text-lg font-light tracking-wide">{item.label}</span>
                  </Link>
                ))}

                {/* Logout */}
                <button
                  onClick={() => {
                    setShowSidebar(false);
                    setShowLogoutModal(true);
                  }}
                  className="flex items-center gap-4 px-2 py-3 text-red-500 hover:text-red-400 transition-all mt-4 w-full"
                >
                  <LogOut className="w-5 h-5 stroke-[1.5]" />
                  <span className="text-lg font-light tracking-wide">Logout</span>
                </button>
              </nav>

              {/* Decorative Butterfly Logo */}
              <SymbolLogo className="absolute -bottom-16 -right-16 w-64 h-64 text-[#E6E1D8]/30 pointer-events-none" variant="solid" />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Logout Modal ─── */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-[#838182] rounded-[2rem] p-10 text-center shadow-2xl relative overflow-hidden"
            >
              {/* Decorative Butterfly Logo */}
              <SymbolLogo className="absolute -top-4 -right-4 w-32 h-32 text-[#D46B4E] rotate-12 opacity-90" variant="solid" />

              <div className="relative z-10 text-left">
                <h2 className="text-[40px] font-urbanist font-light text-white mb-2">Leaving for now?</h2>
                <p className="text-2xl text-white/90 font-playfair italic mb-16">
                  Your thoughts are safely stored. You can<br />return anytime.
                </p>

                <div className="flex gap-6 justify-center mb-8">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="w-36 py-3.5 rounded-2xl bg-[#4A4A4A] border border-[#D46B4E] text-white hover:bg-[#5a5a5a] transition-all text-lg font-medium shadow-lg"
                  >
                    Stay
                  </button>
                  <button
                    onClick={() => signOut({ redirectUrl: '/' })}
                    className="w-36 py-3.5 rounded-2xl bg-[#D33F3F] border border-[#B33535] text-white hover:bg-[#E34A4A] transition-all text-lg font-medium shadow-lg"
                  >
                    Logout
                  </button>
                </div>

                <p className="text-center text-lg text-white/60 font-playfair italic">See you soon.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
