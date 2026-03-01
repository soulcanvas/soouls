/**
 * Namespace: private
 * API:        entries
 * Route:      create — run
 *
 * Called after Zod validation and auth checks pass.
 * Receives typed input + narrowed (authenticated) context + injected services.
 */
import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(
  input: Input,
  ctx: ProtectedContext,
  services: Services,
): Promise<{ id: string }> {
  return services.entries.createEntry(ctx.userId, input.content, input.type);
}
