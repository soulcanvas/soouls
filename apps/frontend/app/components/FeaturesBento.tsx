'use client';

import { m } from 'framer-motion';
import { BookOpen, Camera, Edit3, Link as LinkIcon } from 'lucide-react';
import type React from 'react';
import { useRef, useState } from 'react';

// Reusable animated bento card
interface BentoCardProps {
  className?: string;
  children?: React.ReactNode;
  icon: any;
  title: string;
  desc: string;
  tag: string;
  delay?: number;
  bgColor?: string;
}

function BentoCard({ className, children, icon: Icon, title, desc, tag, delay = 0, bgColor = "bg-white/5" }: BentoCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-[2rem] border border-white/5 p-8 flex flex-col group cursor-pointer ${className} ${bgColor}`}
    >
      {/* Spotlight effect on hover */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />

      {/* Subdued Icon bg watermark */}
      <div className="absolute -bottom-8 -right-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 group-hover:scale-110">
        <Icon size={160} strokeWidth={1} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="w-10 h-10 rounded-full bg-base-void border border-white/10 flex items-center justify-center mb-16 shadow-inner">
          <Icon size={18} className="text-white/80" />
        </div>

        <div className="mt-auto">
          <h3 className="font-editorial text-2xl text-white/90 mb-3 tracking-wide">{title}</h3>
          <p className="font-clarity text-sm text-white/50 leading-relaxed mb-6 font-light">
            {desc}
          </p>
          <span className="font-clarity text-[10px] tracking-widest uppercase text-white/30 group-hover:text-white/60 transition-colors duration-300">
            {tag}
          </span>
        </div>
      </div>
    </m.div>
  );
}

export function FeaturesBento() {
  return (
    <section id="features" className="py-32 bg-base-void relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-editorial text-5xl md:text-6xl tracking-tight leading-[1.1] mb-6 text-white"
          >
            Beyond <span className="italic text-white/80">Standard Text</span>
          </m.h2>
          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-clarity text-white/40 text-sm max-w-lg mx-auto font-light"
          >
            Break the blank page syndrome. Capture moments as they happen with powerful tools
            designed for modern memory keeping.
          </m.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[380px]">
          <BentoCard
            className="md:col-span-2 lg:col-span-2"
            bgColor="bg-[#1A1C1A]"
            icon={Camera}
            title="The Digital Scrapbook"
            desc="Embed photos, voice nodes, and artifacts seamlessly. Your memories aren't just words—they're feelings."
            tag="Visual Memory"
            delay={0}
          />
          <BentoCard
            className="md:col-span-1 lg:col-span-1"
            bgColor="bg-[#121415]"
            icon={BookOpen}
            title="Verbal Bookmarks"
            desc="Speak your mind when hands are tied. Auto-transcribed memory captures on the go."
            tag="Voice to Text"
            delay={0.1}
          />
          <BentoCard
            className="md:col-span-1 lg:col-span-1"
            bgColor="bg-[#1A1617]"
            icon={LinkIcon}
            title="Time Capsule"
            desc="Seal thoughts for your future self. Unlock them on specific dates or milestones."
            tag="Future Self"
            delay={0.2}
          />
          <BentoCard
            className="md:col-span-1 lg:col-span-2"
            bgColor="bg-white/[0.03]"
            icon={Edit3}
            title="Habit & Routine Tracker"
            desc="Layer habit tracking under your reflections. Understand how your actions shape your daily mood and thoughts."
            tag="Analytics"
            delay={0.3}
          />
        </div>
      </div>
    </section>
  );
}
