'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SymbolLogo } from './SymbolLogo';

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

      // Become floating after 60px
      setScrolled(currentY > 60);

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
        fixed left-1/2 -translate-x-1/2 z-50
        transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
        flex flex-row items-center
        ${hidden ? '-translate-y-32 opacity-0' : 'translate-y-0 opacity-100'}
      `}
      style={{
        // Initially at y=66px and 1239px wide (matching Figma perfectly)
        // When scrolled, shrink to a floating pill
        top: scrolled ? '24px' : '66px',
        width: scrolled ? '880px' : '1239px',
        padding: scrolled ? '16px 32px' : '0px 0px',
        borderRadius: scrolled ? '40px' : '0px',
        background: scrolled ? 'rgba(42, 51, 53, 0.75)' : 'transparent',
        backdropFilter: scrolled ? 'blur(32px) saturate(1.2)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(32px) saturate(1.2)' : 'none',
        boxShadow: scrolled
          ? '0px 22px 48px 0px rgba(0, 0, 0, 0.16), 0px 88px 88px 0px rgba(0, 0, 0, 0.14)'
          : 'none',
        border: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
      }}
    >
      <nav className="flex items-center justify-between w-full h-full relative">
        {/* Mobile menu (Left) */}
        <div className="flex md:hidden items-center justify-start w-[80px]">
          <button
            className="text-[#EFEBDD] p-2 hover:bg-white/10 rounded-md transition-colors"
            aria-label="Menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* Logo */}
        <div className="flex-shrink-0 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex items-center justify-center md:justify-start w-auto md:w-[200px] h-[32px]">
          {/* Text Logo */}
          <span
            className="absolute font-playfair font-bold"
            style={{
              fontFamily: 'ABC Whyte Inktrap, sans-serif',
              color: '#D6C2A3',
              fontSize: '28px',
              lineHeight: '1em',
              letterSpacing: '-0.035em',
              opacity: scrolled ? 0 : 1,
              transform: scrolled ? 'translateX(-20px)' : 'translateX(0)',
              pointerEvents: scrolled ? 'none' : 'auto',
              transition: 'all 0.5s ease',
            }}
          >
            Soulcanvas
          </span>
          {/* Symbol Logo */}
          <div
            className="absolute"
            style={{
              opacity: scrolled ? 1 : 0,
              transform: scrolled
                ? 'translateX(0) rotate(0deg)'
                : 'translateX(20px) rotate(-90deg)',
              pointerEvents: scrolled ? 'auto' : 'none',
              color: '#D6C2A3',
              transition: 'all 0.5s ease',
            }}
          >
            <SymbolLogo variant="solid" width="36" height="36" />
          </div>
        </div>

        {/* Nav Links — centered */}
        <div
          className="hidden md:flex flex-row items-center justify-center flex-1"
          style={{
            gap: scrolled ? '36px' : '48px',
            transition: 'all 0.5s ease',
          }}
        >
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-urbanist"
              style={{
                color: scrolled ? '#EFEBDD' : '#A8A8A8',
                fontSize: scrolled ? '16px' : '18px',
                lineHeight: '1.2em',
                transition: 'color 0.2s, font-size 0.5s ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#E07A5F';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = scrolled ? '#EFEBDD' : '#A8A8A8';
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side — CTA */}
        <div className="flex-shrink-0 flex items-center justify-end w-auto md:w-[200px] gap-6">
          <Link
            href="#login"
            className="hidden md:block font-urbanist transition-colors"
            style={{ 
              color: '#E07A5F',
              fontSize: '14px', 
              fontWeight: 500
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = '#EFEBDD';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = '#E07A5F';
            }}
          >
            Login
          </Link>
          <Link
            href="#start-writing"
            className="font-urbanist font-bold transition-all duration-300 flex justify-center items-center"
            style={{
              backgroundColor: '#E07A5F',
              color: '#111111',
              padding: '10px 16px', // Slightly smaller for mobile
              borderRadius: '8px',
              fontSize: '11px', // Smaller font for mobile
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#EFEBDD';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#E07A5F';
            }}
          >
            Start Writing
          </Link>
        </div>
      </nav>
    </header>
  );
}
