import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { projectBySlug, projects } from '@/content/projects';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = projectBySlug((await params).slug);
  return p ? { title: p.name, description: p.oneLiner } : {};
}

export default async function ProjectPage({ params }: Props) {
  const p = projectBySlug((await params).slug);
  if (!p) notFound();

  return (
    <PageShell>
      <h1>{p.name}</h1>
      {p.oneLiner && <p className="lead">{p.oneLiner}</p>}
      {!!p.links?.length && (
        <p>
          {p.links.map((l) => (
            <a key={l.href} className="arrow-link" href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label} ↗{l.note ? ` (${l.note})` : ''}
            </a>
          ))}
        </p>
      )}

      {(p.problem || p.showEmptyDetails) && (
        <>
          <h2>Problem Statement</h2>
          <p>{p.problem ?? '-'}</p>
        </>
      )}

      {p.role && (
        <>
          <h2>My role</h2>
          <p>{p.role}</p>
        </>
      )}
      {(p.implementation || p.showEmptyDetails) && (
        <>
          <h2>Implementation</h2>
          <p>{p.implementation ?? '-'}</p>
        </>
      )}

      {!!p.built?.length && (
        <>
          <h2>What I built</h2>
          <ul className="built">
            {p.built.map((b, i) => (
              <li key={i}>{b.label && <b>{b.label}: </b>}{b.text}</li>
            ))}
          </ul>
        </>
      )}
      {!!p.also?.length && (
        <>
          <h2>Also supported</h2>
          <ul className="built">{p.also.map((a) => <li key={a}>{a}</li>)}</ul>
        </>
      )}

      {(p.constraints || p.showEmptyDetails) && (
        <>
          <h2>Constraints &amp; Lesson Learnt</h2>
          <p>{p.constraints ?? '-'}</p>
        </>
      )}

      {(p.outcome || p.showEmptyDetails) && (
        <>
          <h2>{p.outcomeHeading ?? 'Outcome'}</h2>
          <p>{p.outcome ?? '-'}</p>
        </>
      )}

      {(!!p.stack?.length || p.showEmptyDetails) && (
        <>
          <h2>Technologies</h2>
          {p.stack?.length
            ? <ul className="chips">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
            : <p>-</p>}
        </>
      )}

      {p.demonstrationPlaceholder && (
        <>
          <h2>Project Demonstration</h2>
          <div className="project-demo-placeholder" role="img" aria-label="Project demonstration placeholder" />
        </>
      )}

      {!!p.screenshots?.length && (
        <>
          <h2>Screenshots</h2>
          <div className="shots">
            {p.screenshots.map((s, i) => (
              <Image key={i} src={s.src} alt={s.alt} sizes="(max-width: 860px) 100vw, 820px" placeholder="blur" />
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
}
