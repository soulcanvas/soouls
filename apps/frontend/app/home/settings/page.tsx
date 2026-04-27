'use client';

import { useUser } from '@clerk/nextjs';
import type { HomeSettings } from '@soouls/api/router';
import { Bell, ChevronDown, Clock, Loader2, Moon, Sparkles, Sun, User } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  HOME_DEFAULT_SETTINGS,
  HOME_THEME_STORAGE_KEY,
  applyHomeTheme,
  formatReminderTime,
} from '../../../src/hooks/use-home-theme';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { clearQueryCache } from '../../../src/providers/trpc-provider';
import { trpc } from '../../../src/utils/trpc';

const FONT_URBANIST = "'Urbanist', system-ui, sans-serif";

function avatarFor(seed?: string | null) {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed || 'Soouls')}&backgroundColor=1c1c1c,e07a5f&radius=50`;
}

function Toggle({ on, onChange }: { on: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="relative h-6 w-11 rounded-full transition-colors duration-200"
      style={{
        backgroundColor: on ? 'rgba(var(--soouls-accent-rgb),0.92)' : 'var(--soouls-overlay-muted)',
      }}
      aria-checked={on}
      role="switch"
    >
      <span
        className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-5' : ''}`}
      />
    </button>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <section
      className="rounded-[24px] border p-6"
      style={{ backgroundColor: 'var(--soouls-bg-surface)', borderColor: 'var(--soouls-border)' }}
    >
      {children}
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 text-base font-semibold text-[var(--soouls-text-strong)]">{children}</h2>
  );
}

function SettingRow({
  label,
  sublabel,
  icon,
  right,
}: { label: string; sublabel?: string; icon?: React.ReactNode; right: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between gap-4 border-b py-3 last:border-b-0"
      style={{ borderColor: 'var(--soouls-overlay-subtle)' }}
    >
      <div className="flex min-w-0 items-center gap-3">
        {icon ? (
          <span className="shrink-0" style={{ color: 'var(--soouls-accent)' }}>
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--soouls-text-strong)]">{label}</p>
          {sublabel ? (
            <p className="mt-0.5 text-xs text-[var(--soouls-text-faint)]">{sublabel}</p>
          ) : null}
        </div>
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useUser();
  const { setIsOpen } = useSidebar();
  const utils = trpc.useUtils();
  const timeInputRef = useRef<HTMLInputElement>(null);
  const confirmedSettingsRef = useRef<HomeSettings>(HOME_DEFAULT_SETTINGS);
  const queuedSettingsRef = useRef<HomeSettings | null>(null);
  const isFlushingRef = useRef(false);
  const hasOptimisticSettingsRef = useRef(false);
  const [feedback, setFeedback] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);

  const { data } = trpc.private.home.getSettings.useQuery(undefined);
  const settings = useMemo(() => data ?? HOME_DEFAULT_SETTINGS, [data]);
  const updateSettings = trpc.private.home.updateSettings.useMutation();

  const persistThemeSelection = useCallback((next: HomeSettings) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      HOME_THEME_STORAGE_KEY,
      JSON.stringify({ themeMode: next.themeMode, accentTheme: next.accentTheme }),
    );
  }, []);

  const applySettingsLocally = useCallback(
    (next: HomeSettings) => {
      utils.private.home.getSettings.setData(undefined, next);
      applyHomeTheme(next);
      persistThemeSelection(next);
    },
    [persistThemeSelection, utils],
  );

  useEffect(() => {
    if (!data || hasOptimisticSettingsRef.current) return;
    confirmedSettingsRef.current = data;
  }, [data]);

  useEffect(() => {
    if (feedback !== 'saved') return;
    const timer = setTimeout(() => setFeedback('idle'), 1800);
    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!cacheMessage) return;
    const timer = setTimeout(() => setCacheMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [cacheMessage]);

  const flushQueuedSettings = useCallback(async () => {
    if (isFlushingRef.current) return;
    isFlushingRef.current = true;
    try {
      while (queuedSettingsRef.current) {
        const payload = queuedSettingsRef.current;
        queuedSettingsRef.current = null;
        const saved = await updateSettings.mutateAsync(payload);
        confirmedSettingsRef.current = saved;
        if (!queuedSettingsRef.current) {
          hasOptimisticSettingsRef.current = false;
          applySettingsLocally(saved);
          await Promise.all([
            utils.private.home.getInsights.invalidate(),
            utils.private.home.getAccount.invalidate(),
            utils.private.home.getClusters.invalidate(),
          ]);
          setFeedback('saved');
        }
      }
    } catch {
      hasOptimisticSettingsRef.current = false;
      queuedSettingsRef.current = null;
      applySettingsLocally(confirmedSettingsRef.current);
      setFeedback('idle');
    } finally {
      isFlushingRef.current = false;
      if (queuedSettingsRef.current) void flushQueuedSettings();
    }
  }, [applySettingsLocally, updateSettings, utils]);

  const handlePatch = useCallback(
    (patch: Partial<HomeSettings>) => {
      const previous =
        queuedSettingsRef.current ??
        utils.private.home.getSettings.getData(undefined) ??
        confirmedSettingsRef.current;
      const next = { ...previous, ...patch };
      hasOptimisticSettingsRef.current = true;
      queuedSettingsRef.current = next;
      setFeedback('saving');
      applySettingsLocally(next);
      void flushQueuedSettings();
    },
    [applySettingsLocally, flushQueuedSettings, utils],
  );

  const handleClearCache = useCallback(async () => {
    await clearQueryCache();
    if (typeof window !== 'undefined') {
      for (const key of Object.keys(window.localStorage)) {
        if (key.startsWith('soouls_entry_v1_')) window.localStorage.removeItem(key);
      }
    }
    await Promise.all([
      utils.private.entries.getAll.invalidate(),
      utils.private.entries.getGalaxy.invalidate(),
      utils.private.home.getInsights.invalidate(),
      utils.private.home.getAccount.invalidate(),
      utils.private.home.getClusters.invalidate(),
    ]);
    setCacheMessage('Cache cleared');
  }, [utils]);

  return (
    <div
      className="min-h-screen text-[var(--soouls-text-strong)]"
      style={{ backgroundColor: 'var(--soouls-bg)', fontFamily: FONT_URBANIST }}
    >
      <header
        className="flex items-center justify-between border-b px-5 py-5 sm:px-8"
        style={{ borderColor: 'var(--soouls-border)' }}
      >
        <div className="flex items-center gap-3 text-sm sm:text-base">
          <Link
            href="/home"
            className="text-[var(--soouls-text-muted)] transition-colors hover:text-[var(--soouls-text-strong)]"
          >
            Home
          </Link>
          <span className="text-[var(--soouls-text-faint)]">/</span>
          <span style={{ color: 'var(--soouls-accent)' }}>Settings</span>
        </div>
        <div className="flex items-center gap-3">
          {feedback === 'saving' ? (
            <Loader2 className="h-4 w-4 animate-spin text-[var(--soouls-text-faint)]" />
          ) : null}
          {feedback === 'saved' ? (
            <span className="text-xs" style={{ color: 'var(--soouls-accent)' }}>
              Saved
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="h-10 w-10 overflow-hidden rounded-full border border-white/10"
            aria-label="Open profile menu"
          >
            <img
              src={user?.imageUrl || avatarFor(user?.primaryEmailAddress?.emailAddress || user?.id)}
              alt=""
              className="h-full w-full object-cover"
            />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-5 py-8 pb-20 sm:px-8">
        <div>
          <h1 className="font-playfair text-4xl italic leading-tight sm:text-5xl">Settings</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--soouls-accent)' }}>
            Control how Soouls works for you.
          </p>
        </div>

        <SectionCard>
          <p className="mb-4 text-xs uppercase tracking-[0.22em] text-[var(--soouls-text-faint)]">
            Preferences
          </p>
          <div className="grid gap-5 sm:grid-cols-3">
            <SettingRow
              label="Theme"
              icon={
                settings.themeMode === 'dark' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )
              }
              right={
                <button
                  type="button"
                  onClick={() =>
                    handlePatch({ themeMode: settings.themeMode === 'dark' ? 'light' : 'dark' })
                  }
                  style={{ color: 'var(--soouls-accent)' }}
                >
                  {settings.themeMode === 'dark' ? 'Dark' : 'Light'}
                </button>
              }
            />
            <SettingRow
              label="Default view"
              icon={<ChevronDown className="h-4 w-4" />}
              right={
                <button
                  type="button"
                  onClick={() => {
                    const views: HomeSettings['defaultView'][] = ['canvas', 'list', 'calendar'];
                    handlePatch({
                      defaultView:
                        views[(views.indexOf(settings.defaultView) + 1) % views.length] ?? 'canvas',
                    });
                  }}
                  style={{ color: 'var(--soouls-accent)' }}
                >
                  {settings.defaultView}
                </button>
              }
            />
            <SettingRow
              label="Writing"
              right={
                <button
                  type="button"
                  onClick={() =>
                    handlePatch({
                      writingMode: settings.writingMode === 'minimal' ? 'guided' : 'minimal',
                    })
                  }
                  style={{ color: 'var(--soouls-accent)' }}
                >
                  {settings.writingMode}
                </button>
              }
            />
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle>Notifications</SectionTitle>
          <SettingRow
            label="Daily reminder"
            sublabel="Gentle nudge to reflect on your day"
            icon={<Bell className="h-4 w-4" />}
            right={
              <Toggle
                on={settings.dailyReminder}
                onChange={(value) => handlePatch({ dailyReminder: value })}
              />
            }
          />
          <SettingRow
            label="Reflection prompts"
            sublabel="AI-generated questions for deeper thought"
            icon={<Sparkles className="h-4 w-4" />}
            right={
              <Toggle
                on={settings.reflectionPrompts}
                onChange={(value) => handlePatch({ reflectionPrompts: value })}
              />
            }
          />
          <SettingRow
            label="Reminder time"
            icon={<Clock className="h-4 w-4" />}
            right={
              <>
                <input
                  ref={timeInputRef}
                  type="time"
                  value={settings.reminderTime}
                  onChange={(event) => handlePatch({ reminderTime: event.target.value })}
                  className="sr-only"
                />
                <button
                  type="button"
                  onClick={() => timeInputRef.current?.showPicker?.()}
                  className="rounded-full border px-3 py-1 text-xs"
                  style={{ borderColor: 'var(--soouls-border)', color: 'var(--soouls-accent)' }}
                >
                  {formatReminderTime(settings.reminderTime)}
                </button>
              </>
            }
          />
        </SectionCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard>
            <SectionTitle>AI Behavior</SectionTitle>
            <div
              className="mb-4 grid grid-cols-3 gap-1 rounded-2xl p-1"
              style={{ backgroundColor: 'var(--soouls-overlay-subtle)' }}
            >
              {(['minimal', 'balanced', 'deep'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handlePatch({ insightDepth: level })}
                  className="rounded-xl px-3 py-2 text-xs font-medium capitalize"
                  style={{
                    backgroundColor:
                      settings.insightDepth === level
                        ? 'rgba(var(--soouls-accent-rgb),0.92)'
                        : 'transparent',
                    color: settings.insightDepth === level ? '#fff' : 'var(--soouls-text-faint)',
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
            <SettingRow
              label="Auto clustering"
              right={
                <Toggle
                  on={settings.autoClustering}
                  onChange={(value) => handlePatch({ autoClustering: value })}
                />
              }
            />
            <SettingRow
              label="Suggestions"
              right={
                <Toggle
                  on={settings.suggestions}
                  onChange={(value) => handlePatch({ suggestions: value })}
                />
              }
            />
          </SectionCard>

          <SectionCard>
            <SectionTitle>App Behavior</SectionTitle>
            {(['autosave', 'focusMode', 'sessionTracking'] as const).map((key) => (
              <SettingRow
                key={key}
                label={key.replace(/([A-Z])/g, ' $1')}
                right={
                  <Toggle on={settings[key]} onChange={(value) => handlePatch({ [key]: value })} />
                }
              />
            ))}
          </SectionCard>
        </div>

        <SectionCard>
          <SectionTitle>Privacy Controls</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-3">
            <SettingRow
              label="Data storage"
              right={
                <button
                  type="button"
                  onClick={() =>
                    handlePatch({
                      dataStorage: settings.dataStorage === 'local' ? 'cloud' : 'local',
                    })
                  }
                  style={{ color: 'var(--soouls-accent)' }}
                >
                  {settings.dataStorage}
                </button>
              }
            />
            <SettingRow
              label="Data usage"
              right={
                <button
                  type="button"
                  onClick={() =>
                    handlePatch({
                      dataUsage: settings.dataUsage === 'anonymous' ? 'full' : 'anonymous',
                    })
                  }
                  style={{ color: 'var(--soouls-accent)' }}
                >
                  {settings.dataUsage}
                </button>
              }
            />
            <SettingRow
              label="Cache"
              right={
                <button
                  type="button"
                  onClick={handleClearCache}
                  style={{ color: 'var(--soouls-accent)' }}
                >
                  {cacheMessage ?? 'Clear'}
                </button>
              }
            />
          </div>
        </SectionCard>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handlePatch(HOME_DEFAULT_SETTINGS)}
            className="rounded-full border px-7 py-3 text-sm font-medium"
            style={{ borderColor: 'var(--soouls-chip-divider)' }}
          >
            Reset App
          </button>
          <button
            type="button"
            onClick={handleClearCache}
            className="rounded-full border px-7 py-3 text-sm font-medium"
            style={{
              borderColor: 'rgba(var(--soouls-accent-rgb),0.4)',
              color: 'var(--soouls-accent)',
            }}
          >
            Clear Cache
          </button>
        </div>
      </main>
    </div>
  );
}
