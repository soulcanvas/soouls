import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

export const schema = z.object({
  brandKey: z.enum(['soouls', 'soouls-studio', 'founder-desk']),
  title: z.string().trim().min(3).max(120),
  subject: z.string().trim().min(3).max(160),
  markdownBody: z.string().trim().min(10).max(20_000),
  whatsappBody: z.string().trim().max(2_000).optional(),
  ctaLabel: z.string().trim().max(40).optional(),
  ctaUrl: z.string().trim().url().optional(),
  channels: z
    .array(z.enum(['email', 'whatsapp']))
    .min(1)
    .max(2),
});

export type Input = z.infer<typeof schema>;

export const config = {
  rateLimit: {
    maxRequests: 6,
    windowMs: 10 * 60 * 1000,
  } satisfies RateLimitConfig,
} as const;
