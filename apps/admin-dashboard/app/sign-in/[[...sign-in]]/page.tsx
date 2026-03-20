'use client';

import { SignIn, useAuth } from '@clerk/nextjs';
import { Fingerprint, Orbit, Shield, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CommandCenterLandingPage() {
  const [showClerk, setShowClerk] = useState(false);
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // If already signed-in, redirect via Clerk's fallback
  if (isSignedIn) {
    router.replace('/');
    return null;
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#040814] px-6 py-10 selection:bg-amber-500/30">
      {/* ── Animated Cosmic Background ── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Primary amber nebula */}
        <div className="absolute -left-[15%] -top-[8%] h-[600px] w-[600px] animate-pulse rounded-full bg-amber-500/[0.07] blur-[160px]" />
        {/* Secondary blue nebula */}
        <div className="absolute right-[5%] top-[15%] h-[500px] w-[500px] rounded-full bg-blue-500/[0.06] blur-[140px]" />
        {/* Emerald deep field */}
        <div className="absolute -bottom-[15%] left-[25%] h-[700px] w-[700px] rounded-full bg-emerald-500/[0.04] blur-[180px]" />
        {/* Violet accent */}
        <div className="absolute -right-[10%] bottom-[10%] h-[400px] w-[400px] rounded-full bg-violet-500/[0.05] blur-[120px]" />
        {/* Star field dots */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 60% 20%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 100%), radial-gradient(1px 1px at 15% 80%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 70% 85%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1.5px 1.5px at 50% 50%, rgba(245,158,11,0.6) 0%, transparent 100%)',
          }}
        />
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 flex max-w-2xl flex-col items-center text-center">
        {/* SoulLabs badge */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-500/20 bg-amber-500/[0.08] px-5 py-2.5 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-300">
            SoulLabs Internal
          </span>
        </div>

        {/* Orbit Icon */}
        <div className="relative mt-10">
          <div className="absolute inset-0 scale-150 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-[28px] border border-amber-400/20 bg-gradient-to-br from-amber-400/15 to-orange-500/10 shadow-2xl shadow-amber-500/10 backdrop-blur-xl">
            <Orbit className="h-10 w-10 text-amber-300" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="mt-10 font-display text-5xl font-medium leading-[1.12] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Welcome to the{' '}
          <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
            SoulLabs Command Center
          </span>
        </h1>
        <p className="mt-4 font-display text-xl italic text-slate-400 sm:text-2xl">
          The center of the galaxy.
        </p>

        {/* Description */}
        <p className="mt-8 max-w-lg text-base leading-relaxed text-slate-500">
          Internal operations hub for platform administration, real-time telemetry, and incident
          response. Authorized personnel only.
        </p>

        {/* Feature Pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <FeaturePill icon={<Shield className="h-3.5 w-3.5" />} label="RBAC Enforcement" />
          <FeaturePill icon={<Sparkles className="h-3.5 w-3.5" />} label="Real-time Telemetry" />
          <FeaturePill icon={<Fingerprint className="h-3.5 w-3.5" />} label="Audit-Logged Access" />
        </div>

        {/* ── Authenticate Identity Button or Clerk Form ── */}
        <div className="mt-14 w-full max-w-md">
          {!showClerk ? (
            <button
              id="authenticate-identity-btn"
              type="button"
              onClick={() => setShowClerk(true)}
              className="group relative w-full overflow-hidden rounded-2xl p-[1px] transition-all duration-500 hover:shadow-[0_0_60px_rgba(245,158,11,0.25)]"
            >
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 opacity-80 transition-opacity group-hover:opacity-100" />
              {/* Glow pulse */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 opacity-0 blur-xl transition-opacity group-hover:opacity-50" />
              {/* Inner */}
              <div className="relative flex items-center justify-center gap-3 rounded-[15px] bg-[#0a1628] px-8 py-5 transition-all duration-300 group-hover:bg-[#0c1a30]">
                <Fingerprint className="h-5 w-5 text-amber-400 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-base font-semibold tracking-wide text-amber-100 transition-colors group-hover:text-white">
                  Authenticate Identity
                </span>
              </div>
            </button>
          ) : (
            <div className="animate-fade-in">
              <div className="rounded-[28px] border border-white/5 bg-white shadow-2xl shadow-black/30">
                <SignIn
                  routing="path"
                  path="/sign-in"
                  fallbackRedirectUrl="/"
                  signUpFallbackRedirectUrl="/"
                  forceRedirectUrl="/"
                  afterSignInUrl="/"
                  afterSignUpUrl="/"
                  signUpUrl="/sign-in"
                  appearance={{
                    elements: {
                      rootBox: 'w-full',
                      card: 'shadow-none p-8',
                      headerTitle: 'font-display text-2xl text-slate-900',
                      headerSubtitle: 'text-slate-500',
                      formButtonPrimary:
                        'bg-slate-950 hover:bg-slate-800 text-white rounded-xl py-3 transition-colors',
                      formFieldInput:
                        'rounded-xl border-slate-200 focus:border-slate-400 focus:ring-slate-400',
                      dividerLine: 'bg-slate-200',
                      dividerText: 'text-slate-400',
                      socialButtonsBlockButton:
                        'rounded-xl border-slate-200 hover:bg-slate-50 transition-colors',
                      footerActionText: 'text-slate-500',
                      footerActionLink: 'text-amber-600 hover:text-amber-700 font-medium',
                    },
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowClerk(false)}
                className="mt-4 text-xs text-slate-600 transition-colors hover:text-slate-400"
              >
                ← Back
              </button>
            </div>
          )}
        </div>

        {/* Security footer */}
        <div className="mt-10 flex items-center gap-2 text-[11px] text-slate-600">
          <Shield className="h-3 w-3" />
          <span>Protected by Clerk · Enterprise SSO · No open registration</span>
        </div>
      </div>
    </main>
  );
}

function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-slate-400 backdrop-blur-sm">
      <span className="text-amber-400/70">{icon}</span>
      {label}
    </div>
  );
}
