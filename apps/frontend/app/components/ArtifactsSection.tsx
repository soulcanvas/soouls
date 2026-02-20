'use client';

import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Camera, FileAudio, FileText, Map, Palette, Percent, Star, TrendingUp } from 'lucide-react';
import React from 'react';

const artifacts = [
  {
    title: 'The Digital Scrapbook',
    desc: 'Infinite pages for photos, sketches, and mementos from your daily life.',
    Icon: Camera,
    span: 'md:col-span-2',
    color: 'from-aura-joy/10 to-amber-500/5',
    iconColor: 'text-aura-joy',
    borderColor: 'hover:border-aura-joy/15',
  },
  {
    title: 'Voice & Melody Bookmarks',
    desc: 'Capture spoken reflections and save musical moments.',
    Icon: FileAudio,
    span: 'md:col-span-1',
    color: 'from-indigo-500/10 to-purple-500/5',
    iconColor: 'text-indigo-400',
    borderColor: 'hover:border-indigo-400/15',
  },
  {
    title: 'Personalized Time Capsule',
    desc: 'Seal entries for your future self to discover and reflect upon.',
    Icon: Map,
    span: 'md:col-span-1',
    color: 'from-aura-focus/10 to-cyan-500/5',
    iconColor: 'text-aura-focus',
    borderColor: 'hover:border-aura-focus/15',
  },
  {
    title: 'Mood & Emotion Tracker',
    desc: 'Visualize emotional patterns with AI-powered sentiment analysis.',
    Icon: TrendingUp,
    span: 'md:col-span-2',
    color: 'from-rose-500/10 to-orange-500/5',
    iconColor: 'text-rose-400',
    borderColor: 'hover:border-rose-400/15',
  },
];

export const ArtifactsSection = () => {
  return (
    <section id="artifacts" className="relative py-32 md:py-44 bg-base-void overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-amber-500/3 blur-[180px] -top-40 right-20" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-indigo-500/3 blur-[150px] bottom-20 -left-20" />
      </div>

      <LazyMotion features={domAnimation}>
        {/* Header */}
        <div className="max-w-4xl mx-auto px-6 text-center mb-20">
          <m.div
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] font-clarity text-[10px] tracking-[0.25em] uppercase text-white/30">
              <Star size={11} className="text-amber-400/60" />
              Rich Media Support
            </span>
            <h2 className="font-editorial text-5xl md:text-7xl lg:text-8xl text-white leading-[0.9]">
              Beyond <span className="italic text-gradient">Standard Text</span>
            </h2>
            <p className="font-clarity text-white/30 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
              More than a journal — a complete artifact system for capturing every dimension of your
              life.
            </p>
          </m.div>
        </div>

        {/* Bento Grid */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {artifacts.map((item, i) => (
              <m.div
                key={item.title}
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`${item.span} group`}
              >
                <div
                  className={`relative h-full rounded-2xl glass p-8 md:p-10 transition-all duration-500 border border-transparent ${item.borderColor} cursor-default overflow-hidden`}
                >
                  {/* Background gradient on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl`}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-6">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <item.Icon
                          size={20}
                          className={`${item.iconColor} opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
                        />
                      </div>
                    </div>

                    <h3 className="font-editorial text-xl md:text-2xl text-white/80 group-hover:text-white transition-colors duration-500 mb-3">
                      {item.title}
                    </h3>
                    <p className="font-clarity text-sm text-white/30 group-hover:text-white/50 transition-colors duration-500 leading-relaxed">
                      {item.desc}
                    </p>

                    {/* Learn More */}
                    <div className="mt-6">
                      <span className="inline-flex items-center gap-1 font-clarity text-[11px] tracking-[0.15em] uppercase text-white/20 group-hover:text-white/40 transition-colors duration-500">
                        Learn More
                        <svg
                          className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </LazyMotion>
    </section>
  );
};
