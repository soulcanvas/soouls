import { verifyToken } from '@clerk/backend';
import { db, eq } from '@soouls/database/client';
import { adminUsers } from '@soouls/database/schema';
import type { Request } from 'express';

export async function createTrpcContext(req: Request) {
  // Get the auth token from the request
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  let userId: string | undefined;

  let isMasquerade = false;

  if (token) {
    try {
      const session = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY || '',
      });
      userId = session.sub;

      // Masquerade logic
      const targetMasqueradeId = req.headers['x-masquerade-session'] as string | undefined;
      if (targetMasqueradeId && targetMasqueradeId !== userId) {
        // Verify this Clerk user is an active super admin or has view:all
        const adminRows = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.clerkId, userId))
          .limit(1);

        const admin = adminRows[0];
        if (
          admin &&
          admin.status === 'active' &&
          (admin.role === 'super_admin' ||
            admin.permissions.includes('view:all') ||
            admin.permissions.includes('*'))
        ) {
          console.warn(
            `[Masquerade] Admin ${admin.email} is impersonating User ${targetMasqueradeId}`,
          );
          userId = targetMasqueradeId;
          isMasquerade = true;
        }
      }
    } catch (error) {
      // Token is invalid, user is not authenticated — continue as anonymous
      console.error('[Auth] Invalid token:', error);
    }
  }

  // req.ip is set correctly when trust proxy is enabled in main.ts
  // Falls back to the socket address if not forwarded
  const ip =
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
    req.ip ??
    '127.0.0.1';

  return {
    userId,
    authToken: token,
    ip,
    isMasquerade,
  };
}
