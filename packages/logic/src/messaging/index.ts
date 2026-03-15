const LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const INLINE_CODE_REGEX = /`([^`]+)`/g;
const BOLD_REGEX = /\*\*([^*]+)\*\*/g;
const ITALIC_REGEX = /\*([^*]+)\*/g;

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function applyInlineFormatting(value: string) {
  return escapeHtml(value)
    .replace(
      LINK_REGEX,
      '<a href="$2" style="color:#f97316;text-decoration:none;font-weight:600;">$1</a>',
    )
    .replace(INLINE_CODE_REGEX, '<code>$1</code>')
    .replace(BOLD_REGEX, '<strong>$1</strong>')
    .replace(ITALIC_REGEX, '<em>$1</em>');
}

function flushParagraph(buffer: string[], html: string[]) {
  if (buffer.length === 0) {
    return;
  }

  html.push(
    `<p style="margin:0 0 16px;line-height:1.75;color:#e2e8f0;">${applyInlineFormatting(
      buffer.join(' '),
    )}</p>`,
  );
  buffer.length = 0;
}

export function markdownToHtml(markdown: string) {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const html: string[] = [];
  const paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length === 0) {
      return;
    }

    html.push(
      `<ul style="margin:0 0 18px 18px;padding:0;color:#e2e8f0;line-height:1.7;">${listBuffer.join(
        '',
      )}</ul>`,
    );
    listBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph(paragraphBuffer, html);
      flushList();
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph(paragraphBuffer, html);
      listBuffer.push(
        `<li style="margin:0 0 8px;">${applyInlineFormatting(trimmed.slice(2))}</li>`,
      );
      continue;
    }

    flushList();

    if (trimmed.startsWith('### ')) {
      flushParagraph(paragraphBuffer, html);
      html.push(
        `<h3 style="margin:0 0 10px;color:#fff7ed;font-size:18px;line-height:1.4;">${applyInlineFormatting(
          trimmed.slice(4),
        )}</h3>`,
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph(paragraphBuffer, html);
      html.push(
        `<h2 style="margin:0 0 12px;color:#fff7ed;font-size:24px;line-height:1.3;">${applyInlineFormatting(
          trimmed.slice(3),
        )}</h2>`,
      );
      continue;
    }

    if (trimmed.startsWith('# ')) {
      flushParagraph(paragraphBuffer, html);
      html.push(
        `<h1 style="margin:0 0 14px;color:#ffffff;font-size:30px;line-height:1.2;">${applyInlineFormatting(
          trimmed.slice(2),
        )}</h1>`,
      );
      continue;
    }

    paragraphBuffer.push(trimmed);
  }

  flushParagraph(paragraphBuffer, html);
  flushList();

  return html.join('');
}

export function markdownToText(markdown: string) {
  return markdown
    .replaceAll('\r\n', '\n')
    .replace(LINK_REGEX, '$1 ($2)')
    .replace(INLINE_CODE_REGEX, '$1')
    .replace(BOLD_REGEX, '$1')
    .replace(ITALIC_REGEX, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function buildExcerpt(markdown: string, maxLength = 140) {
  const plain = markdownToText(markdown).replace(/\s+/g, ' ').trim();

  if (plain.length <= maxLength) {
    return plain;
  }

  return `${plain.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}
