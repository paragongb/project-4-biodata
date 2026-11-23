import 'server-only';

// Draws the desktop shelf as a flat isometric line drawing (SVG) for the link-preview image.
// Same idea as mockup 01: project boxes to polygons and paint back-to-front.

import { buildLayout, levelZ, BAY, BOARD, DEPTH, POST, type Box, type ShelfObj } from '@/components/shelf/scene';

const C30 = Math.cos(Math.PI / 6);
const U = 10;
const P = ([x, y, z]: number[]) => [(x + y) * C30 * U, ((y - x) * 0.5 - z) * U];

type AABB = { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number };

function placer(b: Box) {
  if (!b.rotX) return (p: number[]) => p;
  const th = (b.rotX * Math.PI) / 180, cs = Math.cos(th), sn = Math.sin(th);
  const py = b.y + b.d, pz = b.z;
  return ([x, y, z]: number[]) => [x, py + (y - py) * cs - (z - pz) * sn, pz + (y - py) * sn + (z - pz) * cs];
}

function aabb(b: Box): AABB {
  const T = placer(b);
  const pts: number[][] = [];
  for (const x of [b.x, b.x + b.w]) for (const y of [b.y, b.y + b.d]) for (const z of [b.z, b.z + b.h]) pts.push(T([x, y, z]));
  const r = (i: number, f: (...n: number[]) => number) => f(...pts.map((p) => p[i]));
  return { x0: r(0, Math.min), x1: r(0, Math.max), y0: r(1, Math.min), y1: r(1, Math.max), z0: r(2, Math.min), z1: r(2, Math.max) };
}
const union = (l: AABB[]) => l.reduce((a, b) => ({
  x0: Math.min(a.x0, b.x0), x1: Math.max(a.x1, b.x1), y0: Math.min(a.y0, b.y0),
  y1: Math.max(a.y1, b.y1), z0: Math.min(a.z0, b.z0), z1: Math.max(a.z1, b.z1),
}));

// a occludes b? viewer sits at (-X, +Y, +Z); any separating plane decides
function inFront(a: AABB, b: AABB): boolean | null {
  const E = 1e-6;
  if (a.x1 <= b.x0 + E) return true;
  if (b.x1 <= a.x0 + E) return false;
  if (a.y0 >= b.y1 - E) return true;
  if (b.y0 >= a.y1 - E) return false;
  if (a.z0 >= b.z1 - E) return true;
  if (b.z0 >= a.z1 - E) return false;
  return null;
}
const key = (a: AABB) => -(a.x0 + a.x1) / 2 + (a.y0 + a.y1) / 2 + (a.z0 + a.z1) / 2;

function depthSort<T extends { bb: AABB }>(items: T[]): T[] {
  const n = items.length;
  const after: number[][] = items.map(() => []);
  const indeg = new Array(n).fill(0);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const f = inFront(items[i].bb, items[j].bb);
    if (f === true) { after[j].push(i); indeg[i]++; } else if (f === false) { after[i].push(j); indeg[j]++; }
  }
  const out: T[] = [];
  const done = new Array(n).fill(false);
  const byKey = (a: number, b: number) => key(items[a].bb) - key(items[b].bb);
  let ready = items.map((_, i) => i).filter((i) => indeg[i] === 0);
  while (out.length < n) {
    if (!ready.length) ready = [items.map((_, i) => i).filter((i) => !done[i]).sort(byKey)[0]];
    ready.sort(byKey);
    const i = ready.shift()!;
    if (done[i]) continue;
    done[i] = true;
    out.push(items[i]);
    for (const j of after[i]) if (--indeg[j] === 0 && !done[j]) ready.push(j);
  }
  return out;
}

/** Extra static boxes so the preview reads well without live data / 3D models. */
function extras(o: ShelfObj): Box[] {
  const b0 = o.boxes[0];
  if (o.kind === 'github') {
    // a sample skyline on the plinth
    const out: Box[] = [];
    let s = 7;
    for (let c = 0; c < 16; c++) for (let r = 0; r < 5; r++) {
      s = (s * 16807) % 2147483647;
      const h = 0.2 + ((s % 100) / 100) ** 2 * 4.2;
      out.push({ x: b0.x + 1 + c * 1.4, y: b0.y + 0.8 + r * 1.35, z: b0.z + b0.h, w: 1, d: 1, h });
    }
    return out;
  }
  return [];
}

export function shelfSvg(opts: { fill: string; board: string; ink: string; stroke?: number }): { svg: string; width: number; height: number } {
  const { objs, bays, levels } = buildLayout('desktop');
  const out: string[] = [];
  let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;

  const drawBox = (b: Box, fill = opts.fill) => {
    const T = placer(b);
    const x0 = b.x, x1 = b.x + b.w, y0 = b.y, y1 = b.y + b.d, z0 = b.z, z1 = b.z + b.h;
    for (const f of [
      [[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]],
      [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]],
      [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]],
    ]) {
      const pts = f.map((p) => P(T(p)));
      for (const [x, y] of pts) { bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y); }
      out.push(`<polygon points="${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')}" fill="${fill}"/>`);
    }
  };
  const drawObject = (o: ShelfObj) => {
    const boxes = [...o.boxes, ...extras(o)].map((b) => ({ b, bb: aabb(b) }));
    for (const { b } of depthSort(boxes)) drawBox(b);
  };

  const postXs = Array.from({ length: bays + 1 }, (_, i) => i * BAY);
  const posts = (z0: number, z1: number) =>
    postXs.flatMap((x) => [0, DEPTH - POST].map((y) => {
      const b: Box = { x: x - POST / 2, y, z: z0, w: POST, d: POST, h: z1 - z0 };
      return { bb: aabb(b), draw: () => drawBox(b, opts.board) };
    }));
  const flush = (items: { bb: AABB; draw: () => void }[]) => depthSort(items).forEach((i) => i.draw());

  const postTop = levelZ(levels - 1) + BOARD + 4.5;
  flush(posts(0, levelZ(0)));
  for (let L = 0; L < levels; L++) {
    for (let bay = bays - 1; bay >= 0; bay--) drawBox({ x: bay * BAY, y: 0, z: levelZ(L), w: BAY, d: DEPTH, h: BOARD }, opts.board);
    const items = posts(levelZ(L) + BOARD, L < levels - 1 ? levelZ(L + 1) : postTop);
    for (const o of objs) {
      if (o.level === L) items.push({ bb: union([...o.boxes, ...extras(o)].map(aabb)), draw: () => drawObject(o) });
    }
    flush(items);
  }
  for (const o of objs) if (o.level === 'floor') drawObject(o);

  const pad = 12;
  const width = bx1 - bx0 + pad * 2, height = by1 - by0 + pad * 2;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${(bx0 - pad).toFixed(1)} ${(by0 - pad).toFixed(1)} ${width.toFixed(1)} ${height.toFixed(1)}">` +
    `<g stroke="${opts.ink}" stroke-width="${opts.stroke ?? 1.1}" stroke-linejoin="round">${out.join('')}</g></svg>`;
  return { svg, width, height };
}
