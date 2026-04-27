import { Inject, Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export interface GCalToken {
  access_token: string;
  refresh_token: string;
  expiry_date: number; // epoch ms
  scope: string;
}

export interface GCalEvent {
  id: string;
  summary: string;
  start: string; // ISO
  end: string; // ISO
  colorId?: string;
}

const GCAL_TOKEN_PREFIX = 'gcal:token';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  private readonly clientId = process.env.GOOGLE_CLIENT_ID ?? '';
  private readonly clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? '';
  private readonly redirectUri =
    process.env.GOOGLE_CALENDAR_REDIRECT_URI ?? 'http://localhost:3000/google-calendar/callback';

  constructor(@Inject(RedisService) private readonly redis: RedisService) {}

  // ─── Configured? ─────────────────────────────────────────────────────────

  get isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  // ─── OAuth URL ─────────────────────────────────────────────────────────────

  getAuthUrl(clerkUserId: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar.readonly',
      access_type: 'offline',
      prompt: 'consent',
      state: clerkUserId, // passed back in callback to associate token
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // ─── Exchange code → token ────────────────────────────────────────────────

  async exchangeCode(code: string, clerkUserId: string): Promise<GCalToken> {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`[GCal] Token exchange failed: ${err}`);
      throw new Error('Google OAuth token exchange failed');
    }

    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      scope: string;
    };

    const token: GCalToken = {
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? '',
      expiry_date: Date.now() + data.expires_in * 1000,
      scope: data.scope,
    };

    // Store for 365 days in Redis — the refresh_token makes it long-lived
    await this.redis.set(`${GCAL_TOKEN_PREFIX}:${clerkUserId}`, token, 365 * 24 * 3600);
    return token;
  }

  // ─── Refresh access token ─────────────────────────────────────────────────

  private async refreshToken(token: GCalToken, clerkUserId: string): Promise<GCalToken> {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: token.refresh_token,
        grant_type: 'refresh_token',
      }).toString(),
    });

    if (!res.ok) {
      // Refresh failed — wipe tokens so user reconnects
      await this.redis.del(`${GCAL_TOKEN_PREFIX}:${clerkUserId}`);
      throw new Error('Google token refresh failed');
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    const refreshed: GCalToken = {
      ...token,
      access_token: data.access_token,
      expiry_date: Date.now() + data.expires_in * 1000,
    };

    await this.redis.set(`${GCAL_TOKEN_PREFIX}:${clerkUserId}`, refreshed, 365 * 24 * 3600);
    return refreshed;
  }

  // ─── Get valid token ──────────────────────────────────────────────────────

  private async getValidToken(clerkUserId: string): Promise<GCalToken | null> {
    const token = await this.redis.get<GCalToken>(`${GCAL_TOKEN_PREFIX}:${clerkUserId}`);
    if (!token) return null;

    // Refresh if expired (with 60s buffer)
    if (Date.now() >= token.expiry_date - 60_000) {
      if (!token.refresh_token) {
        await this.redis.del(`${GCAL_TOKEN_PREFIX}:${clerkUserId}`);
        return null;
      }
      return this.refreshToken(token, clerkUserId);
    }

    return token;
  }

  // ─── Is connected? ────────────────────────────────────────────────────────

  async isConnected(clerkUserId: string): Promise<boolean> {
    const token = await this.redis.get<GCalToken>(`${GCAL_TOKEN_PREFIX}:${clerkUserId}`);
    return Boolean(token?.refresh_token);
  }

  // ─── Disconnect ───────────────────────────────────────────────────────────

  async disconnect(clerkUserId: string): Promise<void> {
    await this.redis.del(`${GCAL_TOKEN_PREFIX}:${clerkUserId}`);
  }

  // ─── Fetch events ─────────────────────────────────────────────────────────

  async getEvents(clerkUserId: string, timeMin: string, timeMax: string): Promise<GCalEvent[]> {
    const token = await this.getValidToken(clerkUserId);
    if (!token) return [];

    const cacheKey = `gcal:events:${clerkUserId}:${timeMin}:${timeMax}`;
    const cached = await this.redis.get<GCalEvent[]>(cacheKey);
    if (cached) return cached;

    // calendarId goes in the URL path — not as a query param
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '100',
    });

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token.access_token}` },
      },
    );

    if (!res.ok) {
      const errBody = await res.text();
      this.logger.warn(`[GCal] Events fetch failed: ${res.status} — ${errBody}`);

      if (res.status === 401) {
        // Token revoked/expired — wipe it so user is prompted to reconnect
        await this.redis.del(`${GCAL_TOKEN_PREFIX}:${clerkUserId}`);
      }

      if (res.status === 403) {
        // API disabled or quota — wipe the events cache so next request retries Google
        // (don't cache empty result when the problem is transient)
        await this.redis.del(cacheKey);
      }

      return [];
    }

    const data = (await res.json()) as {
      items: Array<{
        id: string;
        summary?: string;
        start: { dateTime?: string; date?: string };
        end: { dateTime?: string; date?: string };
        colorId?: string;
      }>;
    };

    const events: GCalEvent[] = (data.items ?? []).map((e) => ({
      id: e.id,
      summary: e.summary ?? '(No title)',
      start: e.start.dateTime ?? e.start.date ?? '',
      end: e.end.dateTime ?? e.end.date ?? '',
      colorId: e.colorId,
    }));

    // Cache events for 10 minutes
    await this.redis.set(cacheKey, events, 600);
    return events;
  }
}
