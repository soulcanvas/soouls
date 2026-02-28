import FooterSection from './components/FooterSection';
import HeroSection from './components/HeroSection';
import LandingNavbar from './components/LandingNavbar';
import RiverOfTimeSection from './components/RiverOfTimeSection';
import SpatialCanvasSection from './components/SpatialCanvasSection';
import SundayReviewSection from './components/SundayReviewSection';
import WaitlistSection from './components/WaitlistSection';

export default function Home() {
  return (
    <main style={{ backgroundColor: '#222222' }}>
      <LandingNavbar />
      <HeroSection />
      <RiverOfTimeSection />
      <SpatialCanvasSection />
      <SundayReviewSection />
      <WaitlistSection />
      <FooterSection />
    </main>
  );
}
