/**
 * Namespace: private
 * API:        entries
 * Route:      getOne — run
 *
 * Called after Zod validation and auth checks pass.
 */
import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(
  input: Input,
  ctx: ProtectedContext,
  services: Services,
): Promise<{ id: string; content: string } | null> {
  return services.entries.getEntry(ctx.userId, input.id);
}
