import { Badge } from '@soouls/ui-kit';
import React, { useMemo } from 'react';

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

const SHORT_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const GCAL_COLORS: Record<string, string> = {
  '1': '#B86B4E',
  '2': '#AE8B7E',
  '3': '#D46B4E',
  '4': '#A67C52',
  '5': '#E6B89C',
  '6': '#845C44',
  '7': '#C5906E',
  '8': '#5D5D5D',
  '9': '#E27D60',
  '10': '#4E342E',
  '11': '#BF360C',
};
const GCAL_DEFAULT_COLOR = '#D46B4E';

export function WeeklyTimeGrid({
  weekDates,
  entriesByDate,
  gcalEventsByDate,
  today,
  selectedDay,
  onSelectDay,
  onOpenEntry,
}: {
  weekDates: Date[];
  entriesByDate: Map<string, CalendarEntry[]>;
  gcalEventsByDate: Map<string, GCalEvent[]>;
  today: Date;
  selectedDay: number | null;
  onSelectDay: (d: number) => void;
  onOpenEntry: (id: string) => void;
}) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Scroll to current hour on mount
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      const currentHour = new Date().getHours();
      // Calculate scroll position (each hour row is 80px, roughly center it)
      const scrollTo = Math.max(0, currentHour * 80 - 200);
      scrollContainerRef.current.scrollTop = scrollTo;
    }
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex">
        {/* Time column offset */}
        <div className="w-16 shrink-0 border-r border-white/5" />
        {/* Days Header */}
        <div className="flex-1 grid grid-cols-7 border-b border-white/5 pb-4">
          {weekDates.map((wd) => {
            const isToday = wd.toDateString() === today.toDateString();
            const isSelected = wd.getDate() === selectedDay;
            return (
              <div key={wd.toISOString()} className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">
                  {SHORT_DAYS[wd.getDay()]}
                </span>
                <button
                  onClick={() => onSelectDay(wd.getDate())}
                  className={`w-9 h-9 rounded-full text-sm font-semibold flex items-center justify-center transition-all ${
                    isToday
                      ? 'bg-[#e67e65] text-white shadow-lg shadow-[#e67e65]/30'
                      : isSelected
                        ? 'ring-2 ring-[#e67e65] text-white'
                        : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {wd.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Body */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative min-h-[400px]">
        {/* Background Grid */}
        <div className="flex" style={{ height: '1920px' }}>
          {/* Time Labels */}
          <div className="w-16 shrink-0 flex flex-col border-r border-white/5">
            {HOURS.map((hour) => (
              <div key={hour} className="shrink-0 relative pr-3" style={{ height: '80px' }}>
                <span className="absolute -top-[7px] right-3 text-[10px] text-gray-500 font-medium leading-none">
                  {hour === 0
                    ? '12 AM'
                    : hour < 12
                      ? `${hour} AM`
                      : hour === 12
                        ? '12 PM'
                        : `${hour - 12} PM`}
                </span>
              </div>
            ))}
          </div>

          {/* Vertical Columns & Horizontal Lines */}
          <div className="flex-1 relative">
            {/* Horizontal lines */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute w-full border-t border-white/5"
                style={{ top: `${hour * 80}px`, height: '80px' }}
              />
            ))}

            {/* Columns (7 days) */}
            <div className="absolute inset-0 grid grid-cols-7">
              {weekDates.map((wd, colIndex) => {
                const isToday = wd.toDateString() === today.toDateString();
                const key = `${wd.getFullYear()}-${wd.getMonth()}-${wd.getDate()}`;
                const dayEntries = entriesByDate.get(key) ?? [];
                const gcalEvents = gcalEventsByDate.get(key) ?? [];

                return (
                  <div
                    key={colIndex}
                    className={`relative border-r border-white/5 ${isToday ? 'bg-white/[0.02]' : ''}`}
                  >
                    {/* Render Events */}
                    {gcalEvents.map((ev) => {
                      const isAllDay = !ev.start.includes('T');
                      const startDate = new Date(ev.start);
                      const endDate = new Date(ev.end);
                      const startHour = isAllDay
                        ? 0
                        : startDate.getHours() + startDate.getMinutes() / 60;
                      const durationHours = isAllDay
                        ? 0.75
                        : Math.max(
                            0.5,
                            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60),
                          );

                      const top = startHour * 80;
                      const height = durationHours * 80;
                      const color = GCAL_COLORS[ev.colorId ?? ''] ?? GCAL_DEFAULT_COLOR;

                      return (
                        <div
                          key={ev.id}
                          className="absolute left-1 right-1 rounded-md px-2 py-1.5 overflow-hidden text-[10px] text-white/90 border border-white/10"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            backgroundColor: `${color}25`,
                            borderLeft: `3px solid ${color}`,
                            zIndex: 10,
                          }}
                        >
                          <div className="font-semibold line-clamp-1">{ev.summary}</div>
                          <div className="text-[9px] opacity-70 mt-0.5">
                            {isAllDay
                              ? 'All Day'
                              : startDate.toLocaleTimeString([], {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                          </div>
                        </div>
                      );
                    })}

                    {/* Render Soouls Entries (assuming default 30 min duration for visual) */}
                    {dayEntries.map((entry, _index) => {
                      const startHour =
                        entry.createdAt.getHours() + entry.createdAt.getMinutes() / 60;
                      const top = startHour * 80;
                      const height = 40; // 30 mins

                      return (
                        <button
                          key={entry.id}
                          onClick={() => onOpenEntry(entry.id)}
                          className="absolute left-1 right-1 rounded-md px-2 py-1.5 overflow-hidden text-left text-[10px] bg-zinc-800 border border-zinc-700 hover:border-[#e67e65] hover:bg-zinc-700 transition-all z-20 shadow-lg"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                          }}
                        >
                          <div className="font-medium text-gray-200 line-clamp-1">
                            {entry.title}
                          </div>
                        </button>
                      );
                    })}

                    {/* Current time indicator line */}
                    {isToday && (
                      <div
                        className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                        style={{
                          top: `${(new Date().getHours() + new Date().getMinutes() / 60) * 80}px`,
                        }}
                      >
                        <div className="w-full border-t-2 border-red-500/50 border-dashed" />
                        <div className="absolute -left-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
