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
    const token = authorization?.replace('Bearer ', '');

    if (!token) {
      return false;
    }

    const session = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY || '',
    });

    request.commandCenterAdmin = await this.commandCenterService.ensureAuthorizedAdmin(
      session.sub,
      request.ip ??
        (request.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
        null,
    );

    return true;
  }
}
