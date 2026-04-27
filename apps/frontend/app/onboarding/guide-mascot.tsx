'use client';

import { motion } from 'framer-motion';
import { MoonStar, Sparkles, Star } from 'lucide-react';
import Image from 'next/image';

type ThemeColor = 'orange' | 'yellow' | 'green' | 'purple';

type GuideMascotProps = {
  theme: ThemeColor;
  step: number;
  awake: boolean;
  isWaitlistUser: boolean;
  name?: string;
  firstEntry?: string;
  onWake?: () => void;
};

const themeTokens: Record<
  ThemeColor,
  {
    accent: string;
    border: string;
    bubble: string;
    glow: string;
    shadow: string;
  }
> = {
  orange: {
    accent: '#E07A5F',
    border: 'rgba(224, 122, 95, 0.36)',
    bubble: 'rgba(44, 24, 18, 0.88)',
    glow: 'rgba(224, 122, 95, 0.34)',
    shadow: 'rgba(224, 122, 95, 0.24)',
  },
  yellow: {
    accent: '#D9A23D',
    border: 'rgba(217, 162, 61, 0.34)',
    bubble: 'rgba(44, 33, 13, 0.86)',
    glow: 'rgba(217, 162, 61, 0.28)',
    shadow: 'rgba(217, 162, 61, 0.2)',
  },
  green: {
    accent: '#73B27C',
    border: 'rgba(115, 178, 124, 0.34)',
    bubble: 'rgba(19, 41, 29, 0.84)',
    glow: 'rgba(115, 178, 124, 0.28)',
    shadow: 'rgba(115, 178, 124, 0.2)',
  },
  purple: {
    accent: '#8C72D8',
    border: 'rgba(140, 114, 216, 0.34)',
    bubble: 'rgba(28, 21, 44, 0.88)',
    glow: 'rgba(140, 114, 216, 0.3)',
    shadow: 'rgba(140, 114, 216, 0.2)',
  },
};

function getMascotMood({
  step,
  awake,
  isWaitlistUser,
  name,
  firstEntry,
}: Omit<GuideMascotProps, 'theme' | 'onWake'>) {
  if (step <= 2) {
    return {
      label: awake ? 'Listening' : 'Drowsy',
      line: 'Give me the first true signal. I can tune the room from there.',
      icon: awake ? Sparkles : MoonStar,
    };
  }

  if (step === 3) {
    return {
      label: 'Coloring',
      line: 'That atmosphere will tint everything we build next.',
      icon: Sparkles,
    };
  }

  if (step === 4) {
    return {
      label: 'Observing',
      line: 'Rhythm matters. I want to meet your thoughts when they are most honest.',
      icon: Sparkles,
    };
  }

  if (step === 5) {
    return {
      label: 'Tuning',
      line: 'I can stay quiet, stay soft, or press harder. You decide the voice.',
      icon: Sparkles,
    };
  }

  if (step === 6) {
    return {
      label: 'Holding',
      line: 'One sentence is enough. We only need the direction of the flame.',
      icon: Sparkles,
    };
  }

  if (step === 7) {
    return {
      label: 'Guarding',
      line: 'Anything you leave here becomes part of the room, not the performance.',
      icon: Sparkles,
    };
  }

  if (step === 8 && !awake) {
    return {
      label: 'Sleeping',
      line: 'Tap the signal when you want me fully here.',
      icon: MoonStar,
    };
  }

  if (step === 8) {
    return {
      label: 'Warm',
      line: name
        ? `${name} fits. Keep going and I will hold the edges steady.`
        : 'There you are. Let me learn your name first.',
      icon: Sparkles,
    };
  }

  if (step === 9) {
    return {
      label: 'Naming',
      line: 'A room remembers the name you give it. Pick one with some gravity.',
      icon: Sparkles,
    };
  }

  if (step === 10) {
    return {
      label: firstEntry ? 'Ready' : 'Waiting',
      line: firstEntry
        ? 'That is enough to light the first ember. Launch when it feels true.'
        : 'One honest sentence can start the whole archive.',
      icon: Sparkles,
    };
  }

  if (step === 11) {
    return {
      label: 'Grateful',
      line: isWaitlistUser
        ? 'You were here before the room had walls. I remember that.'
        : 'You made it through the threshold. The rest can grow slowly.',
      icon: Star,
    };
  }

  return {
    label: 'Opening',
    line: 'Hold still. Your first room is coming online.',
    icon: Sparkles,
  };
}

export function GuideMascot({
  theme,
  step,
  awake,
  isWaitlistUser,
  name,
  firstEntry,
  onWake,
}: GuideMascotProps) {
  const tone = themeTokens[theme];
  const mood = getMascotMood({ step, awake, isWaitlistUser, name, firstEntry });
  const MoodIcon = mood.icon;
  const wakeable = step === 8 && !awake ? onWake : undefined;

  return (
    <motion.div
      animate={{
        x: awake ? [0, -4, 5, 0] : [0, 2, 0],
        y: awake ? [0, -8, 4, 0] : [0, -2, 0],
        rotate: awake ? [0, -1.5, 1.5, 0] : [0, 0.6, 0],
      }}
      transition={{
        duration: awake ? 8.5 : 10.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'easeInOut',
      }}
      className="pointer-events-none fixed bottom-4 right-4 z-40 flex items-end gap-3 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8"
    >
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden max-w-[17rem] rounded-[26px] border p-4 backdrop-blur-2xl sm:block"
        style={{
          borderColor: tone.border,
          backgroundColor: tone.bubble,
          boxShadow: `0 24px 60px ${tone.shadow}`,
        }}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.28em]"
            style={{ borderColor: tone.border, color: tone.accent }}
          >
            <MoodIcon className="h-3 w-3" />
            {mood.label}
          </div>
          {isWaitlistUser && step >= 8 ? (
            <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.24em] text-white/55">
              <Star className="h-3 w-3" style={{ color: tone.accent }} />
              Early
            </div>
          ) : null}
        </div>
        <p className="text-sm leading-relaxed text-white/82">{mood.line}</p>
      </motion.div>

      <motion.button
        type="button"
        onClick={wakeable}
        initial={{ opacity: 0, y: 24, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
        whileHover={wakeable ? { scale: 1.04 } : undefined}
        whileTap={wakeable ? { scale: 0.98 } : undefined}
        className="pointer-events-auto relative flex h-28 w-28 items-center justify-center rounded-full border sm:h-32 sm:w-32"
        style={{
          borderColor: tone.border,
          background:
            'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.2) 0%, rgba(18,18,22,0.88) 54%, rgba(8,8,11,0.96) 100%)',
          boxShadow: `0 18px 60px ${tone.shadow}`,
          cursor: wakeable ? 'pointer' : 'default',
        }}
        aria-label={wakeable ? 'Wake Orbi' : 'Orbi guide'}
      >
        <motion.div
          className="absolute inset-[-12%] rounded-full blur-3xl"
          animate={{
            opacity: awake ? [0.45, 0.85, 0.45] : [0.22, 0.44, 0.22],
            scale: awake ? [1, 1.06, 1] : [0.96, 1.02, 0.96],
          }}
          transition={{ duration: awake ? 3.6 : 5.8, repeat: Number.POSITIVE_INFINITY }}
          style={{
            background: `radial-gradient(circle, ${tone.glow} 0%, rgba(0,0,0,0) 72%)`,
          }}
        />

        <motion.div
          className="absolute inset-[-8%] rounded-full border border-white/12"
          animate={{ rotate: [0, 360] }}
          transition={{
            duration: awake ? 18 : 28,
            ease: 'linear',
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <span
            className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: tone.accent, boxShadow: `0 0 16px ${tone.accent}` }}
          />
        </motion.div>

        <motion.div
          className="absolute inset-[10%] rounded-full border border-white/10"
          animate={{
            rotate: awake ? [0, -8, 6, 0] : [0, 2, -2, 0],
            scale: awake ? [1, 1.02, 1] : [0.98, 1, 0.98],
          }}
          transition={{ duration: awake ? 4.8 : 6.8, repeat: Number.POSITIVE_INFINITY }}
        />

        <motion.div
          animate={{
            y: awake ? [0, -8, 0, 4, 0] : [0, 2, 0],
            rotate: awake ? [0, -2, 2, 0] : [0, -1, 1, 0],
            filter: awake
              ? ['brightness(0.98)', 'brightness(1.08)', 'brightness(0.98)']
              : ['brightness(0.8)', 'brightness(0.9)', 'brightness(0.8)'],
          }}
          transition={{ duration: awake ? 5.2 : 7.2, repeat: Number.POSITIVE_INFINITY }}
          className="relative h-[82%] w-[82%]"
        >
          <Image
            src="/orbi-mascot.png"
            alt="Orbi"
            fill
            sizes="128px"
            className={`object-contain ${awake ? '' : 'grayscale opacity-80'}`}
            priority
          />
        </motion.div>

        {awake ? (
          <motion.div
            className="absolute inset-[22%] rounded-full"
            animate={{
              boxShadow: [
                `0 0 0 0 ${tone.glow}`,
                '0 0 0 7px rgba(0,0,0,0)',
                `0 0 0 0 ${tone.glow}`,
              ],
            }}
            transition={{ duration: 3.8, repeat: Number.POSITIVE_INFINITY }}
          />
        ) : null}

        {!awake ? (
          <motion.div
            animate={{ opacity: [0.14, 0.28, 0.14] }}
            transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY }}
            className="absolute bottom-3 text-[10px] uppercase tracking-[0.32em] text-white/45"
          >
            sleep
          </motion.div>
        ) : null}
      </motion.button>
    </motion.div>
  );
}
