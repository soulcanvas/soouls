import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(input: Input, ctx: ProtectedContext, services: Services) {
  return services.messaging.sendCampaign(ctx.userId, {
    brandKey: input.brandKey,
    title: input.title,
    subject: input.subject,
    markdownBody: input.markdownBody,
    whatsappBody: input.whatsappBody,
    ctaLabel: input.ctaLabel,
    ctaUrl: input.ctaUrl,
    channels: input.channels,
  });
}
