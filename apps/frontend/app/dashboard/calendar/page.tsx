'use client';

import { useUser } from '@clerk/nextjs';
import { Badge, CalendarCard, DayCell, IconButton } from '@soulcanvas/ui-kit';
<<<<<<< Updated upstream
import { ChevronLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import LZString from 'lz-string';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { trpc } from '../../../src/utils/trpc';

type CalendarEntry = {
  id: string;
  title: string;
  createdAt: Date;
};

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

export default function CalendarPage() {
  const router = useRouter();
  const { user } = useUser();
=======
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useMemo, useEffect } from 'react';

/*
==============================
MOCK EVENT DATA
==============================
*/

const fetchGoogleEvents = async (_year: number, _month: number) => {
  return [
    { id: '1', day: 2, title: 'Design Sync' },
    { id: '2', day: 7, title: 'Project Kickoff' },
    { id: '3', day: 17, title: 'Soulcanvas Review' },
  ];
};

const mockEventDetails = {
  title: 'Event setup 2.0',
  date: 'Tuesday, 11th',
  tasks: ['Lighting setup', 'DJ booth', 'Stationary', 'Final tests'],
  time: '00 : 01 : 48 pm',
};
>>>>>>> Stashed changes

  const [view, setView] = useState('Monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

<<<<<<< Updated upstream
  const today = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const { data: galaxyData, isLoading } = trpc.private.entries.getGalaxy.useQuery({ limit: 500 });

  const entries = useMemo<CalendarEntry[]>(() => {
    if (!galaxyData?.items) return [];
    return galaxyData.items.map((entry) => {
      const decoded = decodeEntryContent(entry.content);
      const firstLine = decoded
        .split('\n')
        .map((line) => line.trim())
        .find(Boolean);

      return {
        id: entry.id,
        title: firstLine || 'Untitled entry',
        createdAt: new Date(entry.createdAt),
      };
    });
  }, [galaxyData]);

  const entriesByDay = useMemo(() => {
    const map = new Map<number, CalendarEntry[]>();

    for (const entry of entries) {
      if (entry.createdAt.getMonth() !== month || entry.createdAt.getFullYear() !== year) continue;
      const day = entry.createdAt.getDate();
      const list = map.get(day) ?? [];
      list.push(entry);
      map.set(day, list);
    }

    return map;
  }, [entries, month, year]);

  const selectedEntries = selectedDay ? entriesByDay.get(selectedDay) ?? [] : [];
=======
export default function Calendar() {
  const router = useRouter();
  const { user } = useUser();

  const [view, setView] = useState('Monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date();

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
>>>>>>> Stashed changes

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
<<<<<<< Updated upstream
=======

  /*
  ==============================
  CALENDAR GRID LOGIC
  ==============================
  */
>>>>>>> Stashed changes

  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
<<<<<<< Updated upstream
    const items: Array<{ day: number | null; key: string; events?: Array<{ id: string; title: string }> }> = [];
=======

    const items: any[] = [];
>>>>>>> Stashed changes

    for (let i = 0; i < firstDayOfMonth; i++) {
      items.push({ day: null, key: `empty-${i}` });
    }

    for (let d = 1; d <= daysInMonth; d++) {
<<<<<<< Updated upstream
      const dayEntries = entriesByDay.get(d) ?? [];
      items.push({
        day: d,
        key: `day-${d}`,
        events: dayEntries.slice(0, 3).map((entry) => ({ id: entry.id, title: entry.title })),
=======
      const dayEvents = events.filter((e) => e.day === d);

      items.push({
        day: d,
        key: `day-${d}`,
        events: dayEvents,
>>>>>>> Stashed changes
      });
    }

    return items;
<<<<<<< Updated upstream
  }, [entriesByDay, month, year]);
=======
  }, [month, year, events]);

  /*
  ==============================
  LOAD EVENTS
  ==============================
  */

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      try {
        const data = await fetchGoogleEvents(year, month);
        setEvents(data);
      } catch (err) {
        console.error('Failed to fetch events', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [month, year]);

  /*
  ==============================
  CHANGE MONTH
  ==============================
  */
>>>>>>> Stashed changes

  const changeMonth = (direction: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(1);
      newDate.setMonth(prev.getMonth() + direction);
<<<<<<< Updated upstream
      return newDate;
    });
  };

  const googleCalendarConnectUrl =
    process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_OAUTH_URL ?? 'https://calendar.google.com';

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans p-8 flex flex-col items-center justify-center overflow-hidden selection:bg-[#e67e65]/30 relative">
=======

      return newDate;
    });
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans p-8 flex flex-col items-center justify-center overflow-hidden selection:bg-[#e67e65]/30 relative">
      {/* Background Title */}

>>>>>>> Stashed changes
      <div className="absolute top-[15%] left-0 w-full flex justify-center pointer-events-none select-none z-0">
        <h1
          className="text-[16vw] font-bold leading-none tracking-tighter text-transparent opacity-10"
          style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.4)' }}
        >
          Soulcanvas
        </h1>
      </div>

<<<<<<< Updated upstream
=======
      {/* HEADER */}

>>>>>>> Stashed changes
      <header className="w-full max-w-4xl flex justify-between items-center mb-12 relative z-10 px-4">
        <div className="flex items-baseline gap-1 text-2xl font-semibold tracking-tight">
          <span
            onClick={() => router.push('/dashboard')}
            className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
          >
            Home
          </span>
          <span className="text-gray-400 mx-1">/</span>
          <span className="text-[#e67e65]">Calendar</span>
        </div>

        <div className="flex items-center gap-4">
          {isLoading && <Loader2 className="animate-spin text-[#e67e65]" size={20} />}
<<<<<<< Updated upstream
          <a
            href={googleCalendarConnectUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#e67e65]/40 bg-[#e67e65]/10 px-4 py-2 text-xs font-semibold text-[#f4b29f] hover:bg-[#e67e65]/20 transition-colors"
          >
            Connect Google Calendar
            <ExternalLink size={12} />
          </a>
          <div className="w-12 h-12 rounded-full border-2 border-[#e67e65] p-[2px] overflow-hidden bg-gray-800 shadow-lg">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="profile" className="w-full h-full object-cover rounded-full" />
=======

          <div className="w-12 h-12 rounded-full border-2 border-[#e67e65] p-[2px] overflow-hidden bg-gray-800 shadow-lg">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="profile"
                className="w-full h-full object-cover rounded-full"
              />
>>>>>>> Stashed changes
            ) : (
              <div className="w-full h-full rounded-full bg-zinc-700 flex items-center justify-center text-xs">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        </div>
      </header>

<<<<<<< Updated upstream
      <CalendarCard>
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-10">
            <IconButton icon={ChevronLeft} label="Previous Month" onClick={() => changeMonth(-1)} />
            <h2 className="text-3xl font-bold tracking-tight min-w-[240px] text-center">
              {months[month]} {year}
            </h2>
            <IconButton icon={ChevronRight} label="Next Month" onClick={() => changeMonth(1)} />
          </div>

=======
      {/* MAIN CARD */}

      <CalendarCard>
        {/* HEADER CONTROLS */}

        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-10">
            <IconButton icon={ChevronLeft} label="Previous Month" onClick={() => changeMonth(-1)} />

            <h2 className="text-3xl font-bold tracking-tight min-w-[240px] text-center">
              {months[month]} {year}
            </h2>

            <IconButton icon={ChevronRight} label="Next Month" onClick={() => changeMonth(1)} />
          </div>

          {/* VIEW TOGGLE */}

>>>>>>> Stashed changes
          <div className="bg-black/60 p-1 rounded-full border border-white/5 flex items-center">
            {['Monthly', 'Weekly', 'Daily'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  view === v ? 'bg-[#e67e65] text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

<<<<<<< Updated upstream
=======
        {/* WEEK LABELS */}

>>>>>>> Stashed changes
        <div className="grid grid-cols-7 mb-10">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
            <div key={day} className="flex justify-center">
              <Badge>{day}</Badge>
            </div>
          ))}
        </div>

<<<<<<< Updated upstream
        <div className="flex gap-8">
          <div className="grid grid-cols-7 gap-y-10 flex-1">
            {calendarGrid.map((item) => {
              const isToday =
                item.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
=======
        {/* CALENDAR + SIDEBAR */}

        <div className="flex gap-8">
          {/* CALENDAR GRID */}

          <div className="grid grid-cols-7 gap-y-10 flex-1">
            {calendarGrid.map((item) => {
              const isToday =
                item.day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

              const isActive = item.day === selectedDay;
>>>>>>> Stashed changes

              return (
                <DayCell
                  key={item.key}
                  day={item.day}
                  isToday={isToday || item.day === selectedDay}
                  events={item.events}
                  onClick={() => setSelectedDay(item.day)}
                />
              );
            })}
          </div>

<<<<<<< Updated upstream
          {/* Entry Sidebar */}
          <div className="w-[300px] bg-black/40 border border-white/10 rounded-2xl p-5">
            <div className="text-xs text-gray-400 mb-1">Soulcanvas</div>
            <div className="text-lg font-semibold mb-3">
              {selectedDay ? `${months[month]} ${selectedDay}` : 'Pick a day'}
            </div>
            <div className="text-xs text-gray-500 mb-4">
              {selectedEntries.length} {selectedEntries.length === 1 ? 'entry' : 'entries'}
            </div>

            <ul className="space-y-2 text-sm text-gray-300 mb-6 max-h-[280px] overflow-y-auto pr-1">
              {selectedEntries.length === 0 && (
                <li className="rounded-xl border border-white/10 p-3 text-xs text-gray-500">
                  No entries on this day yet.
                </li>
              )}
              {selectedEntries.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/new-entry?id=${entry.id}`)}
                    className="w-full text-left rounded-xl border border-white/10 px-3 py-2 hover:border-[#e67e65]/40 hover:bg-[#e67e65]/10 transition-colors"
                  >
                    <div className="line-clamp-2">{entry.title}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-wide text-gray-500">
                      Open entry
                    </div>
                  </button>
=======
          {/* EVENT SIDEBAR */}

          <div className="w-[260px] bg-black/40 border border-white/10 rounded-2xl p-5">
            <div className="text-xs text-gray-400 mb-1">Woodland Event</div>

            <div className="text-lg font-semibold mb-3">{mockEventDetails.title}</div>

            <div className="text-xs text-gray-500 mb-4">{mockEventDetails.date}</div>

            <ul className="space-y-1 text-sm text-gray-300 mb-6">
              {mockEventDetails.tasks.map((task) => (
                <li key={task} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#e67e65] rounded-full" />
                  {task}
>>>>>>> Stashed changes
                </li>
              ))}
            </ul>

            <div className="border border-white/10 rounded-xl p-3 text-center">
<<<<<<< Updated upstream
              <div className="text-[10px] text-gray-500 mb-1">Google Calendar</div>
              <a
                href={googleCalendarConnectUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-[#e67e65] hover:bg-white/10 transition-colors"
              >
                Connect Calendar
              </a>
            </div>
          </div>
        </div>
=======
              <div className="text-[10px] text-gray-500 mb-1">Calculate event finish time</div>

              <div className="text-[#e67e65] font-semibold">{mockEventDetails.time}</div>
            </div>
          </div>
        </div>

        {/* SEARCH BUTTON */}

        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
          <button className="bg-[#1a1a1a] border border-white/10 px-8 py-3 rounded-full text-xs text-gray-500 font-bold flex items-center gap-3 hover:border-[#e67e65]/50 hover:text-gray-300 transition-all shadow-2xl group uppercase tracking-widest">
            <Search size={14} />

            <span className="opacity-60 group-hover:opacity-100 transition-opacity">
              Ctrl + K to search
            </span>
          </button>
        </div>
>>>>>>> Stashed changes
      </CalendarCard>
    </div>
  );
}
