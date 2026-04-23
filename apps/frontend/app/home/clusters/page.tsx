'use client';
import { useUser } from '@clerk/nextjs';
import { GraduationCap, Lightbulb, Search, Settings, Sparkles, Sun } from 'lucide-react';
import React, { useState } from 'react';

/**
 * NOTE: @clerk/nextjs is removed for the preview environment.
 * In your local project, you can keep your clerk imports and useUser hook.
 */

export default function ClustersPage() {
  // Mocking user data since Clerk is unavailable in this sandbox
  const { user } = useUser();

  const clusters = [
    {
      title: 'Morning Rituals',
      entries: 12,
      time: '2 days ago',
      description:
        'The correlation between tea preparation and sensory grounding is strengthening.',
      type: 'EMERGING',
      icon: <Sun className="w-4 h-4 text-[#FF5C35]" />,
    },
    {
      title: 'Project Alpha',
      entries: 8,
      time: '1 day ago',
      description: 'Technical debt in the legacy module is becoming a bottleneck for scaling.',
      type: 'EMERGING',
      icon: <Settings className="w-4 h-4 text-[#FF5C35]" />,
    },
    {
      title: 'Creative Sparks',
      entries: 15,
      time: '3 days ago',
      description: 'Inspiration from brutalist architecture is influencing the new UI patterns.',
      type: 'EMERGING',
      icon: <Lightbulb className="w-4 h-4 text-[#FF5C35]" />,
    },
    {
      title: 'Social Dynamics',
      entries: 10,
      time: '5 hours ago',
      description: 'Observations on non-verbal cues during high-stakes negotiations.',
      type: 'EMERGING',
      icon: <Settings className="w-4 h-4 text-[#FF5C35]" />,
    },
    {
      title: 'Health & Vitality',
      entries: 24,
      time: '1 week ago',
      description: 'The impact of circadian rhythm alignment on cognitive peak performance.',
      type: 'EMERGING',
      icon: <Lightbulb className="w-4 h-4 text-[#FF5C35]" />,
    },
    {
      title: 'Evening Reflection',
      entries: 6,
      time: '12 hours ago',
      description: 'The correlation between evening light exposure and sleep onset latency.',
      type: 'EMERGING',
      icon: <Sun className="w-4 h-4 text-[#FF5C35]" />,
    },
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
          Soouls
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
          <span className="text-[#FF5C35]">Clusters</span>
        </div>

        <div className="w-9 h-9 rounded-full border border-white/10 bg-zinc-800 overflow-hidden ring-2 ring-white/5">
          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt="Profile"
              className="w-9 h-9 rounded-full border border-white/10"
            />
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 relative z-10 flex flex-col pt-4 pb-20">
        {/* Page Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif italic text-[#FF9E80] leading-tight">
              Your thought clusters
            </h1>
            <p className="text-white/40 mt-2 text-lg">
              these are the spaces your thoughts naturally gather
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col items-end gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#FF5C35] transition-colors" />
              <input
                type="text"
                placeholder="search clusters"
                className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-6 text-sm w-full md:w-80 focus:outline-none focus:border-[#FF5C35]/50 transition-all placeholder:text-white/20"
              />
            </div>
            <div className="flex gap-2">
              {['Most Active', 'Recently Updated', 'Emotion Intensity'].map((filter) => (
                <button
                  key={filter}
                  className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border transition-all ${filter === 'Most Active' ? 'bg-[#FF5C35]/20 border-[#FF5C35] text-[#FF5C35]' : 'border-white/10 text-white/40 hover:border-white/30'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insight banner */}
        <div className="flex items-center gap-3 text-white/40 text-sm mb-10 justify-center">
          <Sparkles className="w-4 h-4 text-[#FF5C35]" />
          <span>You've been thinking most about direction and growth lately.</span>
        </div>

        {/* Main Content Card */}
        <div className="bg-[#141414]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Featured Active Hub Card */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <span className="bg-[#FF5C35]/10 text-[#FF5C35] text-[10px] font-bold tracking-widest py-1 px-3 rounded-full border border-[#FF5C35]/20">
                  ACTIVE HUB
                </span>
              </div>

              <div className="flex items-start gap-4 mb-4">
                <GraduationCap className="w-6 h-6 text-[#FF5C35] mt-1" />
                <h2 className="text-3xl font-serif italic text-white/90">The Midnight Ecos</h2>
              </div>

              <p className="text-white/50 text-sm leading-relaxed mb-10 max-w-md">
                Insights suggest a persistent focus on professional identity and future-pacing. Your
                tone is shifting from uncertainty towards structured planning.
              </p>

              <div className="flex gap-12">
                <div>
                  <span className="text-[10px] uppercase tracking-tighter text-white/30 block mb-1">
                    Emotion Tone
                  </span>
                  <div className="flex gap-2 text-xs text-white/70">
                    <span>Cautious</span>
                    <span className="text-white/20">•</span>
                    <span>Focused</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-tighter text-white/30 block mb-1">
                    Strength
                  </span>
                  <span className="text-xs text-[#FF5C35] font-medium">Dominant</span>
                </div>
              </div>
            </div>

            {/* Circle Stats */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Outer Glow Circle */}
                <div className="absolute inset-0 rounded-full bg-[#FF5C35]/5 blur-2xl" />
                {/* Main Circle */}
                <div className="absolute inset-0 rounded-full border border-[#FF5C35]/20 bg-gradient-to-b from-[#FF5C35]/10 to-transparent" />
                {/* Inner Content */}
                <div className="text-center">
                  <div className="text-5xl font-serif italic text-white/90">24</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#FF5C35] mt-1">
                    Entries
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid of smaller clusters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 pt-12 border-t border-white/5">
            {clusters.map((cluster, idx) => (
              <div
                key={idx}
                className="group bg-white/[0.02] border border-white/5 hover:border-[#FF5C35]/30 p-6 rounded-2xl transition-all duration-500 cursor-pointer hover:translate-y-[-4px]"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[#FF5C35]/10 transition-colors">
                    {cluster.icon}
                  </div>
                  <span className="text-[9px] font-bold tracking-widest text-white/30 group-hover:text-[#FF5C35]/60 transition-colors">
                    {cluster.type}
                  </span>
                </div>

                <h3 className="text-xl font-serif italic mb-2 text-white/80 group-hover:text-[#FF9E80] transition-colors">
                  {cluster.title}
                </h3>
                <div className="flex gap-3 text-[10px] text-white/30 mb-4 font-medium uppercase tracking-tighter">
                  <span>{cluster.entries} entries</span>
                  <span>•</span>
                  <span>{cluster.time}</span>
                </div>

                <p className="text-xs text-white/40 leading-relaxed line-clamp-3">
                  {cluster.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Decorative Blur Gradients */}
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#FF5C35]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-[#FF5C35]/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}
