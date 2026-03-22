import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../packages/database/src/schema/index';
import { eq, and } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || '';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

async function migrate() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Please provide a user ID');
    process.exit(1);
  }

  console.log(`Starting media migration for user: ${userId}`);

  const entries = await db
    .select()
    .from(schema.journalEntries)
    .where(eq(schema.journalEntries.userId, userId));

  for (const entry of entries) {
    let contentChanged = false;
    let contentData;

    try {
      // In a real scenario, we'd need the encryption key. 
      // For this script, we assume the user might have provided it or it's accessible.
      // But actually, we can't easily decrypt here without the user's clerk token/context.
      // ALTERNATIVE: Use a tRPC procedure so it runs in the backend context with auth.
      console.warn(`Skipping entry ${entry.id} - decryption requires user context.`);
    } catch (e) {
      console.error(`Failed to process entry ${entry.id}`, e);
    }
  }
}

// migrate();
