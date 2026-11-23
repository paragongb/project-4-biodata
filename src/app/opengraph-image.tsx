// Link-preview image (LinkedIn, Slack, iMessage, X…). Generated at build time.

import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { site } from '@/content/site';
import { shelfSvg } from '@/lib/og-shelf';

export const alt = `${site.name}: ${site.title}. Portfolio shelf.`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const font = (pkg: string, file: string) => readFile(join(process.cwd(), 'node_modules/@fontsource', pkg, 'files', file));

const C = { bg: '#efe9df', ink: '#2b2621', muted: '#8c8073', accent: '#e4572e', face: '#fbf8f3', board: '#f4eee5' };

export default async function Image() {
  const [interBold, interRegular, mono] = await Promise.all([
    font('inter', 'inter-latin-700-normal.woff'),
    font('inter', 'inter-latin-400-normal.woff'),
    font('jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff'),
  ]);

  const shelf = shelfSvg({ fill: C.face, board: C.board, ink: C.ink, stroke: 1.2 });
  const shelfH = 560;
  const shelfW = Math.round((shelf.width / shelf.height) * shelfH);
  const shelfSrc = `data:image/svg+xml;base64,${Buffer.from(shelf.svg).toString('base64')}`;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: C.bg, color: C.ink, fontFamily: 'Inter' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 0 60px 72px', flex: 1 }}>
          <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: 20, color: C.muted }}>portfolio</div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 100, fontWeight: 700, letterSpacing: -5, lineHeight: 1 }}>{site.wordmark}</div>
            <div style={{ display: 'flex', fontSize: 40, marginTop: 22, letterSpacing: -1 }}>{site.title}</div>
          </div>

          <div style={{ display: 'flex', gap: 12, fontFamily: 'Mono', fontSize: 19 }}>
            {['projects', 'skills', 'research', 'github'].map((t) => (
              <div key={t} style={{ display: 'flex', border: `1.5px solid ${C.ink}`, padding: '6px 12px' }}>{t}</div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: shelfW + 40, paddingRight: 40 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shelfSrc} width={shelfW} height={shelfH} alt="" />
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, background: C.accent, display: 'flex' }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
        { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
        { name: 'Mono', data: mono, weight: 400, style: 'normal' },
      ],
    },
  );
}
