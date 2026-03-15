import {
  boolean,
  customType,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// Vector type for pgvector
const vector = customType<{ data: number[] }>({
  dataType() {
    return 'vector(1536)'; // OpenAI text-embedding-3-small size
  },
});

export const entryTypeEnum = pgEnum('entry_type', ['entry', 'task']);
export const messageChannelEnum = pgEnum('message_channel', ['email', 'whatsapp']);
export const userAccountStatusEnum = pgEnum('user_account_status', [
  'active',
  'locked',
  'beta',
  'suspended',
]);
export const billingTierEnum = pgEnum('billing_tier', ['free', 'premium', 'enterprise']);
export const messageDeliveryStatusEnum = pgEnum('message_delivery_status', [
  'pending',
  'sent',
  'failed',
  'skipped',
]);
export const messageCategoryEnum = pgEnum('message_category', [
  'transactional',
  'marketing',
  'security',
  'product',
]);
export const messageCampaignStatusEnum = pgEnum('message_campaign_status', [
  'draft',
  'sending',
  'sent',
  'partially_sent',
  'failed',
]);
export const messageCampaignAudienceEnum = pgEnum('message_campaign_audience', ['all_users']);
export const adminRoleEnum = pgEnum('admin_role', ['support', 'engineer', 'super_admin']);
export const adminAccessStatusEnum = pgEnum('admin_access_status', [
  'invited',
  'active',
  'revoked',
]);
export const adminInviteStatusEnum = pgEnum('admin_invite_status', [
  'pending',
  'accepted',
  'revoked',
  'expired',
]);
export const developerApiKeyStatusEnum = pgEnum('developer_api_key_status', ['active', 'revoked']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(), // Link to Clerk
  email: text('email').notNull().unique(),
  name: text('name'),
  phoneNumber: text('phone_number'),
  accountStatus: userAccountStatusEnum('account_status').default('active').notNull(),
  billingTier: billingTierEnum('billing_tier').default('free').notNull(),
  themePreference: text('theme_preference').default('aurora'),
  mascot: text('mascot').default('Lumi'),
  stripeCustomerId: text('stripe_customer_id'),
  walletAddress: text('wallet_address'),
  marketingEmailOptIn: boolean('marketing_email_opt_in').default(true).notNull(),
  marketingWhatsappOptIn: boolean('marketing_whatsapp_opt_in').default(false).notNull(),
  transactionalEmailOptIn: boolean('transactional_email_opt_in').default(true).notNull(),
  transactionalWhatsappOptIn: boolean('transactional_whatsapp_opt_in').default(false).notNull(),
  welcomeEmailSentAt: timestamp('welcome_email_sent_at'),
  welcomeWhatsappSentAt: timestamp('welcome_whatsapp_sent_at'),
  lastSecureAccessSentAt: timestamp('last_secure_access_sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Journal entries table
export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  content: text('content').notNull(), // Encrypted content
  type: entryTypeEnum('type').default('entry').notNull(),

  // Semantic/AI fields
  embedding: vector('embedding'),
  sentimentScore: real('sentiment_score'),
  sentimentLabel: text('sentiment_label'), // Joy, Anxiety, Peace, etc.
  sentimentColor: text('sentiment_color'), // Hex code

  // Task specific fields
  deadline: timestamp('deadline'),
  status: text('status').default('pending'), // pending, completed

  metadata: jsonb('metadata'), // Additional data like tags, location, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Canvas nodes table (for 3D visualization)
export const canvasNodes = pgTable('canvas_nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  entryId: uuid('entry_id')
    .references(() => journalEntries.id)
    .notNull(),
  x: real('x').notNull(), // Changed to real for smoother positioning
  y: real('y').notNull(),
  z: real('z').notNull(),
  visualMass: real('visual_mass').default(1.0).notNull(), // For gravitational pull
  emotion: text('emotion'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: adminRoleEnum('role').notNull(),
  permissions: jsonb('permissions').$type<string[]>().default([]).notNull(),
  status: adminAccessStatusEnum('status').default('invited').notNull(),
  invitedByAdminUserId: uuid('invited_by_admin_user_id'),
  activatedAt: timestamp('activated_at'),
  revokedAt: timestamp('revoked_at'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const adminInvites = pgTable('admin_invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  role: adminRoleEnum('role').notNull(),
  status: adminInviteStatusEnum('status').default('pending').notNull(),
  invitedByAdminUserId: uuid('invited_by_admin_user_id').references(() => adminUsers.id),
  inviteToken: text('invite_token').notNull().unique(),
  acceptedAt: timestamp('accepted_at'),
  revokedAt: timestamp('revoked_at'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const adminAuditLogs = pgTable('admin_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminUserId: uuid('admin_user_id').references(() => adminUsers.id),
  actorEmail: text('actor_email').notNull(),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id'),
  ipAddress: text('ip_address'),
  metadata: jsonb('metadata').$type<Record<string, unknown> | null>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const featureFlags = pgTable('feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  description: text('description'),
  enabled: boolean('enabled').default(false).notNull(),
  updatedByAdminUserId: uuid('updated_by_admin_user_id').references(() => adminUsers.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const developerApiKeys = pgTable('developer_api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  label: text('label').notNull(),
  keyPrefix: text('key_prefix').notNull(),
  hashedKey: text('hashed_key').notNull(),
  rateLimitPerMinute: integer('rate_limit_per_minute').default(60).notNull(),
  status: developerApiKeyStatusEnum('status').default('active').notNull(),
  createdByAdminUserId: uuid('created_by_admin_user_id').references(() => adminUsers.id),
  revokedAt: timestamp('revoked_at'),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const serviceControls = pgTable('service_controls', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  label: text('label').notNull(),
  description: text('description'),
  enabled: boolean('enabled').default(true).notNull(),
  updatedByAdminUserId: uuid('updated_by_admin_user_id').references(() => adminUsers.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const messageCampaigns = pgTable('message_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdByUserId: uuid('created_by_user_id').references(() => users.id),
  brandKey: text('brand_key').default('soulcanvas').notNull(),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  previewText: text('preview_text'),
  markdownBody: text('markdown_body').notNull(),
  whatsappBody: text('whatsapp_body').notNull(),
  ctaLabel: text('cta_label'),
  ctaUrl: text('cta_url'),
  audience: messageCampaignAudienceEnum('audience').default('all_users').notNull(),
  channels: jsonb('channels').$type<Array<'email' | 'whatsapp'>>().notNull(),
  status: messageCampaignStatusEnum('status').default('draft').notNull(),
  totalRecipients: integer('total_recipients').default(0).notNull(),
  emailRecipients: integer('email_recipients').default(0).notNull(),
  whatsappRecipients: integer('whatsapp_recipients').default(0).notNull(),
  lastSentAt: timestamp('last_sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messageDeliveries = pgTable('message_deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  campaignId: uuid('campaign_id').references(() => messageCampaigns.id),
  brandKey: text('brand_key').default('soulcanvas').notNull(),
  channel: messageChannelEnum('channel').notNull(),
  category: messageCategoryEnum('category').notNull(),
  templateKey: text('template_key').notNull(),
  subject: text('subject'),
  recipient: text('recipient').notNull(),
  provider: text('provider').notNull(),
  providerMessageId: text('provider_message_id'),
  status: messageDeliveryStatusEnum('status').default('pending').notNull(),
  errorMessage: text('error_message'),
  payload: jsonb('payload').$type<Record<string, unknown> | null>(),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
