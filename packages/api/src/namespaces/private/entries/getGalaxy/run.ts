import type { GalaxyEntry } from '../../../../router.js';
/**
 * Namespace: private
 * API:        entries
 * Route:      getGalaxy — run
 *
 * Called after auth checks pass. No user input — scoped 100% to authed user.
 */
import type { ProtectedContext, Services } from '../../../../trpc.js';

export async function run(
  _input: undefined,
  ctx: ProtectedContext,
  services: Services,
): Promise<GalaxyEntry[]> {
  return services.entries.getGalaxyData(ctx.userId);
}
