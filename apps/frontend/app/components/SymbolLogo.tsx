import React from 'react';

interface SymbolLogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'outline' | 'solid';
}

export function SymbolLogo({ variant = 'outline', ...props }: SymbolLogoProps) {
  const isSolid = variant === 'solid';

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Soulcanvas Clover Logo</title>
      <path
        d="M48 48 C 20 8, -5 40, 48 48 Z"
        stroke="currentColor"
        strokeWidth="3"
        fill={isSolid ? 'currentColor' : 'none'}
        strokeLinejoin="round"
      />
      <path
        d="M52 48 C 80 8, 105 40, 52 48 Z"
        stroke="currentColor"
        strokeWidth="3"
        fill={isSolid ? 'currentColor' : 'none'}
        strokeLinejoin="round"
      />
      <path
        d="M52 52 C 80 92, 105 60, 52 52 Z"
        stroke="currentColor"
        strokeWidth="3"
        fill={isSolid ? 'currentColor' : 'none'}
        strokeLinejoin="round"
      />
      <path
        d="M48 52 C 20 92, -5 60, 48 52 Z"
        stroke="currentColor"
        strokeWidth="3"
        fill={isSolid ? 'currentColor' : 'none'}
        strokeLinejoin="round"
      />
    </svg>
  );
}
