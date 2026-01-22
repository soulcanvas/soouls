'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { HTMLAttributes, ReactNode } from 'react';

type SectionBackground = 'transparent' | 'dark' | 'darker' | 'gradient' | 'image';
type SectionPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Background style */
  background?: SectionBackground;
  /** Vertical padding */
  padding?: SectionPadding;
  /** Background image URL (when background='image') */
  backgroundImage?: string;
  /** Additional CSS classes */
  className?: string;
  /** Section content */
  children: ReactNode;
  /** Enable scroll-triggered animation */
  animate?: boolean;
  /** Section ID for anchor links */
  id?: string;
}

const backgroundStyles: Record<SectionBackground, string> = {
  transparent: 'bg-transparent',
  dark: 'bg-slate-900',
  darker: 'bg-slate-950',
  gradient: 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900',
  image: 'bg-cover bg-center bg-no-repeat',
};

const paddingStyles: Record<SectionPadding, string> = {
  none: 'py-0',
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-16 lg:py-20',
  lg: 'py-16 md:py-24 lg:py-32',
  xl: 'py-24 md:py-32 lg:py-40',
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const reducedMotion = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/**
 * Section wrapper with background options and scroll animations.
 * Supports image backgrounds, gradients, and respects prefers-reduced-motion.
 */
export function Section({
  background = 'transparent',
  padding = 'lg',
  backgroundImage,
  className = '',
  children,
  animate = true,
  id,
  style,
  ...props
}: SectionProps) {
  const shouldReduceMotion = useReducedMotion();

  const sectionStyle = {
    ...style,
    ...(background === 'image' && backgroundImage
      ? { backgroundImage: `url(${backgroundImage})` }
      : {}),
  };

  const content = (
    <section
      id={id}
      className={`
        relative overflow-hidden
        ${backgroundStyles[background]}
        ${paddingStyles[padding]}
        ${className}
      `
        .trim()
        .replace(/\s+/g, ' ')}
      style={sectionStyle}
      {...props}
    >
      {/* Overlay for image backgrounds */}
      {background === 'image' && (
        <div className="absolute inset-0 bg-slate-900/60" aria-hidden="true" />
      )}
      <div className="relative z-10">{children}</div>
    </section>
  );

  if (!animate) {
    return content;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={shouldReduceMotion ? reducedMotion : fadeInUp}
    >
      {content}
    </motion.div>
  );
}

export type { SectionProps, SectionBackground, SectionPadding };
