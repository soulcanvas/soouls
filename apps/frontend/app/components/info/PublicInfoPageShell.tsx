import type { ComponentType } from 'react';
import FooterSection from '../FooterSection';
import LandingNavbar from '../LandingNavbar';
import AboutUsSection from './AboutUsSection';
import BlogSection from './BlogSection';
import CareersSection from './CareersSection';
import CommunitySection from './CommunitySection';
import ContactSection from './ContactSection';
import CookiePolicySection from './CookiePolicySection';
import DocumentationSection from './DocumentationSection';
import DownloadsSection from './DownloadsSection';
import FeaturesSection from './FeaturesSection';
import PrivacyPolicySection from './PrivacyPolicySection';
import ReleaseNotesSection from './ReleaseNotesSection';
import SecuritySection from './SecuritySection';
import TermsOfServiceSection from './TermsOfServiceSection';

const publicInfoPageSections: Record<string, ComponentType> = {
  about: AboutUsSection,
  'about-us': AboutUsSection,
  features: FeaturesSection,
  downloads: DownloadsSection,
  'release-notes': ReleaseNotesSection,
  careers: CareersSection,
  contact: ContactSection,
  documentation: DocumentationSection,
  blog: BlogSection,
  community: CommunitySection,
  'privacy-policy': PrivacyPolicySection,
  'terms-of-service': TermsOfServiceSection,
  'cookie-policy': CookiePolicySection,
  security: SecuritySection,
};

export default function PublicInfoPageShell({ slug }: { slug: string }) {
  const Section = publicInfoPageSections[slug];

  if (!Section) {
    return null;
  }

  return (
    <main className="bg-[#161616] min-h-screen">
      <LandingNavbar />
      <div className="h-32 md:h-40" />
      <Section />
      <FooterSection />
    </main>
  );
}
