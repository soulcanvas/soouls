'use client';

import { motion } from 'framer-motion';

export interface StatsWidgetProps {
  totalEntries: number;
  weeklyActivity?: number[]; // Array of 7 numbers (percentages 0-100)
}

export function StatsWidget({ totalEntries, weeklyActivity }: StatsWidgetProps) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Default visual if no activity data provided, or use provided data
  const activity = weeklyActivity || [10, 20, 15, 30, 25, 40, 35]; // Fallback visual, but totalEntries is real

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between px-1">
        <div className="text-4xl font-light text-base-cream">
          {totalEntries} <span className="text-sm text-slate-500">Entries</span>
        </div>
        <div className="text-sm text-amber-500">
          {totalEntries > 0 ? 'Keep it up!' : 'Start writing'}
        </div>
      </div>

      <div className="flex h-32 items-end justify-between gap-2">
        {days.map((day, i) => (
          <div key={day} className="flex flex-col items-center gap-2 w-full">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${activity[i]}%` }}
              transition={{ duration: 1, delay: i * 0.1 }}
              className={`w-full max-w-[6px] rounded-full ${
                i === 6 ? 'bg-amber-400' : 'bg-white/10'
              }`}
            />
            <span className="font-clarity text-[10px] text-slate-500 uppercase">{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
