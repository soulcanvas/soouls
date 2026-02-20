'use client';

import { Button } from '@soulcanvas/ui-kit';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion';
import { Eye, EyeOff, Fingerprint, Flame, Lock, ShieldCheck, Smartphone } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

export const VaultSection = () => {
  const [locked, setLocked] = useState(true);
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = useCallback(() => {
    setHolding(true);
    setProgress(0);

    // Smooth progress animation
    let p = 0;
    progressRef.current = setInterval(() => {
      p += 2;
      setProgress(Math.min(p, 100));
    }, 30);

    holdTimerRef.current = setTimeout(() => {
      setLocked(false);
      setHolding(false);
      setProgress(100);
      if (progressRef.current) clearInterval(progressRef.current);
    }, 1500);
  }, []);

  const stopHold = useCallback(() => {
    setHolding(false);
    setProgress(0);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  }, []);

  const features = [
    {
      Icon: Lock,
      label: 'AES-256 local-first encryption',
      desc: 'Your data never leaves your device unencrypted',
    },
    { Icon: Smartphone, label: 'Biometric unlock', desc: 'FaceID & TouchID integration' },
    {
      Icon: Flame,
      label: 'Burn After Reading',
      desc: 'Self-destructing entries for ultimate privacy',
    },
    {
      Icon: ShieldCheck,
      label: 'Zero-knowledge sync',
      desc: "We can't read your data, even if we wanted to",
    },
  ];

  return (
    <section id="vault" className="relative py-32 md:py-44 bg-base-void overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute w-[700px] h-[700px] rounded-full bg-rose-500/3 blur-[200px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-breathe" />
      </div>

      <LazyMotion features={domAnimation}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text Content — Left Side */}
          <m.div
            initial={{ opacity: 0, x: -40, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] font-clarity text-[10px] tracking-[0.25em] uppercase text-white/30">
                <Lock size={11} className="text-aura-anxiety/60" />
                Privacy First
              </span>

              <h2 className="font-editorial text-5xl md:text-6xl lg:text-7xl text-white leading-[0.9]">
                A Safe Space <br />
                to <span className="italic text-gradient-warm">Be Yourself</span>
              </h2>

              <p className="font-clarity text-sm md:text-base text-white/30 leading-relaxed max-w-md">
                Your data is yours. Encrypted locally, secured with biometric authentication. A
                digital vault that even we can't access.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-4">
              {features.map((feat, i) => (
                <m.div
                  key={feat.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                  className="group flex items-start gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors duration-500 cursor-default"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-aura-focus/5 group-hover:border-aura-focus/10 transition-all duration-500">
                    <feat.Icon
                      size={16}
                      className="text-white/40 group-hover:text-aura-focus transition-colors duration-500"
                    />
                  </div>
                  <div>
                    <div className="font-clarity text-sm text-white/60 group-hover:text-white/80 transition-colors duration-500">
                      {feat.label}
                    </div>
                    <div className="font-clarity text-xs text-white/20 mt-0.5">{feat.desc}</div>
                  </div>
                </m.div>
              ))}
            </div>
          </m.div>

          {/* Interactive Vault Demo — Right Side */}
          <m.div
            initial={{ opacity: 0, x: 40, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Concentric ring decorations */}
            <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
              <div className="absolute w-[110%] h-[110%] rounded-full border border-white/[0.02] animate-spin-slow" />
              <div
                className="absolute w-[125%] h-[125%] rounded-full border border-white/[0.015] animate-spin-slow"
                style={{ animationDirection: 'reverse', animationDuration: '35s' }}
              />
              <div
                className="absolute w-[140%] h-[140%] rounded-full border border-white/[0.01] animate-spin-slow"
                style={{ animationDuration: '45s' }}
              />
            </div>

            <div className="relative aspect-square max-w-sm mx-auto">
              <m.div
                className="h-full w-full rounded-3xl glass-strong flex flex-col items-center justify-center p-10"
                animate={{
                  boxShadow: locked
                    ? '0 25px 80px rgba(0, 0, 0, 0.4)'
                    : '0 25px 80px rgba(153, 246, 228, 0.12)',
                }}
                transition={{ duration: 0.8 }}
              >
                <AnimatePresence mode="wait">
                  {locked ? (
                    <m.div
                      key="locked"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="text-center space-y-8"
                    >
                      {/* Fingerprint with dynamic glow */}
                      <div className="relative inline-block">
                        <m.div
                          className="absolute -inset-8 rounded-full blur-3xl"
                          animate={{
                            scale: holding ? 1.8 : 1,
                            opacity: holding ? 0.4 : 0.1,
                            background: holding
                              ? 'radial-gradient(circle, rgba(153,246,228,0.3), transparent)'
                              : 'radial-gradient(circle, rgba(153,246,228,0.1), transparent)',
                          }}
                          transition={{ duration: 0.3 }}
                        />
                        <Fingerprint size={80} className="text-white/30 relative" />

                        {/* Progress ring */}
                        <svg
                          className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)]"
                          viewBox="0 0 100 100"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="1"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="rgba(153,246,228,0.5)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                            transform="rotate(-90 50 50)"
                            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                          />
                        </svg>
                      </div>

                      <div className="space-y-3">
                        <p className="font-clarity text-[10px] tracking-[0.3em] uppercase text-white/25">
                          Hold to Unlock
                        </p>

                        <div
                          className="cursor-pointer select-none"
                          role="button"
                          tabIndex={0}
                          aria-label="Hold to unlock the vault"
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') startHold();
                          }}
                          onKeyUp={stopHold}
                          onMouseDown={startHold}
                          onMouseUp={stopHold}
                          onMouseLeave={stopHold}
                          onTouchStart={startHold}
                          onTouchEnd={stopHold}
                        >
                          <div className="w-36 h-1.5 bg-white/5 rounded-full overflow-hidden mx-auto">
                            <div
                              className="h-full bg-gradient-to-r from-aura-focus to-aura-joy rounded-full transition-all duration-75"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </m.div>
                  ) : (
                    <m.div
                      key="unlocked"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-6 w-full"
                    >
                      <m.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                      >
                        <Eye size={40} className="text-aura-focus/60 mx-auto" />
                      </m.div>

                      <div className="font-editorial text-xl italic text-white/70">
                        Welcome to Your Space
                      </div>

                      <div className="grid grid-cols-2 gap-3 w-full">
                        {['Private Entry', 'Sealed Memory', 'Voice Note', 'Photo Log'].map(
                          (item, idx) => (
                            <m.div
                              key={item}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 + idx * 0.08, type: 'spring', damping: 20 }}
                              className="h-16 rounded-xl glass flex items-center justify-center group hover:bg-white/[0.04] transition-colors duration-500 cursor-pointer"
                            >
                              <span className="font-clarity text-[10px] tracking-wider uppercase text-white/25 group-hover:text-white/50 transition-colors duration-500">
                                {item}
                              </span>
                            </m.div>
                          ),
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setLocked(true);
                          setHolding(false);
                          setProgress(0);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 font-clarity text-xs text-white/40 hover:text-white/60 hover:border-white/20 transition-all duration-300 cursor-pointer"
                      >
                        <EyeOff size={12} />
                        Relock Vault
                      </button>
                    </m.div>
                  )}
                </AnimatePresence>
              </m.div>
            </div>
          </m.div>
        </div>
      </LazyMotion>
    </section>
  );
};
