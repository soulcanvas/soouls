import { Navbar } from '@soulcanvas/ui-kit';
import { GalaxyView } from './components/GalaxyView';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Safe Space', href: '#safe-space' },
  { label: 'Sunday Review', href: '#review' },
];

export default function Home() {
  return (
    <main className="bg-base-void min-h-screen">
      <Navbar links={navLinks} ctaText="Get Started" ctaHref="/sign-up" transparent />
      <GalaxyView />
    </main>
  );
}
