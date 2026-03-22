export type Channel = 'email' | 'whatsapp';
export type BrandKey = 'soulcanvas' | 'soulcanvas-studio' | 'founder-desk';
export type Category = 'transactional' | 'marketing' | 'security' | 'product';
export type DeliveryStatus = 'sent' | 'failed' | 'skipped';

export type UserMessagingProfile = {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  phoneNumber: string | null;
  marketingEmailOptIn: boolean;
  marketingWhatsappOptIn: boolean;
  transactionalEmailOptIn: boolean;
  transactionalWhatsappOptIn: boolean;
  welcomeEmailSentAt: Date | null;
  welcomeWhatsappSentAt: Date | null;
  lastSecureAccessSentAt: Date | null;
};

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type WhatsAppMessage = {
  to: string;
  body: string;
};

export type TransportResult = {
  status: DeliveryStatus;
  provider: string;
  providerMessageId?: string;
  errorMessage?: string;
};

export type MessageTemplate = {
  subject: string;
  previewText: string;
  html: string;
  text: string;
  whatsappBody: string;
};

export type CampaignInput = {
  brandKey: BrandKey;
  title: string;
  subject: string;
  markdownBody: string;
  whatsappBody?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  channels: Channel[];
  targeting?: {
    nodeCount?: string;
    signupDate?: string;
    lastLogin?: string;
  };
};

export type PreferencesInput = {
  phoneNumber?: string | null;
  marketingEmailOptIn: boolean;
  marketingWhatsappOptIn: boolean;
  transactionalEmailOptIn: boolean;
  transactionalWhatsappOptIn: boolean;
};

export const BRAND_PRESETS: Record<
  BrandKey,
  {
    key: BrandKey;
    label: string;
    eyebrow: string;
    footer: string;
  }
> = {
  soulcanvas: {
    key: 'soulcanvas',
    label: 'SoulCanvas',
    eyebrow: 'SoulCanvas',
    footer: 'SoulCanvas is built for quiet focus, deep reflection, and meaningful product updates.',
  },
  'soulcanvas-studio': {
    key: 'soulcanvas-studio',
    label: 'SoulCanvas Studio',
    eyebrow: 'Studio Release',
    footer:
      'SoulCanvas Studio messages are crafted for launches, downloadable builds, and product drop announcements.',
  },
  'founder-desk': {
    key: 'founder-desk',
    label: 'Founder Desk',
    eyebrow: 'Founder Note',
    footer:
      'Founder Desk is for direct letters, roadmap context, and higher-touch communication from the core team.',
  },
};

export function getBrandPreset(brandKey: string | undefined) {
  return BRAND_PRESETS[(brandKey as BrandKey) ?? 'soulcanvas'] ?? BRAND_PRESETS.soulcanvas;
}
