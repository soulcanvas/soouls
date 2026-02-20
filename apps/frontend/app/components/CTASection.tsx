'use client';

import { Button } from '@soulcanvas/ui-kit';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export function CTASection() {
  return (
    <section className="relative py-40 md:py-52 overflow-hidden bg-base-void">
      {/* Background gradient */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-indigo-600/8 blur-[200px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-breathe" />
        <div
          className="absolute w-[400px] h-[400px] rounded-full bg-aura-joy/5 blur-[160px] top-1/4 left-1/3 animate-breathe"
          style={{ animationDelay: '3s' }}
        />
        <div
          className="absolute w-[350px] h-[350px] rounded-full bg-aura-focus/4 blur-[140px] bottom-1/4 right-1/3 animate-breathe"
          style={{ animationDelay: '5s' }}
        />
      </div>

      {/* Grid overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <LazyMotion features={domAnimation}>
        <m.div
          initial={{ opacity: 0, y: 40, filter: 'blur(15px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-3xl mx-auto px-6 text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-10">
            <Sparkles size={12} className="text-aura-joy" />
            <span className="font-clarity text-[10px] tracking-[0.2em] uppercase text-white/50">
              Start Your Journey Today
            </span>
          </div>

          <h2 className="font-editorial text-5xl md:text-7xl lg:text-8xl text-white leading-[0.9] mb-8">
            Ready to Write Your <span className="italic text-gradient">Story?</span>
          </h2>

          <p className="font-clarity text-sm md:text-base text-white/30 max-w-lg mx-auto leading-relaxed mb-14">
            Join thousands of mindful individuals who are documenting, reflecting, and understanding
            their lives — one entry at a time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="group px-12 py-7 text-base rounded-full bg-white text-base-void hover:bg-white/90 shadow-2xl shadow-white/10 transition-all duration-300 hover:scale-105 hover:shadow-white/20 active:scale-95 font-clarity font-semibold tracking-wide"
              >
                <span className="flex items-center gap-2">
                  Begin Your Story
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </span>
              </Button>
            </Link>
            <span className="font-clarity text-[10px] tracking-[0.15em] uppercase text-white/20">
              Free forever • No credit card
            </span>
          </div>
        </m.div>
      </LazyMotion>
    </section>
  );
}
