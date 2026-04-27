'use client';

import { useUser } from '@clerk/nextjs';
import { GraduationCap, Lightbulb, Search, Sparkles, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { trpc } from '../../../src/utils/trpc';

const FILTERS = [
  { key: 'active', label: 'Most Active' },
  { key: 'updated', label: 'Recently Updated' },
  { key: 'intensity', label: 'Emotion Intensity' },
] as const;

function ClusterIcon({ index }: { index: number }) {
  const className = 'w-4 h-4';
  const style = { color: 'var(--soouls-accent)' };
  if (index % 3 === 0) return <Sun className={className} style={style} />;
  if (index % 3 === 1) return <GraduationCap className={className} style={style} />;
  return <Lightbulb className={className} style={style} />;
}

export default function ClustersPage() {
  const router = useRouter();
  const { user } = useUser();
  const { setIsOpen } = useSidebar();
  const { data } = trpc.private.home.getClusters.useQuery(undefined);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('active');

  const clusters = useMemo(() => {
    const items = [...(data?.items ?? [])].filter((cluster) => {
      const corpus = `${cluster.name} ${cluster.description}`.toLowerCase();
      return corpus.includes(query.toLowerCase());
    });

    if (filter === 'active') {
      items.sort((left, right) => right.entryCount - left.entryCount);
    } else if (filter === 'intensity') {
      items.sort((left, right) => {
        if (left.strength === right.strength) return right.entryCount - left.entryCount;
        return left.strength === 'Dominant' ? -1 : 1;
      });
    }

    return items;
  }, [data?.items, filter, query]);

  const featured = clusters[0];

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden font-sans select-none"
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
          Soouls
        </span>
      </div>

      <header className="px-8 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--soouls-text-muted)]">
          <button
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="transition duration-300 hover:text-[var(--soouls-accent)]"
          >
            Home
          </button>
          <span>/</span>
          <span style={{ color: 'var(--soouls-accent)' }}>Clusters</span>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="w-9 h-9 rounded-full border border-white/10 bg-zinc-800 overflow-hidden ring-2 ring-white/5 hover:border-white/30 transition-all cursor-pointer"
        >
          {user?.imageUrl && (
            <img src={user.imageUrl} alt="Profile" className="w-9 h-9 rounded-full" />
          )}
        </button>
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

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 relative z-10 flex flex-col pt-4 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1
              className="text-4xl md:text-5xl font-serif italic leading-tight"
              style={{ color: 'var(--soouls-accent)' }}
            >
              Your thought clusters
            </h1>
            <p className="mt-2 text-lg text-[var(--soouls-text-muted)]">
              these are the spaces your thoughts naturally gather
            </p>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--soouls-text-faint)] group-focus-within:text-[var(--soouls-accent)] transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="search clusters"
                className="rounded-full py-2.5 pl-11 pr-6 text-sm w-full md:w-80 focus:outline-none transition-all placeholder:text-[var(--soouls-text-faint)]"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--soouls-border)',
                }}
              />
            </div>
            <div className="flex gap-2">
              {FILTERS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setFilter(option.key)}
                  className="text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border transition-all"
                  style={{
                    backgroundColor:
                      filter === option.key
                        ? 'rgba(var(--soouls-accent-rgb), 0.15)'
                        : 'transparent',
                    borderColor:
                      filter === option.key
                        ? 'rgba(var(--soouls-accent-rgb), 0.6)'
                        : 'var(--soouls-border)',
                    color:
                      filter === option.key ? 'var(--soouls-accent)' : 'var(--soouls-text-muted)',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm mb-10 justify-center text-[var(--soouls-text-muted)]">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--soouls-accent)' }} />
          <span>{data?.headline ?? 'Your recent thoughts are beginning to cluster.'}</span>
        </div>

        <div
          className="backdrop-blur-xl border rounded-3xl p-8 shadow-2xl relative overflow-hidden"
          style={{
            backgroundColor: 'var(--soouls-bg-surface)',
            borderColor: 'var(--soouls-border)',
          }}
        >
          {featured ? (
            <button
              type="button"
              onClick={() => router.push(`/home/clusters/${featured.id}`)}
              className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 w-full text-left"
            >
              <div className="lg:col-span-7 flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <span
                    className="text-[10px] font-bold tracking-widest py-1 px-3 rounded-full border"
                    style={{
                      backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.1)',
                      borderColor: 'rgba(var(--soouls-accent-rgb), 0.25)',
                      color: 'var(--soouls-accent)',
                    }}
                  >
                    {featured.strength === 'Dominant' ? 'ACTIVE HUB' : 'EMERGING'}
                  </span>
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <GraduationCap
                    className="w-6 h-6 mt-1"
                    style={{ color: 'var(--soouls-accent)' }}
                  />
                  <h2 className="text-3xl font-serif italic text-[var(--soouls-text-strong)]">
                    {featured.name}
                  </h2>
                </div>

                <p className="text-sm leading-relaxed mb-10 max-w-md text-[var(--soouls-text-muted)]">
                  {featured.description}
                </p>

                <div className="flex gap-12">
                  <div>
                    <span className="text-[10px] uppercase tracking-tighter block mb-1 text-[var(--soouls-text-faint)]">
                      Emotion Tone
                    </span>
                    <div className="flex gap-2 text-xs text-[var(--soouls-text-muted)]">
                      {featured.tones.map((tone, index) => (
                        <span key={tone}>
                          {index > 0 && <span className="text-white/20"> • </span>}
                          {tone}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-tighter block mb-1 text-[var(--soouls-text-faint)]">
                      Strength
                    </span>
                    <span className="text-xs font-medium" style={{ color: 'var(--soouls-accent)' }}>
                      {featured.strength}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full blur-2xl"
                    style={{ backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.12)' }}
                  />
                  <div
                    className="absolute inset-0 rounded-full border"
                    style={{
                      borderColor: 'rgba(var(--soouls-accent-rgb), 0.22)',
                      background:
                        'linear-gradient(180deg, rgba(var(--soouls-accent-rgb), 0.12), transparent)',
                    }}
                  />
                  <div className="text-center">
                    <div className="text-5xl font-serif italic text-[var(--soouls-text-strong)]">
                      {featured.entryCount}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-[0.2em] mt-1"
                      style={{ color: 'var(--soouls-accent)' }}
                    >
                      Entries
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ) : (
            <div
              className="relative z-10 rounded-3xl border px-6 py-10 text-center"
              style={{
                borderColor: 'var(--soouls-border)',
                backgroundColor: 'var(--soouls-overlay-subtle)',
                color: 'var(--soouls-text-muted)',
              }}
            >
              Your first few entries will begin forming visible clusters here.
            </div>
          )}

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 pt-12 border-t"
            style={{ borderColor: 'var(--soouls-overlay-subtle)' }}
          >
            {clusters.map((cluster, index) => (
              <button
                key={cluster.id}
                type="button"
                onClick={() => router.push(`/home/clusters/${cluster.id}`)}
                className="group border p-6 rounded-2xl transition-all duration-500 cursor-pointer hover:translate-y-[-4px] text-left"
                style={{
                  backgroundColor: 'var(--soouls-overlay-subtle)',
                  borderColor: 'var(--soouls-border)',
                }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div
                    className="p-2 rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--soouls-overlay-muted)' }}
                  >
                    <ClusterIcon index={index} />
                  </div>
                  <span className="text-[9px] font-bold tracking-widest text-[var(--soouls-text-faint)] group-hover:text-[var(--soouls-accent)] transition-colors">
                    {cluster.strength.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-xl font-serif italic mb-2 text-[var(--soouls-text-strong)] group-hover:text-[var(--soouls-accent)] transition-colors">
                  {cluster.name}
                </h3>
                <div className="flex gap-3 text-[10px] mb-4 font-medium uppercase tracking-tighter text-[var(--soouls-text-faint)]">
                  <span>{cluster.entryCount} entries</span>
                  <span>•</span>
                  <span>{cluster.updatedAtLabel}</span>
                </div>

                <p className="text-xs leading-relaxed line-clamp-3 text-[var(--soouls-text-muted)]">
                  {cluster.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>

      <div
        className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.05)' }}
      />
      <div
        className="absolute top-1/2 -right-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
        style={{ backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.06)' }}
      />
    </div>
  );
}
