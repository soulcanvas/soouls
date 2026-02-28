'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface NavLink {
  label: string;
  href: string;
}

interface LandingNavbarProps {
  links?: NavLink[];
}

const defaultLinks: NavLink[] = [
  { label: 'Product', href: '#product' },
  { label: 'Philosophy', href: '#philosophy' },
  { label: 'Sunday Review', href: '#sunday-review' },
  { label: 'Waitlist', href: '#waitlist' },
];

export default function LandingNavbar({ links = defaultLinks }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // Become floating after 80px
      setScrolled(currentY > 80);

      // Hide when scrolling down fast, show when scrolling up
      if (currentY > lastScrollY.current + 8 && currentY > 200) {
        setHidden(true);
      } else if (currentY < lastScrollY.current - 4) {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-500 ease-out
        ${
          scrolled
            ? `mx-4 mt-4 rounded-2xl ${hidden ? '-translate-y-24 opacity-0' : 'translate-y-0 opacity-100'}`
            : 'mx-0 mt-0 rounded-none'
        }
      `}
      style={{
        background: scrolled ? 'rgba(28, 28, 28, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px) saturate(1.4)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(1.4)' : 'none',
        borderBottom: scrolled ? 'none' : 'none',
        border: scrolled ? '1px solid rgba(214, 194, 163, 0.12)' : 'none',
        boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <nav className="max-w-7xl mx-auto px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex-shrink-0" style={{ width: '200px' }}>
          <span className="font-playfair text-xl tracking-wide" style={{ color: '#D6C2A3' }}>
            Soulcanvas
          </span>
        </div>

        {/* Nav Links — centered */}
        <div className="hidden md:flex items-center justify-center gap-10 flex-1">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-urbanist text-sm transition-colors duration-200"
              style={{ color: '#A8A8A8', letterSpacing: '0.02em' }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#EFEBDD';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = '#A8A8A8';
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA Right */}
        <div className="flex items-center justify-end gap-6" style={{ width: '200px' }}>
          <a
            href="/sign-in"
            className="font-urbanist text-sm transition-colors duration-200"
            style={{ color: '#E07A5F', letterSpacing: '0.02em' }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#EFEBDD')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#E07A5F')}
          >
            Login
          </a>
          <a
            href="#waitlist"
            className="font-urbanist text-sm font-medium px-6 py-2.5 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: '#E07A5F',
              color: '#222222',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#d4694e';
              (e.target as HTMLElement).style.transform = 'scale(1.03)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#E07A5F';
              (e.target as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            Start Writing
          </a>
        </div>
      </nav>
    </header>
  );
}
