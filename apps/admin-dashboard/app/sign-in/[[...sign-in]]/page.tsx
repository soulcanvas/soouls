import { SignIn } from '@clerk/nextjs';
import { Activity, Shield, Terminal } from 'lucide-react';

export default function AdminSignInPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#040814] px-6 py-10 selection:bg-amber-500/30">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[20%] -top-[10%] h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute -bottom-[20%] left-[20%] h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1200px] overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.02] shadow-command backdrop-blur-xl">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left Panel: Branding & Features */}
          <section className="relative flex flex-col justify-between overflow-hidden p-10 lg:p-16">
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                  SoulLabs Internal
                </span>
              </div>

              <h1 className="mt-8 font-display text-5xl font-medium leading-[1.1] text-white lg:text-6xl">
                Command <span className="text-amber-400/90 italic">Center</span>
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-400">
                Operating system for support, engineering, and platform administration. Access is
                strictly audited.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="relative mt-16 space-y-4">
              <FeatureCard
                icon={<Shield className="h-5 w-5 text-emerald-400" />}
                title="Role-Based Access"
                description="Granular permissions for Support, Engineering, and Super Admins."
              />
              <FeatureCard
                icon={<Activity className="h-5 w-5 text-blue-400" />}
                title="Real-time Telemetry"
                description="Live WebSocket connections, database latency, and bullmq job radar."
              />
              <FeatureCard
                icon={<Terminal className="h-5 w-5 text-violet-400" />}
                title="Emergency Controls"
                description="Kill switches and dynamic feature flags for immediate incident response."
              />
            </div>
          </section>

          {/* Right Panel: Sign In */}
          <section className="relative flex flex-col items-center justify-center border-l-0 border-white/10 bg-[#08111f]/80 p-10 lg:border-l lg:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)]" />

            <div className="relative w-full max-w-[400px]">
              <div className="rounded-[28px] border border-white/5 bg-white shadow-2xl">
                <SignIn
                  routing="path"
                  path="/sign-in"
                  fallbackRedirectUrl="/"
                  signUpFallbackRedirectUrl="/"
                  forceRedirectUrl="/"
                  signUpUrl="/sign-in" // allow sign in component to handle sign up on the same route
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

              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Shield className="h-3 w-3" />
                <span>Protected by Clerk · Enterprise SSO</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group flex items-start gap-4 rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] shadow-inner transition-transform group-hover:scale-105">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-200">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
      </div>
    </div>
  );
}
