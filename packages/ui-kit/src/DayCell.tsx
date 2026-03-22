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
  events?: CalendarEvent[];
  onClick?: () => void;
  className?: string;
}

/**
 * Atomic Calendar Day Cell
 */
export const DayCell = React.memo(
  ({ day, isToday, events = [], onClick, className = '' }: DayCellProps) => {
    if (!day) return <div className="h-20" />;

    return (
      <div className={`relative flex flex-col justify-center items-center group h-20 ${className}`}>
        <motion.div
          whileHover={{ scale: 1.1 }}
          onClick={onClick}
          className={`
            w-14 h-16 flex flex-col items-center justify-center text-2xl font-light cursor-pointer
            transition-all duration-300 rounded-2xl relative
            ${
              isToday
                ? 'bg-[#e67e65] text-white shadow-2xl shadow-[#e67e65]/40'
                : 'text-gray-300 hover:bg-white/5'
            }
          `}
        >
          {day}

          {events.length > 0 && (
            <div className="absolute bottom-2 flex gap-1">
              {events.map((event) => (
                <span
                  key={event.id}
                  className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-[#e67e65]'}`}
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
