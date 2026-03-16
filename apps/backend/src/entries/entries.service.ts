import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { db } from '@soulcanvas/database/client';
import { and, eq, sql } from '@soulcanvas/database/client';
import { canvasNodes, journalEntries } from '@soulcanvas/database/schema';
import LZString from 'lz-string';
import type { RedisService } from '../redis/redis.service';
import { decryptData, encryptData } from '../utils/encryption';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

@Injectable()
export class EntriesService {
  constructor(private readonly redis: RedisService) {}

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

    // Invalidate galaxy cache
    await this.redis.del(`galaxy_map_${userId}`);

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
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));

    // Invalidate galaxy cache
    await this.redis.del(`galaxy_map_${userId}`);
  }

  async getUploadPresignedUrl(userId: string, entryId: string, contentType: string) {
    // Verify ownership
    const existing = await db
      .select({ id: journalEntries.id })
      .from(journalEntries)
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      throw new Error('Unauthorized or entry not found.');
    }

    const bucketParams = {
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'soulcanvas-media',
      Key: `entries/${userId}/${entryId}/${Date.now()}`,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(bucketParams);
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    // Construct the final public URL the client will report back
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${bucketParams.Key}`;

    return { uploadUrl: signedUrl, publicUrl };
  }

  async updateEntryMediaUrl(userId: string, entryId: string, mediaUrl: string) {
    // Verify ownership
    const existing = await db
      .select({ id: journalEntries.id })
      .from(journalEntries)
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      throw new Error('Unauthorized or entry not found.');
    }

    await db
      .update(journalEntries)
      .set({ mediaUrl })
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)));

    // Invalidate galaxy cache
    await this.redis.del(`galaxy_map_${userId}`);
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

  async getGalaxyData(userId: string, limit = 100, cursor = 0) {
    const cacheKey = `galaxy_map_${userId}_${limit}_${cursor}`;
    const cached = await this.redis.get<{ items: any[]; nextCursor: number | null }>(cacheKey);
    if (cached) return cached;

    const rawData = await db
      .select({
        id: journalEntries.id,
        content: journalEntries.content,
        createdAt: journalEntries.createdAt,
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
      .where(eq(journalEntries.userId, userId))
      .limit(limit + 1)
      .offset(cursor);

    let nextCursor: number | null = null;
    let itemsToReturn = rawData;

    if (rawData.length > limit) {
      itemsToReturn = rawData.slice(0, limit);
      nextCursor = cursor + limit;
    }

    // Decrypt on the way out
    const items = itemsToReturn.map((entry) => {
      const dec = decryptData(entry.content, userId);
      let optimizedContent = dec;
      try {
        const decompressed = LZString.decompressFromUTF16(dec) || dec;
        const parsed = JSON.parse(decompressed);
        if (parsed && typeof parsed === 'object') {
          // Keep only textContent to save megabytes of base64 images/audio for galaxy endpoint
          parsed.blocks = [];
          optimizedContent = LZString.compressToUTF16(JSON.stringify(parsed));
        }
      } catch (_e) {
        // Not LZString JSON, probably legacy plain text - do nothing
      }
      return {
        ...entry,
        content: optimizedContent,
      };
    });

    const result = { items, nextCursor };
    await this.redis.set(cacheKey, result, 3600); // cache for 1 hour

    return result;
  }
}
