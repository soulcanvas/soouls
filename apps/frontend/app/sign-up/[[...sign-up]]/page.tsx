import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top,#1f2937_0%,#111827_35%,#050816_100%)] p-8 lg:p-12">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(249,115,22,0.15),transparent_38%,rgba(34,197,94,0.1))]" />
          <div className="relative space-y-6">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-orange-200">
              SoulCanvas Onboarding
            </div>
            <div className="space-y-4">
              <h1 className="max-w-xl font-playfair text-5xl leading-tight text-white">
                Join once. Trigger polished welcome journeys everywhere.
              </h1>
              <p className="max-w-xl text-base leading-8 text-slate-300">
                New accounts now flow into a branded messaging system that can thank people
                properly, recover access securely, and keep everyone up to date when you ship.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
                Beautiful email layouts
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
                Recovery and account access flows
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
                Broadcast-ready email and WhatsApp campaigns
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <Link href="/sign-in" className="text-slate-400 transition hover:text-white">
                Already have an account?
              </Link>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-center">
          <SignUp />
        </div>
      </div>
    </div>
  );
}
