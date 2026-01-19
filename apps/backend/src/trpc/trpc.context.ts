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
      // Token is invalid, user is not authenticated
      console.error('Invalid token:', error);
    }
  }

  return {
    userId,
    authToken: token,
  };
}
