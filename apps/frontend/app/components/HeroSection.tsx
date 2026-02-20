'use client';

import { Button } from '@soulcanvas/ui-kit';
import { LazyMotion, domAnimation, m, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React, { useRef, useState } from 'react';
import SplineScene from './SplineScene';

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [splineLoaded, setSplineLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Parallax and fade effects based on scroll
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-base-void"
    >
      {/* ── Spline 3D Scene Background ── */}
      <div className="absolute inset-0 z-0">
        {!splineLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-base-void">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-white/5 border-t-white/30 animate-spin" />
              <span className="font-clarity text-[10px] tracking-[0.25em] uppercase text-white/30">
                Loading 3D Experience...
              </span>
            </div>
          </div>
        )}
        <SplineScene
          scene="https://prod.spline.design/6Wq1Q7YGyH-H09vI/scene.splinecode"
          className="w-full h-full"
          onLoad={() => setSplineLoaded(true)}
          style={{
            opacity: splineLoaded ? 1 : 0,
            transition: 'opacity 2s ease-out',
          }}
        />

        {/* Subtle overlay to ensure text readability */}
        <div className="absolute inset-0 bg-base-void/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-base-void via-transparent to-base-void/20 pointer-events-none" />
      </div>

      {/* ── Content Overlay ── */}
      <LazyMotion features={domAnimation}>
        <m.div
          className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-20"
          style={{ opacity, y, scale }}
        >
          {/* Top Badge */}
          <m.div
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aura-joy opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-aura-joy"></span>
              </span>
              <span className="font-clarity text-[10px] tracking-[0.2em] uppercase text-white/70 font-medium">
                Your Digital Life Archive
              </span>
            </div>
          </m.div>

          {/* Main Headline */}
          <m.h1
            initial={{ opacity: 0, y: 30, filter: 'blur(15px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-editorial text-6xl md:text-8xl lg:text-[110px] tracking-tight leading-[0.9] mb-8"
          >
            <span className="block text-white">Document</span>
            <span className="block italic text-white/80 pr-12 md:pr-24 lg:pr-32">the Soul</span>
          </m.h1>

          {/* Subtitle */}
          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
            className="max-w-xl mx-auto font-clarity text-sm md:text-base text-white/50 leading-relaxed mb-12 font-light"
          >
            Transform your scattered daily reflections into a living, beautiful digital sanctuary. A
            personal chronographer built thoughtfully for the modern mind.
          </m.p>

          {/* CTAs */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/sign-up">
              <Button
                size="lg"
                className="group relative overflow-hidden px-8 py-6 rounded-full bg-white text-base-void hover:bg-white/90 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all duration-500 font-clarity font-medium text-sm tracking-wide"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative z-10 flex items-center gap-2">
                  Start your journey
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </span>
              </Button>
            </Link>

            <Link href="#features">
              <button
                type="button"
                className="font-clarity text-xs tracking-[0.15em] uppercase text-white/40 hover:text-white transition-colors duration-300 flex items-center gap-3 group"
              >
                Explore
                <ChevronDown
                  size={14}
                  className="group-hover:translate-y-1 transition-transform duration-300"
                />
              </button>
            </Link>
          </m.div>
        </m.div>

        {/* Scroll Indicator */}
        <m.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-white/0 via-white/20 to-white/0 overflow-hidden relative">
            <m.div
              className="w-full h-1/2 bg-white/40"
              animate={{ y: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            />
          </div>
        </m.div>
      </LazyMotion>
    </section>
  );
}
