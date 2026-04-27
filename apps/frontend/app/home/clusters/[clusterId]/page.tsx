'use client';

import { useUser } from '@clerk/nextjs';
import { FileText, Mic, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '../../../../src/utils/trpc';

function HighlightIcon({ type }: { type: 'entry' | 'task' }) {
  if (type === 'task') return <Mic className="w-4 h-4" style={{ color: 'var(--soouls-accent)' }} />;
  return <FileText className="w-4 h-4" style={{ color: 'var(--soouls-accent)' }} />;
}

export default function ClusterDetailPage() {
  const router = useRouter();
  const { user } = useUser();
  const params = useParams<{ clusterId: string }>();
  const clusterId = typeof params?.clusterId === 'string' ? params.clusterId : '';

  const { data, isLoading } = trpc.private.home.getClusterDetail.useQuery(
    { clusterId },
    { enabled: clusterId.length > 0 },
  );

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--soouls-bg)', color: 'var(--soouls-text-strong)' }}
      >
        <div className="text-center">
          <p className="text-lg mb-3">Loading cluster...</p>
          <button
            type="button"
            onClick={() => router.push('/home/clusters')}
            style={{ color: 'var(--soouls-accent)' }}
          >
            Back to clusters
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: 'var(--soouls-bg)', color: 'var(--soouls-text-strong)' }}
      >
        <div
          className="max-w-md rounded-[2rem] border px-8 py-10 text-center shadow-2xl"
          style={{
            backgroundColor: 'var(--soouls-bg-surface)',
            borderColor: 'var(--soouls-border)',
          }}
        >
          <p
            className="text-sm uppercase tracking-[0.18em] mb-4"
            style={{ color: 'var(--soouls-accent)' }}
          >
            Cluster Unavailable
          </p>
          <h1 className="text-2xl font-semibold mb-3">This cluster could not be found.</h1>
          <p className="text-sm mb-6 text-[var(--soouls-text-muted)]">
            It may have been removed, renamed, or linked from an older insight snapshot.
          </p>
          <button
            type="button"
            onClick={() => router.push('/home/clusters')}
            className="inline-flex items-center justify-center px-5 py-3 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--soouls-accent)' }}
          >
            Back to clusters
          </button>
        </div>
      </div>
    );
  }

  const cluster = data.cluster;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: 'var(--soouls-bg)', color: 'var(--soouls-text-strong)' }}
    >
      <div className="absolute top-10 left-0 right-0 flex justify-center pointer-events-none opacity-10 select-none z-0 overflow-hidden whitespace-nowrap">
        <span
          className="text-[20vw] leading-none text-transparent tracking-tighter"
          style={{
            fontFamily: 'serif',
            WebkitTextStroke: '1px rgba(255,255,255,0.35)',
          }}
        >
          Soouls in
        </span>
      </div>

      <header className="px-8 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--soouls-text-muted)]">
          <button
            onClick={() => router.push('/home/clusters')}
            className="transition duration-300 hover:text-[var(--soouls-accent)]"
          >
            Home
          </button>
          <span>/</span>
          <span
            className="hover:text-[var(--soouls-accent)] cursor-pointer"
            onClick={() => router.push('/home/clusters')}
          >
            Clusters
          </span>
          <span>/</span>
          <span style={{ color: 'var(--soouls-accent)' }}>{cluster.name}</span>
        </div>

        <div
          className="w-9 h-9 rounded-full border overflow-hidden ring-2 ring-white/5"
          style={{
            borderColor: 'var(--soouls-border)',
            backgroundColor: 'var(--soouls-bg-elevated)',
          }}
        >
          {user?.imageUrl && (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 relative z-10 flex flex-col pt-4 pb-20">
        <div
          className="rounded-[2.5rem] border p-8 md:p-12 shadow-2xl"
          style={{
            backgroundColor: 'var(--soouls-bg-surface)',
            borderColor: 'var(--soouls-border)',
          }}
        >
          <p
            className="text-sm uppercase tracking-[0.2em] mb-4"
            style={{ color: 'var(--soouls-accent)' }}
          >
            Core Theme
          </p>
          <h1 className="text-4xl font-semibold mb-8">{cluster.name}</h1>

          <div
            className="rounded-[2rem] border p-8 mb-10"
            style={{
              borderColor: 'rgba(var(--soouls-accent-rgb), 0.35)',
              background:
                'linear-gradient(135deg, rgba(var(--soouls-accent-rgb), 0.16), transparent)',
            }}
          >
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--soouls-accent)' }}>
              Core Narrative Shift
            </p>
            <p className="text-3xl font-serif italic leading-[1.25] text-[var(--soouls-text-strong)]">
              “{data.narrative}”
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div
              className="lg:col-span-2 border rounded-3xl p-6"
              style={{
                borderColor: 'var(--soouls-border)',
                backgroundColor: 'rgba(255,255,255,0.03)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Key Ideas</h2>
                <p className="text-sm text-[var(--soouls-text-muted)]">
                  {cluster.entryCount} Nodes Identified
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.keyIdeas.map((idea, index) => (
                  <div
                    key={idea.label}
                    className="rounded-2xl border p-5"
                    style={{
                      borderColor: 'var(--soouls-border)',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <p
                      className="text-sm mb-3"
                      style={{
                        color:
                          index % 2 === 0 ? 'var(--soouls-accent)' : 'var(--soouls-text-strong)',
                      }}
                    >
                      {idea.label}
                    </p>
                    <p className="text-sm leading-relaxed text-[var(--soouls-text-muted)]">
                      {idea.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="border rounded-3xl p-6"
              style={{
                borderColor: 'var(--soouls-border)',
                backgroundColor: 'rgba(255,255,255,0.03)',
              }}
            >
              <h2 className="text-2xl font-semibold mb-6">Idea Connections</h2>
              <div className="space-y-5">
                {data.keyIdeas.map((idea, index) => {
                  const partner = data.keyIdeas[(index + 1) % data.keyIdeas.length];
                  return (
                    <div key={`${idea.label}-${partner?.label ?? index}`}>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-[var(--soouls-text-strong)]">
                          {idea.label}
                        </span>
                        <span style={{ color: 'var(--soouls-accent)' }}>↔</span>
                        <span className="text-sm text-[var(--soouls-text-muted)]">
                          {partner?.label ?? cluster.name}
                        </span>
                      </div>
                      <p className="text-xs mt-1 text-[var(--soouls-text-faint)]">
                        These themes keep appearing near each other in your recent writing.
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div
              className="border rounded-3xl p-6"
              style={{
                borderColor: 'var(--soouls-border)',
                backgroundColor: 'rgba(255,255,255,0.03)',
              }}
            >
              <h2 className="text-2xl font-semibold mb-6">Entry Highlights</h2>
              <div className="space-y-4">
                {data.highlights.map((highlight) => (
                  <Link
                    key={highlight.id}
                    href={`/home/new-entry?id=${highlight.id}`}
                    className="flex items-center justify-between rounded-2xl border px-4 py-4 transition-colors hover:border-[var(--soouls-accent)]"
                    style={{
                      borderColor: 'var(--soouls-border)',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <HighlightIcon type={highlight.type} />
                      <div>
                        <p className="text-sm text-[var(--soouls-text-strong)]">
                          {highlight.title}
                        </p>
                        <p className="text-xs uppercase tracking-widest text-[var(--soouls-text-faint)]">
                          {highlight.type === 'task' ? 'Task entry' : 'Text entry'} ·{' '}
                          {new Date(highlight.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <span className="text-[var(--soouls-text-faint)]">›</span>
                  </Link>
                ))}
              </div>
            </div>

            <div
              className="border rounded-3xl p-6"
              style={{
                borderColor: 'var(--soouls-border)',
                backgroundColor: 'rgba(255,255,255,0.03)',
              }}
            >
              <h2 className="text-2xl font-semibold mb-6">Observations</h2>
              <p className="text-sm leading-relaxed mb-8 text-[var(--soouls-text-muted)]">
                {data.observation}
              </p>
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--soouls-accent)' }}>
                Next Logical Step
              </p>
              <div
                className="rounded-2xl p-5 text-sm leading-relaxed"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                {data.nextStep}
              </div>
            </div>
          </div>

          <div
            className="rounded-[2rem] border p-8 text-center"
            style={{
              borderColor: 'rgba(var(--soouls-accent-rgb), 0.35)',
              background:
                'linear-gradient(180deg, rgba(var(--soouls-accent-rgb), 0.12), transparent)',
            }}
          >
            <div className="flex justify-center mb-5">
              <Sparkles className="w-5 h-5" style={{ color: 'var(--soouls-accent)' }} />
            </div>
            <p className="text-sm font-medium mb-4" style={{ color: 'var(--soouls-accent)' }}>
              Reflection Prompt
            </p>
            <p className="text-3xl font-serif italic mb-8 text-[var(--soouls-text-strong)]">
              “{data.reflectionPrompt}”
            </p>
            <Link
              href={'/home/new-entry'}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--soouls-accent)' }}
            >
              Create New Entry in Cluster
            </Link>
            <p className="mt-4 text-sm text-[var(--soouls-text-faint)]">
              Start recording or typing now
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
