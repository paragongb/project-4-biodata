import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/content/site';
import styles from './journey.module.css';

export const metadata: Metadata = {
  title: 'Journey',
  description: 'Two timelines for my study and life journey and my gaming journey.',
};

const study = [
  { title: 'Early years', description: 'Add a memory from school or a moment that shaped your interests.' },
  { title: 'Further studies', description: 'Add a milestone from college or university and what you learned along the way.' },
  { title: 'Life after graduation', description: 'Add a recent milestone and describe where it led you next.' },
];

const gaming = [
  { title: 'First games', description: 'Add the game or console that got you into gaming.' },
  { title: 'Finding my favourites', description: 'Add a game, genre, or community that became a favourite.' },
  { title: 'Gaming today', description: 'Add what you play now or a recent gaming memory.' },
];

function Timeline({ id, title, entries }: {
  id: string;
  title: string;
  entries: readonly { title: string; description: string }[];
}) {
  return (
    <section className={styles.column}>
      <h2 id={id}>{title}</h2>
      <div className={styles.scroll} role="region" aria-labelledby={id} tabIndex={0}>
        <ol className={styles.timeline} role="list">
          {entries.map((entry) => (
            <li className={styles.entry} key={entry.title}>
              <h3>{entry.title}</h3>
              <div className={styles.photo}>Photo placeholder</div>
              <p>{entry.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default function JourneyPage() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link className="wordmark" href="/">{site.wordmark}</Link>
        <Link className={styles.back} href="/">← Back to shelf</Link>
      </header>
      <main className={styles.main}>
        <h1>Journey</h1>
        <div className={styles.columns}>
          <Timeline id="study-life" title="Study & life" entries={study} />
          <Timeline id="gaming" title="Gaming" entries={gaming} />
        </div>
      </main>
    </div>
  );
}
