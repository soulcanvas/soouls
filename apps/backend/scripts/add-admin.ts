process.env.DATABASE_URL = process.env.DATABASE_URL?.replace('&channel_binding=require', '');
import { db } from '@soulcanvas/database/client';
import { adminUsers } from '@soulcanvas/database/schema';

async function run() {
  try {
    console.log('Inserting/updating super admin: rudra195957@gmail.com');
    await db
      .insert(adminUsers)
      .values({
        email: 'rudra195957@gmail.com',
        role: 'super_admin',
        status: 'active',
        permissions: [
          'view:all',
          'mutate:users',
          'mutate:invites',
          'mutate:api_keys',
          'mutate:feature_flags',
          'mutate:service_controls',
          'mutate:queues',
          'mutate:messaging',
        ],
      })
      .onConflictDoUpdate({
        target: adminUsers.email,
        set: {
          role: 'super_admin',
          status: 'active',
          permissions: [
            'view:all',
            'mutate:users',
            'mutate:invites',
            'mutate:api_keys',
            'mutate:feature_flags',
            'mutate:service_controls',
            'mutate:queues',
            'mutate:messaging',
          ],
        },
      });
    console.log('Success! Super admin access granted.');
  } catch (err) {
    console.error('Failed to grant access:', err);
  } finally {
    process.exit(0);
  }
}

run();
