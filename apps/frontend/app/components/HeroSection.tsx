'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !bgRef.current || !contentRef.current) return;
      const scrollY = window.scrollY;
      const sectionTop = sectionRef.current.offsetTop;
      const relativeScroll = scrollY - sectionTop;

      // Parallax: BG moves slower than content
      bgRef.current.style.transform = `translateY(${relativeScroll * 0.35}px)`;
      contentRef.current.style.transform = `translateY(${relativeScroll * 0.15}px)`;
      contentRef.current.style.opacity = `${Math.max(0, 1 - relativeScroll / 500)}`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: '#222222',
        height: '100svh',
        minHeight: '700px',
      }}
    >
      {/* Hero Background Image (parallax layer) */}
      <div
        ref={bgRef}
        className="absolute inset-0 parallax-layer"
        style={{ top: '-10%', height: '120%' }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="object-cover object-center w-full h-full"
          style={{ opacity: 0.85 }}
        >
          <source src="/images/red_sun_remix.mp4" type="video/mp4" />
        </video>
        {/* Dark gradient overlay — bottom fade to black */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(34,34,34,0.15) 0%, rgba(34,34,34,0.0) 40%, rgba(34,34,34,0.6) 75%, rgba(34,34,34,1) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
        style={{ paddingTop: '80px' }}
      >
        {/* Main headline */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-center sm:gap-4 flex-wrap" style={{ maxWidth: '1100px' }}>
          <span
            className="font-urbanist font-medium tracking-tight"
            style={{
              fontSize: 'clamp(46px, 6.5vw, 92px)',
              lineHeight: '1.05em',
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
            }}
          >
            Welcome to a
          </span>

          <span
            className="font-playfair font-medium"
            style={{
              fontSize: 'clamp(48px, 6.8vw, 96px)',
              lineHeight: '1.05em',
              letterSpacing: '-0.02em',
              color: '#E07A5F',
              textShadow: '0 4px 42px rgba(224, 122, 95, 0.45)',
            }}
          >
            quieter
          </span>

          <span
            className="font-urbanist font-medium tracking-tight"
            style={{
              fontSize: 'clamp(46px, 6.5vw, 92px)',
              lineHeight: '1.05em',
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
            }}
          >
            way to think.
          </span>
        </div>

        {/* Subtitle */}
        <p
          className="font-urbanist font-normal mb-10"
          style={{
            fontSize: 'clamp(16px, 1.8vw, 26px)',
            lineHeight: '1.5em',
            letterSpacing: '-0.035em',
            color: '#EFEBDD',
            maxWidth: '760px',
            opacity: 0.9,
          }}
        >
          Non-linear journaling designed for depth. Capture your thoughts as they happen, not just when they fit a timeline. Build a map of your mind.
        </p>

        {/* CTA Button */}
        <a
          href="#waitlist"
          className="font-urbanist font-medium rounded-xl transition-all duration-300 group"
          style={{
            backgroundColor: '#E07A5F',
            color: '#222222',
            padding: '16px 36px',
            fontSize: '18px',
            lineHeight: '1em',
            letterSpacing: '0.01em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '12px',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
            (e.currentTarget as HTMLElement).style.backgroundColor = '#d4694e';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            (e.currentTarget as HTMLElement).style.backgroundColor = '#E07A5F';
          }}
        >
          Start Writing
        </a>

        {/* Tagline below CTA */}
        <p
          className="font-playfair mt-5"
          style={{
            fontSize: 'clamp(14px, 1.6vw, 26px)',
            letterSpacing: '-0.035em',
            color: '#D9D9D9',
            opacity: 0.7,
          }}
        >
          No cards, No noise, Just your story
        </p>

        {/* Scroll caret */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          style={{ animation: 'float-up 2s ease-in-out infinite alternate' }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M7 10.5L14 17.5L21 10.5" stroke="#EFEBDD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          </svg>
        </div>
      </div>
    </section>
  );
}
