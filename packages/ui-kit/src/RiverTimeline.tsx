'use client';

import { motion } from 'framer-motion';
import type React from 'react';

interface RiverTimelineProps {
  entries: Array<{
    date: string;
    content: string;
    sentiment?: 'joy' | 'melancholy' | 'focus' | 'anxiety';
  }>;
}

const colorMap = {
  joy: 'text-aura-joy',
  melancholy: 'text-aura-melancholy',
  focus: 'text-aura-focus',
  anxiety: 'text-aura-anxiety',
};

export const RiverTimeline: React.FC<RiverTimelineProps> = ({ entries }) => {
  return (
    <div className="relative max-w-2xl mx-auto py-20 px-4">
      {/* The River Line (Invisible or subtle) */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 -translate-x-1/2 opacity-20" />

      <div className="space-y-32">
        {entries.map((entry, i) => (
          <motion.div
            key={`${entry.date}-${entry.content.substring(0, 10)}`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative"
          >
            {/* Seasonal Separation (Logic placeholder) */}
            {i % 3 === 0 && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-center w-full">
                <span className="font-editorial text-4xl italic opacity-10 select-none pointer-events-none">
                  The Season of Reflection
                </span>
              </div>
            )}

            <div className="flex flex-col items-center text-center space-y-4">
              <span className="font-editorial text-sm tracking-widest uppercase opacity-50">
                {entry.date}
              </span>

              <div
                className={`text-xl md:text-2xl font-clarity leading-relaxed ${entry.sentiment ? colorMap[entry.sentiment] : 'text-slate-800 dark:text-slate-200'}`}
              >
                {entry.content}
              </div>

              {/* Whisper Prompt */}
              {i === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.3 }}
                  className="font-editorial italic text-sm mt-8 cursor-default hover:opacity-100 transition-opacity duration-500"
                >
                  "You seemed quieter on Tuesdays this month. What changed?"
                </motion.div>
              )}
            </div>

            {/* Floating Orb (Visual decor) */}
            <motion.div
              className={`absolute -z-10 w-24 h-24 rounded-full blur-2xl opacity-20 ${entry.sentiment ? `bg-aura-${entry.sentiment}` : 'bg-slate-400'}`}
              animate={{
                y: [0, -20, 0],
                x: i % 2 === 0 ? [0, 10, 0] : [0, -10, 0],
              }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
              style={{
                left: i % 2 === 0 ? '70%' : '10%',
                top: '50%',
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
