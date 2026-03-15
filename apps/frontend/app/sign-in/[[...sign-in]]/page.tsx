import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top,#3b1d10_0%,#120f1d_40%,#050816_100%)] p-8 lg:p-12">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(249,115,22,0.16),transparent_45%,rgba(15,118,110,0.12))]" />
          <div className="relative space-y-6">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-orange-200">
              SoulCanvas Access
            </div>
            <div className="space-y-4">
              <h1 className="max-w-xl font-playfair text-5xl leading-tight text-white">
                Sign back into the quietest workspace in your stack.
              </h1>
              <p className="max-w-xl text-base leading-8 text-slate-300">
                Your journal, your campaigns, your onboarding system, and your product voice all
                live in one place now.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-orange-200/80">Private</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  SoulCanvas keeps the journaling experience quiet while internal systems stay
                  behind the scenes.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-200/80">
                  Onboarding
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  New accounts still trigger branded welcome messaging automatically without turning
                  the product UI into a mail tool.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <Link href="/" className="text-slate-400 transition hover:text-white">
                Back to home
              </Link>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-center">
          <SignIn />
        </div>
      </div>
    </div>
  );
}
