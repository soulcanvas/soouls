type AccentTheme = 'orange' | 'yellow' | 'green' | 'purple';
type ThemeMode = 'dark' | 'light';
type DefaultView = 'canvas' | 'list' | 'calendar';
type WritingMode = 'minimal' | 'guided';
type InsightDepth = 'minimal' | 'balanced' | 'deep';
type DataStorage = 'local' | 'cloud';
type DataUsage = 'anonymous' | 'full';

type GoalBlock = {
  id: string;
  type: 'goal';
  goal: string;
  label: string;
  seconds: number;
  running: boolean;
};

type TaskListBlock = {
  id: string;
  type: 'tasklist';
  title: string;
  tasks: Array<{ id: string; text: string; done: boolean }>;
};

type MediaBlock = {
  id: string;
  type: 'image' | 'voice' | 'doodle';
  dataUrl: string;
  name?: string;
  duration?: number;
};

export type DecodedEntryBlock = GoalBlock | TaskListBlock | MediaBlock;

export type DecodedHomeEntry = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  text: string;
  title: string | null;
  type: 'entry' | 'task';
  sentimentLabel?: string | null;
  sentimentColor?: string | null;
  taskStatus?: string | null;
  blocks: DecodedEntryBlock[];
};

export type UserPreferencesInput = Partial<{
  themeMode: ThemeMode;
  accentTheme: AccentTheme;
  defaultView: DefaultView;
  writingMode: WritingMode;
  insightDepth: InsightDepth;
  autoClustering: boolean;
  suggestions: boolean;
  autosave: boolean;
  focusMode: boolean;
  sessionTracking: boolean;
  dataStorage: DataStorage;
  dataUsage: DataUsage;
  dailyReminder: boolean;
  reflectionPrompts: boolean;
  reminderTime: string;
}>;

export type NormalizedUserPreferences = {
  themeMode: ThemeMode;
  accentTheme: AccentTheme;
  defaultView: DefaultView;
  writingMode: WritingMode;
  insightDepth: InsightDepth;
  autoClustering: boolean;
  suggestions: boolean;
  autosave: boolean;
  focusMode: boolean;
  sessionTracking: boolean;
  dataStorage: DataStorage;
  dataUsage: DataUsage;
  dailyReminder: boolean;
  reflectionPrompts: boolean;
  reminderTime: string;
};

type ThemeDefinition = {
  key: string;
  label: string;
  clusterDescription: string;
  keywords: string[];
};

type ThemeScore = ThemeDefinition & {
  count: number;
  progress: number;
};

type ClusterCard = {
  id: string;
  name: string;
  entryCount: number;
  updatedAtLabel: string;
  description: string;
  strength: 'Dominant' | 'Emerging';
  tones: string[];
};

type CanvasFolder = {
  id: string;
  title: string;
  entryCount: number;
  updatedAtLabel: string;
};

type WritingProfile = {
  title: string;
  description: string;
  tags: string[];
};

export type HomeAnalyticsBundle = {
  overview: {
    entryCount: number;
    currentStreak: number;
    mostActivePeriod: string;
    completedTaskCount: number;
    weeklyEntryCount: number;
  };
  insights: {
    monthlyNarrative: string;
    thoughtThemes: ThemeScore[];
    finalSynthesis: string;
  };
  account: {
    writingProfile: WritingProfile;
    coreThemes: Array<{ label: string; percent: number }>;
  };
  clusters: {
    headline: string;
    items: ClusterCard[];
  };
  canvas: {
    folders: CanvasFolder[];
  };
};

const DEFAULT_PREFERENCES: NormalizedUserPreferences = {
  themeMode: 'dark',
  accentTheme: 'orange',
  defaultView: 'canvas',
  writingMode: 'minimal',
  insightDepth: 'balanced',
  autoClustering: true,
  suggestions: true,
  autosave: true,
  focusMode: false,
  sessionTracking: true,
  dataStorage: 'local',
  dataUsage: 'anonymous',
  dailyReminder: false,
  reflectionPrompts: false,
  reminderTime: '20:00',
};

const ACCENT_THEMES = new Set<AccentTheme>(['orange', 'yellow', 'green', 'purple']);

const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    key: 'career-direction',
    label: 'Career Direction',
    clusterDescription:
      'Your entries keep returning to professional identity, ambition, and direction-setting.',
    keywords: [
      'career',
      'job',
      'work',
      'promotion',
      'resume',
      'interview',
      'roadmap',
      'startup',
      'product',
      'prototype',
      'market',
      'pitch',
      'strategy',
      'direction',
    ],
  },
  {
    key: 'side-projects',
    label: 'Side Projects',
    clusterDescription:
      'You are actively shaping personal initiatives and turning scattered ideas into something shippable.',
    keywords: ['project', 'side', 'prototype', 'build', 'ship', 'idea', 'feature', 'launch'],
  },
  {
    key: 'self-development',
    label: 'Self Development',
    clusterDescription:
      'You are tracking discipline, grounding, healing, and the habits that change your inner baseline.',
    keywords: [
      'discipline',
      'habit',
      'routine',
      'growth',
      'reflect',
      'healing',
      'grounded',
      'self',
      'journaling',
      'progress',
    ],
  },
  {
    key: 'creative-exploration',
    label: 'Creative Exploration',
    clusterDescription:
      'Creative impulses are appearing in sketches, ideas, and experiments that want more space.',
    keywords: ['creative', 'art', 'write', 'design', 'music', 'draw', 'doodle', 'story'],
  },
  {
    key: 'anxiety',
    label: 'Anxiety',
    clusterDescription:
      'A thread of uncertainty is present, but you are starting to name it with more clarity.',
    keywords: ['anxious', 'anxiety', 'fear', 'worry', 'stress', 'uncertain', 'panic'],
  },
  {
    key: 'healing',
    label: 'Healing',
    clusterDescription:
      'These entries suggest repair, softness, and a desire to move through old weight with intention.',
    keywords: ['heal', 'healing', 'recover', 'rest', 'soft', 'gentle', 'calm'],
  },
];

const STOP_WORDS = new Set([
  'about',
  'after',
  'again',
  'also',
  'because',
  'been',
  'being',
  'feel',
  'from',
  'have',
  'into',
  'just',
  'more',
  'only',
  'that',
  'them',
  'they',
  'this',
  'through',
  'want',
  'when',
  'with',
  'your',
  'my',
  'the',
  'and',
  'for',
  'are',
  'but',
  'not',
  'was',
  'you',
  'our',
  'too',
  'very',
  'will',
  'has',
  'had',
  'his',
  'her',
  'its',
  'their',
  'than',
  'then',
  'what',
  'where',
  'who',
  'why',
]);

function asAccentTheme(value: string | null | undefined): AccentTheme | null {
  if (!value) return null;
  const normalized = value.toLowerCase() as AccentTheme;
  return ACCENT_THEMES.has(normalized) ? normalized : null;
}

export function normalizeUserPreferences(
  raw?: UserPreferencesInput | null,
  legacyAccentTheme?: string | null,
): NormalizedUserPreferences {
  return {
    ...DEFAULT_PREFERENCES,
    ...raw,
    accentTheme:
      asAccentTheme(raw?.accentTheme) ??
      asAccentTheme(legacyAccentTheme) ??
      DEFAULT_PREFERENCES.accentTheme,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getCurrentStreak(entries: DecodedHomeEntry[]): number {
  const uniqueDays = [...new Set(entries.map((entry) => toDateKey(entry.createdAt)))]
    .sort()
    .reverse();
  if (uniqueDays.length === 0) return 0;

  let streak = 0;
  const cursor = new Date(`${uniqueDays[0]}T00:00:00.000Z`);

  for (const day of uniqueDays) {
    if (toDateKey(cursor) !== day) {
      break;
    }
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

function getActivityBucketLabel(hour: number): string {
  if (hour >= 21 || hour < 1) return 'Late Evenings';
  if (hour >= 18) return 'Evenings';
  if (hour >= 12) return 'Afternoons';
  if (hour >= 6) return 'Mornings';
  return 'Late Nights';
}

function getMostActivePeriod(entries: DecodedHomeEntry[]): string {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const label = getActivityBucketLabel(entry.createdAt.getUTCHours());
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'Evenings';
}

function getWeeklyEntryCount(entries: DecodedHomeEntry[], now: Date): number {
  const weekAgo = new Date(now);
  weekAgo.setUTCDate(now.getUTCDate() - 6);

  return entries.filter((entry) => entry.createdAt >= weekAgo && entry.createdAt <= now).length;
}

function getCompletedTaskCount(entries: DecodedHomeEntry[]): number {
  return entries.filter((entry) => entry.type === 'task' && entry.taskStatus === 'completed')
    .length;
}

function getEntryCorpus(entry: DecodedHomeEntry): string {
  const blockText = entry.blocks
    .map((block) => {
      if (block.type === 'goal') {
        return `${block.goal} ${block.label}`;
      }
      if (block.type === 'tasklist') {
        return `${block.title} ${block.tasks.map((task) => task.text).join(' ')}`;
      }
      return block.name ?? '';
    })
    .join(' ');

  return [entry.title ?? '', entry.text, blockText].join(' ').toLowerCase();
}

function countThemeMatches(entries: DecodedHomeEntry[]): ThemeScore[] {
  const counts = THEME_DEFINITIONS.map((theme) => {
    const count = entries.reduce((total, entry) => {
      const corpus = getEntryCorpus(entry);
      const matched = theme.keywords.some((keyword) => corpus.includes(keyword));
      return total + (matched ? 1 : 0);
    }, 0);

    return {
      ...theme,
      count,
      progress: 0,
    };
  }).filter((theme) => theme.count > 0);

  const max = counts[0] ? Math.max(...counts.map((theme) => theme.count), 1) : 1;

  return counts
    .map((theme) => ({
      ...theme,
      progress: Math.max(20, Math.round((theme.count / max) * 100)),
    }))
    .sort((left, right) => right.count - left.count);
}

function extractTopKeywords(entries: DecodedHomeEntry[]): string[] {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    const words = getEntryCorpus(entry)
      .split(/[^a-z0-9]+/g)
      .map((word) => word.trim())
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

    for (const word of words) {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([word]) => word);
}

function buildMonthlyNarrative(topTheme: ThemeScore | undefined, keywords: string[]): string {
  if (!topTheme) {
    return 'Your recent entries show a steady desire to make sense of what matters, even when the pattern is still forming.';
  }

  const keywordText = keywords.slice(0, 2).join(' and ');
  return `This month, your writing keeps circling ${topTheme.label.toLowerCase()}${keywordText ? ` through ${keywordText}` : ''}. The overall signal suggests movement from scattered thoughts toward clearer action.`;
}

function buildFinalSynthesis(topTheme: ThemeScore | undefined): string {
  if (!topTheme) {
    return 'Your entries suggest a reflective phase where clarity is still gathering around a few recurring thoughts.';
  }

  return `Right now, your mental landscape is consolidating around ${topTheme.label.toLowerCase()}. The more you write, the more your direction becomes visible.`;
}

function buildWritingProfile(entries: DecodedHomeEntry[]): WritingProfile {
  const texts = entries.map((entry) => entry.text.trim()).filter(Boolean);
  const averageWords =
    texts.reduce((total, text) => total + text.split(/\s+/).filter(Boolean).length, 0) /
    Math.max(texts.length, 1);
  const firstPersonHits = texts.join(' ').match(/\b(i|my|me)\b/gi)?.length ?? 0;

  if (averageWords > 18 && firstPersonHits > 2) {
    return {
      title: 'Thoughtful self-reflection',
      description:
        'Your entries lean inward in a grounded way. You tend to process emotion by naming it, examining it, and tracing what it means.',
      tags: ['Reflective', 'Aware', 'Grounded'],
    };
  }

  return {
    title: 'Emerging observation',
    description:
      'Your entries capture the important signal quickly, then return to it as the pattern becomes clearer.',
    tags: ['Curious', 'Observant', 'Intentional'],
  };
}

function buildCoreThemes(themeScores: ThemeScore[]): Array<{ label: string; percent: number }> {
  const total = themeScores.reduce((sum, theme) => sum + theme.count, 0) || 1;
  return themeScores.slice(0, 3).map((theme) => ({
    label: theme.label,
    percent: Math.round((theme.count / total) * 100),
  }));
}

function formatUpdatedAtLabel(latestDate: Date, now: Date): string {
  const diffMs = now.getTime() - latestDate.getTime();
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  if (diffHours < 24) {
    return diffHours <= 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }

  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
}

function buildClusters(
  entries: DecodedHomeEntry[],
  themeScores: ThemeScore[],
  now: Date,
): ClusterCard[] {
  return themeScores.slice(0, 6).map((theme, index) => {
    const themedEntries = entries.filter((entry) => {
      const corpus = getEntryCorpus(entry);
      return theme.keywords.some((keyword) => corpus.includes(keyword));
    });

    const latestDate =
      themedEntries.sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())[0]
        ?.updatedAt ?? now;

    const tones = theme.key === 'anxiety' ? ['Anxious', 'Searching'] : ['Focused', 'Reflective'];

    return {
      id: `${slugify(theme.label)}-${index + 1}`,
      name: theme.label,
      entryCount: themedEntries.length || theme.count,
      updatedAtLabel: formatUpdatedAtLabel(latestDate, now),
      description: theme.clusterDescription,
      strength: index === 0 ? 'Dominant' : 'Emerging',
      tones,
    };
  });
}

function buildCanvasFolders(clusters: ClusterCard[]): CanvasFolder[] {
  return clusters.map((cluster) => ({
    id: cluster.id,
    title: cluster.name,
    entryCount: cluster.entryCount,
    updatedAtLabel: cluster.updatedAtLabel,
  }));
}

export function buildHomeAnalytics(input: {
  entries: DecodedHomeEntry[];
  preferences: NormalizedUserPreferences;
  userName: string;
  now: Date;
}): HomeAnalyticsBundle {
  const entries = [...input.entries].sort(
    (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
  );
  const themeScores = countThemeMatches(entries);
  const keywords = extractTopKeywords(entries);
  const topTheme = themeScores[0];
  const clusters = buildClusters(entries, themeScores, input.now);

  return {
    overview: {
      entryCount: entries.length,
      currentStreak: getCurrentStreak(entries),
      mostActivePeriod: getMostActivePeriod(entries),
      completedTaskCount: getCompletedTaskCount(entries),
      weeklyEntryCount: getWeeklyEntryCount(entries, input.now),
    },
    insights: {
      monthlyNarrative: buildMonthlyNarrative(topTheme, keywords),
      thoughtThemes: themeScores,
      finalSynthesis: buildFinalSynthesis(topTheme),
    },
    account: {
      writingProfile: buildWritingProfile(entries),
      coreThemes: buildCoreThemes(themeScores),
    },
    clusters: {
      headline: topTheme?.label
        ? `You've been thinking most about ${topTheme.label.toLowerCase()} lately.`
        : 'Your recent thoughts are starting to cluster into a few recurring themes.',
      items: clusters,
    },
    canvas: {
      folders: buildCanvasFolders(clusters),
    },
  };
}
