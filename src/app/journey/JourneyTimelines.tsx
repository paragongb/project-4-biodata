import Image from 'next/image';
import styles from './journey.module.css';

type TimelineEntry = { title: string } & (
  | { description: string }
  | {
    documents: {
      label: string;
      filename: string;
      pages: { image: string; width: number; height: number }[];
    }[];
  }
);

const studyFolder = '/what%20did%20i%20learnt';

const study: TimelineEntry[] = [
  {
    title: 'UPSR - SEKOLAH KEBANGSAAN SEDARAT (2015)',
    documents: [{
      label: 'UPSR certificate',
      filename: '1 - Sijil UPSR.pdf',
      pages: [{ image: '1-1.jpg', width: 1600, height: 994 }],
    }],
  },
  {
    title: 'PT3 - SAINSKU (2018)',
    documents: [{
      label: 'PT3 certificate',
      filename: '2 - Sijil PT3.pdf',
      pages: [{ image: '2-1.jpg', width: 1050, height: 1600 }],
    }],
  },
  {
    title: 'SPM - SAINSKU (2020/2021)',
    documents: [{
      label: 'SPM certificate',
      filename: '3 - Sijil SPM.pdf',
      pages: [{ image: '3-1.jpg', width: 1150, height: 1600 }],
    }],
  },
  {
    title: 'UPBA - SAINSKU (2021)',
    documents: [{
      label: 'UPBA certificate',
      filename: '4 - Sijil UPBA.pdf',
      pages: [{ image: '4-1.jpg', width: 1078, height: 1600 }],
    }],
  },
  {
    title: 'MATRICULATION - KOLEJ MATRIKULASI SARAWAK (2022)',
    documents: [{
      label: 'Matriculation certificate',
      filename: '5 - Sijil Matrikulasi.pdf',
      pages: [{ image: '5-1.jpg', width: 1089, height: 1600 }],
    }],
  },
  {
    title: 'MUET - KOLEJ MATRIKULASI SARAWAK (2022)',
    documents: [{
      label: 'MUET certificate',
      filename: '6 - Sijil MUET.pdf',
      pages: [{ image: '6-1.jpg', width: 1093, height: 1600 }],
    }],
  },
  {
    title: 'STUDENT EXCHANGE PROGRAMME - UNIVERSITAS BRAWIJAYA (2023)',
    documents: [{
      label: 'Universitas Brawijaya transcript',
      filename: '7 - Official Transcript Universitas Brawijaya Indonesia.pdf',
      pages: [{ image: '7-1.jpg', width: 1131, height: 1600 }],
    }],
  },
  {
    title: "BACHELOR'S DEGREE - UNIVERSITY MALAYSIA SARAWAK (2026)",
    documents: [
      {
        label: 'UNIMAS transcript',
        filename: '8A - Official Transcript UNIMAS.pdf',
        pages: [
          { image: '8A-1.jpg', width: 1082, height: 1600 },
          { image: '8A-2.jpg', width: 1069, height: 1600 },
        ],
      },
      {
        label: "Bachelor's degree certificate",
        filename: '8B - Sijil Ijazah Sarjana Muda.pdf',
        pages: [{ image: '8B-1.jpg', width: 1600, height: 1059 }],
      },
    ],
  },
];

const participation = [
  { title: 'First activity', description: 'Add an early event, competition, or programme you took part in.' },
  { title: 'Next activity', description: 'Add a later activity and describe your role.' },
  { title: 'Most recent activity', description: 'Add a recent event and share what you contributed.' },
];

function Timeline({ id, title, entries, inPanel }: {
  id: string;
  title: string;
  entries: TimelineEntry[];
  inPanel: boolean;
}) {
  const Heading = inPanel ? 'h3' : 'h2';
  const EntryHeading = inPanel ? 'h4' : 'h3';

  return (
    <section className={styles.column} aria-labelledby={id}>
      <Heading id={id} className={inPanel ? styles.panelHeading : undefined}>{title}</Heading>
      <ol className={inPanel ? 'panel-timeline' : styles.timeline} role="list">
        {entries.map((entry) => (
          <li className={inPanel ? undefined : styles.entry} key={entry.title}>
            <EntryHeading className={inPanel ? styles.panelEntryHeading : undefined}>{entry.title}</EntryHeading>
            {'documents' in entry ? (
              <div className={styles.documents}>
                {entry.documents.flatMap(({ label, filename, pages }) =>
                  pages.map(({ image, width, height }, index) => (
                    <a
                      className={styles.document}
                      href={`${studyFolder}/${encodeURIComponent(filename)}`}
                      key={image}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Image
                        src={`${studyFolder}/previews/${image}`}
                        alt={`Open ${label} PDF${pages.length > 1 ? `, page ${index + 1} preview` : ''}`}
                        width={width}
                        height={height}
                        unoptimized
                      />
                    </a>
                  )),
                )}
              </div>
            ) : (
              <>
                <div className={styles.photo}>Photo placeholder</div>
                <p>{entry.description}</p>
              </>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function JourneyTimelines({ inPanel = false }: { inPanel?: boolean }) {
  return (
    <div className={inPanel ? styles.panelGroups : styles.columns}>
      <Timeline id="study-life" title="What Did I Learnt?" entries={study} inPanel={inPanel} />
      <Timeline id="participation" title="What Did I Participated?" entries={participation} inPanel={inPanel} />
    </div>
  );
}
