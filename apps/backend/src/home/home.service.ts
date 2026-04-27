import { createClerkClient } from '@clerk/backend';
import { Inject, Injectable } from '@nestjs/common';
import { generateHomeInsightCopy } from '@soouls/ai-engine/home-insights';
import type {
  HomeAccount,
  HomeApi,
  HomeCluster,
  HomeClusterDetail,
  HomeInsights,
  HomeSettings,
} from '@soouls/api/router';
import { db, desc, eq, inArray } from '@soouls/database/client';
import {
  canvasNodes,
  journalEntries,
  messageCampaigns,
  messageDeliveries,
  users,
} from '@soouls/database/schema';
import { EntriesService } from '../entries/entries.service';
import { RedisService } from '../redis/redis.service';
import {
  type DecodedEntryBlock,
  type DecodedHomeEntry,
  type HomeAnalyticsBundle,
  type NormalizedUserPreferences,
  type UserPreferencesInput,
  buildHomeAnalytics,
  normalizeUserPreferences,
} from './home.analytics';

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  bio: string | null;
  createdAt: Date;
  themePreference: string | null;
  preferences: Record<string, unknown> | null;
  marketingEmailOptIn: boolean;
  transactionalEmailOptIn: boolean;
};

@Injectable()
export class HomeService implements HomeApi {
  constructor(
    @Inject(EntriesService) private readonly entriesService: EntriesService,
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  private getCacheKey(prefix: string, userId: string): string {
    return `${prefix}:${userId}`;
  }

  private async getUserRow(userId: string): Promise<UserRow> {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        bio: users.bio,
        createdAt: users.createdAt,
        themePreference: users.themePreference,
        preferences: users.preferences,
        marketingEmailOptIn: users.marketingEmailOptIn,
        transactionalEmailOptIn: users.transactionalEmailOptIn,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  private buildSettingsFromUser(user: UserRow): NormalizedUserPreferences {
    const rawPrefs = (user.preferences ?? {}) as UserPreferencesInput;
    return normalizeUserPreferences(
      {
        ...rawPrefs,
        dailyReminder: user.transactionalEmailOptIn,
        reflectionPrompts: user.marketingEmailOptIn,
      },
      user.themePreference,
    );
  }

  private async getDecodedEntries(userId: string): Promise<DecodedHomeEntry[]> {
    const rows = await db
      .select({
        id: journalEntries.id,
        title: journalEntries.title,
        content: journalEntries.content,
        type: journalEntries.type,
        sentimentLabel: journalEntries.sentimentLabel,
        sentimentColor: journalEntries.sentimentColor,
        createdAt: journalEntries.createdAt,
        updatedAt: journalEntries.updatedAt,
        taskStatus: journalEntries.taskStatus,
      })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));

    return rows.map((row) => {
      const decoded = this.entriesService.decodeEntryContent(row.content, userId);

      return {
        id: row.id,
        title: row.title,
        text: decoded.text,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        type: row.type,
        sentimentLabel: row.sentimentLabel,
        sentimentColor: row.sentimentColor,
        taskStatus: row.taskStatus,
        blocks: Array.isArray(decoded.full?.blocks)
          ? (decoded.full.blocks as DecodedEntryBlock[])
          : [],
      };
    });
  }

  private async enrichAnalyticsWithAiCopy(
    analytics: HomeAnalyticsBundle,
    userName: string,
  ): Promise<HomeAnalyticsBundle> {
    const aiCopy = await generateHomeInsightCopy({
      userName,
      topThemes: analytics.insights.thoughtThemes.map((theme) => theme.label),
      monthlyNarrativeFallback: analytics.insights.monthlyNarrative,
      finalSynthesisFallback: analytics.insights.finalSynthesis,
      writingProfileTitleFallback: analytics.account.writingProfile.title,
      writingProfileDescriptionFallback: analytics.account.writingProfile.description,
    });

    if (!aiCopy) {
      return analytics;
    }

    return {
      ...analytics,
      insights: {
        ...analytics.insights,
        monthlyNarrative: aiCopy.monthlyNarrative,
        finalSynthesis: aiCopy.finalSynthesis,
      },
      account: {
        ...analytics.account,
        writingProfile: {
          ...analytics.account.writingProfile,
          title: aiCopy.writingProfileTitle,
          description: aiCopy.writingProfileDescription,
        },
      },
    };
  }

  private async getSnapshot(userId: string): Promise<{
    user: UserRow;
    settings: NormalizedUserPreferences;
    analytics: ReturnType<typeof buildHomeAnalytics>;
  }> {
    const cacheKey = this.getCacheKey('home:snapshot', userId);
    const cached = await this.redis.get<{
      user: UserRow;
      settings: NormalizedUserPreferences;
      analytics: ReturnType<typeof buildHomeAnalytics>;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const user = await this.getUserRow(userId);
    const settings = this.buildSettingsFromUser(user);
    const entries = await this.getDecodedEntries(userId);
    const baseAnalytics = buildHomeAnalytics({
      entries,
      preferences: settings,
      userName: user.name ?? 'Explorer',
      now: new Date(),
    });
    const analytics = await this.enrichAnalyticsWithAiCopy(baseAnalytics, user.name ?? 'Explorer');

    const snapshot = {
      user,
      settings,
      analytics,
    };

    await this.redis.set(cacheKey, snapshot, 300);
    return snapshot;
  }

  async getInsights(userId: string): Promise<HomeInsights> {
    const { analytics } = await this.getSnapshot(userId);

    return {
      overview: analytics.overview,
      monthlyNarrative: analytics.insights.monthlyNarrative,
      thoughtThemes: analytics.insights.thoughtThemes.map((theme) => ({
        key: theme.key,
        label: theme.label,
        count: theme.count,
        progress: theme.progress,
      })),
      finalSynthesis: analytics.insights.finalSynthesis,
      clustersHeadline: analytics.clusters.headline,
      clusters: analytics.clusters.items,
      canvasFolders: analytics.canvas.folders,
      coreThemes: analytics.account.coreThemes,
      writingProfile: analytics.account.writingProfile,
    };
  }

  async getAccount(userId: string): Promise<HomeAccount> {
    const { analytics, user } = await this.getSnapshot(userId);
    const daysJoined = Math.max(
      1,
      Math.ceil((Date.now() - new Date(user.createdAt).getTime()) / (24 * 60 * 60 * 1000)),
    );

    return {
      stats: {
        daysJoined,
        entries: analytics.overview.entryCount,
        streak: analytics.overview.currentStreak,
        mostActivePeriod: analytics.overview.mostActivePeriod,
      },
      writingProfile: analytics.account.writingProfile,
      coreThemes: analytics.account.coreThemes,
      consistencyMessage:
        analytics.overview.currentStreak >= 3
          ? "You've been staying consistent."
          : 'Your reflective rhythm is starting to form.',
      bio: user.bio ?? 'Trying to make sense of my thoughts.',
    };
  }

  async getSettings(userId: string): Promise<HomeSettings> {
    const { settings } = await this.getSnapshot(userId);
    return settings;
  }

  async updateSettings(userId: string, input: Partial<HomeSettings>): Promise<HomeSettings> {
    const user = await this.getUserRow(userId);
    const current = this.buildSettingsFromUser(user);
    const next = normalizeUserPreferences(
      {
        ...current,
        ...input,
      },
      input.accentTheme ?? user.themePreference,
    );

    await db
      .update(users)
      .set({
        themePreference: next.accentTheme,
        preferences: next as unknown as Record<string, unknown>,
        marketingEmailOptIn: next.reflectionPrompts,
        transactionalEmailOptIn: next.dailyReminder,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    await this.redis.invalidatePattern(`home:*:${userId}*`);

    return next;
  }

  async getClusters(userId: string): Promise<{
    headline: string;
    items: HomeCluster[];
    folders: Array<{ id: string; title: string; entryCount: number; updatedAtLabel: string }>;
  }> {
    const { analytics } = await this.getSnapshot(userId);

    return {
      headline: analytics.clusters.headline,
      items: analytics.clusters.items,
      folders: analytics.canvas.folders,
    };
  }

  async getClusterDetail(userId: string, clusterId: string): Promise<HomeClusterDetail | null> {
    const { analytics } = await this.getSnapshot(userId);
    const entries = await this.getDecodedEntries(userId);
    const cluster = analytics.clusters.items.find((item) => item.id === clusterId);

    if (!cluster) {
      return null;
    }

    const matchWords = cluster.name
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .map((word) => word.trim())
      .filter(Boolean);

    const matchingEntries = entries.filter((entry) => {
      const corpus = `${entry.title ?? ''} ${entry.text}`.toLowerCase();
      return matchWords.some((word) => corpus.includes(word));
    });

    const highlights = matchingEntries.slice(0, 3).map((entry) => ({
      id: entry.id,
      title: entry.title || entry.text.split('\n')[0] || 'Untitled entry',
      type: entry.type,
      createdAt: entry.createdAt.toISOString(),
    }));

    const topWords = matchingEntries
      .flatMap((entry) => entry.text.toLowerCase().split(/[^a-z0-9]+/g))
      .filter((word) => word.length > 4)
      .slice(0, 6);

    const keyIdeas = (topWords.length > 0 ? topWords : cluster.name.split(' '))
      .slice(0, 3)
      .map((word) => ({
        label: word.replace(/^\w/, (char) => char.toUpperCase()),
        description: `This idea appears repeatedly inside the ${cluster.name.toLowerCase()} cluster.`,
      }));

    return {
      cluster,
      narrative: `Your recent entries in ${cluster.name.toLowerCase()} are becoming more coherent. The signal here is stronger than the noise, and the next step is easier to see.`,
      keyIdeas,
      highlights,
      observation: `A clear pattern is emerging around ${cluster.name.toLowerCase()}. Your entries are becoming more specific and action-oriented over time.`,
      nextStep: `Capture one more concrete entry that moves ${cluster.name.toLowerCase()} from reflection into action.`,
      reflectionPrompt: `If you had to explain why ${cluster.name.toLowerCase()} matters right now, what truth would you be least comfortable saying out loud?`,
    };
  }

  async deleteAccount(userId: string): Promise<{ deleted: true }> {
    const [user] = await db
      .select({ id: users.id, clerkId: users.clerkId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    const entryIds = await db
      .select({ id: journalEntries.id })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId));

    if (entryIds.length > 0) {
      await db.delete(canvasNodes).where(
        inArray(
          canvasNodes.entryId,
          entryIds.map((entry) => entry.id),
        ),
      );
    }

    await db.delete(messageDeliveries).where(eq(messageDeliveries.userId, userId));
    await db.delete(messageCampaigns).where(eq(messageCampaigns.createdByUserId, userId));
    await db.delete(journalEntries).where(eq(journalEntries.userId, userId));
    await db.delete(users).where(eq(users.id, userId));

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (secretKey) {
      const clerk = createClerkClient({ secretKey });
      await clerk.users.deleteUser(user.clerkId);
    }

    await this.redis.invalidatePattern(`home:*:${userId}*`);
    await this.redis.invalidatePattern(`entries:all:${userId}:*`);
    await this.redis.invalidatePattern(`galaxy:${userId}:*`);

    return { deleted: true };
  }
}
