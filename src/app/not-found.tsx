import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '@/components/PageShell';
import { site } from '@/content/site';

export const metadata: Metadata = { title: 'Not found' };

// One empty cubby in the same isometric line style as the shelf.
const C30 = Math.cos(Math.PI / 6);
const P = (x: number, y: number, z: number) => [(x + y) * C30 * 10, ((y - x) * 0.5 - z) * 10];
type B = [number, number, number, number, number, number]; // x y z w d h

function faces([x, y, z, w, d, h]: B) {
  const x1 = x + w, y1 = y + d, z1 = z + h;
  return [
    [P(x, y, z), P(x, y1, z), P(x, y1, z1), P(x, y, z1)],
    [P(x, y1, z), P(x1, y1, z), P(x1, y1, z1), P(x, y1, z1)],
    [P(x, y, z1), P(x1, y, z1), P(x1, y1, z1), P(x, y1, z1)],
  ];
}

const W = 30, D = 12, H = 20, POST = 0.6, T = 0.8;
// paint back-to-front: back posts, bottom board, front-right post, top board, front-left post
const BOXES: { b: B; cls: string }[] = [
  { b: [W - POST / 2, 0, 0, POST, POST, H + T + 3], cls: 'post' },
  { b: [-POST / 2, 0, 0, POST, POST, H + T + 3], cls: 'post' },
  { b: [0, 0, 0, W, D, T], cls: 'board' },
  { b: [W - POST / 2, D - POST, 0, POST, POST, H + T + 3], cls: 'post' },
  { b: [0, 0, H, W, D, T], cls: 'board' },
  { b: [-POST / 2, D - POST, 0, POST, POST, H + T + 3], cls: 'post' },
];

export default function NotFound() {
  const polys = BOXES.flatMap(({ b, cls }) => faces(b).map((f) => ({ cls, pts: f.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ') })));
  const all = BOXES.flatMap(({ b }) => faces(b).flat());
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const pad = 8;
  const vb = `${Math.min(...xs) - pad} ${Math.min(...ys) - pad} ${Math.max(...xs) - Math.min(...xs) + pad * 2} ${Math.max(...ys) - Math.min(...ys) + pad * 2}`;

  return (
    <PageShell>
      <div className="nf">
        <svg className="nf-cubby" viewBox={vb} role="img" aria-label="An empty shelf cubby">
          {polys.map((p, i) => <polygon key={i} points={p.pts} />)}
        </svg>
        <div>
          <p className="kicker" style={{ marginTop: 0 }}>404 · empty cubby</p>
          <h1>Nothing on this shelf.</h1>
          <p className="lead">This page doesn’t exist, or it fell off the back. Even the teddy bear couldn’t find it.</p>
          <p>
            <Link className="arrow-link" href="/">← back to the shelf</Link>
            <Link className="arrow-link" href="/projects">projects</Link>
            <a className="arrow-link" href={site.resumePdf}>CV</a>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
