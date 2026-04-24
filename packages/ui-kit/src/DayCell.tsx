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

    const cellClass = isSelected
      ? 'bg-[#e67e65] text-neutral-900 font-medium'
      : isToday
        ? 'bg-white/10 text-white'
        : 'text-gray-300 hover:bg-white/5';

    return (
      <div className={`relative flex flex-col justify-center items-center group h-20 ${className}`}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={onClick}
          className={`
            w-14 h-16 flex flex-col items-center justify-center text-lg cursor-pointer
            transition-all duration-200 rounded-xl relative
            ${cellClass}
          `}
        >
          {day}

          {events.length > 0 && (
            <div className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-[#1c1c1c] text-[9px] font-bold text-white border border-[#333] shadow-lg">
              {events.length}
            </div>
          )}
        </motion.div>
      </div>
    );
  },
);

DayCell.displayName = 'DayCell';
