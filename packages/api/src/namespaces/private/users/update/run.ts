import type { Services, TrpcContext } from '../../../../router.js';
import type { Input } from './constants.js';

export async function run(input: Input, ctx: TrpcContext, services: Services) {
  if (!ctx.userId) {
    throw new Error('User context missing');
  }

  await services.users.updateUser(ctx.userId, input);
}
