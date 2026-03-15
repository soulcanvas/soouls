'use client';

import Link from 'next/link';

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

export default function LandingDock({ links = defaultLinks }: LandingNavbarProps) {
  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-row items-center rounded-3xl"
      style={{
        backgroundColor: '#2A3335',
        boxShadow:
          '0px 22px 48px 0px rgba(232, 195, 122, 0.16), 0px 88px 88px 0px rgba(232, 195, 122, 0.14), 0px 198px 119px 0px rgba(232, 195, 122, 0.08), 0px 351px 141px 0px rgba(232, 195, 122, 0.02), 0px 549px 154px 0px rgba(232, 195, 122, 0)',
        padding: '26px 44px',
        gap: '64px', // Reduced from 125px for better spacing on smaller monitors while keeping ratio
      }}
    >
      {/* Logo Area */}
      <div className="flex items-center gap-1">
        <span
          className="font-playfair font-bold"
          style={{
            fontFamily: 'ABC Whyte Inktrap, sans-serif',
            color: '#D6C2A3',
            fontSize: '28px', // Scaled down from 44px for practical web usage
            lineHeight: '1em',
            letterSpacing: '-0.035em',
          }}
        >
          Soulcanvas
        </span>
      </div>

      {/* Nav Links */}
      <nav className="hidden md:flex flex-row gap-[48px] items-center">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="font-urbanist"
            style={{
              color: '#A8A8A8',
              fontSize: '18px', // Scaled down from 26px
              lineHeight: '1.2em',
              transition: 'color 0.2s',
            }}
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
      </nav>

      {/* Call To Actions */}
      <div className="flex flex-row items-center gap-[24px]">
        <Link
          href="/sign-in"
          className="font-urbanist font-semibold"
          style={{
            color: '#E07C60',
            fontSize: '18px', // Scaled from 26px
            lineHeight: '1em',
            letterSpacing: '-0.035em',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.color = '#EFEBDD';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.color = '#E07C60';
          }}
        >
          Login
        </Link>

        {/* Start Writing Button Component Match */}
        <Link
          href="/sign-up"
          className="font-urbanist font-semibold transition-all duration-300 flex justify-center items-center"
          style={{
            backgroundColor: '#E07C60',
            color: '#222222',
            fontSize: '16px', // Scaled from 24px
            lineHeight: '1em',
            letterSpacing: '-0.035em',
            padding: '12px 20px',
            borderRadius: '12px',
            gap: '7.5px',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
            (e.currentTarget as HTMLElement).style.backgroundColor = '#d4694e';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            (e.currentTarget as HTMLElement).style.backgroundColor = '#E07C60';
          }}
        >
          Start Writing
        </Link>
      </div>
    </div>
  );
}
