import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Market for Impact — Put every dollar where it matters most',
  description: 'Compare high-impact funding opportunities across evidence, expected impact, and room for more funding.',
  openGraph: {
    title: 'Market for Impact',
    description: 'Put every dollar where it matters most.',
    images: [{ url: '/og.png', width: 1731, height: 909, alt: 'Market for Impact' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Market for Impact',
    description: 'Put every dollar where it matters most.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
