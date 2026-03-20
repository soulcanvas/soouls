import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { db } from '@soulcanvas/database/client';
import { and, desc, eq, sql } from '@soulcanvas/database/client';
import { canvasNodes, journalEntries, users } from '@soulcanvas/database/schema';
import LZString from 'lz-string';
import type { RedisService } from '../redis/redis.service';
import { decryptData, encryptData } from '../utils/encryption';

import type { GalaxyEntry, UserEntry } from '@soulcanvas/api';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

@Injectable()
export class EntriesService {
  private readonly CACHE_TTL = {
    ENTRY: 3600,
    ENTRIES_ALL: 1800,
    GALAXY: 3600,
  };

  constructor(private readonly redis: RedisService) {}

  private getCacheKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  private async invalidateUserEntryCache(userId: string): Promise<void> {
    const patterns = [
      this.getCacheKey('entries:all', userId, '*'),
      this.getCacheKey('galaxy', userId, '*'),
    ];
    for (const pattern of patterns) {
      await this.redis.invalidatePattern(pattern);
    }
  }

  async createEntry(userId: string, content: string, type: 'entry' | 'task' = 'entry') {
    const encryptedContent = encryptData(content, userId);

    const [entry] = await db
      .insert(journalEntries)
      .values({
        userId,
        content: encryptedContent,
        type,
      })
      .returning();

    await db.insert(canvasNodes).values({
      entryId: entry.id,
      x: Math.random() * 10 - 5,
      y: Math.random() * 10 - 5,
      z: Math.random() * 10 - 5,
      visualMass: type === 'task' ? 2.0 : 1.0,
    });

    await this.invalidateUserEntryCache(userId);
    return entry;
  }

  async getEntry(userId: string, id: string) {
    const cacheKey = this.getCacheKey('entry', id);
    const cached = await this.redis.get<{ id: string; content: string }>(cacheKey);
    if (cached) return cached;

    const [entry] = await db
      .select({ id: journalEntries.id, content: journalEntries.content })
      .from(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
      .limit(1);

    if (entry) {
      entry.content = decryptData(entry.content, userId);
      await this.redis.set(cacheKey, entry, this.CACHE_TTL.ENTRY);
    }
    return entry || null;
  }

  async updateEntry(userId: string, id: string, content: string) {
    const existing = await db
      .select({ id: journalEntries.id })
      .from(journalEntries)
      .where(sql`${journalEntries.id} = ${id} AND ${journalEntries.userId} = ${userId}`)
      .limit(1);

    if (existing.length === 0) {
      throw new Error('Unauthorized or entry not found.');
    }

    await db
      .update(journalEntries)
      .set({
        content: encryptData(content, userId),
        updatedAt: new Date(),
      })
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));

    await this.redis.del(this.getCacheKey('entry', id));
    await this.invalidateUserEntryCache(userId);
  }

  async getUploadPresignedUrl(userId: string, entryId: string, contentType: string) {
    // Verify ownership ONLY if it's not a temporary ID for a new entry
    if (!entryId.startsWith('temp-')) {
      const existing = await db
        .select({ id: journalEntries.id })
        .from(journalEntries)
        .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
        .limit(1);

      if (existing.length === 0) {
        throw new Error('Unauthorized or entry not found.');
      }
    }

    const bucketParams = {
      Bucket: process.env.R2_BUCKET_NAME || 'soulcanvas-media',
      Key: `entries/${userId}/${entryId}/${Date.now()}`,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(bucketParams);
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    // Construct the final public URL the client will report back
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${bucketParams.Key}`;

    return { uploadUrl: signedUrl, publicUrl };
  }

  async updateEntryMediaUrl(userId: string, entryId: string, mediaUrl: string) {
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

    await this.redis.del(this.getCacheKey('entry', entryId));
    await this.invalidateUserEntryCache(userId);
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
    const cacheKey = this.getCacheKey('galaxy', userId, limit, cursor);
    const cached = await this.redis.get<{ items: GalaxyEntry[]; nextCursor: number | null }>(
      cacheKey,
    );
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
      .orderBy(desc(journalEntries.createdAt))
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
      let previewText = '';
      try {
        const decompressed = LZString.decompressFromUTF16(dec) || dec;
        const parsed = JSON.parse(decompressed);
        if (parsed && typeof parsed === 'object') {
          previewText = parsed.textContent || '';
          // Keep only textContent to save megabytes of base64 images/audio for galaxy endpoint
          parsed.blocks = [];
          optimizedContent = LZString.compressToUTF16(JSON.stringify(parsed));
        } else {
          previewText = dec;
        }
      } catch (_e) {
        // Not LZString JSON, probably legacy plain text
        previewText = dec;
      }
      return {
        ...entry,
        content: optimizedContent,
        previewText,
        // Ensure numbers are never null for the 3D galaxy
        x: entry.x ?? 0,
        y: entry.y ?? 0,
        z: entry.z ?? 0,
      } as GalaxyEntry;
    });

    const result = { items, nextCursor };
    await this.redis.set(cacheKey, result, this.CACHE_TTL.GALAXY);
    return result;
  }

  /**
   * Get all entries for a user with FULL content (not stripped).
   * Used by the dashboard timeline to show descriptions and media.
   */
  async getAllEntries(userId: string, limit = 50, cursor = 0) {
    const cacheKey = this.getCacheKey('entries:all', userId, limit, cursor);
    const cached = await this.redis.get<{ items: UserEntry[]; nextCursor: number | null }>(
      cacheKey,
    );
    if (cached) return cached;

    const rawData = await db
      .select({
        id: journalEntries.id,
        content: journalEntries.content,
        type: journalEntries.type,
        title: journalEntries.title,
        mediaUrl: journalEntries.mediaUrl,
        sentimentColor: journalEntries.sentimentColor,
        sentimentLabel: journalEntries.sentimentLabel,
        createdAt: journalEntries.createdAt,
        updatedAt: journalEntries.updatedAt,
      })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit + 1)
      .offset(cursor);

    let nextCursor: number | null = null;
    let itemsToReturn = rawData;

    if (rawData.length > limit) {
      itemsToReturn = rawData.slice(0, limit);
      nextCursor = cursor + limit;
    }

    // Decrypt full content on the way out
    const items = itemsToReturn.map((entry) => {
      let decryptedContent = '';
      try {
        const dec = decryptData(entry.content, userId);
        const decompressed = LZString.decompressFromUTF16(dec) || dec;
        const parsed = JSON.parse(decompressed);
        decryptedContent = parsed.textContent || decompressed;
      } catch {
        try {
          decryptedContent = decryptData(entry.content, userId);
        } catch {
          decryptedContent = '';
        }
      }
      return {
        ...entry,
        content: decryptedContent,
      };
    });

    const result = { items, nextCursor };
    await this.redis.set(cacheKey, result, this.CACHE_TTL.ENTRIES_ALL);
    return result;
  }

  /**
   * List all entries across all users (admin view).
   * Returns decrypted descriptions with user info.
   */
  async listAllEntriesAdmin(limit = 50, offset = 0) {
    const rawData = await db
      .select({
        id: journalEntries.id,
        userId: journalEntries.userId,
        content: journalEntries.content,
        type: journalEntries.type,
        title: journalEntries.title,
        mediaUrl: journalEntries.mediaUrl,
        sentimentColor: journalEntries.sentimentColor,
        sentimentLabel: journalEntries.sentimentLabel,
        createdAt: journalEntries.createdAt,
        updatedAt: journalEntries.updatedAt,
        userEmail: users.email,
        userName: users.name,
      })
      .from(journalEntries)
      .innerJoin(users, eq(journalEntries.userId, users.id))
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit)
      .offset(offset);

    // Decrypt content for admin view
    const items = rawData.map((entry) => {
      let decryptedContent = '';
      try {
        const dec = decryptData(entry.content, entry.userId);
        const decompressed = LZString.decompressFromUTF16(dec) || dec;
        const parsed = JSON.parse(decompressed);
        decryptedContent = parsed.textContent || decompressed;
      } catch {
        try {
          decryptedContent = decryptData(entry.content, entry.userId);
        } catch {
          decryptedContent = '';
        }
      }
      return {
        id: entry.id,
        userId: entry.userId,
        userEmail: entry.userEmail,
        userName: entry.userName,
        type: entry.type,
        title: entry.title,
        content: decryptedContent,
        mediaUrl: entry.mediaUrl,
        sentimentColor: entry.sentimentColor,
        sentimentLabel: entry.sentimentLabel,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      };
    });

    // Get total count
    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(journalEntries);
    const total = Number(countResult?.count ?? 0);

    return { items, total };
  }

  async migrateMedia(userId: string) {
    const entries = await db.select().from(journalEntries).where(eq(journalEntries.userId, userId));

    let migratedCount = 0;

    for (const entry of entries) {
      const decrypted = decryptData(entry.content, userId);
      let contentData;
      try {
        const decompressed = LZString.decompressFromUTF16(decrypted) || decrypted;
        contentData = JSON.parse(decompressed);
      } catch (e) {
        // Not a JSON block entry, skip
        continue;
      }

      const blocks = contentData.blocks || [];
      let entryChanged = false;

      for (const block of blocks) {
        if (block.type === 'image' && block.dataUrl?.startsWith('data:image')) {
          try {
            // Convert dataUrl to buffer
            const base64Data = block.dataUrl.split(',')[1];
            if (!base64Data) continue;

            const buffer = Buffer.from(base64Data, 'base64');
            const mimeType = block.dataUrl.split(':')[1].split(';')[0];
            const extension = mimeType.split('/')[1] || 'png';
            const fileName = `entries/${userId}/${entry.id}/${Date.now()}.${extension}`;

            const bucketParams = {
              Bucket: process.env.R2_BUCKET_NAME || 'soulcanvas-media',
              Key: fileName,
              Body: buffer,
              ContentType: mimeType,
            };

            await s3.send(new PutObjectCommand(bucketParams));

            const publicUrlBase = process.env.R2_PUBLIC_URL;
            if (publicUrlBase) {
              block.dataUrl = `${publicUrlBase}/${fileName}`;
              entryChanged = true;
            }
          } catch (error) {
            console.error(`Failed to migrate media in entry ${entry.id}`, error);
          }
        }
      }

      if (entryChanged) {
        const updatedContent = JSON.stringify(contentData);
        const compressed = LZString.compressToUTF16(updatedContent);
        const encrypted = encryptData(compressed, userId);

        await db
          .update(journalEntries)
          .set({ content: encrypted, updatedAt: new Date() })
          .where(eq(journalEntries.id, entry.id));

        migratedCount++;
      }
    }

    // Invalidate cache
    await this.redis.del(this.getCacheKey('entry', userId));
    await this.invalidateUserEntryCache(userId);

    return { migratedCount };
  }
}
