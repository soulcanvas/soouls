import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { TRPCProvider } from '../src/providers/trpc-provider';

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

export const metadata: Metadata = {
  title: 'SoulCanvas - Your Life Journal',
  description: 'A beautiful 3D digital life archive',
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
          className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} font-clarity`}
          suppressHydrationWarning
        >
          <TRPCProvider>{children}</TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
