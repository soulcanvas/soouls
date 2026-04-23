'use client';

import { UserButton } from '@clerk/nextjs';
import { Bell, ChevronDown, Clock, Moon, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { trpc } from '../../../src/utils/trpc';

const FONT_URBANIST = "'Urbanist', system-ui, sans-serif";

type AppPrefs = {
  theme: 'Dark' | 'Light';
  defaultView: 'Canvas' | 'List' | 'Calendar';
  writingMode: 'Minimal' | 'Guided';
  insightDepth: 'Minimal' | 'Balanced' | 'Deep';
  autoClustering: boolean;
  suggestions: boolean;
  autosave: boolean;
  focusMode: boolean;
  sessionTracking: boolean;
  dataStorage: 'Local Only' | 'Cloud';
  dataUsage: 'Anonymous' | 'Full';
};

const DEFAULT_PREFS: AppPrefs = {
  theme: 'Dark',
  defaultView: 'Canvas',
  writingMode: 'Minimal',
  insightDepth: 'Balanced',
  autoClustering: true,
  suggestions: true,
  autosave: true,
  focusMode: false,
  sessionTracking: true,
  dataStorage: 'Local Only',
  dataUsage: 'Anonymous',
};

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 rounded-full transition-colors duration-200 focus:outline-none ${on ? 'bg-[#e07a5f]' : 'bg-white/10'}`}
      aria-checked={on}
      role="switch"
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  );
}

function SectionCard({
  children,
  className = '',
}: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-[#1a1a1a] border border-white/5 p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-white font-urbanist font-semibold text-base mb-5">{children}</h2>;
}

function SettingRow({
  label,
  right,
  sublabel,
  icon,
}: {
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-b-0">
      <div className="flex items-center gap-3">
        {icon && <span className="text-[#e07a5f]">{icon}</span>}
        <div>
          <p className="text-white font-urbanist font-medium text-sm">{label}</p>
          {sublabel && <p className="text-white/40 font-urbanist text-xs mt-0.5">{sublabel}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<AppPrefs>(DEFAULT_PREFS);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [notifDailyReminder, setNotifDailyReminder] = useState(false);
  const [notifReflectionPrompts, setNotifReflectionPrompts] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('soouls_settings');
      if (raw) {
        setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
      }
    } catch {}
    setPrefsLoaded(true);
  }, []);

  useEffect(() => {
    if (!prefsLoaded) return;
    try {
      localStorage.setItem('soouls_settings', JSON.stringify(prefs));
    } catch {}
  }, [prefs, prefsLoaded]);

  const { data: centerData } = trpc.private.messaging.getCenter.useQuery(undefined);

  useEffect(() => {
    if (!centerData) return;
    setNotifDailyReminder(centerData.preferences.transactionalEmailOptIn);
    setNotifReflectionPrompts(centerData.preferences.marketingEmailOptIn);
  }, [centerData]);

  const updatePrefsMutation = trpc.private.messaging.updatePreferences.useMutation();

  const handleNotifChange = useCallback(
    (field: 'daily' | 'reflection', value: boolean) => {
      const next = {
        daily: field === 'daily' ? value : notifDailyReminder,
        reflection: field === 'reflection' ? value : notifReflectionPrompts,
      };
      if (field === 'daily') setNotifDailyReminder(value);
      else setNotifReflectionPrompts(value);

      updatePrefsMutation.mutate({
        transactionalEmailOptIn: next.daily,
        marketingEmailOptIn: next.reflection,
        transactionalWhatsappOptIn: centerData?.preferences.transactionalWhatsappOptIn ?? false,
        marketingWhatsappOptIn: centerData?.preferences.marketingWhatsappOptIn ?? false,
        phoneNumber: centerData?.preferences.phoneNumber ?? null,
      });
    },
    [notifDailyReminder, notifReflectionPrompts, centerData, updatePrefsMutation],
  );

  function setPref<K extends keyof AppPrefs>(key: K, value: AppPrefs[K]) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  function handleResetApp() {
    setPrefs(DEFAULT_PREFS);
    localStorage.removeItem('soouls_settings');
  }

  function handleClearCache() {
    try {
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        if (k.startsWith('soouls_')) localStorage.removeItem(k);
      }
      setPrefs(DEFAULT_PREFS);
    } catch {}
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,600&family=Urbanist:wght@300;400;500;600&display=swap"
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
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Home
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-[#e07a5f] text-lg">Settings</span>
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
          {/* Page Header */}
          <div>
            <h1
              className="font-playfair text-4xl italic text-white leading-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: 'italic',
                fontWeight: 600,
              }}
            >
              Settings
            </h1>
            <p className="text-[#e07a5f] text-sm mt-1">Control how Soouls works for you.</p>
          </div>

          {/* Preferences */}
          <SectionCard>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-4">Preferences</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 sm:divide-x sm:divide-white/5">
              <div className="sm:pr-6 pb-4 sm:pb-0 border-b border-white/5 sm:border-b-0">
                <p className="text-white/40 text-xs mb-3">Theme</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#e07a5f] text-2xl font-semibold">{prefs.theme}</span>
                  <Moon className="w-5 h-5 text-[#e07a5f]" />
                </div>
              </div>

              <div className="sm:px-6 pb-4 sm:pb-0 border-b border-white/5 sm:border-b-0">
                <p className="text-white/40 text-xs mb-3">Default view</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#e07a5f] text-2xl font-semibold">{prefs.defaultView}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const views: AppPrefs['defaultView'][] = ['Canvas', 'List', 'Calendar'];
                      const idx = views.indexOf(prefs.defaultView);
                      setPref('defaultView', views[(idx + 1) % views.length] ?? 'Canvas');
                    }}
                    className="text-[#e07a5f] hover:text-white transition-colors"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="sm:pl-6">
                <p className="text-white/40 text-xs mb-3">Writing Mode</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPref('writingMode', 'Minimal')}
                    className={`text-sm font-medium transition-colors ${
                      prefs.writingMode === 'Minimal'
                        ? 'text-[#e07a5f]'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    Minimal
                  </button>
                  <span className="text-white/20">/</span>
                  <button
                    type="button"
                    onClick={() => setPref('writingMode', 'Guided')}
                    className={`text-sm font-medium transition-colors ${
                      prefs.writingMode === 'Guided'
                        ? 'text-[#e07a5f]'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    Guided
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Notifications */}
          <SectionCard>
            <SectionTitle>Notifications</SectionTitle>

            <SettingRow
              label="Daily reminder"
              sublabel="Gentle nudge to reflect on your day"
              icon={<Bell className="w-4 h-4" />}
              right={
                <Toggle on={notifDailyReminder} onChange={(v) => handleNotifChange('daily', v)} />
              }
            />

            <SettingRow
              label="Reflection prompts"
              sublabel="AI-generated questions for deeper thought"
              icon={<Sparkles className="w-4 h-4" />}
              right={
                <Toggle
                  on={notifReflectionPrompts}
                  onChange={(v) => handleNotifChange('reflection', v)}
                />
              }
            />

            <SettingRow
              label="Time selector"
              sublabel="When should we reach out?"
              icon={<Clock className="w-4 h-4" />}
              right={
                <span className="text-[#e07a5f] text-xs bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  8:00 PM
                </span>
              }
            />
          </SectionCard>

          {/* AI Behavior + App Behavior */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SectionCard>
              <SectionTitle>AI Behavior</SectionTitle>

              <div className="mb-4">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-3">
                  Insight depth
                </p>
                <div className="flex items-center bg-[#111] rounded-xl p-1 gap-1">
                  {(['Minimal', 'Balanced', 'Deep'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPref('insightDepth', level)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        prefs.insightDepth === level
                          ? 'bg-[#e07a5f] text-white shadow-sm'
                          : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <SettingRow
                label="Auto clustering"
                right={
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${prefs.autoClustering ? 'text-[#e07a5f]' : 'text-white/30'}`}
                    >
                      {prefs.autoClustering ? 'ON' : 'OFF'}
                    </span>
                    <Toggle
                      on={prefs.autoClustering}
                      onChange={(v) => setPref('autoClustering', v)}
                    />
                  </div>
                }
              />

              <SettingRow
                label="Suggestions"
                right={
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${prefs.suggestions ? 'text-[#e07a5f]' : 'text-white/30'}`}
                    >
                      {prefs.suggestions ? 'ON' : 'OFF'}
                    </span>
                    <Toggle on={prefs.suggestions} onChange={(v) => setPref('suggestions', v)} />
                  </div>
                }
              />
            </SectionCard>

            <SectionCard>
              <SectionTitle>App Behavior</SectionTitle>

              <SettingRow
                label="Autosave"
                right={
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${prefs.autosave ? 'text-[#e07a5f]' : 'text-white/30'}`}
                    >
                      {prefs.autosave ? 'ON' : 'OFF'}
                    </span>
                    <Toggle on={prefs.autosave} onChange={(v) => setPref('autosave', v)} />
                  </div>
                }
              />

              <SettingRow
                label="Focus mode"
                right={
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${prefs.focusMode ? 'text-[#e07a5f]' : 'text-white/30'}`}
                    >
                      {prefs.focusMode ? 'ON' : 'OFF'}
                    </span>
                    <Toggle on={prefs.focusMode} onChange={(v) => setPref('focusMode', v)} />
                  </div>
                }
              />
              <SettingRow
                label="Session tracking"
                right={
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${prefs.sessionTracking ? 'text-[#e07a5f]' : 'text-white/30'}`}
                    >
                      {prefs.sessionTracking ? 'ON' : 'OFF'}
                    </span>
                    <Toggle
                      on={prefs.sessionTracking}
                      onChange={(v) => setPref('sessionTracking', v)}
                    />
                  </div>
                }
              />
            </SectionCard>
          </div>

          {/* Privacy Controls */}
          <SectionCard>
            <SectionTitle>Privacy Controls</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 sm:divide-x sm:divide-white/5">
              <div className="sm:pr-6 pb-4 sm:pb-0 border-b border-white/5 sm:border-b-0">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Data storage</p>
                <div className="flex items-center justify-between">
                  <span className="text-white text-base font-semibold">{prefs.dataStorage}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPref(
                        'dataStorage',
                        prefs.dataStorage === 'Local Only' ? 'Cloud' : 'Local Only',
                      )
                    }
                    className="text-[#e07a5f] text-xs underline underline-offset-2 hover:text-white transition-colors"
                  >
                    Switch
                  </button>
                </div>
              </div>

              <div className="sm:px-6 pb-4 sm:pb-0 border-b border-white/5 sm:border-b-0">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Data usage</p>
                <div className="flex items-center justify-between">
                  <span className="text-white text-base font-semibold">{prefs.dataUsage}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPref('dataUsage', prefs.dataUsage === 'Anonymous' ? 'Full' : 'Anonymous')
                    }
                    className="w-6 h-1.5 rounded-full bg-[#e07a5f] hover:bg-[#c96a4f] transition-colors"
                    aria-label="Toggle data usage"
                  />
                </div>
              </div>

              <div className="sm:pl-6">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-3">
                  Clear history
                </p>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="text-white/40 text-sm hover:text-[#e07a5f] transition-colors"
                >
                  Clear all data →
                </button>
              </div>
            </div>
          </SectionCard>

          {/* Bottom Actions */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleResetApp}
              className="px-8 py-3 rounded-full border border-white/20 text-white text-sm font-medium hover:bg-white/5 hover:border-white/40 transition-all duration-200"
            >
              Reset App
            </button>
            <button
              type="button"
              onClick={handleClearCache}
              className="px-8 py-3 rounded-full border border-[#e07a5f]/40 text-[#e07a5f] text-sm font-medium hover:bg-[#e07a5f]/10 hover:border-[#e07a5f]/60 transition-all duration-200"
            >
              Clear Cache
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
