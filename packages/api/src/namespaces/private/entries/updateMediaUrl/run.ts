import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(input: Input, ctx: ProtectedContext, services: Services): Promise<void> {
  return services.entries.updateEntryMediaUrl(ctx.userId, input.entryId, input.mediaUrl);
}
