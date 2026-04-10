import Link from 'next/link';
import type { ReactNode } from 'react';

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

interface SocialLink {
  label: string;
  href: string;
  icon: ReactNode;
}

interface FooterProps {
  /** Logo element or text */
  logo?: ReactNode;
  /** Description text */
  description?: string;
  /** Navigation columns */
  columns?: FooterColumn[];
  /** Social media links */
  socialLinks?: SocialLink[];
  /** Copyright text */
  copyright?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Site footer with navigation columns, social links, and copyright.
 * Uses semantic HTML and accessible link patterns.
 */
export function Footer({
  logo,
  description = 'Find your oasis within. A mindful journaling experience.',
  columns = [],
  socialLinks = [],
  copyright = `© ${new Date().getFullYear()} Soouls. All rights reserved.`,
  className = '',
}: FooterProps) {
  return (
    <footer
      className={`
        bg-slate-950 border-t border-slate-800/50
        ${className}
      `
        .trim()
        .replace(/\s+/g, ' ')}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            {logo || (
              <Link
                href="/"
                className="inline-block text-2xl font-bold tracking-wide text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
              >
                Soul<span className="text-amber-400">Canvas</span>
              </Link>
            )}
            <p className="max-w-xs text-sm text-slate-400 leading-relaxed">{description}</p>
            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-4 pt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 transition-colors hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Columns */}
          {columns.length > 0 && (
            <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              {columns.map((column) => (
                <div key={column.title}>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                    {column.title}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm text-slate-400 transition-colors hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-slate-800/50 pt-8">
          <p className="text-center text-sm text-slate-500">{copyright}</p>
        </div>
      </div>
    </footer>
  );
}

export type { FooterProps, FooterColumn, SocialLink };
