export const publicInfoSlugs = [
  'about',
  'about-us',
  'features',
  'downloads',
  'release-notes',
  'careers',
  'contact',
  'documentation',
  'blog',
  'community',
  'privacy-policy',
  'terms-of-service',
  'cookie-policy',
  'security',
] as const;

export const publicInfoPaths = publicInfoSlugs.map((slug) => `/${slug}`);

export function isPublicInfoSlug(slug: string): slug is (typeof publicInfoSlugs)[number] {
  return publicInfoSlugs.includes(slug as (typeof publicInfoSlugs)[number]);
}
