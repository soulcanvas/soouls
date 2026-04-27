import { describe, expect, it } from 'bun:test';
import {
  type DecodedHomeEntry,
  buildHomeAnalytics,
  normalizeUserPreferences,
} from './home.analytics';

describe('home analytics', () => {
  const now = new Date('2026-04-25T23:30:00.000Z');

  it('normalizes preferences with defaults and legacy accent fallback', () => {
    expect(
      normalizeUserPreferences(
        {
          themeMode: 'light',
          defaultView: 'calendar',
        },
        'green',
      ),
    ).toEqual(
      expect.objectContaining({
        themeMode: 'light',
        accentTheme: 'green',
        defaultView: 'calendar',
        writingMode: 'minimal',
        insightDepth: 'balanced',
        autoClustering: true,
        suggestions: true,
        autosave: true,
      }),
    );
  });

  it('builds real aggregates, clusters, and insight cards from decoded entries', () => {
    const entries: DecodedHomeEntry[] = [
      {
        id: 'entry-1',
        createdAt: new Date('2026-04-23T21:10:00.000Z'),
        updatedAt: new Date('2026-04-23T21:10:00.000Z'),
        text: 'I feel anxious about my career direction, but I also have hope about the startup roadmap and product strategy.',
        title: 'Career direction at night',
        type: 'entry',
        sentimentLabel: 'anxiety',
        sentimentColor: '#FF8C00',
        blocks: [],
      },
      {
        id: 'entry-2',
        createdAt: new Date('2026-04-24T22:25:00.000Z'),
        updatedAt: new Date('2026-04-24T22:25:00.000Z'),
        text: 'The side project is becoming clearer. I want to validate the startup idea, build discipline, and ship a focused prototype.',
        title: 'Clearer side project',
        type: 'entry',
        sentimentLabel: 'hope',
        sentimentColor: '#7CFC00',
        blocks: [
          {
            id: 'goal-1',
            type: 'goal',
            goal: 'Ship prototype',
            label: 'Build',
            seconds: 1200,
            running: false,
          },
        ],
      },
      {
        id: 'entry-3',
        createdAt: new Date('2026-04-25T23:05:00.000Z'),
        updatedAt: new Date('2026-04-25T23:05:00.000Z'),
        text: 'Journaling helps with healing and self reflection. I am calmer when I track progress, complete tasks, and stay grounded.',
        title: 'Healing through tracking',
        type: 'task',
        sentimentLabel: 'neutral',
        sentimentColor: '#C0C0C0',
        taskStatus: 'completed',
        blocks: [
          {
            id: 'tasklist-1',
            type: 'tasklist',
            title: 'Tasks',
            tasks: [
              { id: 't-1', text: 'Write roadmap', done: true },
              { id: 't-2', text: 'Review prototype', done: false },
            ],
          },
        ],
      },
    ];

    const analytics = buildHomeAnalytics({
      entries,
      preferences: normalizeUserPreferences(undefined, 'orange'),
      userName: 'Aarav',
      now,
    });

    expect(analytics.overview.entryCount).toBe(3);
    expect(analytics.overview.currentStreak).toBe(3);
    expect(analytics.overview.mostActivePeriod).toBe('Late Evenings');
    expect(analytics.overview.completedTaskCount).toBe(1);

    expect(analytics.insights.thoughtThemes[0]).toEqual(
      expect.objectContaining({
        label: 'Career Direction',
      }),
    );
    expect(analytics.insights.monthlyNarrative).toContain('career');
    expect(analytics.account.writingProfile.title).toBe('Thoughtful self-reflection');
    expect(analytics.account.writingProfile.tags).toContain('Reflective');

    expect(analytics.clusters.items.length).toBeGreaterThan(0);
    expect(analytics.clusters.items[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        entryCount: expect.any(Number),
      }),
    );

    expect(analytics.canvas.folders.length).toBeGreaterThan(0);
    expect(analytics.canvas.folders[0]).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        entryCount: expect.any(Number),
      }),
    );
  });
});
