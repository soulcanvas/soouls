import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Playfair_Display, Urbanist } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { CSPostHogProvider } from '../src/providers/posthog-provider';
import { PersistedTRPCProvider } from '../src/providers/trpc-provider';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Soouls — A quieter way to think',
  description:
    'Non-linear journaling designed for depth. Capture your thoughts as they happen. Build a map of your mind.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${urbanist.variable} font-urbanist`}
          suppressHydrationWarning
        >
          <CSPostHogProvider>
            <PersistedTRPCProvider>{children}</PersistedTRPCProvider>
            <Analytics />
            <SpeedInsights />
          </CSPostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
