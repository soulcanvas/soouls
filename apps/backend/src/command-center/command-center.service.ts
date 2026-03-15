import { createHash, randomBytes } from 'node:crypto';
import { createClerkClient } from '@clerk/backend';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { and, db, desc, eq, inArray, or, sql } from '@soulcanvas/database/client';
import {
  adminAuditLogs,
  adminInvites,
  adminUsers,
  canvasNodes,
  developerApiKeys,
  featureFlags,
  journalEntries,
  messageCampaigns,
  messageDeliveries,
  serviceControls,
  users,
} from '@soulcanvas/database/schema';
import { parseEnvList } from '../notifications/notification.constants';
import { NotificationQueueService } from '../notifications/notification.queue';
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

    return {
      id: admin.id,
      clerkId: admin.clerkId,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: resolvePermissions(admin.role, admin.permissions ?? []),
      status: admin.status,
      ipAddress: ipAddress ?? null,
    } satisfies AdminActor & { ipAddress: string | null };
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
    const queue = await this.notificationQueue.getCounts();
    const messaging = await this.messagingService.getAdminCenter();

    return {
      queue,
      telemetry: {
        websocketConnections: 0,
        databaseLatencyMs: dbLatencyMs,
        databaseHealthy: dbPing.length > 0,
      },
      messaging,
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
}
