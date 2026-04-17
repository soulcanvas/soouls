'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LandingNavbar from '../LandingNavbar';
import FooterSection from '../FooterSection';

// Import All 13 Sections
import FeaturesSection from './FeaturesSection';
import DownloadsSection from './DownloadsSection';
import ReleaseNotesSection from './ReleaseNotesSection';
import AboutUsSection from './AboutUsSection';
import CareersSection from './CareersSection';
import ContactSection from './ContactSection';
import DocumentationSection from './DocumentationSection';
import BlogSection from './BlogSection';
import CommunitySection from './CommunitySection';
import PrivacyPolicySection from './PrivacyPolicySection';
import TermsOfServiceSection from './TermsOfServiceSection';
import CookiePolicySection from './CookiePolicySection';
import SecuritySection from './SecuritySection';

export default function StackPage() {
  const pathname = usePathname();

  useEffect(() => {
    // If the pathname matches a section (e.g., /careers -> #careers), scroll to it
    const sectionId = pathname.split('/').pop();
    if (sectionId && sectionId !== 'about') {
      const element = document.getElementById(sectionId);
      if (element) {
        // Wait a bit for components to mount and images to layout
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [pathname]);

  return (
    <main className="bg-[#161616] min-h-screen">
      <LandingNavbar />
      
      {/* Spacer for Fixed Navbar */}
      <div className="h-32 md:h-40" />

      {/* Stacked Sections */}
      <div id="about-us"><AboutUsSection /></div>
      <div id="features"><FeaturesSection /></div>
      <div id="downloads"><DownloadsSection /></div>
      <div id="careers"><CareersSection /></div>
      <div id="blog"><BlogSection /></div>
      <div id="community"><CommunitySection /></div>
      <div id="security"><SecuritySection /></div>
      <div id="privacy-policy"><PrivacyPolicySection /></div>
      <div id="documentation"><DocumentationSection /></div>
      <div id="release-notes"><ReleaseNotesSection /></div>
      <div id="contact"><ContactSection /></div>
      <div id="terms-of-service"><TermsOfServiceSection /></div>
      <div id="cookie-policy"><CookiePolicySection /></div>

      <FooterSection />
    </main>
  );
}
