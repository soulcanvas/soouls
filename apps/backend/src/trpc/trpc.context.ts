import { verifyToken } from '@clerk/backend';
import type { Request } from 'express';

export async function createTrpcContext(req: Request) {
  // Get the auth token from the request
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  let userId: string | undefined;

  if (token) {
    try {
      const session = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY || '',
      });
      userId = session.sub;
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
  };
}
