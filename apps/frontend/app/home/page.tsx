'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  BarChart3,
  Calendar,
  ChevronRight,
  LogOut,
  Network,
  PenTool,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentMonth] = useState(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return `${start.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })} - ${end.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}`;
  });

  const userName = user?.firstName || user?.fullName?.split(' ')[0] || 'Explorer';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans relative overflow-hidden">
      {/* Background texture */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* ─── Top Navigation ─── */}
      <header className="relative z-30 flex items-center justify-between px-6 md:px-10 py-5">
        <Link href="/home" className="font-serif text-xl tracking-wide text-[#D6C2A3] italic">
          Soouls
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/home/new-entry"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Make Entry
          </Link>

          {/* Profile avatar */}
          <button
            onClick={() => setShowSidebar(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-500/30 border border-white/10 flex items-center justify-center overflow-hidden hover:border-amber-400/40 transition-all cursor-pointer"
          >
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="" className="w-full h-full object-cover rounded-full" />
            ) : (
              <User className="w-5 h-5 text-amber-300" />
            )}
          </button>
        </div>
      </header>

      {/* ─── Hero Quote ─── */}
      <section className="relative z-10 px-6 md:px-10 pt-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h1 className="font-serif text-3xl md:text-5xl leading-[1.3] text-white/90 max-w-2xl">
            You do not need clarity to start. <br className="hidden md:block" />
            Clarity comes after you{' '}
<Link
              href="/home/new-entry"
              className="italic text-amber-400 hover:text-amber-300 transition-colors underline decoration-amber-400/30 underline-offset-4 cursor-pointer"
            >
              make entry
            </Link>
            <span className="inline-block ml-1 text-amber-400">✦</span>
          </h1>
        </motion.div>
      </section>

      {/* ─── Monthly Insights Card ─── */}
      <section className="relative z-10 px-6 md:px-10 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-3xl"
        >
          {/* Date Range */}
          <div className="flex items-center justify-end gap-2 mb-4 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            {currentMonth}
          </div>

          {/* Main Insight Card */}
          <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-8 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center">
                <PenTool className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>

            <p className="font-serif text-lg md:text-xl text-white/90 leading-relaxed italic">
              &quot;This month, your mind gravitated toward{' '}
              <span className="text-amber-400 font-semibold not-italic">
                turning ideas into action
              </span>
              . There&apos;s{' '}
              <span className="text-amber-400 font-semibold not-italic">a clear transition</span>{' '}
              from scattered inspiration to focused execution.&quot;
            </p>

            <p className="mt-4 text-sm text-slate-500 leading-relaxed">
              Your activity reflects a <strong className="text-white/70">35%</strong> increase in
              goal-oriented thinking compared to previous weeks.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Thought Themes */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">
                Thought Themes
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Career Direction', count: 14, pct: 85, color: 'bg-amber-400' },
                  { label: 'Side Projects', count: 12, pct: 72, color: 'bg-orange-400' },
                  { label: 'Self Development', count: 9, pct: 55, color: 'bg-amber-300' },
                  { label: 'Creative Exploration', count: 7, pct: 42, color: 'bg-orange-300' },
                ].map((t) => (
                  <div key={t.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{t.label}</span>
                      <span className="text-slate-500">{t.count} entries</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${t.color}`}
                        style={{ width: `${t.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reflection Patterns */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4">
                Reflection Patterns
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                You tend to reflect most during{' '}
                <span className="text-amber-300 font-medium">late evenings (10 PM – 12 AM)</span>,
                when your thoughts are more structured yet introspective.
              </p>
              <div className="mt-4 flex items-end gap-1 h-16">
                {[20, 15, 25, 35, 45, 65, 80, 95, 70, 50, 40, 30].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-amber-400/60 to-amber-400/20"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Connection & Evolution cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-2">
                How your Thoughts connect
              </h3>
              <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-4">
                Relationship Map
              </p>
              <div className="h-24 flex items-center justify-center">
                <Network className="w-12 h-12 text-amber-400/30" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-2">
                Your thinking is shifting
              </h3>
              <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-4">
                Evolution Cycle
              </p>
              <div className="space-y-2">
                {[
                  { label: 'Career Anxiety', dir: 'down' },
                  { label: 'Growth Mindset', dir: 'up' },
                  { label: 'Discipline', dir: 'up' },
                  { label: 'Social Fear', dir: 'down' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{item.label}</span>
                    <TrendingUp
                      className={`w-3.5 h-3.5 ${item.dir === 'up' ? 'text-emerald-400' : 'text-rose-400 rotate-180'}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Final Synthesis */}
          <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-8">
            <div className="flex items-center gap-2 mb-4">
              <PenTool className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-400 mb-3">
              Final Synthesis
            </p>
            <p className="font-serif text-lg md:text-xl text-white/90 italic leading-relaxed">
              &quot;You are in a period of significant cognitive transition&quot;
            </p>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              The data suggests your mental architecture is shifting towards long-term legacy rather
              than short-term gains.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ─── Bottom Navigation Bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-white/[0.04]">
        <button
          onClick={() => router.push('/home')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search Entries</span>
        </button>

        <Link href="/home" className="flex items-center justify-center">
          <div className="w-10 h-10 flex items-center justify-center text-amber-400">
            <svg
              viewBox="0 0 32 32"
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M16 4L4 16l12 12 12-12L16 4z" />
              <path d="M16 10l-6 6 6 6 6-6-6-6z" />
            </svg>
          </div>
        </Link>

        <button
          onClick={() => router.push('/home/calendar')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">Calendar</span>
        </button>
      </div>

      {/* ─── Profile Sidebar ─── */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSidebar(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 w-80 h-full bg-[#111111] border-l border-white/[0.06] p-8 flex flex-col"
            >
              <button
                onClick={() => setShowSidebar(false)}
                className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Profile Header */}
              <div className="mb-8 pt-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-500/30 border border-white/10 mb-4 overflow-hidden">
                  {user?.imageUrl && (
                    <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <p className="text-xs text-slate-500 italic font-serif">Hello there,</p>
                <h2 className="text-xl font-bold text-amber-300 mt-1">{userName}</h2>
                <p className="text-xs text-slate-500 font-serif italic mt-1">
                  &quot;You&apos;ve shown up 12 days in a row.&quot;
                </p>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 space-y-1">
                {[
                  { label: 'Home', icon: BarChart3, href: '/home' },
                  { label: 'Insights', icon: Sparkles, href: '/home' },
                  { label: 'Canvas', icon: Network, href: '/home/canvas' },
                  { label: 'Canvas', icon: PenTool, href: '/home/canvas' },
                  { label: 'Account', icon: User, href: '/home/account' },
                  { label: 'Settings', icon: Settings, href: '/home/settings' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all group"
                    onClick={() => setShowSidebar(false)}
                  >
                    <item.icon className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    <span className="text-sm">{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-600" />
                  </Link>
                ))}
              </nav>

              {/* Logout */}
              <button
                onClick={() => {
                  setShowSidebar(false);
                  setShowLogoutModal(true);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-400/10 transition-all mt-4 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Logout Modal ─── */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#1A1A1A] border border-white/[0.08] rounded-3xl p-8 text-center shadow-2xl"
            >
              <h2 className="font-serif text-3xl text-white italic mb-2">Leaving for now?</h2>
              <p className="text-sm text-slate-400 font-serif italic mb-8">
                Your thoughts are safely stored. You can return anytime.
              </p>

              <div className="flex gap-4 justify-center mb-6">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all text-sm font-medium cursor-pointer"
                >
                  Stay
                </button>
                <button
                  onClick={() => signOut({ redirectUrl: '/' })}
                  className="px-8 py-3 rounded-2xl bg-rose-500 text-white hover:bg-rose-400 transition-all text-sm font-medium cursor-pointer"
                >
                  Logout
                </button>
              </div>

              <p className="text-xs text-slate-600 font-serif italic">See you soon.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom spacer for fixed nav */}
      <div className="h-24" />
    </div>
  );
}
