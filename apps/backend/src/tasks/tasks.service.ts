import { createClerkClient } from '@clerk/backend';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { and, db, eq, sql } from '@soulcanvas/database/client';
import { canvasNodes, journalEntries, users } from '@soulcanvas/database/schema';

@Injectable()
export class TasksService {
  @Cron(CronExpression.EVERY_HOUR)
  async updateVisualMass() {
    try {
      console.log('Updating visual mass for tasks...');

      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

      // Update tasks due within 24h
      await db
        .update(canvasNodes)
        .set({ visualMass: 4.0 })
        .where(sql`entry_id IN (
          SELECT id FROM journal_entries 
          WHERE type = 'task' 
          AND deadline <= ${tomorrow} 
          AND deadline > ${nextHour}
        )`);

      // Update tasks due within 1h
      await db
        .update(canvasNodes)
        .set({ visualMass: 5.0 })
        .where(sql`entry_id IN (
          SELECT id FROM journal_entries 
          WHERE type = 'task' 
          AND deadline <= ${nextHour}
        )`);
    } catch (error) {
      console.error('[Scheduler] Failed to update visual mass:', error);
    }
  }

  async convertToTask(userId: string, entryId: string, deadline: Date) {
    const result = await db
      .update(journalEntries)
      .set({ type: 'task', deadline })
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
      .returning({ id: journalEntries.id });

    if (result.length === 0) {
      throw new Error('Unauthorized or entry not found.');
    }

    await db.update(canvasNodes).set({ visualMass: 2.0 }).where(eq(canvasNodes.entryId, entryId));
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeSoftDeletedUsers() {
    try {
      console.log('[Scheduler] Running daily 30-day GDPR soft delete purge...');

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const expiredUsers = await db
        .select({ id: users.id, clerkId: users.clerkId })
        .from(users)
        .where(
          and(sql`${users.deletedAt} IS NOT NULL`, sql`${users.deletedAt} <= ${thirtyDaysAgo}`),
        );

      if (expiredUsers.length === 0) {
        return;
      }

      console.log(
        `[Scheduler] Purging ${expiredUsers.length} users that have passed the 30-day retention window.`,
      );

      const secretKey = process.env.CLERK_SECRET_KEY;
      if (!secretKey) throw new Error('CLERK_SECRET_KEY is not configured');
      const clerk = createClerkClient({ secretKey });

      for (const u of expiredUsers) {
        try {
          await clerk.users.deleteUser(u.clerkId);
        } catch (e) {
          console.error(`[Scheduler] Failed to delete user ${u.clerkId} from Clerk`, e);
        }
        await db.delete(users).where(eq(users.id, u.id));
      }

      console.log('[Scheduler] Purge complete.');
    } catch (error) {
      console.error('[Scheduler] Failed to run automated data purge:', error);
    }
  }
}
