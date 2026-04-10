'use client';

export type AdminRole = 'support' | 'engineer' | 'super_admin';

export type Viewer = {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  permissions: string[];
  status: string;
};

export type Overview = {
  stats: {
    totalUsers: number;
    activeUsers: number;
    activeAdmins: number;
    pendingInvites: number;
  };
  featureFlags: Array<{
    id: string;
    key: string;
    description: string | null;
    enabled: boolean;
  }>;
  serviceControls: Array<{
    id: string;
    key: string;
    label: string;
    description: string | null;
    enabled: boolean;
  }>;
  queue: { waiting: number; active: number; delayed: number; failed: number };
  telemetry: {
    websocketConnections: number;
    databaseConnections: number;
    databaseLatencyMs: number;
    databaseHealthy: boolean;
  };
  recentAuditLogs: Array<{
    id: string;
    actorEmail: string;
    action: string;
    targetType: string;
    createdAt: string;
  }>;
};

export type IamPayload = {
  admins: Array<{
    id: string;
    email: string;
    role: AdminRole;
    status: string;
    lastLoginAt: string | null;
    permissions: string[];
  }>;
  invites: Array<{
    id: string;
    email: string;
    role: AdminRole;
    status: string;
    expiresAt: string;
    permissions?: string[];
  }>;
};

export type UserRecord = {
  id: string;
  email: string;
  name: string | null;
  accountStatus: string;
  billingTier: string;
  mascot: string | null;
  themePreference: string | null;
  totalEntries: number;
  totalNodes: number;
  createdAt: string;
};

export type UserProfile = UserRecord & {
  clerkId: string;
  phoneNumber: string | null;
  sentimentSummary: Array<{ label: string | null; count: number }>;
  rawEntryAccess: false;
};

export type ApiKeyRecord = {
  id: string;
  label: string;
  keyPrefix: string;
  rateLimitPerMinute: number;
  status: string;
};

export type Messaging = {
  brands: Array<{
    key: 'soouls' | 'soouls-studio' | 'founder-desk';
    label: string;
  }>;
  campaigns: Array<{
    id: string;
    title: string;
    subject: string;
    status: string;
  }>;
  recentDeliveries: Array<{
    id: string;
    recipient: string;
    channel: string;
    status: string;
    createdAt: string;
  }>;
  providerHealth: {
    emailConfigured: boolean;
    whatsappConfigured: boolean;
    newsletterConfigured: boolean;
  };
};

export type AuditLogEntry = {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string | null;
  ipAddress: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type HealthPayload = {
  queue: { waiting: number; active: number; delayed: number; failed: number };
  telemetry: {
    websocketConnections: number;
    databaseLatencyMs: number;
    databaseHealthy: boolean;
    databaseConnections: number;
  };
  messaging: Messaging;
  redis: {
    connected: boolean;
    latencyMs: number;
    usedMemory: string;
    connectedClients: number;
  };
};

export type BillingPayload = {
  mrr: number;
  activeSubscribers: number;
  churnRate: number;
  recentRevenue: Array<{ date: string; amount: number }>;
  recentWebhooks: Array<{
    id: string;
    stripeEventId: string;
    eventType: string;
    status: string;
    customerId: string | null;
    amount: number | null;
    metadata: Record<string, unknown> | null;
    processedAt: string;
    createdAt: string;
  }>;
};

export type AiTelemetryPayload = {
  globalTotalUsd: number;
  globalTotalTokens: number;
  totalRequests: number;
  burnRateGraph: Array<{ date: string; cost: number; tokens: number; requests: number }>;
  costPerUser: Array<{
    userId: string;
    email: string;
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
  }>;
  costByModel: Array<{
    model: string;
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
  }>;
  costByAction: Array<{
    action: string;
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
  }>;
  recentLogs: Array<{
    id: string;
    userId: string;
    email: string;
    action: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
    createdAt: string;
  }>;
  avgCostPerRequest: number;
  weeklyCost: number;
  monthlyCost: number;
  killSwitchEnabled: boolean;
};

export type RateLimitEntry = {
  key: string;
  count: number;
  oldest: number | null;
  newest: number | null;
};

export type AdminEntryRecord = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  type: 'entry' | 'task';
  title: string | null;
  content: string;
  mediaUrl: string | null;
  sentimentColor: string | null;
  sentimentLabel: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EntriesPayload = {
  items: AdminEntryRecord[];
  total: number;
};

export type CacheConfig = {
  revalidate?: number;
  staleWhileRevalidate?: number;
};

const CACHE_CONFIGS: Record<string, CacheConfig> = {
  '/api/admin/overview': { revalidate: 60, staleWhileRevalidate: 300 },
  '/api/admin/users': { revalidate: 120, staleWhileRevalidate: 600 },
  '/api/admin/messaging': { revalidate: 30, staleWhileRevalidate: 120 },
  '/api/admin/health': { revalidate: 10, staleWhileRevalidate: 30 },
  '/api/admin/entries': { revalidate: 60, staleWhileRevalidate: 300 },
};

export async function api<T>(
  url: string,
  init?: RequestInit & { cache?: RequestCache },
): Promise<T> {
  const cacheConfig = CACHE_CONFIGS[url] || { revalidate: 60 };

  const response = await fetch(url, {
    ...init,
    cache: init?.cache || (cacheConfig.staleWhileRevalidate ? 'force-cache' : 'no-store'),
    next: {
      revalidate: cacheConfig.revalidate,
    },
  });

  const payload = (await response.json().catch(() => null)) as T | { message?: string } | null;
  if (!response.ok) {
    throw new Error(
      payload && typeof payload === 'object' && 'message' in payload && payload.message
        ? payload.message
        : `Request failed: ${url}`,
    );
  }
  return payload as T;
}

export async function apiFresh<T>(url: string, init?: RequestInit): Promise<T> {
  return api<T>(url, { ...init, cache: 'no-store' });
}

export function formatDate(value: string | null | undefined) {
  return value
    ? new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : '—';
}

export function formatRelativeTime(value: string | null | undefined) {
  if (!value) return '—';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
