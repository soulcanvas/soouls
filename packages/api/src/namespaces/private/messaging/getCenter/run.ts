import type { ProtectedContext, Services } from '../../../../trpc.js';

export async function run(_input: undefined, ctx: ProtectedContext, services: Services) {
  return services.messaging.getCenter(ctx.userId);
}
