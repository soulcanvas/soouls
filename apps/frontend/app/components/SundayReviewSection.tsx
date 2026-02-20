'use client';

import { Button } from '@soulcanvas/ui-kit';
import { LazyMotion, domAnimation, m, useMotionValue, useTransform } from 'framer-motion';
import { Calendar, ChevronRight, Star, Sun } from 'lucide-react';
import type React from 'react';
import { useRef } from 'react';

export const SundayReviewSection = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useTransform(mouseY, [0, 1], [6, -6]);
  const rotateY = useTransform(mouseX, [0, 1], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const mockInsights = [
    { color: 'bg-aura-joy', text: 'Joy peaked on Wednesday after your morning walk.' },
    { color: 'bg-aura-focus', text: 'Most focused during evening writing sessions.' },
    { color: 'bg-aura-melancholy', text: 'Lighter overall mood compared to last week.' },
  ];

  return (
    <section id="review" className="relative py-32 md:py-44 bg-base-void overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-aura-joy/3 blur-[200px] top-10 right-0" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-indigo-500/3 blur-[150px] bottom-20 left-10" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/10 animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + ((i * 37) % 60)}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${8 + i * 2}s`,
            }}
          />
        ))}
      </div>

      <LazyMotion features={domAnimation}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* 3D Tilt Card — Left */}
          <m.div
            initial={{ opacity: 0, x: -40, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div
              ref={cardRef}
              className="perspective-[1000px]"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <m.div
                className="relative rounded-3xl glass-strong p-8 md:p-10 border border-white/5"
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: 'preserve-3d',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {/* Animated gradient border */}
                <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-aura-joy/20 via-aura-focus/20 to-indigo-500/20 opacity-50 blur-sm -z-10 animate-border-flow" />

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-aura-joy/10 flex items-center justify-center">
                      <Sun size={14} className="text-aura-joy" />
                    </div>
                    <div>
                      <div className="font-editorial text-lg text-white/80">Sunday Review</div>
                      <div className="font-clarity text-[10px] text-white/25 tracking-wider">
                        Feb 16, 2025
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        className={i < 4 ? 'text-aura-joy fill-aura-joy' : 'text-white/10'}
                      />
                    ))}
                  </div>
                </div>

                {/* Weekly Sentiment Bar */}
                <div className="mb-8">
                  <div className="font-clarity text-[10px] tracking-[0.2em] uppercase text-white/20 mb-3">
                    Weekly Mood Map
                  </div>
                  <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
                    {[
                      { color: 'bg-aura-joy/50', width: 'w-[35%]' },
                      { color: 'bg-aura-focus/50', width: 'w-[28%]' },
                      { color: 'bg-aura-melancholy/50', width: 'w-[22%]' },
                      { color: 'bg-aura-anxiety/50', width: 'w-[15%]' },
                    ].map((bar, idx) => (
                      <m.div
                        key={idx}
                        className={`${bar.color} ${bar.width} rounded-md`}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.5 + idx * 0.1 }}
                        style={{ transformOrigin: 'left' }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="font-clarity text-[9px] text-white/15">Mon</span>
                    <span className="font-clarity text-[9px] text-white/15">Sun</span>
                  </div>
                </div>

                {/* Insights */}
                <div className="space-y-3">
                  {mockInsights.map((insight, idx) => (
                    <m.div
                      key={insight.text}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 + idx * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-500"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${insight.color} mt-1.5 flex-shrink-0`}
                      />
                      <span className="font-clarity text-xs text-white/40 leading-relaxed">
                        {insight.text}
                      </span>
                    </m.div>
                  ))}
                </div>
              </m.div>
            </div>
          </m.div>

          {/* Text — Right */}
          <m.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8 order-1 lg:order-2"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] font-clarity text-[10px] tracking-[0.25em] uppercase text-white/30">
              <Calendar size={11} className="text-aura-joy/60" />
              Weekly Ritual
            </span>

            <h2 className="font-editorial text-5xl md:text-6xl lg:text-7xl text-white leading-[0.9]">
              The <span className="italic text-gradient">Sunday</span>
              <br />
              Review
            </h2>

            <p className="font-clarity text-sm md:text-base text-white/30 leading-relaxed max-w-md">
              A curated weekly reflection, assembled by AI. It synthesizes your week's emotions,
              highlights meaningful patterns, and gently nudges you toward self-awareness — every
              Sunday, automatically.
            </p>

            <div className="flex items-center gap-3 pt-4">
              <Button
                size="lg"
                className="group px-8 py-6 rounded-full bg-white/[0.05] border border-white/10 text-white/60 hover:bg-white/[0.08] hover:text-white/80 hover:border-white/15 transition-all duration-500 font-clarity text-sm font-medium tracking-wide"
              >
                <span className="flex items-center gap-2">
                  See a Sample Review
                  <ChevronRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform duration-300"
                  />
                </span>
              </Button>
            </div>
          </m.div>
        </div>
      </LazyMotion>
    </section>
  );
};
