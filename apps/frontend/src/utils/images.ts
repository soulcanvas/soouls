/**
 * Cloudflare Image Optimization Utility
 *
 * Appends transformation parameters to R2 URLs to optimize images at the edge.
 * Uses format=auto to serve WebP/AVIF and quality=80 to save bandwidth.
 */

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif';
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
}

/**
 * Transforms an R2 public URL into a Cloudflare Optimized URL.
 * Example input:  https://media.soouls.app/entries/user_123/entry_456/img.jpg
 * Example output: https://media.soouls.app/cdn-cgi/image/width=1200,format=auto,quality=85/entries/user_123/entry_456/img.jpg
 */
export function getOptimizedImageUrl(url: string | null | undefined, options: ImageOptions = {}) {
  if (!url) return '';

  // Only optimize if it's an absolute URL and not a data URL
  if (!url.startsWith('http') || url.startsWith('data:')) {
    return url;
  }

  // Cloudflare Image Resizing expects: /cdn-cgi/image/<options>/<source-url>
  // We assume the URL is already on a Cloudflare-proxied domain (like our R2 public domain).
  const { width = 2048, quality = 85, format = 'auto', fit = 'scale-down' } = options;

  const params = [];
  if (width) params.push(`width=${width}`);
  if (options.height) params.push(`height=${options.height}`);
  if (quality) params.push(`quality=${quality}`);
  if (format) params.push(`format=${format}`);
  if (fit) params.push(`fit=${fit}`);

  const transformString = params.join(',');

  try {
    const urlObj = new URL(url);
    const domain = urlObj.origin;
    const path = urlObj.pathname;

    // Construct the optimized URL
    // Format: origin / cdn-cgi / image / transforms / path
    return `${domain}/cdn-cgi/image/${transformString}${path}`;
  } catch (_e) {
    console.error('Failed to parse image URL for optimization:', url);
    return url;
  }
}
