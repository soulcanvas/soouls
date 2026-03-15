import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

export const schema = z.object({
  email: z.string().email('Enter a valid email address.').trim().toLowerCase(),
});

export type Input = z.infer<typeof schema>;

export const config = {
  rateLimit: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000,
  } satisfies RateLimitConfig,
} as const;
