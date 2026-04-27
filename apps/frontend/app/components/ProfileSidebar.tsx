'use client';

import { useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LogOut,
  Settings,
  Sparkles,
  UserCircle,
  X,
} from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { SymbolLogo } from './SymbolLogo';
import { DiamondIcon, NetworkIcon, CanvasLoopIcon } from './Icons';

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoutClick: () => void;
}

function avatarFor(seed?: string | null) {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed || 'Soouls')}&backgroundColor=1c1c1c,e07a5f&radius=50`;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  isOpen,
  onClose,
  onLogoutClick,
}) => {
  const { user } = useUser();
  const userName = user?.firstName || user?.fullName?.split(' ')[0] || 'Explorer';
  const fullName = user?.fullName || `${userName} Lane`;
  const avatarUrl = user?.imageUrl || avatarFor(user?.primaryEmailAddress?.emailAddress || user?.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 h-full w-[min(92vw,415px)] border-l border-[#222] bg-[rgba(15,15,15,0.92)] p-8 shadow-2xl backdrop-blur-[30px] sm:p-12 flex flex-col rounded-l-[24px] overflow-hidden"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all z-[60]"
              aria-label="Close sidebar"
            >
              <X className="w-7 h-7 stroke-[1.5]" />
            </button>

            {/* Profile Header */}
            <div className="mb-10 pt-2 flex flex-col items-start relative z-10">
              <div className="flex gap-4 items-center mb-2">
                <div className="w-24 h-24 rounded-full bg-[#1A1A1A] overflow-hidden shrink-0 border-2 border-white/10">
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-[22px] text-white/90 font-playfair italic leading-tight">
                    Hello there,
                  </p>
                </div>
              </div>
              <h2 className="text-[32px] font-bold text-[#D46B4E] tracking-tight leading-none mb-4">
                {fullName}
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
                  onClick={onClose}
                >
                  {item.icon}
                  <span className="text-lg font-light tracking-wide">{item.label}</span>
                </Link>
              ))}

              {/* Logout */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogoutClick();
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
  );
};
