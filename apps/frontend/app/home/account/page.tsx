'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Download,
  Flame,
  HardDrive,
  Moon,
  PenLine,
  Shield,
  Trash2,
  TrendingUp,
  Upload,
  User,
} from 'lucide-react';

const FONT_PLAYFAIR = "'Playfair Display', Georgia, serif";
const FONT_URBANIST = "'Urbanist', system-ui, sans-serif";

function StatCard({
  value,
  label,
  icon,
  highlight = false,
}: {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border border-white/5 bg-[#1a1a1a] p-6 flex flex-col gap-4 min-h-[120px] justify-between"
      style={{ fontFamily: FONT_URBANIST }}
    >
      <div className="flex items-start justify-between">
        <span className={`text-5xl font-bold leading-none ${highlight ? 'text-white' : 'text-[#e07a5f]'}`}>
          {value}
        </span>
        <span className="text-[#FFA500]">{icon}</span>
      </div>
      <p className="text-white/50 text-base font-medium">{label}</p>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/70" style={{ fontFamily: FONT_URBANIST }}>
      {label}
    </span>
  );
}

function ThemeBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[#e07a5f] font-medium text-sm" style={{ fontFamily: FONT_URBANIST }}>
        {label}
      </span>
      <span className="text-white/60 text-sm" style={{ fontFamily: FONT_URBANIST }}>
        {percent} %
      </span>
    </div>
  );
}

function OutlineButton({
  children,
  icon,
  onClick,
  danger = false,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-full border px-6 py-3 text-sm font-medium transition-all duration-200 ${
        danger
          ? 'border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60'
          : 'border-white/15 text-white/70 hover:bg-white/5 hover:border-white/30 hover:text-white'
      }`}
      style={{ fontFamily: FONT_URBANIST }}
    >
      {icon}
      {children}
    </button>
  );
}

function DataActionBtn({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex flex-1 items-center gap-3 rounded-2xl border border-white/8 bg-[#1a1a1a] px-5 py-4 text-sm text-white/70 font-medium transition-all duration-200 hover:bg-white/5 hover:text-white hover:border-white/20"
      style={{ fontFamily: FONT_URBANIST }}
    >
      <span className="text-[#e07a5f]">{icon}</span>
      {children}
    </button>
  );
}

export default function AccountPage() {
  const { user } = useUser();
  const router = useRouter();

  const displayName = user?.fullName || user?.firstName || 'Unknownname';
  const email = user?.primaryEmailAddress?.emailAddress || 'you@example.com';
  const avatarUrl = user?.imageUrl;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&family=Urbanist:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen bg-[#0A0A0A] text-white" style={{ fontFamily: FONT_URBANIST }}>
        {/* Header */}
        <header className="px-8 py-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <Link
              href="/home"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-[#e07a5f] text-lg">Account</span>
          </div>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'h-9 w-9 ring-2 ring-white/10 hover:ring-white/20 transition-all',
              },
            }}
            afterSignOutUrl="/"
          />
        </header>

        <main className="max-w-4xl mx-auto px-8 py-10 space-y-6 pb-16">
          {/* Profile + Stats */}
          <div className="rounded-2xl border border-white/5 bg-[#141414] p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-start gap-5 flex-1">
                <div className="relative flex-shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-20 w-20 rounded-full object-cover ring-2 ring-[#e07a5f]/30"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#e07a5f]/40 to-amber-500/30 flex items-center justify-center ring-2 ring-[#e07a5f]/20">
                      <User className="w-8 h-8 text-[#e07a5f]/70" />
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-400 ring-2 ring-[#141414]" />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                  <h2
                    className="text-4xl text-white leading-none"
                    style={{ fontFamily: FONT_PLAYFAIR, fontStyle: 'italic', fontWeight: 600 }}
                  >
                    {displayName}
                  </h2>
                  <p className="text-[#e07a5f] text-base">{email}</p>
                  <div className="text-base text-white/60 mt-0.5">Trying to make sense of my thoughts.</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-semibold">
                      You&apos;ve been staying consistent.
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full sm:w-1/2">
                <StatCard value={32} label="Days Joined" icon={<Calendar className="w-6 h-6" />} />
                <StatCard value={64} label="Entries" icon={<PenLine className="w-6 h-6" />} />
                <StatCard value={9} label="Day Streak" icon={<Flame className="w-6 h-6" />} />
                <StatCard value="Evenings" label="Most Active" icon={<Moon className="w-6 h-6" />} />
              </div>
            </div>
          </div>

          {/* Writing Patterns + Insight Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 rounded-2xl border border-white/5 bg-[#141414] p-6 space-y-4">
              <p className="text-white/70 font-semibold text-base">Your writing patterns</p>
              <p className="text-white/25 text-xs uppercase tracking-[0.18em] font-medium">
                Primary Style
              </p>
              <h3
                className="text-3xl leading-tight text-white"
                style={{ fontFamily: FONT_PLAYFAIR, fontStyle: 'italic', fontWeight: 600 }}
              >
                Thoughtful self-reflection
              </h3>
              <p className="text-[#e07a5f] text-sm leading-relaxed">
                You often pause to process your emotions before responding. Your entries show a
                pattern of careful observation and internal clarity-building.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Tag label="Reflective" />
                <Tag label="Aware" />
                <Tag label="Grounded" />
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#141414] p-6 space-y-3">
              <p className="text-white/70 font-semibold text-base">Insight Analysis</p>
              <p className="text-white/25 text-xs uppercase tracking-[0.18em] font-medium">Core Theme</p>
              <div className="divide-y divide-white/5">
                <ThemeBar label="Healing" percent={41} />
                <ThemeBar label="Anxiety" percent={26} />
                <ThemeBar label="Self-worth" percent={17} />
              </div>
              <p className="text-white/30 text-xs leading-relaxed pt-2 text-center">
                Insights are based on sentiment and tone analysis.
              </p>
            </div>
          </div>

          {/* Data & Ownership + Privacy Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 rounded-2xl border border-white/5 bg-[#141414] p-6 space-y-4">
              <p className="text-white/70 font-semibold text-base">Data &amp; Ownership</p>
              <div className="flex gap-3">
                <DataActionBtn icon={<Download className="w-4 h-4" />}>Download your data</DataActionBtn>
                <DataActionBtn icon={<Upload className="w-4 h-4" />}>Backup your entries</DataActionBtn>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#141414] p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <p className="text-emerald-400 font-semibold text-sm">Privacy Snapshot</p>
              </div>
              <p
                className="text-white text-lg leading-snug"
                style={{ fontFamily: FONT_PLAYFAIR, fontStyle: 'italic', fontWeight: 600 }}
              >
                Your privacy comes first.
              </p>
              <p className="text-[#e07a5f] text-xs leading-relaxed">
                Your data is encrypted end-to-end and used only to generate your personal insights. We don&apos;t share,
                sell, or use it for ads.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <HardDrive className="w-3.5 h-3.5 text-white/30" />
                <span className="text-white/30 text-xs">Your data belongs only to you.</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <OutlineButton icon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.push('/home')}>
              Back to Home
            </OutlineButton>
            <OutlineButton icon={<Trash2 className="w-4 h-4" />} danger>
              Delete account
            </OutlineButton>
          </div>
        </main>
      </div>
    </>
  );
}