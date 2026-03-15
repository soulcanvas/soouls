import type { Services, TrpcContext } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(input: Input, _ctx: TrpcContext, services: Services) {
  return services.messaging.requestSecureAccessLink(input.email);
}
