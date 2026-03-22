'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface NavLink {
  label: string;
  href: string;
}

interface NavbarProps {
  logo?: ReactNode;
  links?: NavLink[];
  ctaText?: string;
  ctaHref?: string;
  transparent?: boolean;
  className?: string;
}

/**
 * Responsive Navbar with floating pill behavior on scroll.
 * — At top: transparent, full-width
 * — On scroll: centered floating glassmorphic pill
 */
export function Navbar({
  logo,
  links = [],
  ctaText = 'Get Started',
  ctaHref = '/sign-up',
  transparent = true,
  className = '',
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 80);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const floating = isScrolled && transparent;

  return (
    <>
      {/* ── Static Top Bar (before scroll) ── */}
      <AnimatePresence initial={false}>
        {!floating && (
          <motion.header
            key="topbar"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`fixed top-0 left-0 right-0 z-50 ${className}`}
          >
            <nav
              className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"
              aria-label="Main navigation"
            >
              {/* Logo */}
              <Link
                href="/"
                className="flex items-center gap-2 text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-focus rounded-lg"
              >
                {logo || (
                  <span
                    className="text-xl font-bold tracking-tight"
                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                  >
                    Soul<span style={{ color: '#99F6E4' }}>Canvas</span>
                  </span>
                )}
              </Link>

              {/* Desktop Links */}
              <div className="hidden items-center gap-8 md:flex">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-white/50 transition-all duration-300 hover:text-[#e07a5f] hover:drop-shadow-[0_0_8px_rgba(224,122,95,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-focus rounded"
                    style={{
                      letterSpacing: '0.04em',
                      fontFamily: 'var(--font-geist-sans), sans-serif',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href={ctaHref}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white/80 backdrop-blur-md transition-all hover:bg-[#e07a5f] hover:text-white hover:border-[#e07a5f] hover:shadow-[0_0_15px_rgba(224,122,95,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-focus"
                  style={{
                    fontFamily: 'var(--font-geist-sans), sans-serif',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  {ctaText}
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-focus md:hidden cursor-pointer"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu-topbar"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  )}
                </svg>
              </button>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  id="mobile-menu-topbar"
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-white/5 bg-black/80 backdrop-blur-2xl md:hidden"
                >
                  <div className="space-y-1 px-6 py-5">
                    {links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block rounded-lg px-3 py-3 text-sm text-white/50 transition-all duration-300 hover:bg-[#e07a5f]/10 hover:text-[#e07a5f] hover:drop-shadow-[0_0_8px_rgba(224,122,95,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-focus"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <Link
                      href={ctaHref}
                      className="mt-3 block w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-white/80 transition-all hover:bg-[#e07a5f] hover:text-white hover:border-[#e07a5f]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {ctaText}
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ── Floating Pill Navbar (on scroll) ── */}
      <AnimatePresence initial={false}>
        {floating && (
          <motion.header
            key="floating-pill"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.96 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-5 left-1/2 z-50 -translate-x-1/2 w-full max-w-2xl px-4"
          >
            <nav
              className="flex items-center justify-between rounded-full border border-white/10 bg-black/70 px-5 py-3 shadow-2xl shadow-black/50"
              style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}
              aria-label="Floating navigation"
            >
              {/* Logo */}
              <Link
                href="/"
                className="flex items-center text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-focus rounded-full"
              >
                {logo || (
                  <span
                    className="text-base font-bold tracking-tight"
                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                  >
                    Soul<span style={{ color: '#99F6E4' }}>Canvas</span>
                  </span>
                )}
              </Link>

              {/* Desktop Links */}
              <div className="hidden items-center gap-6 md:flex">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs text-white/40 transition-all duration-300 hover:text-[#e07a5f] hover:drop-shadow-[0_0_8px_rgba(224,122,95,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-focus rounded"
                    style={{
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--font-geist-sans), sans-serif',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* CTA */}
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-xs font-semibold text-black transition-all hover:bg-[#e07a5f] hover:text-white hover:shadow-[0_0_20px_rgba(224,122,95,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-focus cursor-pointer"
                style={{
                  letterSpacing: '0.03em',
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                }}
              >
                {ctaText}
              </Link>
            </nav>
          </motion.header>
        )}
      </AnimatePresence>
    </>
  );
}

export type { NavbarProps, NavLink };
