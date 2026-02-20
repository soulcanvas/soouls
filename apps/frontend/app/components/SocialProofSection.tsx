'use client';

import { LazyMotion, domAnimation, m, useInView } from 'framer-motion';
import { Award, Globe2, PenLine, Users } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

/* ── Animated Counter ── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2200;
    const steps = 80;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const stats = [
  {
    label: 'Reflections Written',
    value: 12500,
    suffix: '+',
    Icon: PenLine,
    color: 'text-aura-joy',
  },
  { label: 'Active Journalers', value: 580, suffix: '+', Icon: Users, color: 'text-aura-focus' },
  { label: 'Entries Archived', value: 48000, suffix: '+', Icon: Award, color: 'text-amber-400' },
  { label: 'Countries Reached', value: 32, suffix: '', Icon: Globe2, color: 'text-indigo-400' },
];

const testimonials = [
  { text: '"SoulCanvas helped me rediscover the joy of daily reflection."', author: 'Priya K.' },
  { text: '"The most beautiful journaling experience I\'ve ever used."', author: 'Daniel R.' },
  { text: '"An app that treats my thoughts with the respect they deserve."', author: 'Sofia M.' },
  { text: '"The Sunday Review feature changed my entire week."', author: 'James L.' },
  { text: '"I feel more connected to myself since I started using it."', author: 'Anika S.' },
  { text: '"The vault feature gives me the confidence to be truly honest."', author: 'Marcus W.' },
];

export function SocialProofSection() {
  return (
    <section className="relative py-28 md:py-36 bg-base-void overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute inset-0 bg-gradient-radial from-indigo-500/3 via-transparent to-transparent" />
      </div>

      <LazyMotion features={domAnimation}>
        {/* Stats Grid */}
        <div className="max-w-5xl mx-auto px-6 mb-24">
          <m.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center font-clarity text-[11px] tracking-[0.3em] uppercase text-white/25 mb-12"
          >
            Trusted by mindful individuals worldwide
          </m.p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <m.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative glass rounded-2xl p-6 md:p-8 text-center transition-all duration-500 hover:bg-white/[0.04] cursor-default"
              >
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <stat.Icon size={18} className={`${stat.color} opacity-60`} />
                </div>

                <div className="font-editorial text-3xl md:text-4xl lg:text-5xl text-white mb-3">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="font-clarity text-[10px] md:text-[11px] tracking-[0.15em] uppercase text-white/30">
                  {stat.label}
                </p>
              </m.div>
            ))}
          </div>
        </div>

        {/* Testimonial Marquee — Double Row */}
        <div className="space-y-4">
          {[0, 1].map((row) => (
            <div key={row} className="relative">
              {/* Edge fades */}
              <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-base-void to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-base-void to-transparent z-10 pointer-events-none" />

              <div className="overflow-hidden">
                <div
                  className={`flex ${row === 0 ? 'animate-marquee' : 'animate-marquee-reverse'} whitespace-nowrap`}
                >
                  {[...testimonials, ...testimonials].map((quote, i) => (
                    <div
                      key={`${row}-${i}`}
                      className="inline-flex items-center mx-3 px-6 py-4 rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-500"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-aura-focus/30 to-indigo-500/30 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-editorial text-sm italic text-white/50 whitespace-nowrap">
                            {quote.text}
                          </span>
                          <span className="font-clarity text-[10px] text-white/20 mt-1">
                            — {quote.author}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </LazyMotion>
    </section>
  );
}
