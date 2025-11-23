// File: src/app/layout.tsx (Server Component)

import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/app/providers';
import { Geist } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Conveyor HMI - Sorting System',
  description: 'Real-time HMI for Omron PLC-controlled Conveyor Sorting System',
};

const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-geist',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={"antialiased" + " " + geist.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
