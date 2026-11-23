import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { site } from '@/content/site';
import './globals.css';

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${site.name} · ${site.title}`, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: { title: `${site.name} · ${site.title}`, description: site.description, type: 'website', siteName: site.name },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#efe9df', // clay is the default theme
};

// Runs before first paint so the saved theme never flashes the wrong colours.
// Use the visitor's clock so clay mode opens in the right palette.
const themeScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='clay'){t='clay'}d.dataset.theme=t}catch(e){d.dataset.theme='clay'}var h=new Date().getHours();d.dataset.time=(h<7||h>=19)?'night':'day'})()`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
