'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { ActionButton, DashboardLayout, StatsWidget, WidgetCard } from '@soulcanvas/ui-kit';
import { CheckCircle2, ChevronRight, Folder, Mic, PenLine, Plus } from 'lucide-react'; // Fixed imports
import Link from 'next/link';
import { trpc } from '../../src/utils/trpc'; // Relative path

export default function DashboardPage() {
  const { user } = useUser();
  const { data: galaxyData } = trpc.getGalaxyData.useQuery();

  const totalEntries = galaxyData?.length || 0;

  const latestEntry = galaxyData && galaxyData.length > 0 ? galaxyData[galaxyData.length - 1] : null;
  const latestEntryId = latestEntry ? latestEntry.id : null;
  const continueLink = latestEntryId ? `/dashboard/new-entry?id=${latestEntryId}` : '/dashboard/new-entry';

  // Use raw content from latest entry (it arrives decrypted from backend)
  const firstLine = latestEntry ? latestEntry.content.split('\n').find(l => l.trim().length > 0) : null;
  const displayTitle = firstLine ? (firstLine.length > 40 ? firstLine.substring(0, 40) + '...' : firstLine) : 'Latest Entry';

  return (
    <DashboardLayout
      userActionSlot={
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'h-9 w-9 ring-2 ring-white/10 hover:ring-white/20 transition-all',
            },
          }}
          afterSignOutUrl="/"
        />
      }
    >
      {/* Welcome Section */}
      <section className="mb-12">
        <h1 className="font-editorial text-4xl mb-2 text-base-cream">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}.
        </h1>
        <p className="font-clarity text-slate-400 text-lg">
          Let's explore your thoughts, ideas, and insights.
        </p>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Continue Entry - Large Card */}
        <WidgetCard
          title="Continue Entry"
          className="col-span-1 md:col-span-2 relative min-h-[300px]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F0F0F] z-10" />

          <div className="relative z-0 opacity-80 mb-8 max-w-2xl">
            {galaxyData && galaxyData.length > 0 ? (
              <Link href={continueLink} className="block group">
                <h4 className="font-editorial text-2xl text-slate-300 group-hover:text-amber-500 transition-colors">
                  {displayTitle}
                </h4>
                <p className="font-clarity text-slate-400 mt-4 leading-relaxed line-clamp-3">
                  {latestEntry ? latestEntry.content : 'Loading...'}
                </p>
              </Link>
            ) : (
              <>
                <h4 className="font-editorial text-2xl text-slate-700">The Midnight Echos</h4>
                <p className="font-clarity text-slate-600 mt-4 leading-relaxed blur-[2px]">
                  The silence of the night brings a clarity that the day often obscures...
                </p>
              </>
            )}
          </div>

          <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-wrap items-center gap-4">
            <div className="flex gap-2 text-xs text-slate-500 font-clarity uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <Mic className="w-3 h-3" /> Voice
              </span>
              <span className="flex items-center gap-1">
                <PenLine className="w-3 h-3" /> Text
              </span>
            </div>
            <Link href={continueLink} className="ml-auto">
              <ActionButton icon={Plus}>
                {latestEntryId ? 'Continue' : 'New Entry'}
              </ActionButton>
            </Link>
          </div>
        </WidgetCard>

        {/* Calendar Stats */}
        <WidgetCard title="Calorful" actionText="Set reminders" className="bg-[#151515]">
          <StatsWidget totalEntries={totalEntries} />
        </WidgetCard>

        {/* Canvas Preview */}
        <WidgetCard title="The Midnight Echos" actionText="" className="col-span-1 bg-[#121212]">
          <div className="aspect-video w-full rounded-lg bg-slate-900/50 border border-white/5 relative overflow-hidden group/canvas cursor-pointer">
            {/* Mock node graph visual */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-amber-500/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/canvas:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
              <span className="text-xs font-clarity uppercase tracking-widest text-white">
                Open Canvas
              </span>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <Link href="/dashboard/new-entry" className="w-full">
              <ActionButton variant="secondary" icon={Plus} className="w-full text-xs py-2">
                New Entry
              </ActionButton>
            </Link>
          </div>
        </WidgetCard>

        {/* Canvas Folders */}
        <WidgetCard
          title="Canvas"
          subtitle='"Your thoughts are not separate. They are waiting to connect."'
          className="col-span-1"
        >
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { id: 'project-1', label: 'Project 1' },
              { id: 'project-2', label: 'Project 2' },
              { id: 'project-3', label: 'Project 3' },
            ].map((project) => (
              <div key={project.id} className="group cursor-pointer">
                <div className="aspect-square rounded-xl bg-white/5 border border-white/5 flex items-center justify-center transition-colors group-hover:bg-amber-500/10 group-hover:border-amber-500/30">
                  <FolderOpenIcon className="w-6 h-6 text-slate-600 group-hover:text-amber-500 transition-colors" />
                </div>
                <p className="mt-2 text-[10px] text-center text-slate-500 truncate">
                  {project.label}
                </p>
              </div>
            ))}
          </div>
        </WidgetCard>

        {/* Tasklist */}
        <WidgetCard title="Tasklist" actionText="" className="col-span-1">
          <div className="space-y-3 mt-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-300">Read "Atomic Habits"</p>
                <p className="text-xs text-slate-500 mt-1">Today</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-base-cream">Brainstorm ideas</p>
                <p className="text-xs text-amber-500/80 mt-1">Tomorrow</p>
              </div>
            </div>
            <button className="w-full py-2 text-xs text-slate-400 hover:text-base-cream transition-colors">
              + Add task
            </button>
          </div>
        </WidgetCard>

        {/* Insights */}
        <WidgetCard title="Insights" className="col-span-1">
          <div className="mt-2 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-clarity uppercase text-indigo-400">Mood Trend</span>
              </div>
              <p className="text-sm text-slate-300">
                Your entries show a generic upward trend in positivity this week.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-slate-500">
            <Link
              href="/dashboard/insights"
              className="flex items-center hover:text-base-cream transition-colors"
            >
              View all <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </WidgetCard>
      </div>
    </DashboardLayout>
  );
}

function FolderOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
