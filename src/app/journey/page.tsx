import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/content/site';
import JourneyTimelines from './JourneyTimelines';
import styles from './journey.module.css';

export const metadata: Metadata = {
  title: 'Journey',
  description: 'Timelines of what I learned and the activities I took part in.',
};

export default function JourneyPage() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link className="wordmark" href="/">{site.wordmark}</Link>
        <Link className={styles.back} href="/">← Back to shelf</Link>
      </header>
      <main className={styles.main}>
        <h1>Journey</h1>
        <JourneyTimelines />
      </main>
    </div>
  );
}
