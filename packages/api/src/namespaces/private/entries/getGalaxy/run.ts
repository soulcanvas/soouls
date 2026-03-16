import type { GalaxyEntry } from '../../../../router.js';
/**
 * Namespace: private
 * API:        entries
 * Route:      getGalaxy — run
 *
 * Called after auth checks pass. No user input — scoped 100% to authed user.
 */
import type { ProtectedContext, Services } from '../../../../trpc.js';

import type { Input } from './constants.js';

export async function run(
  input: Input,
  ctx: ProtectedContext,
  services: Services,
): Promise<{ items: GalaxyEntry[]; nextCursor: number | null }> {
  return services.entries.getGalaxyData(ctx.userId, input.limit, input.cursor ?? 0);
}
