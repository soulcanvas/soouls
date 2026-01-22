'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { HTMLAttributes, ReactNode } from 'react';

type CardVariant = 'default' | 'glass' | 'bordered' | 'elevated';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style variant */
  variant?: CardVariant;
  /** Card icon (emoji or component) */
  icon?: ReactNode;
  /** Card title */
  title?: string;
  /** Card description */
  description?: string;
  /** Additional CSS classes */
  className?: string;
  /** Card content (alternative to title/description) */
  children?: ReactNode;
  /** Enable hover animation */
  hoverable?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-slate-800/50 border border-slate-700/50',
  glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
  bordered: 'bg-transparent border-2 border-amber-400/30',
  elevated: 'bg-slate-800 shadow-xl shadow-slate-900/50',
};

/**
 * Versatile Card component for features, testimonials, and content blocks.
 * Supports glass morphism, animations, and accessibility.
 */
export function Card({
  variant = 'default',
  icon,
  title,
  description,
  className = '',
  children,
  hoverable = true,
  ...props
}: CardProps) {
  const shouldReduceMotion = useReducedMotion();

  const cardContent = (
    <div
      className={`
        rounded-2xl p-6 md:p-8
        transition-colors duration-300
        ${variantStyles[variant]}
        ${hoverable ? 'hover:border-amber-400/50 hover:bg-slate-700/50' : ''}
        ${className}
      `
        .trim()
        .replace(/\s+/g, ' ')}
      {...props}
    >
      {icon && (
        <div className="mb-4 text-4xl" aria-hidden="true">
          {icon}
        </div>
      )}
      {title && <h3 className="mb-2 text-xl font-semibold text-white text-pretty">{title}</h3>}
      {description && <p className="text-slate-300 leading-relaxed">{description}</p>}
      {children}
    </div>
  );

  if (!hoverable || shouldReduceMotion) {
    return cardContent;
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {cardContent}
    </motion.div>
  );
}

export type { CardProps, CardVariant };
