import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/content/site';
import JourneyTimeline from './JourneyTimeline';
import styles from './journey.module.css';

export const metadata: Metadata = {
  title: 'Journey',
  description: 'Education milestones and certificates.',
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
        <JourneyTimeline />
      </main>
    </div>
  );
}
