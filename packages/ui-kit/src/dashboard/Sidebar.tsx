'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  FolderOpen,
  Home,
  LayoutGrid,
  Library,
  Settings,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: LayoutGrid, label: 'Canvas', href: '/dashboard/canvas' },
  { icon: Sparkles, label: 'Clusters', href: '/dashboard/clusters' },
  { icon: BookOpen, label: 'Insights', href: '/dashboard/insights' },
  { icon: FolderOpen, label: 'Projects', href: '/dashboard/projects' },
  { icon: Library, label: 'Library', href: '/dashboard/library' },
  { icon: Calendar, label: 'Calendar', href: '/dashboard/calendar' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-white/5 bg-base-charcoal p-6 lg:flex">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500" />
        <span className="font-editorial text-xl text-base-cream">Soouls</span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                isActive
                  ? 'bg-white/5 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.1)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-base-cream'
              }`}
            >
              <item.icon
                className={`h-5 w-5 transition-colors ${
                  isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />
              <span className="font-clarity text-sm font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 h-8 w-1 rounded-r-full bg-amber-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        {/* User profile could go here if needed, but usually handled by Clerk/Header */}
      </div>
    </aside>
  );
}
