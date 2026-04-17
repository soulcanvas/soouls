import { notFound } from 'next/navigation';
import { isPublicInfoSlug, publicInfoSlugs } from '../../src/config/publicInfoRoutes';
import PublicInfoPageShell from '../components/info/PublicInfoPageShell';

export const dynamicParams = false;

export function generateStaticParams() {
  return publicInfoSlugs.map((slug) => ({ slug }));
}

export default async function PublicInfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isPublicInfoSlug(slug)) {
    notFound();
  }

  return <PublicInfoPageShell slug={slug} />;
}
