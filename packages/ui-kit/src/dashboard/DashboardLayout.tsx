'use client';

import { Bell, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  userActionSlot?: ReactNode;
}

export function DashboardLayout({ children, userActionSlot }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-base-cream selection:bg-amber-400/30">
      <Sidebar />

      <main className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-white/5 bg-[#0A0A0A]/80 px-8 backdrop-blur-xl">
          <div className="flex items-center gap-4 text-slate-400">
            {/* Breadcrumbs or Title could go here */}
            <span className="font-clarity text-sm">Dashboard</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              className="text-slate-400 hover:text-base-cream transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="text-slate-400 hover:text-base-cream transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-orange-500" />
            </button>
            <div className="h-8 w-px bg-white/10" />
            {userActionSlot}
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">{children}</div>
      </main>
    </div>
  );
}
