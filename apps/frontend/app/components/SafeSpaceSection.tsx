'use client';

import { m } from 'framer-motion';
import { Fingerprint, LockKeyhole, ShieldCheck } from 'lucide-react';
import React from 'react';

export function SafeSpaceSection() {
  return (
    <section
      id="safe-space"
      className="relative py-32 bg-base-void overflow-hidden border-t border-white/5"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-aura-focus/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Text Content */}
          <m.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8">
              <ShieldCheck size={14} className="text-aura-focus" />
              <span className="font-clarity text-[10px] tracking-widest uppercase text-white/60">
                End-to-end Encryption
              </span>
            </div>

            <h2 className="font-editorial text-5xl md:text-6xl tracking-tight leading-[1.1] mb-6 text-white">
              A Safe Space to <br />
              <span className="italic text-white/80 pr-4">Be Yourself</span>
            </h2>

            <p className="font-clarity text-white/50 leading-relaxed mb-10 text-lg font-light">
              Your deeply personal thoughts are just that—yours. We use military-grade encryption so
              not even our team can read your entries.
            </p>

            <ul className="space-y-4 font-clarity text-sm text-white/70">
              {[
                { icon: ShieldCheck, text: 'Zero-knowledge architecture' },
                { icon: LockKeyhole, text: 'Private clouds per user' },
                { icon: Fingerprint, text: 'Biometric lock options' },
              ].map((item, i) => (
                <m.li
                  key={item.text}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <item.icon size={12} className="text-aura-focus" />
                  </div>
                  <span>{item.text}</span>
                </m.li>
              ))}
            </ul>
          </m.div>

          {/* Right Visual Card */}
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="relative mx-auto lg:mx-0 w-full max-w-md aspect-square rounded-[2rem] bg-gradient-to-b from-white/[0.08] to-transparent p-[1px]"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-[2rem] opacity-0 transition-opacity duration-700 hover:opacity-100" />
            <div className="w-full h-full rounded-[2rem] bg-base-charcoal/80 backdrop-blur-xl flex flex-col items-center justify-center p-8 relative overflow-hidden group">
              {/* Inner ambient light changing on hover */}
              <div className="absolute inset-0 bg-aura-focus/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[80px]" />

              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-full border border-white/10 bg-white/5 flex items-center justify-center relative shadow-[0_0_30px_rgba(153,246,228,0.1)] group-hover:shadow-[0_0_50px_rgba(153,246,228,0.2)] transition-all duration-500">
                  {/* Ripple rings */}
                  <div
                    className="absolute inset-0 rounded-full border border-aura-focus/20 scale-110 opacity-0 group-hover:animate-ping mix-blend-screen"
                    style={{ animationDuration: '3s' }}
                  />
                  <div
                    className="absolute inset-0 rounded-full border border-aura-focus/30 scale-125 opacity-0 group-hover:animate-ping mix-blend-screen"
                    style={{ animationDuration: '3s', animationDelay: '0.5s' }}
                  />

                  <Fingerprint
                    size={40}
                    className="text-aura-focus/80 group-hover:text-aura-focus transition-colors duration-300"
                    strokeWidth={1.5}
                  />
                </div>

                <div className="text-center">
                  <p className="font-clarity text-xs tracking-[0.2em] uppercase text-white/30 mb-2">
                    Security Status
                  </p>
                  <p className="font-editorial text-xl text-white/80 italic">Protected</p>
                </div>
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
