'use client';

import Link from 'next/link';
import React from 'react';

const footerLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export const MinimalFooter = () => {
  return (
    <footer className="relative bg-base-void border-t border-white/[0.04]">
      {/* Gradient border glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-aura-focus/20 to-transparent"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="font-editorial text-xl text-white/70">
              Soul<span className="text-aura-focus">Canvas</span>
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-8" aria-label="Footer navigation">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-clarity text-xs text-white/25 hover:text-white/50 transition-colors duration-500 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-aura-focus/30 group-hover:w-full transition-all duration-500" />
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="font-clarity text-[10px] text-white/15 tracking-wider">
            © {new Date().getFullYear()} SoulCanvas
          </p>
        </div>
      </div>
    </footer>
  );
};
