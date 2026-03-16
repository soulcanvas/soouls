import { Inject, Injectable } from '@nestjs/common';
import { and, db, desc, eq, sql } from '@soulcanvas/database/client';
import { messageCampaigns, messageDeliveries, users } from '@soulcanvas/database/schema';
import {
  countValue,
  normalizePhoneNumber,
  parseEnvList,
} from '../notifications/notification.constants';
import { NotificationQueueService } from '../notifications/notification.queue';
import { buildCampaignTemplate } from '../notifications/notification.templates';
import {
  BRAND_PRESETS,
  type CampaignInput,
  type Channel,
  type PreferencesInput,
  type UserMessagingProfile,
  getBrandPreset,
} from '../notifications/notification.types';

@Injectable()
export class MessagingService {
  private readonly adminEmails = parseEnvList(process.env.MESSAGING_ADMIN_EMAILS);
  private readonly adminClerkIds = parseEnvList(process.env.MESSAGING_ADMIN_CLERK_IDS);

  constructor(
    @Inject(NotificationQueueService)
    private readonly notificationQueue: NotificationQueueService,
  ) {}

  private isAdmin(user: Pick<UserMessagingProfile, 'email' | 'clerkId'>) {
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }

    return (
      this.adminEmails.has(user.email.toLowerCase()) ||
      this.adminClerkIds.has(user.clerkId.toLowerCase())
    );
  }

  private getProviderHealth() {
    return {
      emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.MESSAGING_FROM_EMAIL),
      whatsappConfigured: Boolean(
        process.env.TWILIO_ACCOUNT_SID &&
          process.env.TWILIO_AUTH_TOKEN &&
          process.env.TWILIO_WHATSAPP_FROM,
      ),
      queueConfigured: this.notificationQueue.isConfigured(),
      newsletterConfigured: Boolean(process.env.NEWSLETTER_SYNC_URL),
      commandCenterConfigured: Boolean(
        process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      ),
    };
  }

  private async getUserByDbId(userId: string) {
    const [user] = await db
      .select({
        id: users.id,
        clerkId: users.clerkId,
        email: users.email,
        name: users.name,
        phoneNumber: users.phoneNumber,
        marketingEmailOptIn: users.marketingEmailOptIn,
        marketingWhatsappOptIn: users.marketingWhatsappOptIn,
        transactionalEmailOptIn: users.transactionalEmailOptIn,
        transactionalWhatsappOptIn: users.transactionalWhatsappOptIn,
        welcomeEmailSentAt: users.welcomeEmailSentAt,
        welcomeWhatsappSentAt: users.welcomeWhatsappSentAt,
        lastSecureAccessSentAt: users.lastSecureAccessSentAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found.');
    }

    return user satisfies UserMessagingProfile;
  }

  private async buildCenterData() {
    const [usersCountRow] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [emailReachableRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.email} is not null`);
    const [whatsappReachableRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.phoneNumber} is not null`);

    const campaigns = (
      await db
        .select({
          id: messageCampaigns.id,
          brandKey: messageCampaigns.brandKey,
          title: messageCampaigns.title,
          subject: messageCampaigns.subject,
          status: messageCampaigns.status,
          channels: messageCampaigns.channels,
          totalRecipients: messageCampaigns.totalRecipients,
          emailRecipients: messageCampaigns.emailRecipients,
          whatsappRecipients: messageCampaigns.whatsappRecipients,
          lastSentAt: messageCampaigns.lastSentAt,
          createdAt: messageCampaigns.createdAt,
        })
        .from(messageCampaigns)
        .orderBy(desc(messageCampaigns.createdAt))
        .limit(8)
    ).map((campaign) => ({
      ...campaign,
      brandKey: getBrandPreset(campaign.brandKey).key,
    }));

    const recentDeliveries = (
      await db
        .select({
          id: messageDeliveries.id,
          brandKey: messageDeliveries.brandKey,
          channel: messageDeliveries.channel,
          category: messageDeliveries.category,
          templateKey: messageDeliveries.templateKey,
          status: messageDeliveries.status,
          recipient: messageDeliveries.recipient,
          subject: messageDeliveries.subject,
          provider: messageDeliveries.provider,
          createdAt: messageDeliveries.createdAt,
        })
        .from(messageDeliveries)
        .orderBy(desc(messageDeliveries.createdAt))
        .limit(12)
    ).map((delivery) => ({
      ...delivery,
      brandKey: getBrandPreset(delivery.brandKey).key,
    }));

    const queue = await this.notificationQueue.getCounts();

    return {
      providerHealth: this.getProviderHealth(),
      queue,
      stats: {
        totalUsers: countValue(usersCountRow?.count),
        emailReachable: countValue(emailReachableRow?.count),
        whatsappReachable: countValue(whatsappReachableRow?.count),
        campaignsSent: campaigns.length,
      },
      brands: Object.values(BRAND_PRESETS).map((brand) => ({
        key: brand.key,
        label: brand.label,
        eyebrow: brand.eyebrow,
      })),
      campaigns,
      recentDeliveries,
      templates: [
        {
          key: 'welcome',
          label: 'Welcome',
          description: 'Queued after signup, then sent by the notification worker.',
        },
        {
          key: 'secure-access',
          label: 'Secure Access',
          description: 'Magic-link recovery sent by the background worker.',
        },
        {
          key: 'campaign',
          label: 'Campaign',
          description: 'Markdown-powered release, product, and launch announcements.',
        },
      ],
    };
  }

  private async queueCampaign(input: CampaignInput, createdByUserId?: string | null) {
    const sanitizedChannels = Array.from(new Set(input.channels)).filter(
      (channel): channel is Channel => channel === 'email' || channel === 'whatsapp',
    );

    if (sanitizedChannels.length === 0) {
      throw new Error('Choose at least one channel for the campaign.');
    }

    const template = buildCampaignTemplate({
      brandKey: input.brandKey,
      subject: input.subject,
      markdownBody: input.markdownBody,
      ctaLabel: input.ctaLabel,
      ctaUrl: input.ctaUrl,
      whatsappBody: input.whatsappBody,
    });

    const conditions = [];

    // Safety filters to ensure we don't accidentally send to people who opted out
    if (sanitizedChannels.includes('email')) {
      conditions.push(sql`${users.email} is not null`);
      conditions.push(eq(users.marketingEmailOptIn, true));
    }
    if (sanitizedChannels.includes('whatsapp')) {
      conditions.push(sql`${users.phoneNumber} is not null`);
      conditions.push(eq(users.marketingWhatsappOptIn, true));
    }

    if (input.targeting) {
      if (input.targeting.signupDate === 'last_7_days') {
        conditions.push(sql`${users.createdAt} > now() - interval '7 days'`);
      } else if (input.targeting.signupDate === 'last_30_days') {
        conditions.push(sql`${users.createdAt} > now() - interval '30 days'`);
      } else if (input.targeting.signupDate === 'older_than_30') {
        conditions.push(sql`${users.createdAt} < now() - interval '30 days'`);
      }

      // We don't have lastLoginAt on Users yet, so mock or skip it for now.
    }

    const baseQuery = db.select({ count: sql<number>`count(*)` }).from(users);
    if (conditions.length > 0) {
      baseQuery.where(and(...conditions));
    }

    const [audienceCountRow] = await baseQuery;
    const estimatedRecipients = countValue(audienceCountRow?.count);

    const [campaign] = await db
      .insert(messageCampaigns)
      .values({
        createdByUserId: createdByUserId ?? null,
        brandKey: input.brandKey,
        title: input.title,
        subject: input.subject,
        previewText: template.previewText,
        markdownBody: input.markdownBody,
        whatsappBody: template.whatsappBody,
        ctaLabel: input.ctaLabel,
        ctaUrl: input.ctaUrl,
        channels: sanitizedChannels,
        targeting: input.targeting as any,
        status: 'sending',
        totalRecipients: estimatedRecipients,
        updatedAt: new Date(),
      })
      .returning({ id: messageCampaigns.id });

    await this.notificationQueue.enqueueCampaignDispatch(campaign.id);

    return {
      campaignId: campaign.id,
      status: 'queued' as const,
      totalRecipients: estimatedRecipients,
      emailRecipients: 0,
      whatsappRecipients: 0,
      failedCount: 0,
    };
  }

  async sendWelcomeSequence(userId: string) {
    try {
      await this.notificationQueue.enqueueWelcomeSequence(userId);
    } catch (error) {
      console.error('[Messaging] Failed to enqueue welcome sequence', { userId, error });
    }
  }

  async requestSecureAccessLink(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    await this.notificationQueue.enqueueSecureAccess(normalizedEmail);
    return { accepted: true };
  }

  async getCenter(userId: string) {
    const viewer = await this.getUserByDbId(userId);
    const canManageCampaigns = this.isAdmin(viewer);

    if (!canManageCampaigns) {
      return {
        viewer: {
          email: viewer.email,
          name: viewer.name,
          canManageCampaigns,
        },
        preferences: {
          phoneNumber: viewer.phoneNumber,
          marketingEmailOptIn: viewer.marketingEmailOptIn,
          marketingWhatsappOptIn: viewer.marketingWhatsappOptIn,
          transactionalEmailOptIn: viewer.transactionalEmailOptIn,
          transactionalWhatsappOptIn: viewer.transactionalWhatsappOptIn,
          welcomeEmailSentAt: viewer.welcomeEmailSentAt,
          welcomeWhatsappSentAt: viewer.welcomeWhatsappSentAt,
          lastSecureAccessSentAt: viewer.lastSecureAccessSentAt,
        },
        providerHealth: this.getProviderHealth(),
        templates: [
          {
            key: 'welcome',
            label: 'Welcome',
            description: 'Sent the first time a SoulCanvas user is synced into the product.',
          },
          {
            key: 'secure-access',
            label: 'Secure Access',
            description: 'Recovery email and WhatsApp flow that helps a user re-enter safely.',
          },
          {
            key: 'campaign',
            label: 'Campaign',
            description: 'Broadcast updates to everyone in the messaging system.',
          },
        ],
        stats: null,
        brands: Object.values(BRAND_PRESETS).map((brand) => ({
          key: brand.key,
          label: brand.label,
          eyebrow: brand.eyebrow,
        })),
        campaigns: [],
        recentDeliveries: [],
      };
    }

    const center = await this.buildCenterData();

    return {
      viewer: {
        email: viewer.email,
        name: viewer.name,
        canManageCampaigns,
      },
      preferences: {
        phoneNumber: viewer.phoneNumber,
        marketingEmailOptIn: viewer.marketingEmailOptIn,
        marketingWhatsappOptIn: viewer.marketingWhatsappOptIn,
        transactionalEmailOptIn: viewer.transactionalEmailOptIn,
        transactionalWhatsappOptIn: viewer.transactionalWhatsappOptIn,
        welcomeEmailSentAt: viewer.welcomeEmailSentAt,
        welcomeWhatsappSentAt: viewer.welcomeWhatsappSentAt,
        lastSecureAccessSentAt: viewer.lastSecureAccessSentAt,
      },
      ...center,
    };
  }

  async getAdminCenter() {
    return this.buildCenterData();
  }

  async updatePreferences(userId: string, input: PreferencesInput) {
    const [updated] = await db
      .update(users)
      .set({
        phoneNumber: normalizePhoneNumber(input.phoneNumber),
        marketingEmailOptIn: input.marketingEmailOptIn,
        marketingWhatsappOptIn: input.marketingWhatsappOptIn,
        transactionalEmailOptIn: input.transactionalEmailOptIn,
        transactionalWhatsappOptIn: input.transactionalWhatsappOptIn,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        phoneNumber: users.phoneNumber,
        marketingEmailOptIn: users.marketingEmailOptIn,
        marketingWhatsappOptIn: users.marketingWhatsappOptIn,
        transactionalEmailOptIn: users.transactionalEmailOptIn,
        transactionalWhatsappOptIn: users.transactionalWhatsappOptIn,
        welcomeEmailSentAt: users.welcomeEmailSentAt,
        welcomeWhatsappSentAt: users.welcomeWhatsappSentAt,
        lastSecureAccessSentAt: users.lastSecureAccessSentAt,
      });

    return updated;
  }

  async sendCampaign(userId: string, input: CampaignInput) {
    const sender = await this.getUserByDbId(userId);
    if (!this.isAdmin(sender)) {
      throw new Error('You are not allowed to send campaigns.');
    }

    return this.queueCampaign(input, sender.id);
  }

  async createAdminCampaign(input: CampaignInput) {
    return this.queueCampaign(input, null);
  }
}
