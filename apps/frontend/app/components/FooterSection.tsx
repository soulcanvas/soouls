'use client';

import { SiDiscord, SiInstagram, SiLinkedin, SiX } from 'react-icons/si';

export default function FooterSection() {
  return (
    <>
      <footer
        id="footer"
        className="relative flex flex-col items-center justify-start w-full bg-[#161616] z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
        style={{
          paddingTop: '60px',
        }}
      >
        {/* Noise Overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
            opacity: 0.08,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
          }}
        />

        {/* Footer Content */}
        <div className="relative z-20 w-full max-w-[1240px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start pt-[60px] md:pt-[100px] pb-[40px]">
          {/* Left: Brand & Socials */}
          <div className="flex flex-col max-w-[380px] w-full mb-16 md:mb-0 items-center md:items-start text-center md:text-left">
            <div className="mb-[20px]">
              <svg
                width="60"
                height="60"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Soulcanvas Clover Logo</title>
                <path
                  d="M48 48 C 20 8, -5 40, 48 48 Z"
                  stroke="#E6D3B8"
                  strokeWidth="3"
                  fill="none"
                  strokeLinejoin="round"
                />
                <path
                  d="M52 48 C 80 8, 105 40, 52 48 Z"
                  stroke="#E6D3B8"
                  strokeWidth="3"
                  fill="none"
                  strokeLinejoin="round"
                />
                <path
                  d="M52 52 C 80 92, 105 60, 52 52 Z"
                  stroke="#E6D3B8"
                  strokeWidth="3"
                  fill="none"
                  strokeLinejoin="round"
                />
                <path
                  d="M48 52 C 20 92, -5 60, 48 52 Z"
                  stroke="#E6D3B8"
                  strokeWidth="3"
                  fill="none"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              className="font-urbanist tracking-tight mb-[40px] md:mb-[60px]"
              style={{ fontSize: '32px', color: '#E0DECE', fontWeight: 500 }}
            >
              Soulcanvas
            </span>
            <div className="flex items-center gap-[24px]">
              <a
                href="https://twitter.com/soulcanvas_app"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-80 hover:opacity-100 transition-opacity hover:text-[#E07A5F] text-[#D8D8D8]"
              >
                <SiX size={20} />
              </a>
              <a
                href="https://linkedin.com/company/soulcanvas"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-80 hover:opacity-100 transition-opacity hover:text-[#E07A5F] text-[#D8D8D8]"
              >
                <SiLinkedin size={20} />
              </a>
              <a
                href="https://instagram.com/soulcanvas_app"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-80 hover:opacity-100 transition-opacity hover:text-[#E07A5F] text-[#D8D8D8]"
              >
                <SiInstagram size={20} />
              </a>
              <a
                href="https://discord.gg/soulcanvas"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-80 hover:opacity-100 transition-opacity hover:text-[#E07A5F] text-[#D8D8D8]"
              >
                <SiDiscord size={20} />
              </a>
            </div>
          </div>

          {/* Right side container for Links & Copyright */}
          <div className="flex flex-col w-full md:w-auto items-start md:items-end">
            {/* Links Grid */}
            <div className="grid grid-cols-2 md:flex md:flex-row gap-x-[40px] gap-y-[40px] md:gap-[80px]">
              {/* PRODUCT */}
              <div className="flex flex-col gap-[16px]">
                <span className="font-urbanist font-bold text-[#EFEBDD] text-[12px] tracking-widest mb-[4px] md:mb-[8px]">
                  PRODUCT
                </span>
                {['Features', 'Downloads', 'Release Notes'].map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase().replace(' ', '-')}`}
                    className="font-urbanist text-[#A8A8A8] hover:text-[#E07A5F] transition-colors duration-200"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    {link}
                  </a>
                ))}
              </div>
              {/* COMPANY */}
              <div className="flex flex-col gap-[16px]">
                <span className="font-urbanist font-bold text-[#EFEBDD] text-[12px] tracking-widest mb-[4px] md:mb-[8px]">
                  COMPANY
                </span>
                {['About Us', 'Careers', 'Contact'].map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase().replace(' ', '-')}`}
                    className="font-urbanist text-[#A8A8A8] hover:text-[#E07A5F] transition-colors duration-200"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    {link}
                  </a>
                ))}
              </div>
              {/* RESOURCES */}
              <div className="flex flex-col gap-[16px]">
                <span className="font-urbanist font-bold text-[#EFEBDD] text-[12px] tracking-widest mb-[4px] md:mb-[8px]">
                  RESOURCES
                </span>
                {['Documentation', 'Blog', 'Community'].map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    className="font-urbanist text-[#A8A8A8] hover:text-[#E07A5F] transition-colors duration-200"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    {link}
                  </a>
                ))}
              </div>
              {/* LEGAL & COMPLIANCE */}
              <div className="flex flex-col gap-[16px]">
                <span className="font-urbanist font-bold text-[#EFEBDD] text-[12px] tracking-widest mb-[4px] md:mb-[8px]">
                  LEGAL & COMPLIANCE
                </span>
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                    className="font-urbanist text-[#A8A8A8] hover:text-[#E07A5F] transition-colors duration-200"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            <span
              className="font-urbanist mt-[64px] text-center md:text-right w-full md:w-auto"
              style={{ fontSize: '12px', color: '#888888', fontStyle: 'italic' }}
            >
              All rights reserved © SOULCANVAS 2026
            </span>
          </div>
        </div>
      </footer>

      {/* Stacked Text block matching Figma - Overscroll / Bottom area */}
      {/* This sits firmly behind the footer at the bottom of the viewport, revealed ONLY via overscroll */}
      <div
        className="fixed bottom-0 left-0 right-0 w-full overflow-hidden flex flex-col items-center justify-end pointer-events-none opacity-20 border-t border-white/5 py-10 z-[-1]"
        style={{ backgroundColor: '#161616', height: '100vh' }}
      >
        {Array.from({ length: 3 }).map((_, i) => {
          // biome-ignore lint/suspicious/noArrayIndexKey: static text
          return (
            <span
              key={`footer-txt-${i}`}
              className="font-playfair leading-none"
              style={{
                fontFamily: 'ABC Whyte Inktrap, sans-serif',
                fontSize: 'clamp(120px, 20vw, 320px)',
                letterSpacing: '-0.03em',
                fontWeight: 700,
                color: 'transparent',
                WebkitTextStroke: '1px #FFFFFF',
                userSelect: 'none',
                textTransform: 'none',
                marginTop: i === 0 ? '0px' : '-16%',
              }}
            >
              Soulcanvas
            </span>
          );
        })}
      </div>
    </>
  );
}
