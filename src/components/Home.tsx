'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { sections, type SectionId } from '@/content/sections';
import { site } from '@/content/site';
import { track } from '@vercel/analytics';
import type { GithubStats } from '@/lib/types';
import type { Certificate } from '@/content/certificates';
import { THEME_STORAGE_KEY, type ThemeKey } from './theme';
import Panel from './Panel';

// WebGL only runs in the browser, so the shelf is client-only. The list view below is server-rendered.
const ShelfCanvas = dynamic(() => import('./shelf/ShelfCanvas'), {
  ssr: false,
  loading: () => <div className="shelf-loading">loading shelf…</div>,
});

export default function Home({ certificates }: { certificates: Certificate[] }) {
  const [theme, setTheme] = useState<ThemeKey>('clay');
  const [active, setActive] = useState<SectionId | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [contentPx, setContentPx] = useState(0);
  const [github, setGithub] = useState<GithubStats | null>(null);

  useEffect(() => {
    const request = new AbortController();
    fetch('/api/github', { signal: request.signal })
      .then((response) => response.ok ? response.json() : { source: 'unavailable' })
      .then(setGithub)
      .catch(() => {
        if (!request.signal.aborted) setGithub({ source: 'unavailable' });
      });
    return () => request.abort();
  }, []);

  // phones get the single-bay, scroll-down shelf
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)');
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // phones: a one-time nudge to rotate to landscape (wider than 700px gets the full desktop shelf)
  const DESKTOP_HINT_KEY = 'rotate-hint-dismissed';
  const [desktopHint, setDesktopHint] = useState(false);
  const hintShown = useRef(false);
  useEffect(() => {
    if (!mobile) {
      setDesktopHint(false);
      // they rotated while the hint was up: job done, don't nag again
      if (hintShown.current) { try { localStorage.setItem(DESKTOP_HINT_KEY, '1'); } catch { /* private mode */ } }
      return;
    }
    let seen = false;
    try { seen = localStorage.getItem(DESKTOP_HINT_KEY) === '1'; } catch { /* private mode */ }
    if (seen) return;
    const t = setTimeout(() => { hintShown.current = true; setDesktopHint(true); }, 1500); // let the shelf appear first
    return () => clearTimeout(t);
  }, [mobile]);
  const dismissDesktopHint = () => {
    setDesktopHint(false);
    try { localStorage.setItem(DESKTOP_HINT_KEY, '1'); } catch { /* private mode */ }
  };
  // Seed from the script in the document head to avoid a flash before the first clock check.
  const [night, setNight] = useState(() => typeof document !== 'undefined' && document.documentElement.dataset.time === 'night');
  useEffect(() => {
    const syncNight = () => {
      const hour = new Date().getHours();
      setNight(hour < 7 || hour >= 19);
    };
    syncNight();
    const t = setInterval(syncNight, 60_000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { document.documentElement.dataset.time = night ? 'night' : 'day'; }, [night]);

  // the theme was already applied before paint (layout.tsx); sync React state with it
  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    if (t === 'dark' || t === 'clay') setTheme(t);
  }, []);

  const changeTheme = (t: ThemeKey) => {
    setTheme(t);
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem(THEME_STORAGE_KEY, t); } catch { /* private mode */ }
  };

  const open = useCallback((id: SectionId) => {
    track('shelf_open', { section: id });
    if (id === 'resume') {
      window.location.assign(site.resumePdf);
      return;
    }
    setActive(id);
    setListOpen(false);
  }, []);
  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    document.body.classList.toggle('panel-open', active !== null);
    return () => document.body.classList.remove('panel-open');
  }, [active]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setActive(null); setListOpen(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <h1 className="sr-only">{site.name}: {site.title}</h1>
      <header className="chrome">
        <a className="wordmark" href="/">{site.wordmark}</a>
        <nav className="chrome-nav" aria-label="Site">
          <span className="chrome-sub">{site.title}</span>
          <button className="link-btn" type="button" aria-expanded={listOpen} onClick={() => setListOpen((v) => !v)}>
            {listOpen ? 'shelf view' : 'list view'}
          </button>
          <a className="link-btn" href="/projects">projects</a>
          <a className="link-btn" href={site.resumePdf}>CV</a>
          <a className="link-btn" href="/about">about</a>
        </nav>
      </header>

      <main className="stage" aria-label="Shelf of portfolio sections. Use list view for a text version.">
        <ShelfCanvas
          theme={theme}
          activeId={active}
          onSelect={open}
          onMiss={close}
          github={github}
          night={night}
          layout={mobile ? 'mobile' : 'desktop'}
          onContentHeight={setContentPx}
        />
      </main>
      {/* phone: the canvas stays fixed; this gives the page its scroll height */}
      {mobile && <div className="scroll-spacer" style={{ height: contentPx }} aria-hidden="true" />}

      <nav className="listview" hidden={!listOpen} aria-label="All sections">
        <ol>
          {sections.map((s, i) => (
            <li key={s.id}>
              <button type="button" onClick={() => open(s.id)}>
                <span className="lv-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="lv-t">{s.title}</span>
                <span className="lv-k">{s.kicker}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <Panel id={active} onClose={close} live={{ github }} certificates={certificates} />

      <div className="switches">
        <div className="seg" role="group" aria-label="Theme">
          <span className="seg-label">theme</span>
          {(['dark', 'clay'] as const).map((t) => (
            <button key={t} type="button" aria-pressed={theme === t} onClick={() => changeTheme(t)}>{t}</button>
          ))}
        </div>
      </div>
      <p className="hint">{mobile ? 'scroll to explore · tap an object' : 'hover an object · click to open · esc to close'}</p>

      {desktopHint && !active && (
        <div className="desktop-hint" role="status">
          <div className="rotate-anim" aria-hidden="true"><div className="rotate-phone" /></div>
          <p><b>Rotate your phone to landscape for the full 3D experience.</b></p>
          <button type="button" onClick={dismissDesktopHint}>got it</button>
        </div>
      )}
    </>
  );
}
