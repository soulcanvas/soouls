/**
 * Namespace: private
 * API:        entries
 * Route:      migrateMedia — run
 *
 * Scanned existing base64 image blocks and move them to cloud storage.
 */
import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(
  _input: Input,
  ctx: ProtectedContext,
  services: Services,
): Promise<{ migratedCount: number }> {
  return services.entries.migrateMedia(ctx.userId);
}
