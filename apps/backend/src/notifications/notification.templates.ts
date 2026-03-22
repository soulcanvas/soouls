import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { render } from '@react-email/render';
import { buildExcerpt, markdownToHtml, markdownToText } from '@soulcanvas/logic/messaging';
import React from 'react';
import { getCommandCenterUrl, makeAbsoluteUrl } from './notification.constants';
import {
  BRAND_PRESETS,
  type MessageTemplate,
  type UserMessagingProfile,
  getBrandPreset,
} from './notification.types';

function renderMarkdownEmailContent(markdown: string) {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const nodes: React.ReactNode[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) {
      return;
    }

    key += 1;
    nodes.push(
      React.createElement(
        Text,
        {
          key: `paragraph-${key}`,
          style: {
            margin: '0 0 16px',
            lineHeight: '1.75',
            color: '#e2e8f0',
          },
        },
        paragraphBuffer.join(' '),
      ),
    );
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (listBuffer.length === 0) {
      return;
    }

    key += 1;
    nodes.push(
      React.createElement(
        Section,
        {
          key: `list-${key}`,
          style: {
            margin: '0 0 18px',
            paddingLeft: '18px',
          },
        },
        ...listBuffer.map((item, index) =>
          React.createElement(
            Text,
            {
              key: `item-${key}-${index}`,
              style: {
                margin: '0 0 8px',
                lineHeight: '1.7',
                color: '#e2e8f0',
              },
            },
            `• ${item}`,
          ),
        ),
      ),
    );
    listBuffer = [];
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph();
      listBuffer.push(trimmed.slice(2));
      continue;
    }

    flushList();

    if (trimmed.startsWith('# ')) {
      flushParagraph();
      key += 1;
      nodes.push(
        React.createElement(
          Heading,
          {
            key: `h1-${key}`,
            as: 'h1',
            style: {
              margin: '0 0 14px',
              color: '#ffffff',
              fontSize: '30px',
              lineHeight: '1.2',
            },
          },
          trimmed.slice(2),
        ),
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph();
      key += 1;
      nodes.push(
        React.createElement(
          Heading,
          {
            key: `h2-${key}`,
            as: 'h2',
            style: {
              margin: '0 0 12px',
              color: '#fff7ed',
              fontSize: '24px',
              lineHeight: '1.3',
            },
          },
          trimmed.slice(3),
        ),
      );
      continue;
    }

    paragraphBuffer.push(
      trimmed
        .replaceAll('**', '')
        .replaceAll('*', '')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1 ($2)'),
    );
  }

  flushParagraph();
  flushList();

  return nodes;
}

function TransactionalEmailShell(props: {
  brandKey?: string;
  eyebrow: string;
  title: string;
  previewText: string;
  bodyMarkdown: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footer?: string;
}) {
  const brand = getBrandPreset(props.brandKey);
  const footer = props.footer ?? brand.footer;
  const bodyNodes = renderMarkdownEmailContent(props.bodyMarkdown);

  return React.createElement(
    Html,
    null,
    React.createElement(Head),
    React.createElement(Preview, null, props.previewText),
    React.createElement(
      Body,
      {
        style: {
          backgroundColor: '#020617',
          margin: '0',
          padding: '32px 16px',
          fontFamily: 'Inter, Arial, sans-serif',
          color: '#e2e8f0',
        },
      },
      React.createElement(
        Container,
        {
          style: {
            maxWidth: '680px',
            margin: '0 auto',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '28px',
            overflow: 'hidden',
            background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 48%, #020617 100%)',
            boxShadow: '0 30px 80px rgba(15,23,42,0.45)',
          },
        },
        React.createElement(
          Section,
          {
            style: {
              padding: '32px 32px 12px',
              background: 'linear-gradient(180deg, rgba(249,115,22,0.22), rgba(15,23,42,0))',
            },
          },
          React.createElement(
            Text,
            {
              style: {
                display: 'inline-block',
                margin: '0',
                padding: '8px 12px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
                color: '#fdba74',
                fontSize: '12px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              },
            },
            props.eyebrow,
          ),
          React.createElement(
            Heading,
            {
              as: 'h1',
              style: {
                margin: '22px 0 12px',
                color: '#fff7ed',
                fontSize: '34px',
                lineHeight: '1.1',
                fontFamily: "Georgia, 'Times New Roman', serif",
              },
            },
            props.title,
          ),
          React.createElement(
            Text,
            {
              style: {
                margin: '0',
                color: '#cbd5e1',
                fontSize: '16px',
                lineHeight: '1.7',
              },
            },
            props.previewText,
          ),
        ),
        React.createElement(
          Section,
          { style: { padding: '12px 32px 32px' } },
          React.createElement(
            Section,
            {
              style: {
                padding: '24px',
                borderRadius: '24px',
                background: 'rgba(15,23,42,0.55)',
                border: '1px solid rgba(255,255,255,0.08)',
              },
            },
            ...bodyNodes,
            props.ctaLabel && props.ctaUrl
              ? React.createElement(
                  Section,
                  { style: { marginTop: '28px' } },
                  React.createElement(
                    Button,
                    {
                      href: props.ctaUrl,
                      style: {
                        display: 'inline-block',
                        padding: '14px 20px',
                        borderRadius: '999px',
                        background: 'linear-gradient(135deg,#f97316,#fb923c)',
                        color: '#0f172a',
                        fontWeight: '700',
                        textDecoration: 'none',
                      },
                    },
                    props.ctaLabel,
                  ),
                )
              : null,
          ),
          React.createElement(
            Text,
            {
              style: {
                marginTop: '24px',
                paddingTop: '18px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                fontSize: '13px',
                lineHeight: '1.7',
                color: '#94a3b8',
              },
            },
            footer,
          ),
        ),
      ),
    ),
  );
}

async function renderTransactionalTemplate(options: {
  brandKey?: string;
  eyebrow: string;
  title: string;
  previewText: string;
  bodyMarkdown: string;
  bodyText: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footer?: string;
  whatsappBody: string;
}) {
  const reactTree = React.createElement(TransactionalEmailShell, {
    brandKey: options.brandKey,
    eyebrow: options.eyebrow,
    title: options.title,
    previewText: options.previewText,
    bodyMarkdown: options.bodyMarkdown,
    ctaLabel: options.ctaLabel,
    ctaUrl: options.ctaUrl,
    footer: options.footer,
  });

  const html = await render(reactTree);
  const text = options.ctaUrl
    ? `${options.bodyText}\n\n${options.ctaLabel ?? 'Open SoulCanvas'}: ${options.ctaUrl}`
    : options.bodyText;

  return {
    subject: options.title,
    previewText: options.previewText,
    html,
    text,
    whatsappBody: options.whatsappBody,
  } satisfies MessageTemplate;
}

export function buildCampaignTemplate(input: {
  brandKey?: string;
  subject: string;
  markdownBody: string;
  ctaLabel?: string;
  ctaUrl?: string;
  whatsappBody?: string;
}) {
  const brand = getBrandPreset(input.brandKey);
  const previewText = buildExcerpt(input.markdownBody, 120);
  const textBody = markdownToText(input.markdownBody);
  const htmlBody = markdownToHtml(input.markdownBody);
  const ctaBlock =
    input.ctaLabel && input.ctaUrl
      ? `<div style="margin-top:28px;"><a href="${input.ctaUrl}" style="display:inline-block;padding:14px 20px;border-radius:999px;background:linear-gradient(135deg,#f97316,#fb923c);color:#0f172a;text-decoration:none;font-weight:700;">${input.ctaLabel}</a></div>`
      : '';

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${input.subject}</title>
        <meta name="description" content="${previewText}" />
      </head>
      <body style="margin:0;padding:32px 16px;background:#020617;font-family:Inter,Arial,sans-serif;color:#e2e8f0;">
        <div style="max-width:680px;margin:0 auto;background:radial-gradient(circle at top,#1e293b 0%,#0f172a 48%,#020617 100%);border:1px solid rgba(255,255,255,0.08);border-radius:28px;overflow:hidden;box-shadow:0 30px 80px rgba(15,23,42,0.45);">
          <div style="padding:32px 32px 12px;background:linear-gradient(180deg,rgba(249,115,22,0.22),rgba(15,23,42,0));">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,0.08);font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#fdba74;">
              ${brand.eyebrow}
            </div>
            <h1 style="margin:22px 0 12px;font-size:34px;line-height:1.1;color:#fff7ed;font-family:Georgia,'Times New Roman',serif;">
              ${input.subject}
            </h1>
            <p style="margin:0;color:#cbd5e1;font-size:16px;line-height:1.7;max-width:560px;">
              ${previewText}
            </p>
          </div>
          <div style="padding:12px 32px 32px;">
            <div style="padding:24px;border-radius:24px;background:rgba(15,23,42,0.55);border:1px solid rgba(255,255,255,0.08);">
              ${htmlBody}
              ${ctaBlock}
            </div>
            <div style="margin-top:24px;padding-top:18px;border-top:1px solid rgba(255,255,255,0.08);font-size:13px;line-height:1.7;color:#94a3b8;">
              ${brand.footer}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const whatsappBody = [input.whatsappBody?.trim() || textBody, input.ctaUrl]
    .filter(Boolean)
    .join('\n\n');

  return {
    subject: input.subject,
    previewText,
    html,
    text: input.ctaUrl
      ? `${textBody}\n\n${input.ctaLabel ?? 'Open SoulCanvas'}: ${input.ctaUrl}`
      : textBody,
    whatsappBody,
  } satisfies MessageTemplate;
}

export async function buildWelcomeTemplate(recipient: UserMessagingProfile) {
  const brand = BRAND_PRESETS.soulcanvas;
  const firstName = recipient.name?.split(' ')[0] || 'there';
  const dashboardUrl = makeAbsoluteUrl('/dashboard');
  const markdownBody = `# Welcome to SoulCanvas

Hi **${firstName}**,

Thank you for signing up. Your space is ready for reflective journaling, non-linear thinking, and the kind of product experience that feels calm instead of noisy.

- Start your first entry
- Explore your dashboard
- Capture ideas before they disappear

We're glad you're here.`;

  return renderTransactionalTemplate({
    brandKey: brand.key,
    eyebrow: brand.eyebrow,
    title: 'Welcome to SoulCanvas',
    previewText: 'Your SoulCanvas account is live, and your reflective workspace is ready.',
    bodyMarkdown: markdownBody,
    bodyText: markdownToText(markdownBody),
    ctaLabel: 'Open Your Dashboard',
    ctaUrl: dashboardUrl,
    footer: brand.footer,
    whatsappBody: `Welcome to SoulCanvas, ${firstName}. Your space is ready. Open your dashboard and start your first entry.`,
  });
}

export async function buildSecureAccessTemplate(
  recipient: UserMessagingProfile,
  secureLink: string,
) {
  const brand = BRAND_PRESETS.soulcanvas;
  const firstName = recipient.name?.split(' ')[0] || 'there';
  const settingsUrl = makeAbsoluteUrl('/dashboard/settings');
  const markdownBody = `# Secure access for your SoulCanvas account

Hi **${firstName}**,

Use the secure link below to get back into your account. Once you're inside, head to [Settings](${settingsUrl}) to update your password or account details.

- This link expires soon for safety
- If you didn't request this, you can ignore this message
- Support can always help if something looks off`;

  return renderTransactionalTemplate({
    brandKey: brand.key,
    eyebrow: brand.eyebrow,
    title: 'Your SoulCanvas secure access link',
    previewText:
      'Use this secure access link to get back into SoulCanvas and refresh your password safely.',
    bodyMarkdown: markdownBody,
    bodyText: markdownToText(markdownBody),
    ctaLabel: 'Open Secure Access Link',
    ctaUrl: secureLink,
    footer: brand.footer,
    whatsappBody:
      'Here is your SoulCanvas secure access link. Open it soon, then update your password from Settings once you are signed in.',
  });
}

export async function buildAdminInviteTemplate(input: {
  email: string;
  role: 'support' | 'engineer' | 'super_admin';
  inviterName?: string | null;
  inviterEmail?: string | null;
  expiresAt: Date;
}) {
  const roleLabel =
    input.role === 'super_admin'
      ? 'Super Admin'
      : input.role === 'engineer'
        ? 'Senior Engineer'
        : 'Tier 1 Support';
  const commandCenterUrl = new URL('/sign-in', getCommandCenterUrl()).toString();
  const inviter = input.inviterName?.trim() || input.inviterEmail || 'SoulLabs leadership';
  const expiryText = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(input.expiresAt);
  const markdownBody = `# Your SoulLabs Command Center invite

Hi,

**${inviter}** invited **${input.email}** to the SoulLabs Command Center as **${roleLabel}**.

- Sign in with your @soullabs.com Google Workspace account
- Access is role-based and every action is audit logged
- This invite is ready until ${expiryText}

Once you sign in, your invite will be activated automatically.`;

  return renderTransactionalTemplate({
    brandKey: 'founder-desk',
    eyebrow: 'SoulLabs Internal',
    title: 'You have been invited to SoulLabs Command Center',
    previewText: `${roleLabel} access is ready for the SoulLabs internal operating system.`,
    bodyMarkdown: markdownBody,
    bodyText: markdownToText(markdownBody),
    ctaLabel: 'Open Command Center',
    ctaUrl: commandCenterUrl,
    footer:
      'SoulLabs Command Center is an internal operations surface for support, engineering, and secure admin workflows.',
    whatsappBody:
      'You have a SoulLabs Command Center invite. Sign in with your @soullabs.com Google Workspace account to activate access.',
  });
}
