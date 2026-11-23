import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { site } from '@/content/site';
import { about } from '@/content/about';

export const metadata: Metadata = { title: 'About', description: `About ${site.name}: ${site.title}.` };

export default function AboutPage() {
  return (
    <PageShell>
      <h1>About</h1>
      <p className="lead">{about.bio}</p>
    </PageShell>
  );
}
