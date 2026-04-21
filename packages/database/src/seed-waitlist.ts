/**
 * Seed script — import waitlist survey data into the waitlist_users table.
 *
 * Usage:  bun run packages/database/src/seed-waitlist.ts
 */
import { db } from './client';
import { waitlistUsers } from './schema';
import { WAITLIST_DATA } from './waitlist-data';

async function seed() {
  console.log(`[seed] Importing ${WAITLIST_DATA.length} waitlist entries...`);

  let inserted = 0;
  let skipped = 0;

  for (const entry of WAITLIST_DATA) {
    try {
      await db
        .insert(waitlistUsers)
        .values({
          email: entry.email.trim().toLowerCase(),
          phoneNumber: entry.phoneNumber || null,
          source: 'survey',
        })
        .onConflictDoNothing({ target: waitlistUsers.email });

      inserted++;
    } catch (err) {
      skipped++;
      console.warn(`[seed] Skipped ${entry.email}:`, (err as Error).message);
    }
  }

  console.log(`[seed] Done. Inserted: ${inserted}, Skipped: ${skipped}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Fatal error:', err);
  process.exit(1);
});
