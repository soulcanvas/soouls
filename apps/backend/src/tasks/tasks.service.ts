import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { and, db, eq, sql } from '@soulcanvas/database/client';
import { canvasNodes, journalEntries } from '@soulcanvas/database/schema';

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
}
