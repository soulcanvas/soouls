import { verifyToken } from '@clerk/backend';
import { type CanActivate, type ExecutionContext, Inject, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { CommandCenterService } from './command-center.service';

type CommandCenterRequest = Request & {
  commandCenterAdmin?: Awaited<ReturnType<CommandCenterService['ensureAuthorizedAdmin']>>;
};

@Injectable()
export class CommandCenterAuthGuard implements CanActivate {
  constructor(
    @Inject(CommandCenterService)
    private readonly commandCenterService: CommandCenterService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<CommandCenterRequest>();
    const authorization = request.headers.authorization;
    const forwardedUserId = request.headers['x-forwarded-user-id'] as string | undefined;
    const token = authorization?.replace('Bearer ', '');

    let clerkId: string | null = null;

    if (token) {
      const session = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY || '',
      });
      clerkId = session.sub;
    } else if (forwardedUserId) {
      clerkId = forwardedUserId;
    }

    if (!clerkId) {
      return false;
    }

    request.commandCenterAdmin = await this.commandCenterService.ensureAuthorizedAdmin(
      clerkId,
      request.ip ??
        (request.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
        null,
    );

    return true;
  }
}
