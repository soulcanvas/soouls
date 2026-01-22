import type { ElementType, HTMLAttributes, ReactNode } from 'react';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Semantic heading level */
  as?: HeadingLevel;
  /** Visual size (independent of semantic level) */
  size?: HeadingSize;
  /** Additional CSS classes */
  className?: string;
  /** Heading content */
  children: ReactNode;
  /** Use gradient text effect */
  gradient?: boolean;
}

type TextVariant = 'body' | 'lead' | 'small' | 'muted';

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Text style variant */
  variant?: TextVariant;
  /** Additional CSS classes */
  className?: string;
  /** Text content */
  children: ReactNode;
  /** Render as span instead of paragraph */
  asSpan?: boolean;
}

const sizeStyles: Record<HeadingSize, string> = {
  xs: 'text-sm md:text-base',
  sm: 'text-base md:text-lg',
  md: 'text-lg md:text-xl lg:text-2xl',
  lg: 'text-2xl md:text-3xl lg:text-4xl',
  xl: 'text-3xl md:text-4xl lg:text-5xl',
  '2xl': 'text-4xl md:text-5xl lg:text-6xl',
  '3xl': 'text-5xl md:text-6xl lg:text-7xl',
  '4xl': 'text-6xl md:text-7xl lg:text-8xl',
};

const variantStyles: Record<TextVariant, string> = {
  body: 'text-base text-slate-300',
  lead: 'text-lg md:text-xl text-slate-200 leading-relaxed',
  small: 'text-sm text-slate-400',
  muted: 'text-base text-slate-500',
};

/**
 * Heading component with semantic levels and visual size separation.
 * Supports gradient text effect and responsive sizing.
 */
export function Heading({
  as: Component = 'h2',
  size = 'lg',
  className = '',
  children,
  gradient = false,
  ...props
}: HeadingProps) {
  return (
    <Component
      className={`
        font-bold tracking-tight text-pretty
        ${sizeStyles[size]}
        ${
          gradient
            ? 'bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent'
            : 'text-white'
        }
        ${className}
      `
        .trim()
        .replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Text component for body copy with consistent styling.
 * Supports multiple variants for different contexts.
 */
export function Text({
  variant = 'body',
  className = '',
  children,
  asSpan = false,
  ...props
}: TextProps) {
  const Component: ElementType = asSpan ? 'span' : 'p';

  return (
    <Component
      className={`
        ${variantStyles[variant]}
        ${className}
      `
        .trim()
        .replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </Component>
  );
}

export type { HeadingProps, HeadingLevel, HeadingSize, TextProps, TextVariant };
