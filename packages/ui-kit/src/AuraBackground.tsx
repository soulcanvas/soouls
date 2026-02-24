'use client';

import { motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

interface AuraBackgroundProps {
  sentiment?: 'joy' | 'melancholy' | 'focus' | 'anxiety' | 'neutral';
  className?: string;
}

const colorMap = {
  joy: 'bg-aura-joy/30',
  melancholy: 'bg-aura-melancholy/30',
  focus: 'bg-aura-focus/30',
  anxiety: 'bg-aura-anxiety/30',
  neutral: 'bg-slate-500/10',
};

// Deterministic seed-based positions to avoid hydration mismatch
const blobConfigs = [
  {
    color: 'joy' as const,
    delay: 0,
    duration: 20,
    positions: { ix: 25, iy: 15, scale: 1.2, ax: [70, 30, 55], ay: [60, 20, 80] },
  },
  {
    color: 'melancholy' as const,
    delay: 5,
    duration: 25,
    positions: { ix: 65, iy: 75, scale: 1.0, ax: [20, 80, 45], ay: [40, 70, 25] },
  },
  {
    color: 'focus' as const,
    delay: 2,
    duration: 18,
    positions: { ix: 40, iy: 50, scale: 1.5, ax: [85, 15, 60], ay: [30, 85, 50] },
  },
  {
    color: 'anxiety' as const,
    delay: 8,
    duration: 22,
    positions: { ix: 80, iy: 30, scale: 0.9, ax: [40, 65, 20], ay: [75, 15, 55] },
  },
];

export const AuraBackground: React.FC<AuraBackgroundProps> = ({
  sentiment = 'neutral',
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`fixed inset-0 -z-10 overflow-hidden bg-base-cream dark:bg-base-charcoal transition-colors duration-1000 ${className}`}
    >
      <div className="absolute inset-0 filter blur-[120px] opacity-50">
        {mounted &&
          blobConfigs.map((blob) => (
            <motion.div
              key={blob.color}
              className={`absolute rounded-full pointer-events-none ${colorMap[blob.color]}`}
              initial={{
                x: `${blob.positions.ix}%`,
                y: `${blob.positions.iy}%`,
                scale: blob.positions.scale,
              }}
              animate={{
                x: blob.positions.ax.map((v) => `${v}%`),
                y: blob.positions.ay.map((v) => `${v}%`),
              }}
              transition={{
                duration: blob.duration,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
                delay: blob.delay,
              }}
              style={{
                width: '60vw',
                height: '60vw',
              }}
            />
          ))}

        {/* Sentiment Highlight Blob */}
        {sentiment !== 'neutral' && (
          <motion.div
            className={`absolute inset-0 ${colorMap[sentiment]} opacity-40`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.4 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            style={{
              filter: 'blur(100px)',
            }}
          />
        )}
      </div>

      {/* Paper Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply dark:mix-blend-overlay"
        style={{ backgroundImage: `url('/textures/paper-grain.png')` }}
      />
    </div>
  );
};
