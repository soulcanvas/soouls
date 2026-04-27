import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

mock.module('../notifications/notification.templates', () => ({
  buildCampaignTemplate: mock(async () => ({
    subject: 'Campaign subject',
    previewText: 'Campaign preview',
    html: '<p>Campaign</p>',
    text: 'Campaign',
    whatsappBody: 'Campaign',
  })),
  buildAdminInviteTemplate: mock(async () => ({
    subject: 'Admin Invite',
    previewText: 'Admin Invite',
    html: '<p>Invite</p>',
    text: 'Invite',
    whatsappBody: 'Invite',
  })),
  buildSecureAccessTemplate: mock(async () => ({
    subject: 'Secure Access',
    previewText: 'Secure Access',
    html: '<p>Secure</p>',
    text: 'Secure',
    whatsappBody: 'Secure',
  })),
  buildWelcomeTemplate: mock(async () => ({
    subject: 'Welcome',
    previewText: 'Welcome',
    html: '<p>Welcome</p>',
    text: 'Welcome',
    whatsappBody: 'Welcome',
  })),
}));

mock.module('resend', () => ({
  Resend: class Resend {
    emails = {
      send: mock(async () => ({ data: { id: 'email-id' }, error: null })),
    };
  },
}));

mock.module('@soouls/database/schema', () => ({
  adminInvites: { id: 'admin_invites.id' },
  adminUsers: { userId: 'admin_users.user_id' },
  canvasNodes: { entryId: 'canvas_nodes.entry_id' },
  journalEntries: {
    id: 'journal_entries.id',
    userId: 'journal_entries.user_id',
    createdAt: 'journal_entries.created_at',
  },
  messageCampaigns: {
    id: 'message_campaigns.id',
  },
  messageDeliveries: {
    id: 'message_deliveries.id',
  },
  users: {
    clerkId: 'users.clerk_id',
    createdAt: 'users.created_at',
    email: 'users.email',
    id: 'users.id',
    lastSecureAccessSentAt: 'users.last_secure_access_sent_at',
    marketingEmailOptIn: 'users.marketing_email_opt_in',
    marketingWhatsappOptIn: 'users.marketing_whatsapp_opt_in',
    name: 'users.name',
    phoneNumber: 'users.phone_number',
    transactionalEmailOptIn: 'users.transactional_email_opt_in',
    transactionalWhatsappOptIn: 'users.transactional_whatsapp_opt_in',
    updatedAt: 'users.updated_at',
    welcomeEmailSentAt: 'users.welcome_email_sent_at',
    welcomeWhatsappSentAt: 'users.welcome_whatsapp_sent_at',
  },
}));

mock.module('@soouls/database/client', () => ({
  db: {
    select: mock(() => undefined),
    insert: mock(() => undefined),
    update: mock(() => undefined),
  },
  and: (...args: unknown[]) => args,
  desc: (value: unknown) => value,
  eq: (...args: unknown[]) => args,
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values }),
}));

let MessagingService: typeof import('./messaging.service.js').MessagingService;

describe('MessagingService.sendWelcomeSequence', () => {
  const queue = {
    enqueueWelcomeSequence: mock(async (_userId: string) => undefined),
    getCounts: mock(async () => ({ waiting: 0, active: 0, delayed: 0, failed: 0 })),
    isConfigured: mock(() => true),
  };

  const redis = {
    del: mock(async (_key: string) => undefined),
    get: mock(async (_key: string) => null),
    set: mock(async (_key: string, _value: unknown, _ttl: number) => undefined),
  };

  const dispatcher = {
    processWelcomeSequence: mock(async (_userId: string) => undefined),
  };

  beforeAll(async () => {
    ({ MessagingService } = await import('./messaging.service.js'));
  });

  beforeEach(() => {
    queue.enqueueWelcomeSequence.mockReset();
    queue.getCounts.mockReset();
    queue.isConfigured.mockReset();
    redis.del.mockReset();
    redis.get.mockReset();
    redis.set.mockReset();
    dispatcher.processWelcomeSequence.mockReset();

    queue.enqueueWelcomeSequence.mockImplementation(async (_userId: string) => undefined);
    queue.getCounts.mockImplementation(async () => ({
      waiting: 0,
      active: 0,
      delayed: 0,
      failed: 0,
    }));
    queue.isConfigured.mockImplementation(() => true);
    redis.del.mockImplementation(async (_key: string) => undefined);
    redis.get.mockImplementation(async (_key: string) => null);
    redis.set.mockImplementation(async (_key: string, _value: unknown, _ttl: number) => undefined);
    dispatcher.processWelcomeSequence.mockImplementation(async (_userId: string) => undefined);
  });

  it('falls back to direct welcome dispatch when queueing fails', async () => {
    const service = new (MessagingService as any)(queue, dispatcher, redis);
    queue.enqueueWelcomeSequence.mockRejectedValueOnce(
      new Error('REDIS_URL is not configured for the notifications queue.'),
    );

    await service.sendWelcomeSequence('user-123');

    expect(queue.enqueueWelcomeSequence).toHaveBeenCalledWith('user-123');
    expect(dispatcher.processWelcomeSequence).toHaveBeenCalledWith('user-123');
  });
});
