import { Injectable } from '@nestjs/common';
import { db } from '@soulcanvas/database/client';
import { and, eq, sql } from '@soulcanvas/database/client';
import { canvasNodes, journalEntries } from '@soulcanvas/database/schema';
import { encryptData, decryptData } from '../utils/encryption';

@Injectable()
export class EntriesService {
  async createEntry(userId: string, content: string, type: 'entry' | 'task' = 'entry') {
    // Encrypt and save immediately — no AI processing
    const encryptedContent = encryptData(content, userId);

    const [entry] = await db
      .insert(journalEntries)
      .values({
        userId,
        content: encryptedContent,
        type,
        // AI fields (embedding, sentiment) left NULL — will be filled by AI engine later
      })
      .returning();

    // Place canvas node
    await db.insert(canvasNodes).values({
      entryId: entry.id,
      x: Math.random() * 10 - 5,
      y: Math.random() * 10 - 5,
      z: Math.random() * 10 - 5,
      visualMass: type === 'task' ? 2.0 : 1.0,
    });

    return entry;
  }

  async getEntry(userId: string, id: string) {
    const [entry] = await db
      .select({ id: journalEntries.id, content: journalEntries.content })
      .from(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
      .limit(1);

    if (entry) {
      entry.content = decryptData(entry.content, userId);
    }
    return entry || null;
  }

  async updateEntry(userId: string, id: string, content: string) {
    // Verify ownership first
    const existing = await db
      .select({ id: journalEntries.id })
      .from(journalEntries)
      .where(sql`${journalEntries.id} = ${id} AND ${journalEntries.userId} = ${userId}`)
      .limit(1);

    if (existing.length === 0) {
      throw new Error('Unauthorized or entry not found.');
    }

    // Encrypt and update immediately — no AI processing
    await db
      .update(journalEntries)
      .set({
        content: encryptData(content, userId),
        updatedAt: new Date(),
      })
      .where(eq(journalEntries.id, id));
  }

  async findSimilarEntries(
    embedding: number[],
    userId: string,
    limit = 5,
  ): Promise<Array<{ id: string }>> {
    const embeddingString = JSON.stringify(embedding);
    const rows = await db.execute(sql`
      SELECT * FROM ${journalEntries}
      WHERE ${journalEntries.userId} = ${userId}
      ORDER BY ${journalEntries.embedding} <=> ${embeddingString}::vector
      LIMIT ${limit}
    `);
    return rows as unknown as Array<{ id: string }>;
  }

  async getGalaxyData(userId: string) {
    const rawData = await db
      .select({
        id: journalEntries.id,
        content: journalEntries.content,
        type: journalEntries.type,
        sentimentColor: journalEntries.sentimentColor,
        sentimentLabel: journalEntries.sentimentLabel,
        x: canvasNodes.x,
        y: canvasNodes.y,
        z: canvasNodes.z,
        visualMass: canvasNodes.visualMass,
      })
      .from(journalEntries)
      .innerJoin(canvasNodes, eq(journalEntries.id, canvasNodes.entryId))
      .where(eq(journalEntries.userId, userId));

    // Decrypt on the way out
    return rawData.map(entry => ({
      ...entry,
      content: decryptData(entry.content, userId),
    }));
  }
}
