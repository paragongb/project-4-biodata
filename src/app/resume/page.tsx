import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '@/components/PageShell';
import SkillList from '@/components/SkillList';
import { projects } from '@/content/projects';
import { site } from '@/content/site';
import { skills } from '@/content/resume';

export const metadata: Metadata = { title: 'Résumé', description: `${site.name}: projects and skills.` };

export default function ResumePage() {
  return (
    <PageShell>
      <h1>Résumé</h1>
      <p className="lead">{site.name} · {site.title}</p>
      <p><a className="arrow-link" href={site.resumePdf}>View CV (PDF) ↗</a></p>

      <h2 id="projects">Projects</h2>
      {projects.map((p) => (
        <div className="item" key={p.slug}>
          <div className="item-row"><Link href={`/projects/${p.slug}`}><b>{p.name} ↗</b></Link>{p.tags && <span>{p.tags}</span>}</div>
          {p.oneLiner && <div className="item-sub">{p.oneLiner}</div>}
          {(p.role || p.outcome) && (
            <ul>
              {p.role && <li>{p.role}</li>}
              {p.outcome && <li>{p.outcome}</li>}
            </ul>
          )}
          {!!p.stack?.length && <ul className="chips">{p.stack.slice(0, 10).map((s) => <li key={s}>{s}</li>)}</ul>}
        </div>
      ))}

      <h2 id="skills">Skills</h2>
      {skills.map((s) => (
        <div className="item" key={s.group}>
          <div className="item-row"><b>{s.group}</b></div>
          <SkillList items={s.items} />
        </div>
      ))}
    </PageShell>
  );
}
