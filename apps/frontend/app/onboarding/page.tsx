'use client';

import { useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpenText,
  Brain,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Flame,
  Loader2,
  MessageCircleHeart,
  Mic,
  MoonStar,
  PenSquare,
  Sparkles,
  Sunrise,
  Sunset,
  Wind,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  HOME_DEFAULT_SETTINGS,
  HOME_THEME_STORAGE_KEY,
  applyHomeTheme,
} from '../../src/hooks/use-home-theme';
import { trpc } from '../../src/utils/trpc';
import { SymbolLogo } from '../components/SymbolLogo';
import { GuideMascot } from './guide-mascot';

type ThemeColor = 'orange' | 'yellow' | 'green' | 'purple';

type Stage =
  | 'reason'
  | 'capture'
  | 'tone'
  | 'rhythm'
  | 'voice'
  | 'wake'
  | 'name'
  | 'space'
  | 'entry'
  | 'done';

type FlowAnswers = {
  reason?: string;
  capture?: string;
  tone?: ThemeColor;
  rhythm?: string;
  voice?: string;
};

type ChoiceCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  eyebrow?: string;
};

const QUESTION_STEPS: Stage[] = ['reason', 'capture', 'tone', 'rhythm', 'voice'];
const FLOW_SEQUENCE: Stage[] = [
  'reason',
  'capture',
  'tone',
  'rhythm',
  'voice',
  'wake',
  'name',
  'space',
  'entry',
  'done',
];

const EMBERS = [
  { left: '4%', top: '10%', size: 4, duration: 8.4, delay: 0.2 },
  { left: '14%', top: '82%', size: 5, duration: 10.2, delay: 0.4 },
  { left: '22%', top: '26%', size: 6, duration: 9.4, delay: 1.1 },
  { left: '36%', top: '74%', size: 7, duration: 8.8, delay: 0.8 },
  { left: '48%', top: '15%', size: 8, duration: 11.2, delay: 0.5 },
  { left: '59%', top: '57%', size: 5, duration: 9.8, delay: 1.7 },
  { left: '74%', top: '35%', size: 6, duration: 10.8, delay: 0.9 },
  { left: '84%', top: '18%', size: 5, duration: 8.6, delay: 1.5 },
  { left: '91%', top: '67%', size: 7, duration: 9.6, delay: 0.3 },
];

const THEME_COPY: Record<
  ThemeColor,
  {
    label: string;
    title: string;
    description: string;
  }
> = {
  orange: {
    label: 'Orange',
    title: 'Signal fire',
    description: 'Warm, direct, and alive. Best when you want clarity fast.',
  },
  yellow: {
    label: 'Gold',
    title: 'Clear horizon',
    description: 'Brighter and lighter. Good for calm review and steady reflection.',
  },
  green: {
    label: 'Green',
    title: 'Living archive',
    description: 'Grounded, restorative, and growth-oriented.',
  },
  purple: {
    label: 'Purple',
    title: 'Depth chamber',
    description: 'Quiet, introspective, and made for slower inner work.',
  },
};

function getStageNumber(stage: Stage): number {
  switch (stage) {
    case 'reason':
      return 1;
    case 'capture':
      return 2;
    case 'tone':
      return 3;
    case 'rhythm':
      return 4;
    case 'voice':
      return 5;
    case 'wake':
    case 'name':
      return 8;
    case 'space':
      return 9;
    case 'entry':
      return 10;
    case 'done':
      return 11;
    default:
      return 1;
  }
}

function deriveSettings(answers: FlowAnswers, theme: ThemeColor) {
  const reminderByRhythm: Record<string, string> = {
    morning: '07:30',
    midday: '13:00',
    evening: '20:00',
    night: '22:30',
  };

  return {
    themeMode: 'dark' as const,
    accentTheme: theme,
    writingMode: answers.capture === 'guided' ? ('guided' as const) : ('minimal' as const),
    defaultView: answers.capture === 'voice' ? ('list' as const) : ('canvas' as const),
    insightDepth:
      answers.voice === 'deep'
        ? ('deep' as const)
        : answers.voice === 'honest'
          ? ('balanced' as const)
          : ('minimal' as const),
    dailyReminder: answers.rhythm !== 'random',
    reflectionPrompts: answers.voice !== 'quiet',
    suggestions: answers.voice !== 'quiet',
    reminderTime:
      reminderByRhythm[answers.rhythm ?? 'evening'] ?? HOME_DEFAULT_SETTINGS.reminderTime,
  };
}

function BackgroundField() {
  return (
    <>
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_26%,rgba(94,18,10,0.58),transparent_32%),radial-gradient(circle_at_70%_66%,rgba(121,28,17,0.36),transparent_42%),linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.92)_42%,rgba(24,5,5,0.88)_100%)]" />
      <div className="absolute inset-y-0 right-0 w-[48%] bg-[radial-gradient(circle_at_40%_50%,rgba(104,15,10,0.3),transparent_56%)] opacity-90" />

      {EMBERS.map((ember) => (
        <motion.span
          key={`${ember.left}-${ember.top}`}
          className="absolute rounded-full bg-[rgba(236,140,102,0.9)] shadow-[0_0_18px_rgba(224,122,95,0.75)]"
          style={{
            left: ember.left,
            top: ember.top,
            width: ember.size,
            height: ember.size,
          }}
          animate={{
            opacity: [0.35, 0.95, 0.45],
            scale: [0.88, 1.28, 0.9],
            y: [0, -8, 0],
          }}
          transition={{
            duration: ember.duration,
            delay: ember.delay,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: 'mirror',
          }}
        />
      ))}

      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0,transparent_55%)]" />
    </>
  );
}

function ChoiceCard({ title, description, icon, selected, onClick, eyebrow }: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full rounded-[28px] border p-6 text-left transition-all duration-300"
      style={{
        borderColor: selected ? 'rgba(var(--soouls-accent-rgb), 0.48)' : 'rgba(255,255,255,0.04)',
        backgroundColor: selected ? 'rgba(43, 22, 18, 0.94)' : 'rgba(28, 16, 14, 0.9)',
        boxShadow: selected
          ? '0 0 0 1px rgba(var(--soouls-accent-rgb), 0.18), 0 18px 44px rgba(74, 22, 16, 0.38)'
          : '0 14px 38px rgba(73, 20, 13, 0.22)',
      }}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/5 bg-[rgba(255,255,255,0.04)]">
        <span style={{ color: 'var(--soouls-accent)' }}>{icon}</span>
      </div>

      {eyebrow ? (
        <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[var(--soouls-text-faint)]">
          {eyebrow}
        </p>
      ) : null}

      <h3
        className="text-[1.85rem] leading-[1.05] tracking-[-0.01em] text-white sm:text-[2rem]"
        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
      >
        {title}
      </h3>
      <p className="mt-3 max-w-[32rem] text-base leading-relaxed text-[rgba(239,235,221,0.68)]">
        {description}
      </p>
    </button>
  );
}

function ProgressHeader({ step }: { step: number }) {
  return (
    <div className="mb-8 flex flex-col items-center gap-4">
      <div className="text-[11px] uppercase tracking-[0.42em] text-[rgba(239,235,221,0.56)]">
        {`Stage ${String(step).padStart(2, '0')} - 05`}
      </div>
      <div className="flex items-center gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-[3px] rounded-full transition-all duration-300"
            style={{
              width: index < step ? 38 : 32,
              backgroundColor:
                index < step ? 'rgba(var(--soouls-accent-rgb), 0.96)' : 'rgba(255,255,255,0.14)',
            }}
          />
        ))}
      </div>
      <div
        className="text-sm uppercase tracking-[0.22em]"
        style={{
          fontFamily: 'var(--font-playfair)',
          fontStyle: 'italic',
          color: 'rgba(var(--soouls-accent-rgb), 0.9)',
        }}
      >
        The discovery
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { user, isLoaded } = useUser();

  const updateUser = trpc.private.users.update.useMutation();
  const updateSettings = trpc.private.home.updateSettings.useMutation();
  const createEntry = trpc.private.entries.create.useMutation();

  const [stage, setStage] = useState<Stage>('reason');
  const [answers, setAnswers] = useState<FlowAnswers>({});
  const [theme, setTheme] = useState<ThemeColor>('orange');
  const [mascotAwake, setMascotAwake] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [spaceName, setSpaceName] = useState('');
  const [firstEntry, setFirstEntry] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const isWaitlistUser = Boolean(user?.publicMetadata?.isWaitlistUser);
  const questionStep = QUESTION_STEPS.includes(stage) ? QUESTION_STEPS.indexOf(stage) + 1 : null;

  const previewTheme = useCallback(
    (accentTheme: ThemeColor, themeMode: 'dark' | 'light' = 'dark') => {
      applyHomeTheme({ accentTheme, themeMode });
      utils.private.home.getSettings.setData(undefined, (current) => ({
        ...(current ?? HOME_DEFAULT_SETTINGS),
        accentTheme,
        themeMode,
      }));

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          HOME_THEME_STORAGE_KEY,
          JSON.stringify({
            ...(HOME_DEFAULT_SETTINGS as object),
            accentTheme,
            themeMode,
          }),
        );
      }
    },
    [utils],
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.replace('/sign-up');
      return;
    }

    setNameInput((current) => current || user.firstName || user.fullName || '');
  }, [isLoaded, router, user]);

  useEffect(() => {
    previewTheme(theme, 'dark');
  }, [previewTheme, theme]);

  const canContinue = useMemo(() => {
    switch (stage) {
      case 'reason':
        return Boolean(answers.reason);
      case 'capture':
        return Boolean(answers.capture);
      case 'tone':
        return Boolean(answers.tone);
      case 'rhythm':
        return Boolean(answers.rhythm);
      case 'voice':
        return Boolean(answers.voice);
      default:
        return true;
    }
  }, [answers, stage]);

  const goNext = useCallback(() => {
    const index = FLOW_SEQUENCE.indexOf(stage);
    const next = FLOW_SEQUENCE[index + 1];
    if (next) {
      setStage(next);
      setSaveError(null);
    }
  }, [stage]);

  const goBack = useCallback(() => {
    const index = FLOW_SEQUENCE.indexOf(stage);
    const previous = FLOW_SEQUENCE[index - 1];
    if (previous) {
      setStage(previous);
      setSaveError(null);
    }
  }, [stage]);

  const chooseAnswer = useCallback(
    <T extends keyof FlowAnswers>(key: T, value: FlowAnswers[T]) => {
      setAnswers((current) => ({ ...current, [key]: value }));
      if (key === 'tone' && value) {
        const nextTheme = value as ThemeColor;
        setTheme(nextTheme);
        previewTheme(nextTheme, 'dark');
      }
    },
    [previewTheme],
  );

  const handleWake = useCallback(() => {
    setMascotAwake(true);
    setStage('name');
  }, []);

  const handleFinish = useCallback(async () => {
    if (!user || !firstEntry.trim()) return;

    const trimmedName = nameInput.trim() || user.firstName || user.fullName || 'Explorer';
    const trimmedSpace = spaceName.trim() || `${trimmedName}'s Room`;
    const settingsPatch = deriveSettings(answers, theme);

    setIsFinishing(true);
    setSaveError(null);

    try {
      await Promise.all([
        updateUser.mutateAsync({
          name: trimmedName,
          mascot: 'Orbi',
          themePreference: theme,
        }),
        updateSettings.mutateAsync(settingsPatch),
      ]);

      await createEntry.mutateAsync({
        type: 'entry',
        content: JSON.stringify({
          textContent: firstEntry.trim(),
          blocks: [
            {
              type: 'paragraph',
              content: firstEntry.trim(),
            },
          ],
          metadata: {
            source: 'onboarding',
            isGenesis: true,
            isWaitlistUser,
            guide: 'Orbi',
            roomName: trimmedSpace,
            answers: {
              ...answers,
              tone: theme,
            },
          },
        }),
      });

      previewTheme(theme, settingsPatch.themeMode);
      utils.private.home.getSettings.setData(undefined, {
        ...HOME_DEFAULT_SETTINGS,
        ...settingsPatch,
      });

      await Promise.all([
        utils.private.entries.getAll.invalidate(),
        utils.private.entries.getGalaxy.invalidate(),
        utils.private.home.getInsights.invalidate(),
        utils.private.home.getAccount.invalidate(),
        utils.private.home.getClusters.invalidate(),
      ]);

      setStage('done');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'We could not finish setup yet.');
    } finally {
      setIsFinishing(false);
    }
  }, [
    answers,
    createEntry,
    firstEntry,
    isWaitlistUser,
    nameInput,
    previewTheme,
    spaceName,
    theme,
    updateSettings,
    updateUser,
    user,
    utils.private.entries.getAll,
    utils.private.entries.getGalaxy,
    utils.private.home.getAccount,
    utils.private.home.getClusters,
    utils.private.home.getInsights,
    utils.private.home.getSettings,
  ]);

  const titleTone = theme === 'orange' ? 'today' : THEME_COPY[theme].title.toLowerCase();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <BackgroundField />

      <div className="relative z-10 min-h-screen px-5 pb-24 pt-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col lg:flex-row lg:gap-16">
          <div className="hidden flex-1 lg:flex lg:flex-col lg:justify-start">
            <Link href="/" className="pt-6">
              <div className="text-[88px] font-semibold leading-none tracking-[-0.06em] text-[#e8d5b4]">
                Soouls
              </div>
            </Link>
          </div>

          <div className="flex w-full flex-1 flex-col items-center justify-center lg:justify-start lg:pt-20">
            <div className="mb-10 flex w-full items-center justify-between lg:hidden">
              <Link
                href="/"
                className="text-[52px] font-semibold leading-none tracking-[-0.06em] text-[#e8d5b4]"
              >
                Soouls
              </Link>
            </div>

            {questionStep ? <ProgressHeader step={questionStep} /> : null}

            <div className="w-full max-w-[1040px]">
              <AnimatePresence mode="wait">
                {stage === 'reason' ? (
                  <motion.section
                    key="reason"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28 }}
                  >
                    <div className="mb-10 text-center">
                      <h1
                        className="text-[46px] leading-[0.98] text-white drop-shadow-[0_10px_26px_rgba(255,255,255,0.16)] sm:text-[68px] lg:text-[78px]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        Why are you here{' '}
                        <span style={{ color: 'var(--soouls-accent)', fontStyle: 'italic' }}>
                          today
                        </span>
                        ?
                      </h1>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      <ChoiceCard
                        icon={<Wind className="h-7 w-7" />}
                        title="clear my mind"
                        description="My head is too loud right now and I need to get something out before it swallows me."
                        selected={answers.reason === 'mind'}
                        onClick={() => chooseAnswer('reason', 'mind')}
                      />
                      <ChoiceCard
                        icon={<Brain className="h-7 w-7" />}
                        title="track habits and growth"
                        description="I do not understand why I keep doing this. I want to figure out a pattern in myself."
                        selected={answers.reason === 'growth'}
                        onClick={() => chooseAnswer('reason', 'growth')}
                      />
                      <ChoiceCard
                        icon={<BookOpenText className="h-7 w-7" />}
                        title="process emotion and self reflection"
                        description="Something just changed. I am at a beginning and want to document it properly."
                        selected={answers.reason === 'reflection'}
                        onClick={() => chooseAnswer('reason', 'reflection')}
                      />
                      <ChoiceCard
                        icon={<Sparkles className="h-7 w-7" />}
                        title="creative writing"
                        description="I just want to write. No reason. I just want to create something that is only mine."
                        selected={answers.reason === 'writing'}
                        onClick={() => chooseAnswer('reason', 'writing')}
                      />
                    </div>
                  </motion.section>
                ) : null}

                {stage === 'capture' ? (
                  <motion.section
                    key="capture"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28 }}
                  >
                    <div className="mb-10 text-center">
                      <h1
                        className="text-[40px] leading-[1] text-white sm:text-[60px] lg:text-[68px]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        How do you want to{' '}
                        <span style={{ color: 'var(--soouls-accent)', fontStyle: 'italic' }}>
                          capture it
                        </span>
                        ?
                      </h1>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      <ChoiceCard
                        icon={<PenSquare className="h-7 w-7" />}
                        eyebrow="Minimal"
                        title="blank page first"
                        description="Let me write freely and shape it later."
                        selected={answers.capture === 'minimal'}
                        onClick={() => chooseAnswer('capture', 'minimal')}
                      />
                      <ChoiceCard
                        icon={<MessageCircleHeart className="h-7 w-7" />}
                        eyebrow="Guided"
                        title="soft prompts"
                        description="A few good questions help me say the real thing faster."
                        selected={answers.capture === 'guided'}
                        onClick={() => chooseAnswer('capture', 'guided')}
                      />
                      <ChoiceCard
                        icon={<Mic className="h-7 w-7" />}
                        eyebrow="Quick capture"
                        title="voice first"
                        description="My thoughts land faster when I can speak them."
                        selected={answers.capture === 'voice'}
                        onClick={() => chooseAnswer('capture', 'voice')}
                      />
                      <ChoiceCard
                        icon={<Sparkles className="h-7 w-7" />}
                        eyebrow="Mixed"
                        title="a little of everything"
                        description="Words, sketches, fragments, and patterns all belong in the same room."
                        selected={answers.capture === 'mixed'}
                        onClick={() => chooseAnswer('capture', 'mixed')}
                      />
                    </div>
                  </motion.section>
                ) : null}

                {stage === 'tone' ? (
                  <motion.section
                    key="tone"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28 }}
                  >
                    <div className="mb-10 text-center">
                      <h1
                        className="text-[40px] leading-[1] text-white sm:text-[60px] lg:text-[68px]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        Pick the room&apos;s{' '}
                        <span style={{ color: 'var(--soouls-accent)', fontStyle: 'italic' }}>
                          color signal
                        </span>
                        .
                      </h1>
                      <p className="mt-4 text-sm tracking-[0.14em] text-[rgba(239,235,221,0.62)] uppercase">
                        This becomes your app accent everywhere.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      {(
                        Object.entries(THEME_COPY) as Array<
                          [ThemeColor, (typeof THEME_COPY)[ThemeColor]]
                        >
                      ).map(([key, item]) => {
                        const selected = answers.tone === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => chooseAnswer('tone', key)}
                            className="rounded-[28px] border p-6 text-left transition-all duration-300"
                            style={{
                              borderColor: selected
                                ? 'rgba(var(--soouls-accent-rgb), 0.48)'
                                : 'rgba(255,255,255,0.04)',
                              backgroundColor: selected
                                ? 'rgba(43, 22, 18, 0.94)'
                                : 'rgba(28, 16, 14, 0.9)',
                              boxShadow: selected
                                ? '0 0 0 1px rgba(var(--soouls-accent-rgb), 0.18), 0 18px 44px rgba(74, 22, 16, 0.38)'
                                : '0 14px 38px rgba(73, 20, 13, 0.22)',
                            }}
                          >
                            <div className="mb-6 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span
                                  className="h-4 w-4 rounded-full"
                                  style={{
                                    backgroundColor:
                                      key === 'orange'
                                        ? '#e07a5f'
                                        : key === 'yellow'
                                          ? '#d9a23d'
                                          : key === 'green'
                                            ? '#73b27c'
                                            : '#8c72d8',
                                  }}
                                />
                                <span className="text-xs uppercase tracking-[0.32em] text-[rgba(239,235,221,0.58)]">
                                  {item.label}
                                </span>
                              </div>
                              <div
                                className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.26em]"
                                style={{
                                  borderColor: 'rgba(var(--soouls-accent-rgb), 0.32)',
                                  color: 'var(--soouls-accent)',
                                }}
                              >
                                Main UI
                              </div>
                            </div>

                            <h3
                              className="text-[1.85rem] leading-[1.05] text-white sm:text-[2rem]"
                              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                            >
                              {item.title}
                            </h3>
                            <p className="mt-3 text-base leading-relaxed text-[rgba(239,235,221,0.68)]">
                              {item.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </motion.section>
                ) : null}

                {stage === 'rhythm' ? (
                  <motion.section
                    key="rhythm"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28 }}
                  >
                    <div className="mb-10 text-center">
                      <h1
                        className="text-[40px] leading-[1] text-white sm:text-[60px] lg:text-[68px]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        When does the real{' '}
                        <span style={{ color: 'var(--soouls-accent)', fontStyle: 'italic' }}>
                          reflection
                        </span>{' '}
                        show up?
                      </h1>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      <ChoiceCard
                        icon={<Sunrise className="h-7 w-7" />}
                        eyebrow="Reminder 7:30 AM"
                        title="morning"
                        description="Before the day reaches me."
                        selected={answers.rhythm === 'morning'}
                        onClick={() => chooseAnswer('rhythm', 'morning')}
                      />
                      <ChoiceCard
                        icon={<Clock3 className="h-7 w-7" />}
                        eyebrow="No fixed reminder"
                        title="whenever it hits"
                        description="I need quick capture more than routine."
                        selected={answers.rhythm === 'random'}
                        onClick={() => chooseAnswer('rhythm', 'random')}
                      />
                      <ChoiceCard
                        icon={<Sunset className="h-7 w-7" />}
                        eyebrow="Reminder 8:00 PM"
                        title="evening"
                        description="After the noise ends and I can look back clearly."
                        selected={answers.rhythm === 'evening'}
                        onClick={() => chooseAnswer('rhythm', 'evening')}
                      />
                      <ChoiceCard
                        icon={<MoonStar className="h-7 w-7" />}
                        eyebrow="Reminder 10:30 PM"
                        title="late night"
                        description="When it gets quiet enough to tell the truth."
                        selected={answers.rhythm === 'night'}
                        onClick={() => chooseAnswer('rhythm', 'night')}
                      />
                    </div>
                  </motion.section>
                ) : null}

                {stage === 'voice' ? (
                  <motion.section
                    key="voice"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28 }}
                  >
                    <div className="mb-10 text-center">
                      <h1
                        className="text-[40px] leading-[1] text-white sm:text-[60px] lg:text-[68px]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        How should Soouls{' '}
                        <span style={{ color: 'var(--soouls-accent)', fontStyle: 'italic' }}>
                          speak
                        </span>{' '}
                        back?
                      </h1>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      <ChoiceCard
                        icon={<MoonStar className="h-7 w-7" />}
                        eyebrow="Minimal AI"
                        title="quiet"
                        description="Stay out of my way unless I ask."
                        selected={answers.voice === 'quiet'}
                        onClick={() => chooseAnswer('voice', 'quiet')}
                      />
                      <ChoiceCard
                        icon={<MessageCircleHeart className="h-7 w-7" />}
                        eyebrow="Light prompts"
                        title="gentle"
                        description="Ask soft questions that help me open the door."
                        selected={answers.voice === 'gentle'}
                        onClick={() => chooseAnswer('voice', 'gentle')}
                      />
                      <ChoiceCard
                        icon={<Flame className="h-7 w-7" />}
                        eyebrow="Balanced insight"
                        title="honest"
                        description="Tell me the thing I am trying not to say."
                        selected={answers.voice === 'honest'}
                        onClick={() => chooseAnswer('voice', 'honest')}
                      />
                      <ChoiceCard
                        icon={<Brain className="h-7 w-7" />}
                        eyebrow="Deep analysis"
                        title="deep"
                        description="Pattern-match the whole room and push further."
                        selected={answers.voice === 'deep'}
                        onClick={() => chooseAnswer('voice', 'deep')}
                      />
                    </div>
                  </motion.section>
                ) : null}

                {stage === 'wake' ? (
                  <motion.section
                    key="wake"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28 }}
                    className="mx-auto max-w-[760px]"
                  >
                    <div
                      className="rounded-[32px] border px-7 py-10 text-center sm:px-10"
                      style={{
                        borderColor: 'rgba(255,255,255,0.06)',
                        backgroundColor: 'rgba(28, 16, 14, 0.9)',
                        boxShadow: '0 18px 48px rgba(74, 22, 16, 0.34)',
                      }}
                    >
                      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(var(--soouls-accent-rgb),0.26)] bg-[rgba(var(--soouls-accent-rgb),0.08)]">
                        <Sparkles className="h-7 w-7" style={{ color: 'var(--soouls-accent)' }} />
                      </div>
                      <h2
                        className="text-[2.6rem] leading-[1] text-white sm:text-[3.2rem]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        Your guide is waiting.
                      </h2>
                      <p className="mx-auto mt-4 max-w-[34rem] text-base leading-relaxed text-[rgba(239,235,221,0.72)]">
                        Orbi is already tracking your signal from the corner. Wake the mascot when
                        you want the room to feel alive.
                      </p>

                      <div className="mt-8 flex flex-col items-center gap-4">
                        <button
                          type="button"
                          onClick={handleWake}
                          className="inline-flex items-center gap-2 rounded-full border px-7 py-3 text-sm uppercase tracking-[0.26em]"
                          style={{
                            borderColor: 'rgba(var(--soouls-accent-rgb), 0.4)',
                            backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.08)',
                            color: 'var(--soouls-accent)',
                          }}
                        >
                          Wake Orbi
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        <p className="text-xs uppercase tracking-[0.26em] text-[rgba(239,235,221,0.44)]">
                          Or tap the mascot in the right corner
                        </p>
                      </div>
                    </div>
                  </motion.section>
                ) : null}

                {stage === 'name' ? (
                  <motion.section
                    key="name"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28 }}
                    className="mx-auto max-w-[760px]"
                  >
                    <div
                      className="rounded-[32px] border px-7 py-10 text-center sm:px-10"
                      style={{
                        borderColor: 'rgba(255,255,255,0.06)',
                        backgroundColor: 'rgba(28, 16, 14, 0.9)',
                        boxShadow: '0 18px 48px rgba(74, 22, 16, 0.34)',
                      }}
                    >
                      {isWaitlistUser ? (
                        <div
                          className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.24em]"
                          style={{
                            borderColor: 'rgba(var(--soouls-accent-rgb), 0.3)',
                            backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.08)',
                            color: 'var(--soouls-accent)',
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Early believer
                        </div>
                      ) : null}

                      <h2
                        className="text-[2.6rem] leading-[1] text-white sm:text-[3.2rem]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        What should Orbi call you?
                      </h2>
                      <p className="mx-auto mt-4 max-w-[34rem] text-base leading-relaxed text-[rgba(239,235,221,0.72)]">
                        This name gets saved to your account and follows your archive everywhere.
                      </p>

                      <div className="mt-8">
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(event) => setNameInput(event.target.value)}
                          placeholder="Your name"
                          className="w-full rounded-[22px] border bg-[rgba(255,255,255,0.03)] px-5 py-4 text-center text-2xl text-white outline-none transition-all placeholder:text-[rgba(239,235,221,0.28)]"
                          style={{
                            borderColor: 'rgba(255,255,255,0.08)',
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' && nameInput.trim()) {
                              setStage('space');
                            }
                          }}
                        />
                      </div>

                      <div className="mt-8 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setStage('wake')}
                          className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-xs uppercase tracking-[0.24em] text-[rgba(239,235,221,0.55)]"
                          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setStage('space')}
                          disabled={!nameInput.trim()}
                          className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm uppercase tracking-[0.24em] text-white disabled:opacity-40"
                          style={{
                            backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.92)',
                          }}
                        >
                          Continue
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.section>
                ) : null}

                {stage === 'space' ? (
                  <motion.section
                    key="space"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28 }}
                    className="mx-auto max-w-[760px]"
                  >
                    <div
                      className="rounded-[32px] border px-7 py-10 text-center sm:px-10"
                      style={{
                        borderColor: 'rgba(255,255,255,0.06)',
                        backgroundColor: 'rgba(28, 16, 14, 0.9)',
                        boxShadow: '0 18px 48px rgba(74, 22, 16, 0.34)',
                      }}
                    >
                      <h2
                        className="text-[2.6rem] leading-[1] text-white sm:text-[3.2rem]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        Name this first room.
                      </h2>
                      <p className="mx-auto mt-4 max-w-[34rem] text-base leading-relaxed text-[rgba(239,235,221,0.72)]">
                        A name helps the archive feel like yours from the start.
                      </p>

                      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                        {[`${nameInput.trim() || 'My'} room`, 'The archive', 'Quiet orbit'].map(
                          (preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setSpaceName(preset)}
                              className="rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] text-[rgba(239,235,221,0.68)]"
                              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                            >
                              {preset}
                            </button>
                          ),
                        )}
                      </div>

                      <div className="mt-6">
                        <input
                          type="text"
                          value={spaceName}
                          onChange={(event) => setSpaceName(event.target.value)}
                          placeholder="Name it what it feels like"
                          className="w-full rounded-[22px] border bg-[rgba(255,255,255,0.03)] px-5 py-4 text-center text-2xl text-white outline-none transition-all placeholder:text-[rgba(239,235,221,0.28)]"
                          style={{
                            borderColor: 'rgba(255,255,255,0.08)',
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' && spaceName.trim()) {
                              setStage('entry');
                            }
                          }}
                        />
                      </div>

                      <div className="mt-8 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setStage('name')}
                          className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-xs uppercase tracking-[0.24em] text-[rgba(239,235,221,0.55)]"
                          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setStage('entry')}
                          disabled={!spaceName.trim()}
                          className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm uppercase tracking-[0.24em] text-white disabled:opacity-40"
                          style={{
                            backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.92)',
                          }}
                        >
                          Continue
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.section>
                ) : null}

                {stage === 'entry' ? (
                  <motion.section
                    key="entry"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28 }}
                    className="mx-auto max-w-[900px]"
                  >
                    <div
                      className="rounded-[32px] border px-7 py-10 text-center sm:px-10"
                      style={{
                        borderColor: 'rgba(255,255,255,0.06)',
                        backgroundColor: 'rgba(28, 16, 14, 0.9)',
                        boxShadow: '0 18px 48px rgba(74, 22, 16, 0.34)',
                      }}
                    >
                      <div className="mb-4 text-xs uppercase tracking-[0.34em] text-[rgba(239,235,221,0.46)]">
                        {spaceName.trim() || `${nameInput.trim() || 'My'} room`}
                      </div>
                      <h2
                        className="text-[2.6rem] leading-[1] text-white sm:text-[3.2rem]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        Leave the first real sentence.
                      </h2>
                      <p className="mx-auto mt-4 max-w-[36rem] text-base leading-relaxed text-[rgba(239,235,221,0.72)]">
                        We save this as your first entry and encrypt it before it lands in your
                        archive.
                      </p>

                      <div className="mt-8">
                        <textarea
                          value={firstEntry}
                          onChange={(event) => setFirstEntry(event.target.value)}
                          placeholder="Even 'I do not know why I am here yet' is enough to begin."
                          className="min-h-[220px] w-full rounded-[28px] border bg-[rgba(255,255,255,0.03)] px-6 py-6 text-lg leading-relaxed text-white outline-none transition-all placeholder:text-[rgba(239,235,221,0.28)]"
                          style={{
                            borderColor: 'rgba(255,255,255,0.08)',
                          }}
                        />
                      </div>

                      {saveError ? (
                        <div
                          className="mt-5 rounded-2xl border px-4 py-3 text-sm text-[#ffb6a0]"
                          style={{
                            borderColor: 'rgba(255, 136, 108, 0.32)',
                            backgroundColor: 'rgba(124, 33, 19, 0.28)',
                          }}
                        >
                          {saveError}
                        </div>
                      ) : null}

                      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => setStage('space')}
                          className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-xs uppercase tracking-[0.24em] text-[rgba(239,235,221,0.55)]"
                          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleFinish}
                          disabled={!firstEntry.trim() || isFinishing}
                          className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm uppercase tracking-[0.24em] text-white disabled:opacity-40"
                          style={{
                            backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.92)',
                          }}
                        >
                          {isFinishing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          {isFinishing ? 'Saving' : 'Launch room'}
                          {!isFinishing ? <ArrowRight className="h-4 w-4" /> : null}
                        </button>
                      </div>
                    </div>
                  </motion.section>
                ) : null}

                {stage === 'done' ? (
                  <motion.section
                    key="done"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28 }}
                    className="mx-auto max-w-[760px]"
                  >
                    <div
                      className="rounded-[32px] border px-7 py-10 text-center sm:px-10"
                      style={{
                        borderColor: 'rgba(255,255,255,0.06)',
                        backgroundColor: 'rgba(28, 16, 14, 0.9)',
                        boxShadow: '0 18px 48px rgba(74, 22, 16, 0.34)',
                      }}
                    >
                      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(var(--soouls-accent-rgb),0.26)] bg-[rgba(var(--soouls-accent-rgb),0.08)]">
                        <CheckCircle2
                          className="h-7 w-7"
                          style={{ color: 'var(--soouls-accent)' }}
                        />
                      </div>
                      <h2
                        className="text-[2.6rem] leading-[1] text-white sm:text-[3.2rem]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        Your room is live.
                      </h2>
                      <p className="mx-auto mt-4 max-w-[35rem] text-base leading-relaxed text-[rgba(239,235,221,0.72)]">
                        We saved your profile, synced your theme, and encrypted the first entry in
                        your archive.
                      </p>

                      <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
                        {[
                          'Profile saved to your account',
                          `Main UI color set to ${THEME_COPY[theme].label}`,
                          'First entry encrypted and stored',
                        ].map((item) => (
                          <div
                            key={item}
                            className="rounded-2xl border px-4 py-4 text-sm text-[rgba(239,235,221,0.74)]"
                            style={{
                              borderColor: 'rgba(255,255,255,0.06)',
                              backgroundColor: 'rgba(255,255,255,0.03)',
                            }}
                          >
                            {item}
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => router.push('/home')}
                          className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm uppercase tracking-[0.24em] text-white"
                          style={{
                            backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.92)',
                          }}
                        >
                          Enter home
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.section>
                ) : null}
              </AnimatePresence>
            </div>

            {questionStep ? (
              <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-5">
                <div
                  className="pointer-events-auto flex w-full max-w-[320px] items-center justify-between rounded-full border px-3 py-3 backdrop-blur-xl sm:max-w-[330px]"
                  style={{
                    borderColor: 'rgba(255,255,255,0.08)',
                    backgroundColor: 'rgba(20, 11, 10, 0.88)',
                    boxShadow: '0 18px 36px rgba(50, 16, 11, 0.34)',
                  }}
                >
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={questionStep === 1}
                    className="inline-flex items-center gap-2 px-4 text-xs uppercase tracking-[0.26em] text-[rgba(239,235,221,0.5)] disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canContinue}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs uppercase tracking-[0.26em] text-white disabled:opacity-40"
                    style={{ backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.96)' }}
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <GuideMascot
        theme={theme}
        step={getStageNumber(stage)}
        awake={mascotAwake}
        isWaitlistUser={isWaitlistUser}
        name={nameInput.trim() || user?.firstName || undefined}
        firstEntry={firstEntry.trim() || undefined}
        onWake={stage === 'wake' ? handleWake : undefined}
      />

      <div className="sr-only">{titleTone}</div>
    </div>
  );
}
