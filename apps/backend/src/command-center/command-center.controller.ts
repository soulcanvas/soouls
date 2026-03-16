import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CommandCenterAuthGuard } from './command-center.auth.guard';
import { CommandCenterService } from './command-center.service';

type CommandCenterRequest = Request & {
  commandCenterAdmin?: { clerkId: string | null };
};

@Controller('command-center')
@UseGuards(CommandCenterAuthGuard)
export class CommandCenterController {
  constructor(
    @Inject(CommandCenterService)
    private readonly commandCenterService: CommandCenterService,
  ) {}

  private getClerkId(request: CommandCenterRequest) {
    const clerkId = request.commandCenterAdmin?.clerkId;
    if (!clerkId) {
      throw new Error('Admin session is missing a Clerk ID.');
    }

    return clerkId;
  }

  @Get('me')
  async me(@Req() request: CommandCenterRequest) {
    return this.commandCenterService.getViewer(this.getClerkId(request), request.ip);
  }

  @Get('overview')
  async overview(@Req() request: CommandCenterRequest) {
    return this.commandCenterService.getOverview(this.getClerkId(request), request.ip);
  }

  @Get('iam')
  async iam(@Req() request: CommandCenterRequest) {
    return this.commandCenterService.listIam(this.getClerkId(request), request.ip);
  }

  @Post('iam/invite')
  async inviteAdmin(
    @Req() request: CommandCenterRequest,
    @Body() body: {
      email: string;
      role: 'support' | 'engineer' | 'super_admin';
      permissions?: string[];
    },
  ) {
    return this.commandCenterService.inviteAdmin(this.getClerkId(request), body, request.ip);
  }

  @Post('iam/:adminUserId/revoke')
  async revokeAdmin(
    @Req() request: CommandCenterRequest,
    @Param('adminUserId') adminUserId: string,
  ) {
    return this.commandCenterService.revokeAdmin(this.getClerkId(request), adminUserId, request.ip);
  }

  @Get('users')
  async users(@Req() request: CommandCenterRequest, @Query('q') query = '') {
    return this.commandCenterService.searchUsers(this.getClerkId(request), query, request.ip);
  }

  @Get('users/:userId')
  async userProfile(@Req() request: CommandCenterRequest, @Param('userId') userId: string) {
    return this.commandCenterService.getUserProfile(this.getClerkId(request), userId, request.ip);
  }

  @Post('users/:userId/password-reset')
  async sendPasswordReset(@Req() request: CommandCenterRequest, @Param('userId') userId: string) {
    return this.commandCenterService.sendPasswordReset(
      this.getClerkId(request),
      userId,
      request.ip,
    );
  }

  @Post('users/:userId/force-logout')
  async forceLogout(@Req() request: CommandCenterRequest, @Param('userId') userId: string) {
    return this.commandCenterService.forceLogoutAllDevices(
      this.getClerkId(request),
      userId,
      request.ip,
    );
  }

  @Patch('users/:userId/billing-tier')
  async updateBillingTier(
    @Req() request: CommandCenterRequest,
    @Param('userId') userId: string,
    @Body() body: { billingTier: 'free' | 'premium' | 'enterprise' },
  ) {
    return this.commandCenterService.updateBillingTier(
      this.getClerkId(request),
      userId,
      body.billingTier,
      request.ip,
    );
  }

  @Patch('users/:userId/account-status')
  async updateAccountStatus(
    @Req() request: CommandCenterRequest,
    @Param('userId') userId: string,
    @Body() body: { status: 'active' | 'locked' | 'beta' | 'suspended' },
  ) {
    return this.commandCenterService.updateAccountStatus(
      this.getClerkId(request),
      userId,
      body.status,
      request.ip,
    );
  }

  @Post('users/:userId/hard-delete')
  async hardDelete(@Req() request: CommandCenterRequest, @Param('userId') userId: string) {
    return this.commandCenterService.hardDeleteUser(this.getClerkId(request), userId, request.ip);
  }

  @Get('feature-flags')
  async featureFlags(@Req() request: CommandCenterRequest) {
    return this.commandCenterService.listFeatureFlags(this.getClerkId(request), request.ip);
  }

  @Patch('feature-flags/:key')
  async updateFeatureFlag(
    @Req() request: CommandCenterRequest,
    @Param('key') key: string,
    @Body() body: { enabled: boolean; description?: string },
  ) {
    return this.commandCenterService.setFeatureFlag(
      this.getClerkId(request),
      {
        key,
        enabled: body.enabled,
        description: body.description,
      },
      request.ip,
    );
  }

  @Get('api-keys')
  async apiKeys(@Req() request: CommandCenterRequest) {
    return this.commandCenterService.listApiKeys(this.getClerkId(request), request.ip);
  }

  @Post('api-keys')
  async createApiKey(
    @Req() request: CommandCenterRequest,
    @Body() body: { label: string; rateLimitPerMinute: number },
  ) {
    return this.commandCenterService.createApiKey(this.getClerkId(request), body, request.ip);
  }

  @Post('api-keys/:apiKeyId/revoke')
  async revokeApiKey(@Req() request: CommandCenterRequest, @Param('apiKeyId') apiKeyId: string) {
    return this.commandCenterService.revokeApiKey(this.getClerkId(request), apiKeyId, request.ip);
  }

  @Get('service-controls')
  async serviceControlList(@Req() request: CommandCenterRequest) {
    return this.commandCenterService.listServiceControls(this.getClerkId(request), request.ip);
  }

  @Patch('service-controls/:key')
  async updateServiceControl(
    @Req() request: CommandCenterRequest,
    @Param('key') key: string,
    @Body() body: { enabled: boolean },
  ) {
    return this.commandCenterService.setServiceControl(
      this.getClerkId(request),
      { key, enabled: body.enabled },
      request.ip,
    );
  }

  @Get('health')
  async health(@Req() request: CommandCenterRequest) {
    return this.commandCenterService.getHealth(this.getClerkId(request), request.ip);
  }

  @Get('audit-logs')
  async auditLogs(@Req() request: CommandCenterRequest) {
    return this.commandCenterService.listAuditLogs(this.getClerkId(request), request.ip);
  }

  @Get('messaging')
  async messaging(@Req() request: CommandCenterRequest) {
    return this.commandCenterService.getMessagingCenter(this.getClerkId(request), request.ip);
  }

  @Post('messaging/campaigns')
  async createCampaign(
    @Req() request: CommandCenterRequest,
    @Body()
    body: {
      brandKey: 'soulcanvas' | 'soulcanvas-studio' | 'founder-desk';
      title: string;
      subject: string;
      markdownBody: string;
      whatsappBody?: string;
      ctaLabel?: string;
      ctaUrl?: string;
      channels: Array<'email' | 'whatsapp'>;
      targeting?: {
        nodeCount?: string;
        signupDate?: string;
        lastLogin?: string;
      };
    },
  ) {
    return this.commandCenterService.createMessagingCampaign(
      this.getClerkId(request),
      body,
      request.ip,
    );
  }

  @Get('billing')
  async billing(@Req() request: CommandCenterRequest) {
    return this.commandCenterService.getBillingOverview(this.getClerkId(request), request.ip);
  }

  @Get('ai-telemetry')
  async aiTelemetry(@Req() request: CommandCenterRequest) {
    return this.commandCenterService.getAiTelemetry(this.getClerkId(request), request.ip);
  }

  @Post('users/:id/gdpr-export')
  async queueGdprExport(@Req() request: CommandCenterRequest, @Param('id') userId: string) {
    return this.commandCenterService.queueGdprExport(this.getClerkId(request), userId, request.ip);
  }

  @Get('rate-limits')
  async getRateLimits(@Req() request: CommandCenterRequest) {
    return this.commandCenterService.getRateLimits(this.getClerkId(request), request.ip);
  }
}
