import { motion } from 'framer-motion';
import React from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  start?: Date;
  end?: Date;
  color?: string;
}

interface DayCellProps {
  day: number | null;
  isToday: boolean;
  /** Whether this cell is the user-selected day (distinct from isToday) */
  isSelected?: boolean;
  events?: CalendarEvent[];
  onClick?: () => void;
  className?: string;
}

/**
 * Atomic Calendar Day Cell
 *
 * Visual priority: isToday > isSelected > default
 */
export const DayCell = React.memo(
  ({ day, isToday, isSelected = false, events = [], onClick, className = '' }: DayCellProps) => {
    if (!day) return <div className="h-20" />;

    const cellClass = isToday
      ? 'bg-[#e67e65] text-white shadow-2xl shadow-[#e67e65]/40'
      : isSelected
        ? 'ring-2 ring-[#e67e65] ring-offset-2 ring-offset-[#121212] text-white bg-white/5'
        : 'text-gray-300 hover:bg-white/5';

    return (
      <div className={`relative flex flex-col justify-center items-center group h-20 ${className}`}>
        <motion.div
          whileHover={{ scale: 1.1 }}
          onClick={onClick}
          className={`
            w-14 h-16 flex flex-col items-center justify-center text-2xl font-light cursor-pointer
            transition-all duration-300 rounded-2xl relative
            ${cellClass}
          `}
        >
          {day}

          {events.length > 0 && (
            <div className="absolute bottom-2 flex gap-1">
              {events.map((event) => (
                <span
                  key={event.id}
                  className={`w-1 h-1 rounded-full ${
                    event.color
                      ? ''
                      : isToday
                        ? 'bg-white'
                        : 'bg-[#e67e65]'
                  }`}
                  style={event.color ? { backgroundColor: event.color } : undefined}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    );
  },
);

DayCell.displayName = 'DayCell';
