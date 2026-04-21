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
export const entryStatusEnum = pgEnum('entry_status', ['draft', 'published', 'archived']);
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

// ────────────────────────────────────────
// Users table
// ────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(), // Link to Clerk
  email: text('email').notNull().unique(),
  name: text('name'),
  phoneNumber: text('phone_number'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  timezone: text('timezone').default('UTC'),
  accountStatus: userAccountStatusEnum('account_status').default('active').notNull(),
  billingTier: billingTierEnum('billing_tier').default('free').notNull(),
  themePreference: text('theme_preference').default('aurora'),
  mascot: text('mascot').default('Lumi'),
  isWaitlistUser: boolean('is_waitlist_user').default(false).notNull(),
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
  deletedAt: timestamp('deleted_at'),
});

// ────────────────────────────────────────
// Waitlist users reference table (pre-launch survey respondents)
// ────────────────────────────────────────
export const waitlistUsers = pgTable('waitlist_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  phoneNumber: text('phone_number'),
  source: text('source').default('survey').notNull(),
  claimedAt: timestamp('claimed_at'), // Set when user actually signs up
  claimedByUserId: uuid('claimed_by_user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ────────────────────────────────────────
// Clusters table (user-created groupings)
// ────────────────────────────────────────
export const clusters = pgTable('clusters', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').default('#F59E0B'),
  icon: text('icon').default('sparkles'),
  isPinned: boolean('is_pinned').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ────────────────────────────────────────
// Journal entries table
// ────────────────────────────────────────
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
  status: entryStatusEnum('status').default('draft'), // Uses the entry_status enum from DB

  metadata: jsonb('metadata'), // Additional data like tags, location, etc.

  // Columns that exist in the live DB
  clusterId: uuid('cluster_id').references(() => clusters.id, { onDelete: 'set null' }),
  title: text('title'),
  isPinned: boolean('is_pinned').default(false).notNull(),
  wordCount: integer('word_count').default(0),
  taskStatus: text('task_status').default('pending'),
  attachments: jsonb('attachments'), // legacy blobs
  mediaUrl: text('media_url'), // R2 media linkage
  tags: jsonb('tags'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ────────────────────────────────────────
// Canvas nodes table (for 3D visualization)
// ────────────────────────────────────────
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
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ────────────────────────────────────────
// Admin tables (Command Center)
// ────────────────────────────────────────
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
  permissions: jsonb('permissions').$type<string[]>().default([]).notNull(),
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

export const permissionRequests = pgTable('permission_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  requestedByClerkId: text('requested_by_clerk_id').notNull(),
  requestedByEmail: text('requested_by_email').notNull(),
  requestedByName: text('requested_by_name'),
  requestedPermission: text('requested_permission').notNull(),
  status: text('status').default('pending').notNull(), // pending, approved, denied
  reviewedByClerkId: text('reviewed_by_clerk_id'),
  reviewedByEmail: text('reviewed_by_email'),
  reviewedAt: timestamp('reviewed_at'),
  responseNote: text('response_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').defaultNow().notNull(),
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

// ────────────────────────────────────────
// Messaging tables
// ────────────────────────────────────────
export const messageCampaigns = pgTable('message_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdByUserId: uuid('created_by_user_id').references(() => users.id),
  brandKey: text('brand_key').default('soouls').notNull(),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  previewText: text('preview_text'),
  markdownBody: text('markdown_body').notNull(),
  whatsappBody: text('whatsapp_body').notNull(),
  ctaLabel: text('cta_label'),
  ctaUrl: text('cta_url'),
  audience: messageCampaignAudienceEnum('audience').default('all_users').notNull(),
  targeting: jsonb('targeting').$type<{
    nodeCount?: string;
    signupDate?: string;
    lastLogin?: string;
  }>(),
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
  brandKey: text('brand_key').default('soouls').notNull(),
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

// ────────────────────────────────────────
// Billing tables (Stripe)
// ────────────────────────────────────────
export const stripeWebhooks = pgTable('stripe_webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  stripeEventId: text('stripe_event_id').notNull().unique(),
  eventType: text('event_type').notNull(),
  status: text('status').default('success').notNull(), // 'success', 'failed'
  customerId: text('customer_id'),
  amount: real('amount'),
  metadata: jsonb('metadata').$type<Record<string, unknown> | null>(),
  processedAt: timestamp('processed_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ────────────────────────────────────────
// Telemetry tables (AI Cost Control)
// ────────────────────────────────────────
export const aiUsageLogs = pgTable('ai_usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(), // 'weaver_generation', 'embedding_indexing'
  model: text('model').notNull(), // 'gpt-4o', 'text-embedding-3-small'
  promptTokens: integer('prompt_tokens').default(0).notNull(),
  completionTokens: integer('completion_tokens').default(0).notNull(),
  totalTokens: integer('total_tokens').default(0).notNull(),
  estimatedCostUsd: real('estimated_cost_usd').notNull(), // E.g., 0.002
  metadata: jsonb('metadata').$type<Record<string, unknown> | null>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
