import { db } from './src/client';
import { sql } from 'drizzle-orm';

async function main() {
  const res = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`);
  console.log('users columns:', res.map(r => r.column_name));
  
  const res2 = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_name = 'waitlist_users'`);
  console.log('waitlist table:', res2);
  process.exit(0);
}

main().catch(console.error);
