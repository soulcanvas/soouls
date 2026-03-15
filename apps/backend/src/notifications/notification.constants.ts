export const NOTIFICATIONS_QUEUE = 'notifications';
export const DEFAULT_FRONTEND_URL = 'http://localhost:3001';
export const DEFAULT_COMMAND_CENTER_URL = 'http://localhost:4000';
export const NOTIFICATION_BATCH_SIZE = 20;

export type NotificationJobMap = {
  'welcome-sequence': { userId: string };
  'secure-access': { email: string };
  'admin-invite': { inviteId: string };
  'campaign-dispatch': { campaignId: string };
};

export type NotificationJobName = keyof NotificationJobMap;
export type NotificationJobData = NotificationJobMap[NotificationJobName];

export function createRedisConnection() {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    return null;
  }

  const parsed = new URL(redisUrl);

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 6379,
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    db: parsed.pathname && parsed.pathname !== '/' ? Number(parsed.pathname.slice(1)) : undefined,
    tls: parsed.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

export function getFrontendUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_FRONTEND_URL ??
    process.env.FRONTEND_URL ??
    DEFAULT_FRONTEND_URL
  );
}

export function getCommandCenterUrl() {
  return process.env.COMMAND_CENTER_URL ?? DEFAULT_COMMAND_CENTER_URL;
}

export function makeAbsoluteUrl(path: string) {
  return new URL(path, getFrontendUrl()).toString();
}

export function normalizePhoneNumber(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const cleaned = value.replace(/[^\d+]/g, '');

  if (!cleaned) {
    return null;
  }

  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

export function asWhatsappRecipient(value: string) {
  return value.startsWith('whatsapp:') ? value : `whatsapp:${value}`;
}

export function compactPreview(payload: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;
}

export function parseEnvList(value: string | undefined) {
  return new Set(
    (value ?? '')
      .replace(/["']/g, '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function countValue(raw: unknown) {
  const value = typeof raw === 'number' ? raw : Number(raw ?? 0);
  return Number.isFinite(value) ? value : 0;
}
