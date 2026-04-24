import type { SVGProps } from 'react';

interface SymbolLogoProps extends SVGProps<SVGSVGElement> {
  variant?: 'outline' | 'solid';
}

export function SymbolLogo({ variant = 'solid', ...props }: SymbolLogoProps) {
  const isSolid = variant === 'solid';

  // We use a slightly expanded viewBox to prevent the bezier curves from clipping
  // since the path coordinates go from x=-5 to 105.
  return (
    <svg viewBox="-10 -10 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Soouls Clover Logo</title>
      <path
        d="M48 48 C 20 8, -5 40, 48 48 Z"
        stroke={isSolid ? 'none' : 'currentColor'}
        strokeWidth={isSolid ? '0' : '4'}
        fill={isSolid ? 'currentColor' : 'none'}
        strokeLinejoin="round"
      />
      <path
        d="M52 48 C 80 8, 105 40, 52 48 Z"
        stroke={isSolid ? 'none' : 'currentColor'}
        strokeWidth={isSolid ? '0' : '4'}
        fill={isSolid ? 'currentColor' : 'none'}
        strokeLinejoin="round"
      />
      <path
        d="M52 52 C 80 92, 105 60, 52 52 Z"
        stroke={isSolid ? 'none' : 'currentColor'}
        strokeWidth={isSolid ? '0' : '4'}
        fill={isSolid ? 'currentColor' : 'none'}
        strokeLinejoin="round"
      />
      <path
        d="M48 52 C 20 92, -5 60, 48 52 Z"
        stroke={isSolid ? 'none' : 'currentColor'}
        strokeWidth={isSolid ? '0' : '4'}
        fill={isSolid ? 'currentColor' : 'none'}
        strokeLinejoin="round"
      />
    </svg>
  );
}
