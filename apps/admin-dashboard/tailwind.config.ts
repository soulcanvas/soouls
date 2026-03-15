import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#08111f',
        mist: '#9fb6d2',
        glow: '#f59e0b',
        pulse: '#22c55e',
        ember: '#f97316',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        command: '0 24px 80px rgba(2, 6, 23, 0.28)',
      },
    },
  },
  plugins: [],
};

export default config;
