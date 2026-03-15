'use client';

import { UserProfile } from '@clerk/nextjs';
import { DashboardLayout } from '@soulcanvas/ui-kit';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <section className="grid gap-8 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,#1f2937_0%,#111827_38%,#050816_100%)] p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-orange-200">Security</p>
          <h1 className="mt-4 font-editorial text-4xl text-base-cream">Account and access</h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">
            Use Clerk&apos;s account surface for password changes, profile updates, and session
            security. Internal messaging tools now live outside the main product experience, so this
            page stays focused on your account.
          </p>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1120] p-2">
          <div className="rounded-[28px] bg-white">
            <UserProfile routing="hash" />
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
