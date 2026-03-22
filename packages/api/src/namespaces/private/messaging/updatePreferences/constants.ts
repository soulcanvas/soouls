import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

export const schema = z.object({
  phoneNumber: z.string().trim().min(7).max(24).nullable().optional(),
  marketingEmailOptIn: z.boolean(),
  marketingWhatsappOptIn: z.boolean(),
  transactionalEmailOptIn: z.boolean(),
  transactionalWhatsappOptIn: z.boolean(),
});

export type Input = z.infer<typeof schema>;

export const config = {
  rateLimit: {
    maxRequests: 20,
    windowMs: 60_000,
  } satisfies RateLimitConfig,
} as const;
