import {
  Controller,
  Get,
  Query,
  Redirect,
  Req,
  Res,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { verifyToken } from '@clerk/backend';
import { GoogleCalendarService } from './google-calendar.service';

/**
 * Google Calendar OAuth2 endpoints.
 *
 * GET /google-calendar/connect
 *   → Requires ?clerk_token=<Clerk session JWT>
 *   → Redirects to Google consent screen
 *
 * GET /google-calendar/callback
 *   → Google redirects here with ?code=...&state=<clerkUserId>
 *   → Exchanges code for tokens, stores in Redis, redirects to frontend
 *
 * GET /google-calendar/status
 *   → Returns { connected: boolean } for the authenticated user
 *
 * GET /google-calendar/disconnect
 *   → Deletes stored token for the authenticated user
 */
@Controller('google-calendar')
export class GoogleCalendarController {
  private readonly logger = new Logger(GoogleCalendarController.name);

  constructor(private readonly gcalService: GoogleCalendarService) { }

  // ─── Helper: verify Clerk JWT from Authorization header or query param ────

  private async verifyClerkToken(req: Request): Promise<string> {
    const secretKey = process.env.CLERK_SECRET_KEY ?? '';
    const raw =
      req.headers.authorization?.replace('Bearer ', '') ??
      (req.query.clerk_token as string | undefined) ??
      '';

    if (!raw) throw new UnauthorizedException('Missing auth token');

    try {
      const payload = await verifyToken(raw, { secretKey });
      const userId = payload.sub;
      if (!userId) throw new Error('No sub in token');
      return userId;
    } catch (err) {
      this.logger.warn(`[GCal] Auth verification failed: ${err}`);
      throw new UnauthorizedException('Invalid auth token');
    }
  }

  /**
   * Step 1: Frontend redirects user here.
   * We verify their Clerk session, then redirect to Google consent.
   *
   * Usage: window.location.href = `${BACKEND_URL}/google-calendar/connect?clerk_token=${token}`
   */
  @Get('connect')
  @Redirect()
  async connect(@Req() req: Request) {
    if (!this.gcalService.isConfigured) {
      return {
        url: `${process.env.FRONTEND_URL ?? 'http://localhost:3001'}/home?gcal_error=not_configured`,
        statusCode: 302,
      };
    }

    const clerkUserId = await this.verifyClerkToken(req);
    const authUrl = this.gcalService.getAuthUrl(clerkUserId);
    return { url: authUrl, statusCode: 302 };
  }

  /**
   * Step 2: Google redirects here after user consent.
   * Exchange code → tokens, store in Redis, redirect frontend to success URL.
   */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') clerkUserId: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const frontendBase = process.env.FRONTEND_URL ?? 'http://localhost:3001';
    const calendarUrl = `${frontendBase}/home`;

    if (error || !code) {
      this.logger.warn(`[GCal] Callback error: ${error}`);
      return res.redirect(`${calendarUrl}?gcal_error=${error ?? 'cancelled'}`);
    }

    try {
      await this.gcalService.exchangeCode(code, clerkUserId);
      this.logger.log(`[GCal] Connected for user: ${clerkUserId}`);
      return res.redirect(`${calendarUrl}?gcal_connected=1`);
    } catch (err) {
      this.logger.error('[GCal] Exchange failed', err);
      return res.redirect(`${calendarUrl}?gcal_error=exchange_failed`);
    }
  }

  /**
   * Returns whether the requesting user has a stored Google token.
   * Used by the frontend to show connected/not-connected state.
   */
  @Get('status')
  async status(@Req() req: Request) {
    try {
      const clerkUserId = await this.verifyClerkToken(req);
      const connected = await this.gcalService.isConnected(clerkUserId);
      const configured = this.gcalService.isConfigured;
      return { connected, configured };
    } catch {
      return { connected: false, configured: this.gcalService.isConfigured };
    }
  }

  /**
   * Disconnect — delete stored token.
   */
  @Get('disconnect')
  async disconnect(@Req() req: Request) {
    const clerkUserId = await this.verifyClerkToken(req);
    await this.gcalService.disconnect(clerkUserId);
    return { success: true };
  }

  /**
   * Fetch calendar events for the requesting user.
   * Query params: timeMin, timeMax (ISO strings)
   */
  @Get('events')
  async events(
    @Req() req: Request,
    @Query('timeMin') timeMin: string,
    @Query('timeMax') timeMax: string,
  ) {
    const clerkUserId = await this.verifyClerkToken(req);

    if (!timeMin || !timeMax) {
      // Default: current month
      const now = new Date();
      timeMin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      timeMax = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    }

    const events = await this.gcalService.getEvents(clerkUserId, timeMin, timeMax);
    return { events };
  }
}
