import { createHash, randomBytes } from 'node:crypto';
import { createClerkClient } from '@clerk/backend';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { getRateLimitStats } from '@soouls/api/rate-limit';
import { and, db, desc, eq, inArray, or, sql } from '@soouls/database/client';
import {
  adminAuditLogs,
  adminInvites,
  adminUsers,
  aiUsageLogs,
  canvasNodes,
  developerApiKeys,
  featureFlags,
  journalEntries,
  messageCampaigns,
  messageDeliveries,
  permissionRequests,
  serviceControls,
  stripeWebhooks,
  users,
} from '@soouls/database/schema';
import { Resend } from 'resend';
import { EntriesService } from '../entries/entries.service';
import { parseEnvList } from '../notifications/notification.constants';
import { NotificationQueueService } from '../notifications/notification.queue';
import { RedisService } from '../redis/redis.service';
import { MessagingService } from '../services/messaging.service';

type AdminRole = 'support' | 'engineer' | 'super_admin';

/** Immutable seed super admin — always bypasses invite check. */
const SEED_SUPER_ADMIN = 'rudra195957@gmail.com';

const ALL_PERMISSIONS = [
  'view:all',
  'mutate:users',
  'mutate:invites',
  'can_invite',
  'mutate:api_keys',
  'mutate:feature_flags',
  'mutate:service_controls',
  'mutate:queues',
  'mutate:messaging',
] as const;

type Permission = (typeof ALL_PERMISSIONS)[number];

type AdminActor = {
  id: string;
  clerkId: string | null;
  email: string;
  name: string | null;
  role: AdminRole;
  permissions: string[];
  status: 'invited' | 'active' | 'revoked';
};

const DEFAULT_FEATURE_FLAGS = [
  {
    key: 'ENABLE_RIVE_MASCOT',
    description: 'Controls the public-facing Rive mascot experience.',
    enabled: true,
  },
  {
    key: 'ENABLE_AI_WEAVER',
    description: 'Controls AI Weaver generation flows across the product.',
    enabled: true,
  },
  {
    key: 'ENABLE_DOWNLOADABLE_BUILDS',
    description: 'Controls downloadable build launch surfaces.',
    enabled: false,
  },
] as const;

const DEFAULT_SERVICE_CONTROLS = [
  {
    key: 'ai_weaver',
    label: 'AI Weaver',
    description: 'Emergency kill switch for AI Weaver workloads.',
    enabled: true,
  },
  {
    key: 'background_notifications',
    label: 'Background Notifications',
    description: 'Emergency control for email and WhatsApp workers.',
    enabled: true,
  },
  {
    key: 'developer_api_issuance',
    label: 'Developer API Issuance',
    description: 'Controls whether new public API keys can be created.',
    enabled: false,
  },
] as const;

/** Granular permission check. Supports '*' wildcard for super admins. */
function assertPermission(actor: AdminActor, required: Permission) {
  if (actor.permissions.includes('*')) return;
  if (actor.role === 'super_admin') return;
  if (!actor.permissions.includes(required)) {
    throw new UnauthorizedException(`Missing required permission: ${required}`);
  }
}

/** Resolve effective permissions: super_admins get ['*'] (wildcard), others get what's stored. */
function resolvePermissions(role: AdminRole, stored: string[]): string[] {
  if (role === 'super_admin') return ['*'];
  return stored.length > 0 ? stored : ['view:all'];
}

function getClerkClient() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('CLERK_SECRET_KEY is not configured');
  }

  return createClerkClient({ secretKey });
}

@Injectable()
export class CommandCenterService {
  private readonly bootstrapSuperAdmins = parseEnvList(
    process.env.COMMAND_CENTER_BOOTSTRAP_SUPER_ADMINS,
  );

  constructor(
    @Inject(MessagingService) private readonly messagingService: MessagingService,
    @Inject(NotificationQueueService)
    private readonly notificationQueue: NotificationQueueService,
    @Inject(EntriesService) private readonly entriesService: EntriesService,
    @Inject(RedisService) private readonly redisService: RedisService,
  ) {}

  private async ensureDefaultControls() {
    const existingFlags = await db
      .select({ key: featureFlags.key })
      .from(featureFlags)
      .where(
        inArray(
          featureFlags.key,
          DEFAULT_FEATURE_FLAGS.map((flag) => flag.key),
        ),
      );

    const missingFlags = DEFAULT_FEATURE_FLAGS.filter(
      (flag) => !existingFlags.some((existing) => existing.key === flag.key),
    );

    if (missingFlags.length > 0) {
      await db.insert(featureFlags).values(
        missingFlags.map((flag) => ({
          key: flag.key,
          description: flag.description,
          enabled: flag.enabled,
        })),
      );
    }

    const existingControls = await db
      .select({ key: serviceControls.key })
      .from(serviceControls)
      .where(
        inArray(
          serviceControls.key,
          DEFAULT_SERVICE_CONTROLS.map((control) => control.key),
        ),
      );

    const missingControls = DEFAULT_SERVICE_CONTROLS.filter(
      (control) => !existingControls.some((existing) => existing.key === control.key),
    );

    if (missingControls.length > 0) {
      await db.insert(serviceControls).values(
        missingControls.map((control) => ({
          key: control.key,
          label: control.label,
          description: control.description,
          enabled: control.enabled,
        })),
      );
    }
  }

  private async getAdminByClerkOrEmail(clerkId: string, email: string) {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(or(eq(adminUsers.clerkId, clerkId), eq(adminUsers.email, email)))
      .limit(1);

    return admin ?? null;
  }

  private async getPendingInvite(email: string) {
    const [invite] = await db
      .select()
      .from(adminInvites)
      .where(
        and(
          eq(adminInvites.email, email),
          eq(adminInvites.status, 'pending'),
          sql`${adminInvites.expiresAt} > now()`,
        ),
      )
      .orderBy(desc(adminInvites.createdAt))
      .limit(1);

    return invite ?? null;
  }

  private async writeAuditLog(input: {
    actor: AdminActor;
    action: string;
    targetType: string;
    targetId?: string | null;
    ipAddress?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    await db.insert(adminAuditLogs).values({
      adminUserId: input.actor.id,
      actorEmail: input.actor.email,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      ipAddress: input.ipAddress ?? null,
      metadata: input.metadata ?? null,
    });
  }

  async ensureAuthorizedAdmin(clerkId: string, ipAddress?: string | null) {
    const clerk = getClerkClient();
    const clerkUser = await clerk.users.getUser(clerkId);
    const primaryEmailId = clerkUser.primaryEmailAddressId;
    const primaryEmail =
      clerkUser.emailAddresses.find((entry) => entry.id === primaryEmailId)?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      '';

    const fullName =
      `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || primaryEmail;
    const existingAdmin = await this.getAdminByClerkOrEmail(clerkId, primaryEmail);
    const pendingInvite = await this.getPendingInvite(primaryEmail);
    const isBootstrapAdmin =
      this.bootstrapSuperAdmins.has(primaryEmail.toLowerCase()) ||
      primaryEmail.toLowerCase() === SEED_SUPER_ADMIN.toLowerCase();

    console.log(`[CommandCenterAuth] Checking access for: ${primaryEmail}`);
    console.log(`[CommandCenterAuth] Is bootstrap admin? ${isBootstrapAdmin}`);
    if (!isBootstrapAdmin) {
      console.log(
        `[CommandCenterAuth] Current bootstrap list: ${Array.from(this.bootstrapSuperAdmins).join(', ')}`,
      );
    }

    let admin = existingAdmin;

    if (!admin) {
      if (!pendingInvite && !isBootstrapAdmin) {
        throw new UnauthorizedException('403 Forbidden: Unauthorized Entity');
      }

      const nextRole = isBootstrapAdmin ? 'super_admin' : pendingInvite?.role;
      if (!nextRole) {
        throw new UnauthorizedException('Unable to resolve the invited admin role.');
      }

      const seedPermissions = isBootstrapAdmin ? ['*'] : (pendingInvite?.permissions ?? []);

      const [createdAdmin] = await db
        .insert(adminUsers)
        .values({
          clerkId,
          email: primaryEmail,
          name: fullName,
          role: nextRole,
          permissions: seedPermissions,
          status: 'active',
          invitedByAdminUserId: pendingInvite?.invitedByAdminUserId ?? null,
          activatedAt: new Date(),
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      admin = createdAdmin;

      if (pendingInvite) {
        await db
          .update(adminInvites)
          .set({
            status: 'accepted',
            acceptedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(adminInvites.id, pendingInvite.id));
      }
    } else {
      if (admin.status === 'revoked') {
        throw new UnauthorizedException('Your Command Center access has been revoked.');
      }

      const nextRole = isBootstrapAdmin ? 'super_admin' : admin.role;
      const seedPermissions = isBootstrapAdmin ? ['*'] : undefined;

      const [updatedAdmin] = await db
        .update(adminUsers)
        .set({
          clerkId,
          email: primaryEmail,
          name: fullName,
          role: nextRole,
          ...(seedPermissions ? { permissions: seedPermissions } : {}),
          status: 'active',
          activatedAt: admin.activatedAt ?? new Date(),
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(adminUsers.id, admin.id))
        .returning();

      admin = updatedAdmin;

      if (pendingInvite) {
        await db
          .update(adminInvites)
          .set({
            status: 'accepted',
            acceptedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(adminInvites.id, pendingInvite.id));
      }
    }

    const isNewAdmin = !existingAdmin;

    const actor = {
      id: admin.id,
      clerkId: admin.clerkId,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: resolvePermissions(admin.role, admin.permissions ?? []),
      status: admin.status,
      ipAddress: ipAddress ?? null,
    } satisfies AdminActor & { ipAddress: string | null };

    await this.writeAuditLog({
      actor,
      action: isNewAdmin ? 'admin.activated' : 'admin.login',
      targetType: 'admin_user',
      targetId: admin.id,
      ipAddress,
      metadata: {
        isNewAdmin,
        role: admin.role,
        email: admin.email,
      },
    });

    return actor;
  }

  async getViewer(clerkId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);

    return {
      viewer: {
        id: actor.id,
        email: actor.email,
        name: actor.name,
        role: actor.role,
        permissions: actor.permissions,
        status: actor.status,
      },
    };
  }

  async getOverview(clerkId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    await this.ensureDefaultControls();

    const [
      [totalUsersRow],
      [activeUsersRow],
      [totalAdminsRow],
      [pendingInvitesRow],
      flags,
      controls,
      queue,
      recentAuditLogs,
      [activeConnectionsRow],
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.accountStatus, 'active')),
      db
        .select({ count: sql<number>`count(*)` })
        .from(adminUsers)
        .where(eq(adminUsers.status, 'active')),
      db
        .select({ count: sql<number>`count(*)` })
        .from(adminInvites)
        .where(eq(adminInvites.status, 'pending')),
      db.select().from(featureFlags).orderBy(featureFlags.key),
      db.select().from(serviceControls).orderBy(serviceControls.key),
      this.notificationQueue.getCounts(),
      db.select().from(adminAuditLogs).orderBy(desc(adminAuditLogs.createdAt)).limit(8),
      db.select({ count: sql<number>`count(*)` }).from(sql`pg_stat_activity`),
    ]);

    return {
      viewer: actor,
      stats: {
        totalUsers: Number(totalUsersRow?.count ?? 0),
        activeUsers: Number(activeUsersRow?.count ?? 0),
        activeAdmins: Number(totalAdminsRow?.count ?? 0),
        pendingInvites: Number(pendingInvitesRow?.count ?? 0),
      },
      featureFlags: flags,
      serviceControls: controls,
      queue,
      telemetry: {
        websocketConnections: 0,
        databaseConnections: Number(activeConnectionsRow?.count ?? 0),
      },
      recentAuditLogs,
    };
  }

  async listIam(clerkId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'mutate:invites');

    const [admins, invites] = await Promise.all([
      db.select().from(adminUsers).orderBy(desc(adminUsers.updatedAt)),
      db.select().from(adminInvites).orderBy(desc(adminInvites.createdAt)),
    ]);

    return { admins, invites };
  }

  async inviteAdmin(
    clerkId: string,
    input: { email: string; role: AdminRole; permissions?: string[] },
    ipAddress?: string | null,
  ) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'mutate:invites');

    // Delegation enforcement: cannot assign permissions you don't have
    // Delegation enforcement: only grant permissions the inviter themselves has
    const actorPerms = actor.permissions.includes('*') ? [...ALL_PERMISSIONS] : actor.permissions;
    const grantedPermissions = (input.permissions ?? ['view:all']).filter((perm) =>
      actorPerms.includes(perm),
    );

    // Cannot assign a role higher than your own (super_admin bypasses this)
    const roleHierarchy: Record<AdminRole, number> = { support: 0, engineer: 1, super_admin: 2 };
    if (roleHierarchy[input.role] >= roleHierarchy[actor.role] && actor.role !== 'super_admin') {
      throw new Error('You cannot assign a role equal to or higher than your own.');
    }

    const email = input.email.trim().toLowerCase();
    if (!email.includes('@')) {
      throw new Error('Enter a valid email address.');
    }

    const inviteToken = randomBytes(18).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    const [invite] = await db
      .insert(adminInvites)
      .values({
        email,
        role: input.role,
        permissions: grantedPermissions,
        invitedByAdminUserId: actor.id,
        inviteToken,
        expiresAt,
        updatedAt: new Date(),
      })
      .returning();

    const [existingAdmin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1);

    if (existingAdmin) {
      await db
        .update(adminUsers)
        .set({
          role: input.role,
          status: existingAdmin.status === 'revoked' ? 'invited' : existingAdmin.status,
          invitedByAdminUserId: actor.id,
          updatedAt: new Date(),
        })
        .where(eq(adminUsers.id, existingAdmin.id));
    }

    await this.writeAuditLog({
      actor,
      action: 'admin.invited',
      targetType: 'admin_invite',
      targetId: invite.id,
      ipAddress,
      metadata: {
        email,
        role: input.role,
      },
    });

    await this.notificationQueue.enqueueAdminInvite(invite.id);

    return {
      inviteId: invite.id,
      email,
      role: input.role,
      expiresAt,
    };
  }

  async revokeAdmin(clerkId: string, adminUserId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'mutate:invites');

    if (actor.id === adminUserId) {
      throw new Error('You cannot revoke your own access.');
    }

    const [target] = await db
      .update(adminUsers)
      .set({
        status: 'revoked',
        revokedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, adminUserId))
      .returning();

    if (!target) {
      throw new Error('Admin not found.');
    }

    await this.writeAuditLog({
      actor,
      action: 'admin.revoked',
      targetType: 'admin_user',
      targetId: adminUserId,
      ipAddress,
      metadata: {
        email: target.email,
      },
    });

    return target;
  }

  async searchUsers(clerkId: string, query: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'view:all');

    const normalizedQuery = query.trim();
    const likeQuery = `%${normalizedQuery}%`;

    return db
      .select({
        id: users.id,
        clerkId: users.clerkId,
        email: users.email,
        name: users.name,
        accountStatus: users.accountStatus,
        billingTier: users.billingTier,
        mascot: users.mascot,
        themePreference: users.themePreference,
        stripeCustomerId: users.stripeCustomerId,
        walletAddress: users.walletAddress,
        createdAt: users.createdAt,
        totalEntries: sql<number>`(
          select count(*)
          from journal_entries
          where journal_entries.user_id = ${users.id}
        )`,
        totalNodes: sql<number>`(
          select count(*)
          from canvas_nodes
          inner join journal_entries on journal_entries.id = canvas_nodes.entry_id
          where journal_entries.user_id = ${users.id}
        )`,
      })
      .from(users)
      .where(
        or(
          sql`lower(${users.email}) like lower(${likeQuery})`,
          sql`lower(${users.clerkId}) like lower(${likeQuery})`,
          sql`lower(${users.id}) like lower(${likeQuery})`,
          sql`lower(coalesce(${users.stripeCustomerId}, '')) like lower(${likeQuery})`,
          sql`lower(coalesce(${users.walletAddress}, '')) like lower(${likeQuery})`,
        ),
      )
      .orderBy(desc(users.createdAt))
      .limit(25);
  }

  async getUserProfile(clerkId: string, userId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'view:all');

    const [user] = await db
      .select({
        id: users.id,
        clerkId: users.clerkId,
        email: users.email,
        name: users.name,
        phoneNumber: users.phoneNumber,
        accountStatus: users.accountStatus,
        billingTier: users.billingTier,
        mascot: users.mascot,
        themePreference: users.themePreference,
        stripeCustomerId: users.stripeCustomerId,
        walletAddress: users.walletAddress,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        totalEntries: sql<number>`(
          select count(*)
          from journal_entries
          where journal_entries.user_id = ${users.id}
        )`,
        totalNodes: sql<number>`(
          select count(*)
          from canvas_nodes
          inner join journal_entries on journal_entries.id = canvas_nodes.entry_id
          where journal_entries.user_id = ${users.id}
        )`,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found.');
    }

    const sentimentSummary = await db
      .select({
        label: journalEntries.sentimentLabel,
        count: sql<number>`count(*)`,
      })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .groupBy(journalEntries.sentimentLabel)
      .orderBy(desc(sql`count(*)`));

    return {
      ...user,
      sentimentSummary,
      rawEntryAccess: false,
    };
  }

  async sendPasswordReset(clerkId: string, userId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'mutate:users');

    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found.');
    }

    await this.messagingService.requestSecureAccessLink(user.email);
    await this.writeAuditLog({
      actor,
      action: 'user.password_reset_sent',
      targetType: 'user',
      targetId: userId,
      ipAddress,
      metadata: { email: user.email },
    });

    return { accepted: true };
  }

  async forceLogoutAllDevices(clerkId: string, userId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'mutate:users');

    const [user] = await db
      .select({ id: users.id, clerkId: users.clerkId, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found.');
    }

    const clerk = getClerkClient();
    const sessions = await clerk.sessions.getSessionList({
      userId: user.clerkId,
      status: 'active',
      limit: 100,
    });

    await Promise.all(sessions.data.map((session) => clerk.sessions.revokeSession(session.id)));

    await this.writeAuditLog({
      actor,
      action: 'user.force_logout',
      targetType: 'user',
      targetId: userId,
      ipAddress,
      metadata: {
        email: user.email,
        revokedSessions: sessions.data.length,
      },
    });

    return { revokedSessions: sessions.data.length };
  }

  async updateBillingTier(
    clerkId: string,
    userId: string,
    billingTier: 'free' | 'premium' | 'enterprise',
    ipAddress?: string | null,
  ) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'mutate:users');

    const [updatedUser] = await db
      .update(users)
      .set({
        billingTier,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new Error('User not found.');
    }

    await this.writeAuditLog({
      actor,
      action: 'user.billing_tier_updated',
      targetType: 'user',
      targetId: userId,
      ipAddress,
      metadata: {
        billingTier,
      },
    });

    return updatedUser;
  }

  async updateAccountStatus(
    clerkId: string,
    userId: string,
    status: 'active' | 'locked' | 'beta' | 'suspended',
    ipAddress?: string | null,
  ) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'mutate:users');

    const [user] = await db
      .select({ id: users.id, clerkId: users.clerkId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found.');
    }

    const clerk = getClerkClient();
    if (status === 'locked') {
      await clerk.users.lockUser(user.clerkId);
    } else if (status === 'suspended') {
      await clerk.users.banUser(user.clerkId);
    } else if (status === 'active') {
      await clerk.users.unlockUser(user.clerkId);
      await clerk.users.unbanUser(user.clerkId);
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        accountStatus: status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    await this.writeAuditLog({
      actor,
      action: 'user.account_status_updated',
      targetType: 'user',
      targetId: userId,
      ipAddress,
      metadata: {
        status,
      },
    });

    return updatedUser;
  }

  async hardDeleteUser(clerkId: string, userId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'mutate:users');

    const [user] = await db
      .select({ id: users.id, clerkId: users.clerkId, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found.');
    }

    const entryIds = await db
      .select({ id: journalEntries.id })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId));

    if (entryIds.length > 0) {
      await db.delete(canvasNodes).where(
        inArray(
          canvasNodes.entryId,
          entryIds.map((entry) => entry.id),
        ),
      );
    }

    await db.delete(messageDeliveries).where(eq(messageDeliveries.userId, userId));
    await db.delete(messageCampaigns).where(eq(messageCampaigns.createdByUserId, userId));
    await db.delete(journalEntries).where(eq(journalEntries.userId, userId));
    await db.delete(users).where(eq(users.id, userId));

    const clerk = getClerkClient();
    await clerk.users.deleteUser(user.clerkId);

    await this.writeAuditLog({
      actor,
      action: 'user.hard_deleted',
      targetType: 'user',
      targetId: userId,
      ipAddress,
      metadata: {
        email: user.email,
      },
    });

    return { deleted: true };
  }

  async listFeatureFlags(clerkId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'mutate:feature_flags');
    await this.ensureDefaultControls();
    return db.select().from(featureFlags).orderBy(featureFlags.key);
  }

  async setFeatureFlag(
    clerkId: string,
    input: { key: string; enabled: boolean; description?: string },
    ipAddress?: string | null,
  ) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'mutate:feature_flags');
    await this.ensureDefaultControls();

    const [existing] = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.key, input.key))
      .limit(1);

    const [flag] = existing
      ? await db
          .update(featureFlags)
          .set({
            enabled: input.enabled,
            description: input.description ?? existing.description,
            updatedByAdminUserId: actor.id,
            updatedAt: new Date(),
          })
          .where(eq(featureFlags.id, existing.id))
          .returning()
      : await db
          .insert(featureFlags)
          .values({
            key: input.key,
            description: input.description,
            enabled: input.enabled,
            updatedByAdminUserId: actor.id,
          })
          .returning();

    await this.writeAuditLog({
      actor,
      action: 'feature_flag.updated',
      targetType: 'feature_flag',
      targetId: flag.id,
      ipAddress,
      metadata: {
        key: flag.key,
        enabled: flag.enabled,
      },
    });

    return flag;
  }

  async listApiKeys(clerkId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'mutate:api_keys');
    return db.select().from(developerApiKeys).orderBy(desc(developerApiKeys.createdAt));
  }

  async createApiKey(
    clerkId: string,
    input: { label: string; rateLimitPerMinute: number },
    ipAddress?: string | null,
  ) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'mutate:api_keys');

    const rawKey = `sl_live_${randomBytes(24).toString('hex')}`;
    const hashedKey = createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.slice(0, 12);

    const [apiKey] = await db
      .insert(developerApiKeys)
      .values({
        label: input.label,
        keyPrefix,
        hashedKey,
        rateLimitPerMinute: input.rateLimitPerMinute,
        createdByAdminUserId: actor.id,
      })
      .returning();

    await this.writeAuditLog({
      actor,
      action: 'developer_api_key.created',
      targetType: 'developer_api_key',
      targetId: apiKey.id,
      ipAddress,
      metadata: {
        label: apiKey.label,
        rateLimitPerMinute: apiKey.rateLimitPerMinute,
      },
    });

    return {
      ...apiKey,
      rawKey,
    };
  }

  async revokeApiKey(clerkId: string, apiKeyId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'mutate:api_keys');

    const [apiKey] = await db
      .update(developerApiKeys)
      .set({
        status: 'revoked',
        revokedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(developerApiKeys.id, apiKeyId))
      .returning();

    if (!apiKey) {
      throw new Error('API key not found.');
    }

    await this.writeAuditLog({
      actor,
      action: 'developer_api_key.revoked',
      targetType: 'developer_api_key',
      targetId: apiKey.id,
      ipAddress,
      metadata: {
        label: apiKey.label,
      },
    });

    return apiKey;
  }

  async listServiceControls(clerkId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'mutate:service_controls');
    await this.ensureDefaultControls();
    return db.select().from(serviceControls).orderBy(serviceControls.key);
  }

  async setServiceControl(
    clerkId: string,
    input: { key: string; enabled: boolean },
    ipAddress?: string | null,
  ) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'mutate:service_controls');
    await this.ensureDefaultControls();

    const [control] = await db
      .update(serviceControls)
      .set({
        enabled: input.enabled,
        updatedByAdminUserId: actor.id,
        updatedAt: new Date(),
      })
      .where(eq(serviceControls.key, input.key))
      .returning();

    if (!control) {
      throw new Error('Service control not found.');
    }

    await this.writeAuditLog({
      actor,
      action: 'service_control.updated',
      targetType: 'service_control',
      targetId: control.id,
      ipAddress,
      metadata: {
        key: control.key,
        enabled: control.enabled,
      },
    });

    return control;
  }

  async getHealth(clerkId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'view:all');

    const dbProbeStartedAt = Date.now();
    const dbPing = await db.execute<{ value: number }>(sql`select 1 as value`);
    const dbLatencyMs = Date.now() - dbProbeStartedAt;

    const [activeConnectionsRow] = await db.execute<{ count: string }>(
      sql`SELECT count(*) as count FROM pg_stat_activity WHERE datname = current_database()`,
    );
    const databaseConnections = Number(activeConnectionsRow?.count ?? 0);

    const queue = await this.notificationQueue.getCounts();
    const messaging = await this.messagingService.getAdminCenter();
    const redisPing = await this.redisService.ping();
    const redisInfo = await this.redisService.getInfo();

    return {
      queue,
      telemetry: {
        websocketConnections: 0,
        databaseLatencyMs: dbLatencyMs,
        databaseHealthy: dbPing.length > 0,
        databaseConnections,
      },
      messaging,
      redis: {
        connected: redisPing.connected,
        latencyMs: redisPing.latencyMs,
        usedMemory: redisInfo?.used_memory_human ?? 'N/A',
        connectedClients: Number(redisInfo?.connected_clients ?? 0),
      },
    };
  }

  async listAuditLogs(clerkId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'view:all');
    return db.select().from(adminAuditLogs).orderBy(desc(adminAuditLogs.createdAt)).limit(100);
  }

  async getMessagingCenter(clerkId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'view:all');
    return this.messagingService.getAdminCenter();
  }

  async sendTestEmail(
    clerkId: string,
    input: {
      to: string;
      subject: string;
      markdownBody: string;
      ctaLabel?: string;
      ctaUrl?: string;
      brandKey?: 'soouls' | 'soouls-studio' | 'founder-desk';
    },
    ipAddress?: string | null,
  ) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'mutate:messaging');

    const result = await this.messagingService.sendTestEmail({
      to: input.to,
      subject: input.subject,
      markdownBody: input.markdownBody,
      ctaLabel: input.ctaLabel,
      ctaUrl: input.ctaUrl,
      brandKey: input.brandKey || 'soouls',
    });

    await this.writeAuditLog({
      actor,
      action: 'messaging.test_email_sent',
      targetType: 'message_delivery',
      targetId: result.deliveryId,
      ipAddress,
      metadata: {
        to: input.to,
        subject: input.subject,
      },
    });

    return result;
  }

  async createMessagingCampaign(
    clerkId: string,
    input: Parameters<MessagingService['createAdminCampaign']>[0],
    ipAddress?: string | null,
  ) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'mutate:messaging');
    const campaign = await this.messagingService.createAdminCampaign(input);

    await this.writeAuditLog({
      actor,
      action: 'messaging.campaign_created',
      targetType: 'message_campaign',
      targetId: campaign.campaignId,
      ipAddress,
      metadata: {
        title: input.title,
        brandKey: input.brandKey,
      },
    });

    return campaign;
  }

  async getBillingOverview(clerkId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'view:all');

    const mrrResult = await db
      .select({
        mrr: sql<number>`sum(case when ${users.billingTier} = 'premium' then 15 when ${users.billingTier} = 'enterprise' then 49 else 0 end)`,
        subscribers: sql<number>`count(case when ${users.billingTier} != 'free' then 1 end)`,
      })
      .from(users);

    const churnRateResult = 2.4; // Mocked for now until we store active/canceled subscriptions

    // Mock recent revenue for chart
    const recentRevenue = [
      { date: 'Mon', amount: 320 },
      { date: 'Tue', amount: 450 },
      { date: 'Wed', amount: 390 },
      { date: 'Thu', amount: 510 },
      { date: 'Fri', amount: 480 },
      { date: 'Sat', amount: 620 },
      { date: 'Sun', amount: 590 },
    ];

    const webhooks = await db
      .select()
      .from(stripeWebhooks)
      .orderBy(desc(stripeWebhooks.createdAt))
      .limit(10);

    return {
      mrr: Number(mrrResult[0]?.mrr || 0),
      activeSubscribers: Number(mrrResult[0]?.subscribers || 0),
      churnRate: churnRateResult,
      recentRevenue,
      recentWebhooks: webhooks,
    };
  }

  async getAiTelemetry(clerkId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'view:all');

    const totalCostResult = await db
      .select({
        totalUsd: sql<number>`sum(${aiUsageLogs.estimatedCostUsd})`,
        totalTokens: sql<number>`sum(${aiUsageLogs.totalTokens})`,
        totalRequests: sql<number>`count(*)`,
      })
      .from(aiUsageLogs);

    const burnRateGraph = await db
      .select({
        date: sql<string>`date_trunc('day', ${aiUsageLogs.createdAt})::date::text`,
        cost: sql<number>`sum(${aiUsageLogs.estimatedCostUsd})`,
        tokens: sql<number>`sum(${aiUsageLogs.totalTokens})`,
        requests: sql<number>`count(*)`,
      })
      .from(aiUsageLogs)
      .groupBy(sql`date_trunc('day', ${aiUsageLogs.createdAt})::date::text`)
      .orderBy(desc(sql`date_trunc('day', ${aiUsageLogs.createdAt})::date`))
      .limit(30);

    const burnRateGraph7d = await db
      .select({
        date: sql<string>`date_trunc('day', ${aiUsageLogs.createdAt})::date::text`,
        cost: sql<number>`sum(${aiUsageLogs.estimatedCostUsd})`,
      })
      .from(aiUsageLogs)
      .where(sql`${aiUsageLogs.createdAt} > NOW() - INTERVAL '7 days'`)
      .groupBy(sql`date_trunc('day', ${aiUsageLogs.createdAt})::date::text`)
      .orderBy(desc(sql`date_trunc('day', ${aiUsageLogs.createdAt})::date`))
      .limit(7);

    const costPerUser = await db
      .select({
        userId: users.id,
        email: users.email,
        totalCost: sql<number>`sum(${aiUsageLogs.estimatedCostUsd})`,
        totalTokens: sql<number>`sum(${aiUsageLogs.totalTokens})`,
        totalRequests: sql<number>`count(*)`,
      })
      .from(aiUsageLogs)
      .innerJoin(users, eq(aiUsageLogs.userId, users.id))
      .groupBy(users.id, users.email)
      .orderBy(desc(sql<number>`sum(${aiUsageLogs.estimatedCostUsd})`))
      .limit(10);

    const costByModel = await db
      .select({
        model: aiUsageLogs.model,
        totalCost: sql<number>`sum(${aiUsageLogs.estimatedCostUsd})`,
        totalTokens: sql<number>`sum(${aiUsageLogs.totalTokens})`,
        totalRequests: sql<number>`count(*)`,
      })
      .from(aiUsageLogs)
      .groupBy(aiUsageLogs.model)
      .orderBy(desc(sql`sum(${aiUsageLogs.estimatedCostUsd})`));

    const costByAction = await db
      .select({
        action: aiUsageLogs.action,
        totalCost: sql<number>`sum(${aiUsageLogs.estimatedCostUsd})`,
        totalTokens: sql<number>`sum(${aiUsageLogs.totalTokens})`,
        totalRequests: sql<number>`count(*)`,
      })
      .from(aiUsageLogs)
      .groupBy(aiUsageLogs.action)
      .orderBy(desc(sql`sum(${aiUsageLogs.estimatedCostUsd})`));

    const recentLogs = await db
      .select({
        id: aiUsageLogs.id,
        userId: aiUsageLogs.userId,
        action: aiUsageLogs.action,
        model: aiUsageLogs.model,
        promptTokens: aiUsageLogs.promptTokens,
        completionTokens: aiUsageLogs.completionTokens,
        totalTokens: aiUsageLogs.totalTokens,
        estimatedCostUsd: aiUsageLogs.estimatedCostUsd,
        createdAt: aiUsageLogs.createdAt,
      })
      .from(aiUsageLogs)
      .orderBy(desc(aiUsageLogs.createdAt))
      .limit(20);

    const recentLogsWithEmail = await Promise.all(
      recentLogs.map(async (log) => {
        const [user] = await db
          .select({ email: users.email })
          .from(users)
          .where(eq(users.id, log.userId))
          .limit(1);
        return {
          ...log,
          email: user?.email ?? 'Unknown',
        };
      }),
    );

    const avgCostPerRequest = totalCostResult[0]?.totalRequests
      ? Number(totalCostResult[0]?.totalUsd || 0) / Number(totalCostResult[0]?.totalRequests)
      : 0;

    const weeklyCost = burnRateGraph7d.reduce((sum, day) => sum + Number(day.cost), 0);
    const monthlyCost = burnRateGraph.reduce((sum, day) => sum + Number(day.cost), 0);

    const killSwitch = await db
      .select()
      .from(serviceControls)
      .where(eq(serviceControls.key, 'ai_weaver'))
      .limit(1)
      .then((res) => res[0]);

    return {
      globalTotalUsd: Number(totalCostResult[0]?.totalUsd || 0),
      globalTotalTokens: Number(totalCostResult[0]?.totalTokens || 0),
      totalRequests: Number(totalCostResult[0]?.totalRequests || 0),
      burnRateGraph: burnRateGraph
        .map((g) => ({
          date: g.date,
          cost: Number(g.cost),
          tokens: Number(g.tokens),
          requests: Number(g.requests),
        }))
        .reverse(),
      costPerUser: costPerUser.map((u) => ({
        userId: u.userId,
        email: u.email,
        totalCost: Number(u.totalCost),
        totalTokens: Number(u.totalTokens),
        totalRequests: Number(u.totalRequests),
      })),
      costByModel: costByModel.map((m) => ({
        model: m.model,
        totalCost: Number(m.totalCost),
        totalTokens: Number(m.totalTokens),
        totalRequests: Number(m.totalRequests),
      })),
      costByAction: costByAction.map((a) => ({
        action: a.action,
        totalCost: Number(a.totalCost),
        totalTokens: Number(a.totalTokens),
        totalRequests: Number(a.totalRequests),
      })),
      recentLogs: recentLogsWithEmail.map((log) => ({
        ...log,
        estimatedCostUsd: Number(log.estimatedCostUsd),
      })),
      avgCostPerRequest: avgCostPerRequest,
      weeklyCost: weeklyCost,
      monthlyCost: monthlyCost,
      killSwitchEnabled: killSwitch?.enabled ?? false,
    };
  }

  async queueGdprExport(adminClerkId: string, targetUserId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(adminClerkId, ipAddress);
    assertPermission(actor, 'view:all');

    const [target] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);
    if (!target) throw new Error('Target user not found.');

    await this.notificationQueue.enqueueGdprExport(targetUserId, actor.email);

    await db.insert(adminAuditLogs).values({
      adminUserId: actor.id,
      actorEmail: actor.email,
      action: 'GDPR_EXPORT_QUEUED',
      targetType: 'users',
      targetId: targetUserId,
      metadata: { requestorEmail: actor.email },
    });

    return { success: true };
  }

  async getRateLimits(adminClerkId: string, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(adminClerkId, ipAddress);
    assertPermission(actor, 'view:all');
    return getRateLimitStats();
  }

  async listEntries(clerkId: string, limit: number, offset: number, ipAddress?: string | null) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);
    assertPermission(actor, 'view:all');

    await this.writeAuditLog({
      actor,
      action: 'entries.list',
      targetType: 'journal_entries',
      ipAddress,
    });

    return this.entriesService.listAllEntriesAdmin(limit, offset);
  }

  async requestPermission(
    clerkId: string,
    input: { permission: string; requestedBy: string; requestedByName?: string },
    ipAddress?: string | null,
  ) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, ipAddress);

    const permissionLabels: Record<string, string> = {
      'view:all': 'View All Data',
      'mutate:users': 'Manage Users',
      'mutate:invites': 'Manage Team Invites',
      'mutate:api_keys': 'Manage API Keys',
      'mutate:feature_flags': 'Toggle Feature Flags',
      'mutate:service_controls': 'Control Services',
      'mutate:queues': 'Manage Queues',
      'mutate:messaging': 'Send Campaigns',
    };

    await this.writeAuditLog({
      actor,
      action: 'permission.requested',
      targetType: 'permission',
      ipAddress,
      metadata: {
        requestedPermission: input.permission,
        requestedBy: input.requestedBy,
      },
    });

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.MESSAGING_FROM_EMAIL;
    const fromName = process.env.MESSAGING_FROM_NAME ?? 'Soouls';

    if (apiKey && fromEmail) {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: ['rudra195957@gmail.com'],
        subject: `[Soouls] Permission Request: ${permissionLabels[input.permission] || input.permission}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f97316;">Permission Request</h2>
            <p><strong>${input.requestedByName || input.requestedBy}</strong> has requested permission to:</p>
            <blockquote style="border-left: 4px solid #f97316; padding-left: 16px; margin: 16px 0;">
              <strong>${permissionLabels[input.permission] || input.permission}</strong>
              <br/>
              <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${input.permission}</code>
            </blockquote>
            <p><strong>Email:</strong> ${input.requestedBy}</p>
            <p><strong>IP Address:</strong> ${ipAddress || 'Unknown'}</p>
            <p style="margin-top: 24px;">To grant this permission, go to the Command Center and update their role.</p>
          </div>
        `,
      });
    }

    return {
      success: true,
      message: `Permission request sent for: ${permissionLabels[input.permission] || input.permission}`,
    };
  }

  async listPermissionRequests(clerkId: string, status?: 'pending' | 'approved' | 'denied') {
    const actor = await this.ensureAuthorizedAdmin(clerkId, null);

    const requests = await db
      .select()
      .from(permissionRequests)
      .where(status ? eq(permissionRequests.status, status) : undefined)
      .orderBy(desc(permissionRequests.createdAt))
      .limit(100);

    return requests;
  }

  async reviewPermissionRequest(
    clerkId: string,
    requestId: string,
    decision: 'approved' | 'denied',
    note?: string,
  ) {
    const actor = await this.ensureAuthorizedAdmin(clerkId, null);

    if (actor.role !== 'super_admin') {
      throw new UnauthorizedException('Only super admins can review permission requests.');
    }

    const [existingRequest] = await db
      .select()
      .from(permissionRequests)
      .where(eq(permissionRequests.id, requestId))
      .limit(1);

    if (!existingRequest) {
      throw new Error('Permission request not found.');
    }

    await db
      .update(permissionRequests)
      .set({
        status: decision,
        reviewedByClerkId: actor.clerkId,
        reviewedByEmail: actor.email,
        reviewedAt: new Date(),
        responseNote: note || null,
      })
      .where(eq(permissionRequests.id, requestId));

    if (decision === 'approved') {
      const [admin] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.clerkId, existingRequest.requestedByClerkId))
        .limit(1);

      if (admin) {
        const currentPermissions = admin.permissions || [];
        if (!currentPermissions.includes(existingRequest.requestedPermission)) {
          await db
            .update(adminUsers)
            .set({
              permissions: [...currentPermissions, existingRequest.requestedPermission],
              updatedAt: new Date(),
            })
            .where(eq(adminUsers.id, admin.id));
        }
      }
    }

    await this.writeAuditLog({
      actor,
      action: `permission.${decision}d`,
      targetType: 'permission_request',
      targetId: requestId,
      ipAddress: null,
      metadata: {
        requestedBy: existingRequest.requestedByEmail,
        requestedPermission: existingRequest.requestedPermission,
        decision,
        note,
      },
    });

    return { success: true, message: `Permission request ${decision}.` };
  }
}
