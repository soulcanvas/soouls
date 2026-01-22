import { Footer } from '@soulcanvas/ui-kit/Footer';
import { Navbar } from '@soulcanvas/ui-kit/Navbar';
import {
  CTASection,
  FeaturesSection,
  HeroSection,
  HowItWorksSection,
  TestimonialsSection,
} from './components';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Testimonials', href: '#testimonials' },
];

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

/**
 * Landing Page - Main entry point for SoulCanvas.
 * Composed of reusable sections with smooth scroll.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <Navbar links={navLinks} transparent />

      {/* Main Content */}
      <main>
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-white focus:rounded-lg"
        >
          Skip to main content
        </a>

        <div id="main-content">
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <TestimonialsSection />
          <CTASection />
        </div>
      </main>

      {/* Footer */}
      <Footer columns={footerColumns} />
    </div>
  );
}
