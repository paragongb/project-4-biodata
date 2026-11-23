import type { Decal } from './scene';

const FONT = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

/**
 * Paint a decal (inset frame and/or text) to a canvas for use as a texture. W/H = face size in world units.
 * `night` (clay after dark): decals with a `glow` colour light up: screens/labels fill with colour,
 * and plain text turns neon.
 */
export function paintDecal(dec: Decal, W: number, H: number, ink: string, ppu = 48, night = false): HTMLCanvasElement {
  const cw = Math.max(2, Math.round(W * ppu));
  const ch = Math.max(2, Math.round(H * ppu));
  const cv = document.createElement('canvas');
  cv.width = cw;
  cv.height = ch;
  const g = cv.getContext('2d')!;
  const glow = night ? dec.glow : undefined;
  g.strokeStyle = ink;
  g.fillStyle = ink;
  g.lineWidth = Math.max(1.5, ppu * 0.05);

  if (dec.windows) {
    // Draw a grid of office windows.
    const { cols, rows } = dec.windows;
    const mx = cw * 0.14, bottom = ch * 0.93;
    let top = ch * 0.07;
    if (dec.text) {
      const fontSize = (dec.size ?? 1) * ppu;
      const lineHeight = fontSize * 1.12;
      const lines = dec.text.split('\n');
      g.font = `bold ${fontSize}px ${FONT}`;
      g.textAlign = 'center';
      g.textBaseline = 'top';
      g.fillStyle = glow ?? ink;
      lines.forEach((line, i) => g.fillText(line, cw / 2, top + i * lineHeight, cw * 0.9));
      top += lines.length * lineHeight;
    }
    const cellW = (cw - 2 * mx) / cols, cellH = (bottom - top) / rows;
    // at night most windows are lit, in a mix of warm and cool tones; a few stay dark
    const palette = glow ? [glow, glow, '#ffe9a8', '#7fe3ff', glow, '#ff9ecf', null, '#ffe9a8'] : [];
    g.lineWidth = Math.max(1.2, ppu * 0.035);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = mx + c * cellW + cellW * 0.18, y = top + r * cellH + cellH * 0.2, w = cellW * 0.64, h = cellH * 0.55;
        const lit = glow ? palette[(r * 5 + c * 3 + rows) % palette.length] : null;
        if (lit) { g.fillStyle = lit; g.fillRect(x, y, w, h); }
        g.strokeRect(x, y, w, h);
      }
    }
    return cv;
  }

  if (dec.inset != null) {
    const m = dec.inset * ppu;
    if (glow) {
      // lit screen / label: filled with colour, dark text on top
      g.fillStyle = glow;
      g.fillRect(m, m, cw - 2 * m, ch - 2 * m);
    }
    g.strokeRect(m, m, cw - 2 * m, ch - 2 * m);
  }
  if (dec.text) {
    g.save();
    g.translate(cw / 2, ch / 2);
    g.font = `${(dec.size ?? 1) * ppu}px ${FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    if (glow && dec.inset == null) {
      // no frame: neon text
      g.shadowColor = glow;
      g.shadowBlur = ppu * 0.6;
      g.fillStyle = glow;
    } else {
      g.fillStyle = glow ? '#1a1612' : ink;
    }
    g.fillText(dec.text, 0, 0);
    g.restore();
  }
  return cv;
}
