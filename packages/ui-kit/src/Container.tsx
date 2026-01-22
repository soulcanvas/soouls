import type { HTMLAttributes, ReactNode } from 'react';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Maximum width constraint */
  size?: ContainerSize;
  /** Additional CSS classes */
  className?: string;
  /** Container content */
  children: ReactNode;
  /** Center content horizontally */
  centered?: boolean;
}

const sizeStyles: Record<ContainerSize, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

/**
 * Layout container with responsive max-width and padding.
 * Use for consistent page layouts and content sections.
 */
export function Container({
  size = 'xl',
  className = '',
  children,
  centered = true,
  ...props
}: ContainerProps) {
  return (
    <div
      className={`
        w-full px-4 sm:px-6 lg:px-8
        ${sizeStyles[size]}
        ${centered ? 'mx-auto' : ''}
        ${className}
      `
        .trim()
        .replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export type { ContainerProps, ContainerSize };
