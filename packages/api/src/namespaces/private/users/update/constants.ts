import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

export const schema = z.object({
  name: z.string().min(1).max(100).optional(),
  themePreference: z.string().max(50).optional(),
  mascot: z.string().max(50).optional(),
  marketingEmailOptIn: z.boolean().optional(),
  marketingWhatsappOptIn: z.boolean().optional(),
  transactionalEmailOptIn: z.boolean().optional(),
  transactionalWhatsappOptIn: z.boolean().optional(),
});

export type Input = z.infer<typeof schema>;

export const config = {
  rateLimit: {
    maxRequests: 10,
    windowMs: 60_000,
  } satisfies RateLimitConfig,
} as const;
