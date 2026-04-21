import { db } from './src/client';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Running manual migration...');
  
  try {
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_waitlist_user" boolean DEFAULT false NOT NULL`);
    console.log('Added is_waitlist_user to users table');
  } catch(e) { console.warn(e.message); }

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "waitlist_users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "email" text NOT NULL,
        "phone_number" text,
        "source" text DEFAULT 'survey' NOT NULL,
        "claimed_at" timestamp,
        "claimed_by_user_id" uuid,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "waitlist_users_email_unique" UNIQUE("email")
      )
    `);
    console.log('Created waitlist_users table');
  } catch(e) { console.warn(e.message); }

  try {
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'waitlist_users_claimed_by_user_id_users_id_fk'
        ) THEN
          ALTER TABLE "waitlist_users" ADD CONSTRAINT "waitlist_users_claimed_by_user_id_users_id_fk" 
          FOREIGN KEY ("claimed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
        END IF;
      END $$;
    `);
    console.log('Added foreign key constraint');
  } catch(e) { console.warn(e.message); }

  console.log('Done.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
