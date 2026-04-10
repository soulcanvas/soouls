import { db } from './apps/backend/node_modules/@soouls/database/client';
import { adminUsers, users } from './apps/backend/node_modules/@soouls/database/schema';

async function run() {
  const allAdmins = await db.select().from(adminUsers);
  console.log('Admin Users:', allAdmins);
  const user = await db.select().from(users).limit(5);
  console.log(
    'Users:',
    user.map((u) => u.email),
  );
  process.exit(0);
}
run();
