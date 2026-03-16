import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(
  input: Input,
  ctx: ProtectedContext,
  services: Services,
): Promise<{ uploadUrl: string; publicUrl: string }> {
  return services.entries.getUploadPresignedUrl(ctx.userId, input.entryId, input.contentType);
}
