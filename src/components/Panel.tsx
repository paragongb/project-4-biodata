'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { sectionById, type SectionId } from '@/content/sections';
import { site } from '@/content/site';
import { projects } from '@/content/projects';
import { experience, skills } from '@/content/resume';
import { about } from '@/content/about';
import { now } from '@/content/now';
import type { Certificate } from '@/content/certificates';
import type { GithubStats } from '@/lib/types';
import CertificateTimeline from './CertificateTimeline';
import ContactForm from './ContactForm';
import SkillList from './SkillList';
import Terminal from './Terminal';

type Live = { github: GithubStats | null };

type PanelContent = {
  onClose: () => void;
  live: Live;
  certificates: Certificate[];
};

export default function Panel({ id, onClose, live, certificates }: PanelContent & { id: SectionId | null }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (id && id !== 'terminal') closeRef.current?.focus({ preventScroll: true }); // the terminal focuses its own input
  }, [id]);

  const section = id ? sectionById(id) : null;
  return (
    <aside className={`panel${id ? ' open' : ''}`} role="dialog" aria-modal="false" aria-label={section?.title} aria-hidden={!id}>
      {section && (
        <div className="panel-inner">
          <div className="panel-top">
            <button ref={closeRef} className="panel-close" type="button" onClick={onClose}>close ×</button>
            {section.href && <Link className="panel-page" href={section.href}>open page →</Link>}
          </div>
          <p className="kicker">{section.kicker}</p>
          <h2 className="panel-title">{section.title}</h2>
          <Body id={section.id} live={live} certificates={certificates} />
        </div>
      )}
    </aside>
  );
}

function Body({ id, live, certificates }: Omit<PanelContent, 'onClose'> & { id: SectionId }): ReactNode {
  switch (id) {
    case 'projects':
      return (
        <ul className="rows">
          {projects.map((p) => (
            <li key={p.slug}>
              <Link href={`/projects/${p.slug}`}>{p.name} ↗</Link>
              {p.tags && <span>{p.tags}</span>}
            </li>
          ))}
        </ul>
      );

    case 'experience':
      return (
        <>
          {experience.map(({ company, title, dates, highlights }) => (
            <article className="item" key={company}>
              <div className="item-row"><b>{company}</b><span>{dates}</span></div>
              <div className="item-sub">{title}</div>
              <ul>{highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
            </article>
          ))}
        </>
      );

    case 'certs':
      return <CertificateTimeline certificates={certificates} />;

    case 'skills':
      return (
        <>
          {skills.map((s) => (
            <div className="sec" key={s.group}>
              <h3>{s.group}</h3>
              <SkillList items={s.items} />
            </div>
          ))}
        </>
      );

    case 'github': {
      const stats = site.githubStats;
      return (
        <>
          <p className="lead">The skyline shows recent GitHub activity. The figures below are a snapshot.</p>
          <div className="stats">
            <div><b>{stats.contributionsLast20Weeks}</b><span>contributions, 20 weeks</span></div>
            <div><b>{stats.contributionsLastYear}</b><span>contributions, past year</span></div>
          </div>
          <a className="arrow-link" href={site.links.github} target="_blank" rel="noopener noreferrer">github.com/{site.githubUsername} ↗</a>
          {live.github?.source === 'unavailable' && <p className="note">Live skyline data is currently unavailable.</p>}
        </>
      );
    }

    case 'spotify': {
      const { title, artist, spotifyId } = site.featuredTrack;
      return (
        <>
          <iframe
            className="spotify-player"
            src={`https://open.spotify.com/embed/track/${spotifyId}`}
            title={`${title} by ${artist} on Spotify`}
            width="100%"
            height="152"
            allow="autoplay; encrypted-media"
          />
          <a className="arrow-link" href={`https://open.spotify.com/track/${spotifyId}`} target="_blank" rel="noopener noreferrer">{title} on Spotify ↗</a>
        </>
      );
    }

    case 'about':
      return <p className="lead">{about.bio}</p>;

    case 'contact':
      return (
        <>
          <ContactForm />
          <a className="arrow-link" href={site.links.github} target="_blank" rel="noopener noreferrer">GitHub · @{site.githubUsername} ↗</a>
        </>
      );

    case 'now':
      return (
        <>
          <ul className="rows">
            {now.items.map((n) => <li key={n.label}><span>{n.text}</span><span>{n.label}</span></li>)}
          </ul>
          <p className="note">updated {now.updated}</p>
        </>
      );

    case 'research':
      return <p className="lead">No research entries yet.</p>;

    case 'previous-services':
      return (
        <ol className="panel-timeline" role="list">
          {[0, 1, 2].map((entry) => (
            <li key={entry}>
              <h3>Date</h3>
              <div className="timeline-image-placeholder" role="img" aria-label="Photo placeholder" />
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <p className="note">Link to the project · pending</p>
            </li>
          ))}
        </ol>
      );

    case 'terminal':
      return <Terminal />;
  }
}
