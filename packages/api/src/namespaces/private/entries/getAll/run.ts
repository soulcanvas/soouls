/**
 * Namespace: private
 * API:        entries
 * Route:      getAll — run
 *
 * Returns all entries for the authenticated user with full decrypted content.
 * Used by the dashboard timeline to display descriptions and media.
 */
import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(
  input: Input,
  ctx: ProtectedContext,
  services: Services,
) {
  return services.entries.getAllEntries(ctx.userId, input.limit, input.cursor ?? 0);
}
