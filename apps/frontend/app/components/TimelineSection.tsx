'use client';

import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import React from 'react';

const mockEntries = [
  {
    date: 'Autumn 2025',
    content:
      "The first leaf fell today, and for once, I didn't feel the rush to document it immediately. I just sat there.",
    sentiment: 'joy' as const,
    time: '7:42 AM',
  },
  {
    date: 'August 14, 2025',
    content:
      "Meeting with the team. Feels like we're building something that actually matters. A bit overwhelmed, but the good kind.",
    sentiment: 'focus' as const,
    time: '2:15 PM',
  },
  {
    date: 'July 02, 2025',
    content:
      'The City is too loud today. Looking for that quiet place within. Sometimes silence is the loudest answer.',
    sentiment: 'melancholy' as const,
    time: '11:08 PM',
  },
  {
    date: 'June 28, 2025',
    content: 'Why does everything feel like a race? I just want to pause. Breathe. Exist.',
    sentiment: 'anxiety' as const,
    time: '4:30 AM',
  },
];

const sentimentConfig = {
  joy: {
    dot: 'bg-aura-joy',
    glow: 'shadow-aura-joy/30',
    line: 'from-aura-joy/20',
    badge: 'bg-aura-joy/10 text-aura-joy border-aura-joy/20',
    label: 'Joy',
  },
  focus: {
    dot: 'bg-aura-focus',
    glow: 'shadow-aura-focus/30',
    line: 'from-aura-focus/20',
    badge: 'bg-aura-focus/10 text-aura-focus border-aura-focus/20',
    label: 'Focus',
  },
  melancholy: {
    dot: 'bg-aura-melancholy',
    glow: 'shadow-aura-melancholy/30',
    line: 'from-aura-melancholy/20',
    badge: 'bg-aura-melancholy/10 text-aura-melancholy border-aura-melancholy/20',
    label: 'Melancholy',
  },
  anxiety: {
    dot: 'bg-aura-anxiety',
    glow: 'shadow-aura-anxiety/30',
    line: 'from-aura-anxiety/20',
    badge: 'bg-aura-anxiety/10 text-aura-anxiety border-aura-anxiety/20',
    label: 'Anxiety',
  },
};

export const TimelineSection = () => {
  return (
    <section id="features" className="relative py-32 md:py-44 bg-base-void overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-indigo-600/3 blur-[200px] top-20 -left-40" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-aura-focus/3 blur-[180px] bottom-20 -right-40" />
      </div>

      <LazyMotion features={domAnimation}>
        {/* Header */}
        <div className="max-w-4xl mx-auto px-6 text-center mb-24">
          <m.div
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] font-clarity text-[10px] tracking-[0.25em] uppercase text-white/30">
              <Sparkles size={11} className="text-aura-focus/60" />
              Your Story, Your Flow
            </span>
            <h2 className="font-editorial text-5xl md:text-7xl lg:text-8xl text-white leading-[0.9]">
              The River of <span className="italic text-gradient">Time</span>
            </h2>
            <p className="font-clarity text-white/30 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
              A seamless, non-linear architecture that lets your life flow naturally. No cards. No
              boundaries. Just your story.
            </p>
          </m.div>
        </div>

        {/* Timeline */}
        <div className="relative max-w-2xl mx-auto px-6">
          {/* Central Line */}
          <m.div
            className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              transformOrigin: 'top',
              background:
                'linear-gradient(to bottom, transparent, rgba(255,255,255,0.06), transparent)',
            }}
          />

          <div className="space-y-16 md:space-y-24">
            {mockEntries.map((entry, i) => {
              const config = sentimentConfig[entry.sentiment];
              const isRight = i % 2 === 0;

              return (
                <m.div
                  key={entry.date}
                  initial={{ opacity: 0, x: isRight ? 30 : -30, filter: 'blur(10px)' }}
                  whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className={`relative pl-16 md:pl-0 md:grid md:grid-cols-2 md:gap-12 items-start ${isRight ? '' : 'md:direction-rtl'
                    }`}
                >
                  {/* Dot on timeline */}
                  <div className="absolute left-[26px] md:left-1/2 md:-translate-x-1/2 top-2 z-10">
                    <div
                      className={`w-3 h-3 rounded-full ${config.dot} shadow-lg ${config.glow}`}
                    />
                  </div>

                  {/* Card */}
                  <div
                    className={`${isRight ? 'md:col-start-2 md:text-left' : 'md:col-start-1 md:text-right'} md:direction-ltr`}
                  >
                    <div className="group glass rounded-2xl p-7 md:p-8 transition-all duration-500 hover:bg-white/[0.05] cursor-default">
                      {/* Date & Sentiment */}
                      <div
                        className={`flex items-center gap-3 mb-4 ${isRight ? '' : 'md:justify-end'}`}
                      >
                        <span className="font-clarity text-[10px] tracking-[0.2em] uppercase text-white/25">
                          {entry.date}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[9px] tracking-wider uppercase font-clarity ${config.badge}`}
                        >
                          {config.label}
                        </span>
                      </div>

                      <p className="text-base md:text-lg font-clarity leading-relaxed text-white/50 group-hover:text-white/70 transition-colors duration-500">
                        {entry.content}
                      </p>

                      <span className="block mt-4 font-mono text-[10px] text-white/15">
                        {entry.time}
                      </span>
                    </div>
                  </div>

                  {/* Whisper Prompt (on one entry) */}
                  {i === 1 && (
                    <m.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      className={`hidden md:block ${isRight ? 'md:col-start-1 md:row-start-1' : 'md:col-start-2'} self-center`}
                    >
                      <div className="glass rounded-xl p-5 border border-aura-focus/10">
                        <p className="font-editorial italic text-sm text-aura-focus/40 leading-relaxed">
                          "You seemed quieter on Tuesdays this month. What changed?"
                        </p>
                        <span className="block mt-2 font-clarity text-[9px] uppercase tracking-[0.2em] text-white/15">
                          AI Whisper
                        </span>
                      </div>
                    </m.div>
                  )}
                </m.div>
              );
            })}
          </div>
        </div>
      </LazyMotion>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-base-void to-transparent pointer-events-none" />
    </section>
  );
};
