import { PenSquare } from 'lucide-react';
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

export function DailyTimeGrid({
  date,
  entries,
  gcalEvents,
  onOpenEntry,
  onNewEntry,
}: {
  date: Date;
  entries: CalendarEntry[];
  gcalEvents: GCalEvent[];
  onOpenEntry: (id: string) => void;
  onNewEntry: () => void;
}) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const isToday = date.toDateString() === new Date().toDateString();

  // Scroll to current hour on mount
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      const currentHour = new Date().getHours();
      const scrollTo = Math.max(0, currentHour * 80 - 200);
      scrollContainerRef.current.scrollTop = scrollTo;
    }
  }, [date]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div>
          <div className="text-xs font-semibold tracking-widest text-[#e67e65] uppercase mb-1">
            {date.toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
          <h3 className="text-2xl font-bold text-white">
            {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </h3>
        </div>
        <button
          onClick={onNewEntry}
          className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-all border border-white/5 shadow-lg backdrop-blur-md"
        >
          <PenSquare size={16} />
          New entry
        </button>
      </div>

      {/* Grid Body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative min-h-[400px] border border-white/5 rounded-2xl bg-black/20 backdrop-blur-sm"
      >
        <div className="flex" style={{ height: '1920px' }}>
          {/* Time Labels */}
          <div className="w-20 shrink-0 flex flex-col border-r border-white/5 bg-black/10">
            {HOURS.map((hour) => (
              <div key={hour} className="shrink-0 relative pr-4" style={{ height: '80px' }}>
                <span className="absolute -top-[8px] right-4 text-[11px] text-gray-500 font-medium leading-none">
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

          {/* Grid Area */}
          <div className="flex-1 relative">
            {/* Horizontal lines */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute w-full border-t border-white/5"
                style={{ top: `${hour * 80}px`, height: '80px' }}
              />
            ))}

            {/* Events Container */}
            <div className="absolute inset-0">
              {/* GCal Events */}
              {gcalEvents.map((ev) => {
                const isAllDay = !ev.start.includes('T');
                const startDate = new Date(ev.start);
                const endDate = new Date(ev.end);
                const startHour = isAllDay ? 0 : startDate.getHours() + startDate.getMinutes() / 60;
                const durationHours = isAllDay
                  ? 0.75
                  : Math.max(0.5, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));

                const top = startHour * 80;
                const height = durationHours * 80;
                const color = GCAL_COLORS[ev.colorId ?? ''] ?? GCAL_DEFAULT_COLOR;

                return (
                  <div
                    key={ev.id}
                    className="absolute left-4 right-4 rounded-xl px-4 py-3 overflow-hidden text-sm text-white/90 border border-white/10 shadow-lg"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      backgroundColor: `${color}25`,
                      borderLeft: `4px solid ${color}`,
                      zIndex: 10,
                    }}
                  >
                    <div className="font-semibold">{ev.summary}</div>
                    <div className="text-xs opacity-70 mt-1 flex items-center gap-2">
                      {isAllDay ? (
                        <span>All Day</span>
                      ) : (
                        <>
                          <span>
                            {startDate.toLocaleTimeString([], {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>-</span>
                          <span>
                            {endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Soouls Entries */}
              {entries.map((entry) => {
                const startHour = entry.createdAt.getHours() + entry.createdAt.getMinutes() / 60;
                const top = startHour * 80;
                const height = 60; // Slightly taller for daily view default

                return (
                  <button
                    key={entry.id}
                    onClick={() => onOpenEntry(entry.id)}
                    className="absolute left-4 right-4 rounded-xl px-4 py-3 overflow-hidden text-left bg-[#1a1a1a] border border-[#333] hover:border-[#e67e65] hover:bg-[#222] transition-all z-20 shadow-xl"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                    }}
                  >
                    <div className="font-semibold text-gray-200">{entry.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {entry.createdAt.toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
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
                  <div className="absolute -left-20 w-20 flex justify-center pr-2">
                    <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                      NOW
                    </div>
                  </div>
                  <div className="w-full border-t-2 border-red-500/70 border-dashed" />
                  <div className="absolute -left-1 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
