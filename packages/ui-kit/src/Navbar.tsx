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
  /** Logo element or text */
  logo?: ReactNode;
  /** Navigation links */
  links?: NavLink[];
  /** CTA button content */
  ctaText?: string;
  /** CTA button href */
  ctaHref?: string;
  /** Make navbar transparent until scroll */
  transparent?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Responsive Navbar with scroll detection and mobile menu.
 * Uses proper semantic HTML and accessibility patterns.
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
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const navClasses = `
    fixed top-0 left-0 right-0 z-50
    transition-all duration-300
    ${isScrolled || !transparent
      ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50 shadow-lg'
      : 'bg-transparent'
    }
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <header className={navClasses}>
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-lg"
        >
          {logo || (
            <span className="text-2xl font-bold tracking-wide">
              Soul<span className="text-amber-400">Canvas</span>
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-amber-700 hover:shadow-amber-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            {ctaText}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <svg
            className="h-6 w-6"
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
            id="mobile-menu"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-800/50 bg-slate-900/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-4 py-3 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={ctaHref}
                className="mt-4 block w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-center font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-amber-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {ctaText}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export type { NavbarProps, NavLink };
