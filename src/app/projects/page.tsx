import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '@/components/PageShell';
import { projects } from '@/content/projects';
import { site } from '@/content/site';

export const metadata: Metadata = { title: 'Projects', description: `Projects by ${site.name}.` };

export default function ProjectsPage() {
  return (
    <PageShell>
      <h1>Projects</h1>
      <ul className="card-list">
        {projects.map((p) => (
          <li key={p.slug}>
            <Link href={`/projects/${p.slug}`}>
              <h3>{p.name}</h3>
              {p.tags && <span>{p.tags}</span>}
              {p.oneLiner && <p>{p.oneLiner}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
