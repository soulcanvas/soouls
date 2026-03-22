import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(input: Input, ctx: ProtectedContext, services: Services) {
  return services.messaging.updatePreferences(ctx.userId, {
    phoneNumber: input.phoneNumber,
    marketingEmailOptIn: input.marketingEmailOptIn,
    marketingWhatsappOptIn: input.marketingWhatsappOptIn,
    transactionalEmailOptIn: input.transactionalEmailOptIn,
    transactionalWhatsappOptIn: input.transactionalWhatsappOptIn,
  });
}
