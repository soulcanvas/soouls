'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CircleOff,
  LayoutGrid,
  LogOut,
  Moon,
  Network,
  Search,
  Settings,
  Sparkles,
  User,
  UserCircle,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SymbolLogo } from '../components/SymbolLogo';

// Custom Leaf Icon
const LeafIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

// Custom Diamond Outline Icon for Dashboard
const DiamondIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="12 2 16 6 12 10 8 6 12 2" />
    <polygon points="12 14 16 18 12 22 8 18 12 14" />
    <polygon points="2 12 6 16 10 12 6 8 2 12" />
    <polygon points="14 12 18 16 22 12 18 8 14 12" />
  </svg>
);

// Custom Loop Icon for Canvas
const CanvasLoopIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 12C9.5 8 5 8 5 12C5 16 9.5 16 12 12Z" />
    <path d="M12 12C14.5 8 19 8 19 12C19 16 14.5 16 12 12Z" />
    <path d="M12 12C8 9.5 8 5 12 5C16 5 16 9.5 12 12Z" />
    <path d="M12 12C8 14.5 8 19 12 19C16 19 16 14.5 12 12Z" />
  </svg>
);

// Custom Compass Icon
const CompassIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

// Custom Network Icon
const NetworkIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="3" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
    <path d="M14.5 10.5l1.5-1.5" />
    <path d="M9.5 13.5l-1.5 1.5" />
  </svg>
);

export default function HomePage() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userName = user?.firstName || user?.fullName?.split(' ')[0] || 'Explorer';

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white font-urbanist relative overflow-x-hidden selection:bg-[#D46B4E]/30 flex flex-col">
      {/* ── Full Screen Background Logo ── */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        <Image
          src="/images/tree-bg.png"
          alt=""
          fill
          style={{
            objectFit: 'cover', // ← covers the full screen like your screenshot
            objectPosition: 'center',
            opacity: 0.5, // ← adjust this to match the darkness you want
          }}
          priority={false}
        />
      </div>

      {/* ─── Top Navigation ─── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 transition-all duration-300 w-full ${
          scrolled
            ? 'py-4 bg-[#1E1E1E]/80 backdrop-blur-md shadow-lg border-b border-white/5'
            : 'py-6 bg-transparent'
        }`}
      >
        <Link href="/home" className="relative flex items-center h-8 w-24">
          <AnimatePresence mode="wait">
            {!scrolled ? (
              <motion.span
                key="text"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute text-xl font-bold tracking-tight text-white"
              >
                Soouls
              </motion.span>
            ) : (
              <motion.div
                key="logo"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute text-white"
              >
                <SymbolLogo className="w-8 h-8 text-[#BDBBAF]" variant="solid" />
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/home/canvas"
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#111111] border border-white/10 text-sm text-white/80 hover:bg-white/5 hover:border-white/20 transition-all shadow-md"
          >
            <CanvasLoopIcon className="w-[18px] h-[18px]" />
            <span className="font-medium tracking-wide">Canvas</span>
          </Link>

          {/* Profile avatar */}
          <button
            onClick={() => setShowSidebar(true)}
            className="w-10 h-10 rounded-full bg-[#1A1A1A] border-2 border-white/10 flex items-center justify-center overflow-hidden hover:border-white/30 transition-all cursor-pointer shadow-md"
          >
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="" className="w-full h-full object-cover rounded-full" />
            ) : (
              <User className="w-5 h-5 text-white/60" />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* ─── Hero Quote ─── */}
        <section className="relative z-10 px-4 md:px-6 lg:px-8 pt-32 pb-64 md:pb-80 w-full max-w-[1600px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="w-full"
          >
            <h1 className="text-[2.5rem] md:text-[3.5rem] leading-[1.1] font-light text-white tracking-tight">
              You do not need clarity to start. <br className="hidden md:block" />
              Clarity comes after you{' '}
              <Link
                href="/home/new-entry"
                className="font-playfair italic text-[#D46B4E] hover:text-[#e58064] transition-colors relative inline-flex items-center gap-1.5"
              >
                <span className="relative">
                  make entry
                  <span className="absolute left-0 right-0 -bottom-1 h-[1px] bg-[#D46B4E]/50" />
                </span>
                <CompassIcon className="w-6 h-6 text-[#D46B4E] relative" />
              </Link>
            </h1>
          </motion.div>
        </section>

        {/* ─── Main Content Area ─── */}
        <section className="relative z-10 px-4 md:px-6 lg:px-8 pb-16 mt-20 md:mt-32 flex justify-center w-full max-w-[1600px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full bg-[#181818] rounded-[2rem] p-4 md:p-8 relative"
          >
            {/* Top Right Date */}
            <div className="absolute top-8 right-10 flex items-center gap-2 text-[11px] font-medium text-white/50 tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              1st January-31st January
            </div>

            {/* 1. Main Insight Block */}
            <div className="bg-[#0F0F0F] rounded-2xl p-8 mb-6 mt-8">
              <LeafIcon className="w-5 h-5 text-[#86A861] mb-6" />
              <p className="text-2xl md:text-3xl text-white/90 leading-[1.3] font-light tracking-tight">
                &quot;This month, your mind gravitated toward{' '}
                <span className="font-playfair italic text-[#D46B4E]">
                  turning ideas into action
                </span>
                . There&apos;s{' '}
                <span className="font-playfair italic text-[#D46B4E]">a clear transition</span> from
                scattered inspiration to focused execution.&quot;
              </p>
              <p className="mt-6 text-sm text-white/40 leading-relaxed font-light">
                Your activity reflects a <span className="font-medium text-white/70">35%</span>{' '}
                increase in goal-oriented thinking compared to previous weeks. The recurring theme
                of &quot;Exploration&quot; has matured into &quot;Clarity,&quot; indicating
                you&apos;re beginning to define your direction with confidence.
              </p>
            </div>

            {/* 2. Grid Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Thought Themes */}
              <div className="bg-[#0F0F0F] rounded-2xl p-8 flex flex-col justify-between min-h-[220px]">
                <h3 className="text-[15px] text-white/90 mb-8 font-medium">Thought Themes</h3>
                <div className="space-y-5">
                  {[
                    { label: 'CAREER DIRECTION', count: '6 ENTRIES', pct: 85 },
                    { label: 'SIDE PROJECTS', count: '0 ENTRIES', pct: 60 },
                    { label: 'SELF DEVELOPMENT', count: '10 ENTRIES', pct: 45 },
                    { label: 'CREATIVE EXPLORATION', count: '7 ENTRIES', pct: 75 },
                  ].map((t) => (
                    <div key={t.label}>
                      <div className="flex justify-between text-[10px] mb-2 font-medium tracking-wider text-white/50">
                        <span>{t.label}</span>
                        <span>{t.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-black/50 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#D46B4E] to-[#3A2016]"
                          style={{ width: `${t.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reflection Patterns */}
              <div className="bg-[#0F0F0F] rounded-2xl p-8 flex flex-col justify-between min-h-[220px]">
                <h3 className="text-[15px] text-white/90 mb-5 font-medium">Reflection Patterns</h3>
                <div className="flex gap-4 mb-4">
                  <Moon className="w-4 h-4 text-[#D46B4E] shrink-0 mt-0.5" />
                  <p className="text-sm text-white/60 leading-relaxed font-light">
                    You tend to reflect most during late evenings{' '}
                    <span className="text-white/90 font-medium">(10 PM – 12 AM)</span>, when your
                    thoughts are more structured yet introspective.
                  </p>
                </div>
                <p className="text-[11px] text-white/30 font-playfair italic leading-relaxed px-8 mb-6">
                  &quot;There&apos;s a noticeable depth in your night entries, they are often more
                  emotional and solution-oriented. Mid-week reflections show higher consistency
                  compared to weekends.&quot;
                </p>

                {/* Histogram */}
                <div className="flex items-end justify-center gap-[2px] h-12 mt-auto">
                  {[15, 25, 40, 60, 85, 100, 75, 45, 20].map((h, i) => (
                    <div
                      key={i}
                      className="w-6 rounded-t-sm"
                      style={{
                        height: `${h}%`,
                        backgroundColor: h > 70 ? '#D46B4E' : h > 40 ? '#B05941' : '#5E3427',
                        opacity: h > 70 ? 1 : 0.7,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* How your Thoughts connect */}
              <div className="bg-[#0F0F0F] rounded-2xl p-8 flex flex-col justify-between min-h-[220px]">
                <h3 className="text-[15px] text-white/90 mb-1 font-medium">
                  How your Thoughts connect
                </h3>
                <p className="text-[10px] text-white/40 tracking-wider mb-6">RELATIONSHIP MAP</p>

                {/* Constellation Map */}
                <div className="relative h-32 w-full bg-[#161616]/50 rounded-xl overflow-hidden flex items-center justify-center">
                  {/* Lines */}
                  <svg className="absolute inset-0 w-full h-full opacity-30" pointerEvents="none">
                    <line x1="20%" y1="30%" x2="40%" y2="70%" stroke="#D46B4E" strokeWidth="1" />
                    <line x1="40%" y1="70%" x2="60%" y2="80%" stroke="#D46B4E" strokeWidth="1" />
                    <line x1="60%" y1="80%" x2="80%" y2="40%" stroke="#D46B4E" strokeWidth="1" />
                    <line
                      x1="40%"
                      y1="70%"
                      x2="80%"
                      y2="40%"
                      stroke="#D46B4E"
                      strokeWidth="1"
                      opacity="0.5"
                    />
                  </svg>

                  {/* Dots & Labels */}
                  <div className="absolute left-[20%] top-[30%] w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#D46B4E]">
                    <span className="absolute -top-4 -left-4 text-[8px] text-white/50 tracking-widest">
                      GROWTH
                    </span>
                  </div>
                  <div className="absolute left-[40%] top-[70%] w-3 h-3 rounded-full bg-[#D46B4E] shadow-[0_0_15px_#D46B4E]" />
                  <div className="absolute left-[60%] top-[80%] w-4 h-4 rounded-full bg-[#D46B4E] shadow-[0_0_20px_#D46B4E]">
                    <span className="absolute top-5 -left-2 text-[8px] text-white/50 tracking-widest">
                      CAREER
                    </span>
                  </div>
                  <div className="absolute left-[80%] top-[40%] w-2 h-2 rounded-full bg-[#D46B4E]/50 shadow-[0_0_10px_#D46B4E]">
                    <span className="absolute -top-4 -left-2 text-[8px] text-white/50 tracking-widest">
                      ANXIETY
                    </span>
                  </div>
                  {/* Random faint dot */}
                  <div className="absolute left-[35%] top-[85%] w-1.5 h-1.5 rounded-full bg-[#D46B4E]/30" />
                </div>
              </div>

              {/* Your thinking is shifting */}
              <div className="bg-[#0F0F0F] rounded-2xl p-8 flex flex-col justify-between min-h-[220px]">
                <h3 className="text-[15px] text-white/90 mb-1 font-medium">
                  Your thinking is shifting
                </h3>
                <p className="text-[10px] text-white/40 tracking-wider mb-6">EVOLUTION CYCLE</p>

                <div className="space-y-4">
                  {[
                    {
                      label: 'CAREER ANXIETY',
                      icon: <ArrowDownRight className="w-4 h-4 text-white/40" />,
                    },
                    {
                      label: 'GROWTH MINDSET',
                      icon: <ArrowUpRight className="w-4 h-4 text-[#D46B4E]" />,
                    },
                    {
                      label: 'DISCIPLINE',
                      icon: (
                        <span className="text-[8px] tracking-widest border border-[#D46B4E]/30 text-[#D46B4E] px-2 py-0.5 rounded-full bg-[#D46B4E]/10">
                          EMERGING
                        </span>
                      ),
                    },
                    { label: 'SOCIAL FEAR', icon: <CircleOff className="w-4 h-4 text-white/30" /> },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-[11px] text-white/70 tracking-wide font-medium">
                        {item.label}
                      </span>
                      {item.icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Final Synthesis */}
            <div className="bg-[#0F0F0F] rounded-2xl p-10 text-center">
              <div className="flex justify-center mb-6">
                <LeafIcon className="w-6 h-6 text-[#86A861]" />
              </div>
              <p className="text-[11px] text-[#D46B4E] tracking-widest mb-4">FINAL SYNTEHESIS</p>
              <p className="text-2xl md:text-3xl text-white font-playfair italic mb-4">
                &quot;You are in a period of significant cognitive transition&quot;
              </p>
              <p className="text-sm text-white/40 max-w-2xl mx-auto leading-relaxed font-light">
                The data suggests your mental architecture is shifting towards long term legacy
                rather than short term gains. This synthesis marks the end of yur
                &quot;Exploration&quot; phase.
              </p>
            </div>
          </motion.div>
        </section>

        {/* ─── Floating Bottom Navigation ─── */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[1600px] px-6 md:px-12 z-50 pointer-events-none flex justify-between items-center">
          {/* Search Button */}
          <button
            onClick={() => router.push('/home')}
            className="pointer-events-auto flex items-center gap-3 text-[15px] text-white/40 hover:text-white transition-colors bg-[#111111] px-6 py-3.5 rounded-full shadow-2xl"
          >
            <Search className="w-[18px] h-[18px]" />
            <span className="font-light tracking-wide">Search Entries</span>
          </button>

          {/* Center Logo */}
          <Link
            href="/home"
            className="pointer-events-auto flex items-center justify-center group absolute left-1/2 -translate-x-1/2"
          >
            <div className="flex items-center justify-center text-[#BDBBAF] group-hover:text-white transition-colors drop-shadow-2xl">
              <SymbolLogo className="w-14 h-14" variant="solid" />
            </div>
          </Link>

          {/* Calendar Button */}
          <button
            onClick={() => router.push('/home/calendar')}
            className="pointer-events-auto flex items-center gap-3 text-[15px] text-white hover:text-white transition-colors bg-[#111111] px-6 py-3.5 rounded-full shadow-[0_0_25px_rgba(212,107,78,0.15)] border border-[#D46B4E]/40"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M26 4H23V3C23 2.73478 22.8946 2.48043 22.7071 2.29289C22.5196 2.10536 22.2652 2 22 2C21.7348 2 21.4804 2.10536 21.2929 2.29289C21.1054 2.48043 21 2.73478 21 3V4H11V3C11 2.73478 10.8946 2.48043 10.7071 2.29289C10.5196 2.10536 10.2652 2 10 2C9.73478 2 9.48043 2.10536 9.29289 2.29289C9.10536 2.48043 9 2.73478 9 3V4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V26C4 26.5304 4.21071 27.0391 4.58579 27.4142C4.96086 27.7893 5.46957 28 6 28H26C26.5304 28 27.0391 27.7893 27.4142 27.4142C27.7893 27.0391 28 26.5304 28 26V6C28 5.46957 27.7893 4.96086 27.4142 4.58579C27.0391 4.21071 26.5304 4 26 4ZM26 26H6V6H9V7C9 7.26522 9.10536 7.51957 9.29289 7.70711C9.48043 7.89464 9.73478 8 10 8C10.2652 8 10.5196 7.89464 10.7071 7.70711C10.8946 7.51957 11 7.26522 11 7V6H21V7C21 7.26522 21.1054 7.51957 21.2929 7.70711C21.4804 7.89464 21.7348 8 22 8C22.2652 8 22.5196 7.89464 22.7071 7.70711C22.8946 7.51957 23 7.26522 23 7V6H26V26ZM19 11C18.4321 10.9997 17.8707 11.1206 17.3534 11.3547C16.836 11.5888 16.3746 11.9307 16 12.3575C15.4628 11.7483 14.7528 11.3172 13.9646 11.1213C13.1764 10.9254 12.3472 10.9742 11.5873 11.261C10.8274 11.5479 10.1729 12.0592 9.71073 12.7271C9.24856 13.395 9.00066 14.1878 9 15C9 19.565 15.285 22.76 15.5525 22.895C15.6914 22.9645 15.8446 23.0007 16 23.0007C16.1554 23.0007 16.3086 22.9645 16.4475 22.895C16.715 22.76 23 19.565 23 15C23 13.9391 22.5786 12.9217 21.8284 12.1716C21.0783 11.4214 20.0609 11 19 11ZM16 20.8662C14.2762 19.8925 11 17.5225 11 15C11 14.4696 11.2107 13.9609 11.5858 13.5858C11.9609 13.2107 12.4696 13 13 13C13.5304 13 14.0391 13.2107 14.4142 13.5858C14.7893 13.9609 15 14.4696 15 15C15 15.2652 15.1054 15.5196 15.2929 15.7071C15.4804 15.8946 15.7348 16 16 16C16.2652 16 16.5196 15.8946 16.7071 15.7071C16.8946 15.5196 17 15.2652 17 15C17 14.4696 17.2107 13.9609 17.5858 13.5858C17.9609 13.2107 18.4696 13 19 13C19.5304 13 20.0391 13.2107 20.4142 13.5858C20.7893 13.9609 21 14.4696 21 15C21 17.5238 17.7238 19.8937 16 20.8662Z"
                fill="#E6E2D6"
              />
            </svg>
            <span className="font-medium tracking-wide">Calendar</span>
          </button>
        </div>
      </main>

      {/* ─── Profile Sidebar ─── */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowSidebar(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 w-80 h-full bg-[#222222] shadow-2xl p-8 flex flex-col rounded-l-2xl overflow-hidden"
            >
              <button
                onClick={() => setShowSidebar(false)}
                className="absolute top-6 right-6 text-white hover:text-white/80 transition-colors z-10"
              >
                <X className="w-6 h-6 stroke-[1]" />
              </button>

              {/* Profile Header */}
              <div className="mb-10 pt-2 flex flex-col items-start relative z-10">
                <div className="flex gap-4 items-center mb-2">
                  <div className="w-16 h-16 rounded-full bg-[#1A1A1A] overflow-hidden shrink-0 border-2 border-white/10">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50">
                        U
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[22px] text-white/90 font-playfair italic leading-tight">
                      Hello there,
                    </p>
                  </div>
                </div>
                <h2 className="text-[32px] font-bold text-[#D46B4E] tracking-tight leading-none mb-4">
                  {userName} {user?.lastName || 'Lane'}
                </h2>
                <p className="text-xl text-white font-playfair italic leading-snug">
                  &quot;You&apos;ve shown up <span className="text-[#D46B4E]">12 days</span>
                  <br />
                  in a row.&quot;
                </p>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 space-y-2 relative z-10">
                {[
                  { label: 'Dashboard', href: '/home', icon: <DiamondIcon className="w-5 h-5" /> },
                  {
                    label: 'Insights',
                    href: '/home/insights',
                    icon: <Sparkles className="w-5 h-5 stroke-[1.5]" />,
                  },
                  {
                    label: 'Clusters',
                    href: '/home/clusters',
                    icon: <NetworkIcon className="w-5 h-5" />,
                  },
                  {
                    label: 'Canvas',
                    href: '/home/canvas',
                    icon: <CanvasLoopIcon className="w-5 h-5" />,
                  },
                  {
                    label: 'Account',
                    href: '/home/account',
                    icon: <UserCircle className="w-5 h-5 stroke-[1.5]" />,
                  },
                  {
                    label: 'Settings',
                    href: '/home/settings',
                    icon: <Settings className="w-5 h-5 stroke-[1.5]" />,
                  },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-4 px-2 py-3 text-white hover:text-white/80 transition-all"
                    onClick={() => setShowSidebar(false)}
                  >
                    {item.icon}
                    <span className="text-lg font-light tracking-wide">{item.label}</span>
                  </Link>
                ))}

                {/* Logout */}
                <button
                  onClick={() => {
                    setShowSidebar(false);
                    setShowLogoutModal(true);
                  }}
                  className="flex items-center gap-4 px-2 py-3 text-red-500 hover:text-red-400 transition-all mt-4 w-full"
                >
                  <LogOut className="w-5 h-5 stroke-[1.5]" />
                  <span className="text-lg font-light tracking-wide">Logout</span>
                </button>
              </nav>

              {/* Decorative Butterfly Logo */}
              <SymbolLogo
                className="absolute -bottom-16 -right-16 w-64 h-64 text-[#E6E1D8]/30 pointer-events-none"
                variant="solid"
              />
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
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-[#838182] rounded-[2rem] p-10 text-center shadow-2xl relative overflow-hidden"
            >
              {/* Decorative Butterfly Logo */}
              <SymbolLogo
                className="absolute -top-4 -right-4 w-32 h-32 text-[#D46B4E] rotate-12 opacity-90"
                variant="solid"
              />

              <div className="relative z-10 text-left">
                <h2 className="text-[40px] font-urbanist font-light text-white mb-2">
                  Leaving for now?
                </h2>
                <p className="text-2xl text-white/90 font-playfair italic mb-16">
                  Your thoughts are safely stored. You can
                  <br />
                  return anytime.
                </p>

                <div className="flex gap-6 justify-center mb-8">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="w-36 py-3.5 rounded-2xl bg-[#4A4A4A] border border-[#D46B4E] text-white hover:bg-[#5a5a5a] transition-all text-lg font-medium shadow-lg"
                  >
                    Stay
                  </button>
                  <button
                    onClick={() => signOut({ redirectUrl: '/' })}
                    className="w-36 py-3.5 rounded-2xl bg-[#D33F3F] border border-[#B33535] text-white hover:bg-[#E34A4A] transition-all text-lg font-medium shadow-lg"
                  >
                    Logout
                  </button>
                </div>

                <p className="text-center text-lg text-white/60 font-playfair italic">
                  See you soon.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
