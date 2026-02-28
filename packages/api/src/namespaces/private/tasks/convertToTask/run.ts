/**
 * Namespace: private
 * API:        tasks
 * Route:      convertToTask — run
 *
 * Called after Zod validation and auth checks pass.
 */
import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(
  input: Input,
  ctx: ProtectedContext,
  services: Services,
): Promise<{ success: true }> {
  await services.tasks.convertToTask(ctx.userId, input.entryId, new Date(input.deadline));
  return { success: true };
}
