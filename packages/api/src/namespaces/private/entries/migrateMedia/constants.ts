import { z } from 'zod';

export const inputSchema = z.object({});
export type Input = z.infer<typeof inputSchema>;

export const config = {
  rateLimit: {
    maxRequests: 5,
    windowMs: 60_000, // 1 minute
  },
};
