'use client';
import { useUser } from '@clerk/nextjs';
import { Calendar, Moon, Sparkles, Target, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import React from 'react';

/**
 * NOTE: @clerk/nextjs is removed for the preview environment.
 * In your local project, you can keep your clerk imports and useUser hook.
 */

export default function InsightsPage() {
  // Mocking user data since Clerk is unavailable in this sandbox
  const { user } = useUser();

  const thoughtThemes = [
    { label: 'CAREER DIRECTION', entries: 24, progress: 85 },
    { label: 'SIDE PROJECTS', entries: 15, progress: 60 },
    { label: 'SELF DEVELOPMENT', entries: 12, progress: 45 },
    { label: 'CREATIVE EXPLORATION', entries: 7, progress: 25 },
  ];

  const shiftMetrics = [
    { label: 'CAREER ANXIETY', value: -12, status: 'down' },
    { label: 'GROWTH MINDSET', value: +28, status: 'up' },
    { label: 'DISCIPLINE', value: 'STRONG', status: 'badge' },
    { label: 'SOCIAL FEAR', value: 'LOW', status: 'icon' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden font-sans select-none">
      {/* Watermark */}
      <div className="absolute top-10 left-0 right-0 flex justify-center pointer-events-none opacity-10 select-none z-0 overflow-hidden whitespace-nowrap">
        <span
          className="text-[20vw] leading-none text-transparent tracking-tighter"
          style={{
            fontFamily: 'serif',
            WebkitTextStroke: '1px rgba(255,255,255,0.35)',
          }}
        >
          Soouls in
        </span>
      </div>

      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2 text-sm text-white/60 font-medium">
          <button
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="hover:text-[#FF5C35] transition duration-300"
          >
            Home
          </button>
          <span>/</span>
          <span className="text-[#FF5C35]">Insights</span>
        </div>

        <div className="w-9 h-9 rounded-full border border-white/10 bg-zinc-800 overflow-hidden ring-2 ring-white/5">
          {user?.imageUrl && (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 relative z-10 flex flex-col pt-4 pb-20">
        {/* Main Insights Card */}
        <div className="bg-[#141414]/90 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Section Title */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <h2 className="text-2xl font-medium tracking-tight text-white/90">
              Soulcanvas Insights
            </h2>
            <div className="flex items-center gap-2 text-white/40 text-xs tracking-wider uppercase font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>1st January–31st January</span>
            </div>
          </div>

          {/* Core Monthly Narrative */}
          <div className="mb-16">
            <div className="flex gap-4 mb-6">
              <Zap className="w-6 h-6 text-[#FF5C35] shrink-0" />
              <div className="space-y-4">
                <blockquote className="text-3xl md:text-4xl font-serif italic leading-[1.3] text-white/90">
                  "This month, your mind gravitated toward{' '}
                  <span className="text-[#FF5C35]">turning ideas into action.</span> There's{' '}
                  <span className="text-[#FF9E80]">a clear transition</span> from scattered
                  inspiration to focused execution."
                </blockquote>
                <p className="text-white/40 text-sm leading-relaxed max-w-2xl font-light">
                  Your activity reflects a{' '}
                  <span className="text-white/70 font-medium">35% increase</span> in goal-oriented
                  thinking compared to previous weeks. The recurring theme of "Exploration" has
                  matured into "Clarity," indicating you're beginning to define your direction with
                  confidence.
                </p>
              </div>
            </div>
          </div>

          {/* Grid: Themes & Reflection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Thought Themes */}
            <div className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl">
              <h3 className="text-sm font-semibold tracking-wider text-white/60 mb-8 uppercase">
                Thought Themes
              </h3>
              <div className="space-y-8">
                {thoughtThemes.map((theme) => (
                  <div key={theme.label}>
                    <div className="flex justify-between text-[10px] tracking-widest font-bold mb-3">
                      <span className="text-white/40">{theme.label}</span>
                      <span className="text-[#FF5C35]">{theme.entries} ENTRIES</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF5C35] to-[#FF9E80] rounded-full"
                        style={{ width: `${theme.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reflection Patterns */}
            <div className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl">
              <h3 className="text-sm font-semibold tracking-wider text-white/60 mb-6 uppercase">
                Reflection Patterns
              </h3>
              <div className="flex gap-4 mb-10">
                <Moon className="w-5 h-5 text-[#FF9E80] shrink-0" />
                <p className="text-xs text-white/50 leading-relaxed italic">
                  You tend to reflect most during late-evenings{' '}
                  <span className="text-white/80">(10 PM – 12 AM)</span>, when your thoughts are
                  more structured yet introspective.
                </p>
              </div>

              {/* Simple Mock Histogram */}
              <div className="flex items-end justify-between h-24 gap-1 px-4">
                {[20, 35, 25, 45, 80, 100, 60, 40].map((h, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-t-sm transition-all duration-700 ${i === 5 ? 'bg-[#FF5C35]' : 'bg-white/10'}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[8px] text-white/20 mt-3 tracking-widest uppercase font-bold">
                <span>Morning</span>
                <span>Midnight</span>
              </div>
            </div>
          </div>

          {/* Grid: Connections & Shifting */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Connections Visual Placeholder */}
            <div className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl flex flex-col">
              <h3 className="text-sm font-semibold tracking-wider text-white/60 mb-2 uppercase">
                How your Thoughts connect
              </h3>
              <span className="text-[10px] text-white/20 tracking-widest mb-10 uppercase">
                RELATIONS BY SIMILARITY
              </span>
              <div className="flex-1 flex items-center justify-center relative min-h-[160px]">
                {/* Mocking the node map from screenshot */}
                <div
                  className="absolute w-2 h-2 bg-[#FF5C35] rounded-full shadow-[0_0_10px_#FF5C35]"
                  style={{ top: '20%', left: '20%' }}
                />
                <div
                  className="absolute w-3 h-3 bg-white/40 rounded-full"
                  style={{ top: '40%', left: '50%' }}
                />
                <div
                  className="absolute w-2 h-2 bg-white/20 rounded-full"
                  style={{ top: '70%', left: '30%' }}
                />
                <div
                  className="absolute w-2.5 h-2.5 bg-[#FF9E80] rounded-full shadow-[0_0_8px_#FF9E80]"
                  style={{ top: '60%', left: '80%' }}
                />
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
                  stroke="white"
                  strokeWidth="0.5"
                >
                  <line x1="20%" y1="20%" x2="50%" y2="40%" />
                  <line x1="50%" y1="40%" x2="30%" y2="70%" />
                  <line x1="50%" y1="40%" x2="80%" y2="60%" />
                </svg>
              </div>
            </div>

            {/* Shifting Metrics */}
            <div className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl">
              <h3 className="text-sm font-semibold tracking-wider text-white/60 mb-2 uppercase">
                Your thinking is shifting
              </h3>
              <span className="text-[10px] text-white/20 tracking-widest mb-10 uppercase">
                EVOLUTION STATUS
              </span>
              <div className="space-y-6">
                {shiftMetrics.map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-[10px] tracking-wider text-white/40 font-bold uppercase">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.status === 'down' && (
                        <>
                          <TrendingDown className="w-3 h-3 text-[#FF5C35]" />{' '}
                          <span className="text-xs text-white/70">{item.value}%</span>
                        </>
                      )}
                      {item.status === 'up' && (
                        <>
                          <TrendingUp className="w-3 h-3 text-emerald-500" />{' '}
                          <span className="text-xs text-white/70">+{item.value}%</span>
                        </>
                      )}
                      {item.status === 'badge' && (
                        <span className="text-[9px] bg-[#FF5C35]/20 text-[#FF5C35] px-2 py-0.5 rounded border border-[#FF5C35]/30 font-bold tracking-widest">
                          {item.value}
                        </span>
                      )}
                      {item.status === 'icon' && <Target className="w-4 h-4 text-white/30" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Final Synthesis Section */}
          <div className="pt-12 border-t border-white/5 mt-8">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
              <Sparkles className="w-6 h-6 text-[#FF5C35] mb-6" />
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#FF5C35] mb-4 uppercase">
                Final Synthesis
              </span>
              <h4 className="text-2xl md:text-3xl font-serif italic text-white/90 mb-4">
                "You are in a period of significant cognitive transition"
              </h4>
              <p className="text-white/40 text-sm leading-relaxed font-light italic">
                The data suggests your mental architecture is shifting towards long-term legacy
                rather than short-term gains. This synthesis marks the end of your "Exploration"
                phase.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FF5C35]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FF9E80]/5 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
