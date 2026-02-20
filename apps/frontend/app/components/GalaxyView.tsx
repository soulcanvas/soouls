'use client';

import { CTASection } from './CTASection';
import { FeaturesBento } from './FeaturesBento';
import { HeroSection } from './HeroSection';
import { MinimalFooter } from './MinimalFooter';
import { SafeSpaceSection } from './SafeSpaceSection';
import { SocialProofSection } from './SocialProofSection';
import { SundayReviewSection } from './SundayReviewSection';
import { TimelineSection } from './TimelineSection';

export function GalaxyView() {
  return (
    <>
      <HeroSection />
      <SocialProofSection />
      <TimelineSection />
      <SafeSpaceSection />
      <FeaturesBento />
      <SundayReviewSection />
      <CTASection />
      <MinimalFooter />
    </>
  );
}
