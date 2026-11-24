'use client';

// The 3D shelf (React Three Fiber). Ported from mockup 05:
//   dark = unlit line art · clay = lit with soft shadows
// Objects map to site sections; the GitHub skyline reflects live contribution data.

import { createContext, lazy, memo, Suspense, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Drop } from './TeddyRain';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Edges, Html, Line, OrbitControls, Outlines } from '@react-three/drei';
import { buildLayout, cubbyOf, type Box, type Decal, type LayoutKey, type ShelfLayout, type ShelfObj } from './scene';
import { paintDecal } from './decal';
import { THEMES, type Theme, type ThemeKey } from '../theme';
import { sectionById, type SectionId } from '@/content/sections';
import { site } from '@/content/site';
import type { GithubStats } from '@/lib/types';

const DEG = Math.PI / 180;
const WARM = '#ffc861';
const NIGHT_BG = '#2f2b28'; // clay at night (keep in sync with globals.css)
const CAMERA = { position: [-300, 300, 300] as [number, number, number], zoom: 5, near: 1, far: 2000 };

const ThemeCtx = createContext<Theme>(THEMES.dark);
const useTheme = () => useContext(ThemeCtx);
/** true = clay mode after sunset: screens, signs and labels light up */
const NightCtx = createContext(false);
const useNight = () => useContext(NightCtx);

// ---- layouts (desktop: 3 bays · mobile: one tall bay you scroll down) ----
type Prepared = { layout: ShelfLayout; offset: [number, number, number]; all: THREE.Box3; groundY: number; mobile: boolean };

function prepare(key: LayoutKey): Prepared {
  const layout = buildLayout(key);
  const [cx, cy, cz] = layout.center;
  const offset: [number, number, number] = [-cx, -cz, -cy]; // centre the scene on the origin (three coords)
  const all = new THREE.Box3();
  for (const b of [...layout.shelf, ...layout.objs.flatMap((o) => o.boxes)]) all.union(toBox3(b, offset));
  return { layout, offset, all, groundY: -cz, mobile: key === 'mobile' };
}
const LayoutCtx = createContext<Prepared | null>(null);
const useLayout = () => useContext(LayoutCtx)!;

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const stop = (e: ThreeEvent<PointerEvent>) => e.stopPropagation();

// ---------------------------------------------------------------- primitives

/** `emissive`: glows in that colour (used at night for screens, keys, skyline bars…). */
function Surface({ color, emissive }: { color: string; emissive?: string }) {
  const t = useTheme();
  const common = { color, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 };
  if (!t.lit) return <meshBasicMaterial {...common} />;
  return emissive
    ? <meshStandardMaterial {...common} roughness={0.95} emissive={emissive} emissiveIntensity={1.1} toneMapped={false} />
    : <meshStandardMaterial {...common} roughness={0.95} />;
}

function DecalMesh({ dec, b }: { dec: Decal; b: Box }) {
  const t = useTheme();
  const night = useNight();
  const top = dec.face === 'top';
  const W = b.w, H = top ? b.d : b.h;
  const tex = useMemo(() => {
    const tx = new THREE.CanvasTexture(paintDecal(dec, W, H, t.edge, 48, night));
    tx.colorSpace = THREE.SRGBColorSpace;
    tx.anisotropy = 8;
    return tx;
  }, [dec, W, H, t.edge, night]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh position={top ? [0, b.h / 2 + 0.02, 0] : [0, 0, b.d / 2 + 0.02]} rotation={top ? [-Math.PI / 2, 0, 0] : [0, 0, 0]} raycast={() => null}>
      <planeGeometry args={[W, H]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function PhotoDecalMesh({ dec, b }: { dec: Decal; b: Box }) {
  const texture = useImageTexture(dec.image);
  if (!texture) return null;

  const image = texture.image as HTMLImageElement;
  const aspect = image.width / image.height;
  const inset = dec.inset ?? 0;
  const height = Math.min(b.h - 2 * inset, (b.w - 2 * inset) / aspect);
  return (
    <mesh position={[0, 0, b.d / 2 + 0.02]} raycast={() => null}>
      <planeGeometry args={[height * aspect, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function PortalOpening({ b, lit, animate }: { b: Box; lit: boolean; animate: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const motionAllowed = useRef(false);
  const invalidate = useThree((state) => state.invalidate);
  const uniforms = useMemo(() => ({ time: { value: 0 }, brightness: { value: 1 } }), []);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      motionAllowed.current = !preference.matches;
      invalidate();
    };
    sync();
    preference.addEventListener('change', sync);
    return () => preference.removeEventListener('change', sync);
  }, [invalidate]);

  useFrame((state, delta) => {
    if (!material.current) return;
    const { time, brightness } = material.current.uniforms;
    brightness.value = lit ? 1.14 : 1;
    if (animate && motionAllowed.current) {
      time.value += Math.min(delta, 0.05);
      state.invalidate();
    }
  });

  return (
    <mesh position={[b.x + b.w / 2, b.z + b.h / 2, b.y + b.d]}>
      <planeGeometry args={[b.w, b.h]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        toneMapped={false}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          uniform float brightness;
          varying vec2 vUv;
          void main() {
            vec2 point = vUv - vec2(0.5, 0.48);
            float radius = length(point * vec2(1.0, 0.76));
            float twist = 3.0 * sin(12.0 * point.y + 7.0 * point.x - 1.2 * time);
            float wave = 0.5 + 0.5 * cos(86.0 * radius + twist + 4.0 * time);
            float glow = pow(wave, 3.0) * (1.0 - smoothstep(0.28, 0.61, radius));
            vec3 color = mix(vec3(0.21, 0.06, 0.39), vec3(0.88, 0.61, 1.0), glow);
            float pulse = 1.0 + 0.05 * sin(1.6 * time);
            gl_FragColor = vec4(color * brightness * pulse, 1.0);
          }
        `}
      />
    </mesh>
  );
}

function Block({ b, decals = [], lit = false, shelf = false, color, glow }: { b: Box; decals?: Decal[]; lit?: boolean; shelf?: boolean; color?: string; glow?: string }) {
  const t = useTheme();
  const night = useNight();
  const emissive = night ? glow : undefined;
  const fill = emissive ?? color ?? (shelf ? t.shelf : lit ? t.hot : t.face);
  const mesh = (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[b.w, b.h, b.d]} />
      <Surface color={fill} emissive={emissive} />
      <Edges threshold={15} color={lit ? t.accent : t.edge} />
      {decals.map((d, i) => d.image
        ? <PhotoDecalMesh key={i} dec={d} b={b} />
        : <DecalMesh key={i} dec={d} b={b} />)}
    </mesh>
  );
  if (b.rotX) {
    return (
      <group position={[b.x, b.z, b.y + b.d]} rotation={[-b.rotX * DEG, 0, 0]}>
        <group position={[b.w / 2, b.h / 2, -b.d / 2]}>{mesh}</group>
      </group>
    );
  }
  return <group position={[b.x + b.w / 2, b.z + b.h / 2, b.y + b.d / 2]}>{mesh}</group>;
}

const decalsFor = (o: ShelfObj, i: number) => (o.decals ?? []).filter((d) => d.box === i);

const Shelf = memo(function Shelf() {
  const { layout } = useLayout();
  return (
    <group onPointerOver={stop} onPointerMove={stop}>
      {layout.shelf.map((b, i) => <Block key={i} b={b} shelf />)}
    </group>
  );
});

// ---------------------------------------------------------------- special objects

/** Load an image as a texture. Returns null until the image is available. */
function useImageTexture(url?: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!url) { setTex(null); return; }
    let alive = true;
    let loaded: THREE.Texture | null = null;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(url, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      loaded = t;
      if (alive) setTex(t); else t.dispose();
    }, undefined, () => alive && setTex(null));
    return () => { alive = false; loaded?.dispose(); };
  }, [url]);
  return tex;
}

/** The record spins on hover, with the album cover as a picture disc. */
function Vinyl({ b, lit, spinning, art }: { b: Box; lit: boolean; spinning: boolean; art?: string }) {
  const t = useTheme();
  const spin = useRef<THREE.Group>(null);
  const motion = useMemo(() => !reduceMotion(), []);
  const cover = useImageTexture(art);
  const night = useNight();
  useFrame((state, dt) => {
    if (spin.current && motion && spinning) {
      spin.current.rotation.y -= Math.min(dt, 0.05) * 1.8;
      state.invalidate();
    }
  });
  const r = Math.min(b.w, b.d) / 2 - 0.1;
  const edge = lit ? t.accent : t.edge;
  return (
    <group position={[b.x + b.w / 2, b.z, b.y + b.d / 2]}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r + 0.2, r + 0.2, 0.4, 56]} />
        <Surface color={lit ? t.hot : t.face} />
        <Edges threshold={15} color={edge} />
      </mesh>
      <group ref={spin} position={[0, 0.4, 0]}>
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[r, r, 0.24, 56]} />
          <Surface color={t.lit ? '#2b2621' : t.face} />
          <Edges threshold={15} color={t.lit ? '#6b625a' : edge} />
        </mesh>
        {cover ? (
          <>
            {/* picture disc: the album cover, cropped to a circle */}
            <mesh position={[0, 0.245, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
              <circleGeometry args={[r * 0.97, 64]} />
              {t.lit
                ? night
                  ? <meshBasicMaterial map={cover} toneMapped={false} /> /* stays bright in the dark */
                  : <meshStandardMaterial map={cover} roughness={0.55} />
                : <meshBasicMaterial map={cover} toneMapped={false} />}
            </mesh>
            <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
              <circleGeometry args={[r * 0.05, 20]} />
              <meshBasicMaterial color="#1a1714" toneMapped={false} />
            </mesh>
          </>
        ) : (
          <>
            {[0.88, 0.72, 0.56].map((f) => (
              <mesh key={f} position={[0, 0.245, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
                <ringGeometry args={[r * f, r * f + 0.05, 64]} />
                <meshBasicMaterial color={t.lit ? '#4d453e' : t.edge} transparent opacity={0.7} toneMapped={false} />
              </mesh>
            ))}
            <mesh position={[0, 0.27, 0]}>
              <cylinderGeometry args={[r * 0.34, r * 0.34, 0.05, 40]} />
              <Surface color={t.lit ? '#e4572e' : t.face} />
              <Edges threshold={15} color={edge} />
            </mesh>
            <mesh position={[r * 0.17, 0.305, 0]} raycast={() => null}>
              <boxGeometry args={[r * 0.24, 0.02, 0.22]} />
              <meshBasicMaterial color={t.lit ? '#fbf8f3' : t.edge} toneMapped={false} />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}

/**
 * Tonearm: pivots on its base. Swings onto the record (needle down) while playing,
 * back to its rest beside the platter when paused.
 */
const ARM_PLAY = -50 * DEG; // swing toward the record (rest = 0, pointing to the front)
function Tonearm({ base, arm, lit, playing }: { base: Box; arm: Box; lit: boolean; playing: boolean }) {
  const swing = useRef<THREE.Group>(null);
  const motion = useMemo(() => !reduceMotion(), []);
  const pivot: [number, number, number] = [base.x + base.w / 2, base.z + base.h, base.y + base.d / 2];
  const back = pivot[2] - arm.y; // how far the arm extends behind the pivot
  const target = playing ? ARM_PLAY : 0;
  useFrame((state, dt) => {
    const g = swing.current;
    if (!g || g.rotation.y === target) return;
    if (!motion || Math.abs(g.rotation.y - target) < 0.001) {
      g.rotation.y = target;
      return;
    }
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, target, 4, Math.min(dt, 0.05));
    state.invalidate();
  });
  // arm + headshell in pivot space (x across, y = forward along the arm, z = up)
  const armBox: Box = { x: -arm.w / 2, y: -back, z: 0, w: arm.w, d: arm.d, h: arm.h };
  const head: Box = { x: -0.38, y: arm.d - back - 1, z: -0.42, w: 0.76, d: 1, h: 0.82 };
  return (
    <group position={pivot}>
      <group ref={swing}>
        <Block b={armBox} lit={lit} />
        <Block b={head} lit={lit} />
      </group>
    </group>
  );
}

/** Contribution skyline: one bar per day for the last N weeks. */
const GH_GREENS = ['#0e4429', '#006d32', '#26a641', '#39d353'];
const NO_BARS: number[][] = [];

function SkylineBatch({ boxes, color, glow }: { boxes: Box[]; color: string; glow?: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    const mesh = ref.current!;
    const transform = new THREE.Matrix4();
    boxes.forEach((b, index) => {
      transform.makeScale(b.w, b.h, b.d);
      transform.setPosition(b.x + b.w / 2, b.z + b.h / 2, b.y + b.d / 2);
      mesh.setMatrixAt(index, transform);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    invalidate();
  }, [boxes, invalidate]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, boxes.length]} castShadow receiveShadow>
      <boxGeometry />
      <Surface color={color} emissive={glow} />
    </instancedMesh>
  );
}

function Skyline({ plinth, github, lit }: { plinth: Box; github: GithubStats | null; lit: boolean }) {
  const theme = useTheme();
  const night = useNight();
  const weeks = github?.source === 'live' ? github.weeks : NO_BARS;
  const { batches, outlines } = useMemo(() => {
    const counts = weeks.flat().filter((c) => c > 0).sort((a, b) => a - b);
    const cap = Math.max(4, counts[Math.floor(counts.length * 0.9)] ?? 4);
    const batches = new Map<string, Box[]>();
    const bars: Box[] = [];
    const cols = weeks.length;
    const pitchX = Math.min(1.15, (plinth.w - 1.2) / Math.max(cols, 1));
    weeks.forEach((week, col) => {
      week.forEach((c, row) => {
        if (c < 0) return; // future day
        const k = Math.min(c, cap) / cap;
        const h = 0.12 + k * 4.4;
        const b = { x: plinth.x + 0.6 + col * pitchX, y: plinth.y + 0.55 + row, z: plinth.z + plinth.h, w: pitchX * 0.74, d: 0.8, h };
        const glow = night && c > 0 ? GH_GREENS[Math.min(GH_GREENS.length - 1, Math.floor(k * GH_GREENS.length))] : '';
        const batch = batches.get(glow);
        if (batch) batch.push(b);
        else batches.set(glow, [b]);
        bars.push(b);
      });
    });
    if (bars.length === 0) return { batches, outlines: null };

    // Draw all outlines in one submission, with the same unit-box edges as the shelf blocks.
    const box = new THREE.BoxGeometry();
    const edges = new THREE.EdgesGeometry(box, 15);
    const unit = edges.attributes.position.array;
    const outlines = new Float32Array(bars.length * unit.length);
    bars.forEach((b, index) => {
      const offset = index * unit.length;
      for (let i = 0; i < unit.length; i += 3) {
        outlines[offset + i] = b.x + (unit[i] + 0.5) * b.w;
        outlines[offset + i + 1] = b.z + (unit[i + 1] + 0.5) * b.h;
        outlines[offset + i + 2] = b.y + (unit[i + 2] + 0.5) * b.d;
      }
    });
    edges.dispose();
    box.dispose();
    return { batches, outlines };
  }, [weeks, plinth, night]);

  if (!outlines) return null;
  return (
    <>
      {Array.from(batches, ([glow, boxes]) => (
        <SkylineBatch key={glow} boxes={boxes} color={glow || (lit ? theme.hot : theme.face)} glow={glow || undefined} />
      ))}
      <lineSegments raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[outlines, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={lit ? theme.accent : theme.edge} />
      </lineSegments>
    </>
  );
}

/** Desk lamp: switches itself on at night in the visitor’s time zone; a click overrides it until the next visit. */
function Lamp({ obj, night }: { obj: ShelfObj; night: boolean }) {
  const t = useTheme();
  const [manual, setManual] = useState<boolean | null>(null);
  const on = manual ?? night;
  const setOn = (fn: (v: boolean) => boolean) => setManual(fn(on));
  const [hover, setHover] = useState(false);
  const [base, stem, shade] = obj.boxes;
  const cx = shade.x + shade.w / 2, cz = shade.y + shade.d / 2;
  const floor = base.z, beamH = shade.z - floor;
  return (
    <group
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = ''; }}
      onClick={(e) => { e.stopPropagation(); if (e.delta < 5) setOn((v) => !v); }}
    >
      <Block b={base} lit={hover} />
      <Block b={stem} lit={hover} />
      <group position={[cx, shade.z + shade.h / 2, cz]}>
        <mesh castShadow>
          <boxGeometry args={[shade.w, shade.h, shade.d]} />
          {t.lit ? (
            <meshStandardMaterial color={on ? '#fff1cf' : hover ? t.hot : t.face} emissive={WARM} emissiveIntensity={on ? 0.9 : 0} roughness={0.9} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
          ) : (
            <meshBasicMaterial color={on ? WARM : hover ? t.hot : t.face} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} toneMapped={false} />
          )}
          <Edges threshold={15} color={on ? (t.lit ? '#b8801f' : '#fff3d6') : hover ? t.accent : t.edge} />
        </mesh>
      </group>
      {on && (
        <>
          <mesh position={[cx, floor + beamH / 2, cz]} raycast={() => null}>
            <cylinderGeometry args={[shade.w * 0.38, shade.w * 1.1, beamH, 40, 1, true]} />
            <meshBasicMaterial color={WARM} transparent opacity={t.lit ? 0.14 : 0.13} depthWrite={false} side={THREE.DoubleSide} blending={t.lit ? THREE.NormalBlending : THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
          <mesh position={[cx, floor + 0.03, cz]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
            <circleGeometry args={[shade.w * 1.1, 40]} />
            <meshBasicMaterial color={WARM} transparent opacity={t.lit ? 0.22 : 0.18} depthWrite={false} blending={t.lit ? THREE.NormalBlending : THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
          {/* at night the lamp is the main light in the room, so it's brighter and reaches further */}
          {t.lit && <pointLight position={[cx, shade.z - 0.8, cz]} color={WARM} intensity={night ? 300 : 160} distance={night ? 48 : 34} decay={1.6} />}
        </>
      )}
    </group>
  );
}

// ---- teddy rain: poke the teddy and mini teddies fall from the sky (physics loads on the first poke) ----
const TeddyRain = lazy(() => import('./TeddyRain'));
const TeddyCtx = createContext<{ drop: (n: number) => void; count: number }>({ drop: () => {}, count: 0 });
const MINI_SCALE = 0.55;
/** most minis on screen at once (the oldest vanish beyond this); fewer on phones to keep physics smooth */
const maxTeddies = (mobile: boolean) => (mobile ? 8 : 15);

/** The shelf teddy's boxes, recentred on the origin and shrunk, for the falling minis. */
function miniTeddyModel(teddy: ShelfObj) {
  const xs = teddy.boxes.flatMap((b) => [b.x, b.x + b.w]);
  const ys = teddy.boxes.flatMap((b) => [b.y, b.y + b.d]);
  const zs = teddy.boxes.flatMap((b) => [b.z, b.z + b.h]);
  const c = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2];
  const s = MINI_SCALE;
  const boxes: Box[] = teddy.boxes.map((b) => ({ x: (b.x - c[0]) * s, y: (b.y - c[1]) * s, z: (b.z - c[2]) * s, w: b.w * s, d: b.d * s, h: b.h * s }));
  const decals = (teddy.decals ?? []).map((d) => ({ ...d, size: (d.size ?? 1) * s }));
  // three-axis half extents (x, up, depth), slightly inset so they settle snugly
  const half: [number, number, number] = [((Math.max(...xs) - Math.min(...xs)) / 2) * s * 0.85, ((Math.max(...zs) - Math.min(...zs)) / 2) * s * 0.92, ((Math.max(...ys) - Math.min(...ys)) / 2) * s * 0.85];
  return { boxes, decals, half };
}

function MiniTeddy({ model }: { model: ReturnType<typeof miniTeddyModel> }) {
  const t = useTheme();
  const fur = t.lit ? '#e9d3b4' : undefined;
  return <>{model.boxes.map((b, i) => <Block key={i} b={b} color={fur} decals={model.decals.filter((d) => d.box === i)} />)}</>;
}

/** Teddy bear: wobbles when poked, and each poke drops a mini teddy from the sky (shift-click drops 10). */
function Teddy({ obj }: { obj: ShelfObj }) {
  const t = useTheme();
  const { mobile } = useLayout();
  const { drop, count } = useContext(TeddyCtx);
  const g = useRef<THREE.Group>(null);
  const wobble = useRef(0);
  const [hover, setHover] = useState(false);
  // phones have no hover, so the label pops up briefly after each tap instead
  const [tapped, setTapped] = useState(false);
  const tapTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(tapTimer.current), []);
  const body = obj.boxes[0];
  const pivot: [number, number, number] = [body.x + body.w / 2, body.z, body.y + body.d / 2];
  useFrame((state, dt) => {
    if (!g.current || wobble.current === 0) return;
    wobble.current = Math.max(0, wobble.current - Math.min(dt, 0.1));
    const k = wobble.current;
    g.current.rotation.z = k > 0 ? Math.sin(k * 18) * 0.14 * k : 0;
    if (k > 0) state.invalidate();
  });
  const fur = t.lit ? '#e9d3b4' : undefined;
  return (
    <group
      position={pivot}
      ref={g}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = ''; }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.delta >= 5) return;
        if (!reduceMotion()) wobble.current = 1.2;
        drop(e.nativeEvent.shiftKey ? 10 : 1);
        if (mobile) {
          setTapped(true);
          clearTimeout(tapTimer.current);
          tapTimer.current = setTimeout(() => setTapped(false), 2500);
        }
      }}
    >
      <group position={[-pivot[0], -pivot[1], -pivot[2]]}>
        {obj.boxes.map((b, i) => (
          <Block key={i} b={b} lit={hover} color={hover ? undefined : fur} decals={decalsFor(obj, i)} />
        ))}
      </group>
      {((hover && !mobile) || (mobile && tapped)) && (
        <Html position={[0, body.h + 6.5, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="tag3d">
            teddies summoned: {count}
            <small>max teddies: {maxTeddies(mobile)}</small>
          </div>
        </Html>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- section objects

type LiveProps = { github: GithubStats | null; night: boolean };

/** Per-box glow colours for clay at night (decals light up separately via their `glow`). */
function nightGlow(obj: ShelfObj, i: number, b: Box): string | undefined {
  if (obj.id === 'skills' && i > 0) {
    // RGB keyboard backlight: a rainbow sweep across the keys
    const hue = Math.round(((b.x % BAY_W) / BAY_W) * 300 + 200) % 360;
    return `hsl(${hue}, 90%, 62%)`;
  }
  if (obj.id === 'now') return '#ffe27a'; // the sticky note glows softly yellow
  return undefined;
}
const BAY_W = 30;

/** Small coloured lights at night so the glowing things also light their surroundings. */
const NIGHT_LIGHTS: Partial<Record<SectionId, { color: string; intensity: number; distance: number; at: (o: ShelfObj) => [number, number, number] }>> = {
  terminal: { color: '#5cff9d', intensity: 70, distance: 20, at: (o) => { const s = o.boxes[1]; return [s.x + s.w / 2, s.z + s.h / 2, s.y + s.d + 2]; } },
  skills: { color: '#b18cff', intensity: 45, distance: 18, at: (o) => { const k = o.boxes[0]; return [k.x + k.w / 2, k.z + 3, k.y + k.d / 2]; } },
};

function ShelfItem({ obj, active, onPick, live }: { obj: ShelfObj; active: boolean; onPick: (id: SectionId) => void; live: LiveProps }) {
  const ref = useRef<THREE.Group>(null);
  const night = useNight();
  const theme = useTheme();
  const [hover, setHover] = useState(false);
  const id = obj.id;
  const lit = Boolean(id) && (hover || active);

  useFrame((state, dt) => {
    // the sticky note only peels up a touch, so it doesn't float off the monitor
    const group = ref.current;
    const target = lit ? (id === 'now' ? 0.35 : 1.4) : 0;
    if (!group || group.position.y === target) return;
    if (Math.abs(group.position.y - target) < 0.001) {
      group.position.y = target;
      return;
    }
    group.position.y = THREE.MathUtils.damp(group.position.y, target, 10, Math.min(dt, 0.05));
    state.invalidate();
  });

  const parts: ReactNode[] = [];
  if (obj.kind === 'scrolls') {
    parts.push(<ScrollStack key="scrolls" boxes={obj.boxes} lit={lit} />);
  } else {
    obj.boxes.forEach((b, i) => {
      if (id === 'journey' && i === 0) {
        parts.push(<PortalOpening key={i} b={b} lit={lit} animate={hover && !active} />);
        return;
      }
      if (obj.kind === 'record' && (i === 1 || i === 3)) return; // platter → vinyl, arm → animated tonearm
      parts.push(<Block key={i} b={b} lit={lit} decals={decalsFor(obj, i)} glow={nightGlow(obj, i, b)} color={theme.lit ? obj.tint : undefined} />);
    });
  }
  if (obj.kind === 'record') {
    parts.push(<Vinyl key="vinyl" b={obj.boxes[1]} lit={lit} spinning={hover && !active} art={site.featuredTrack.artwork} />);
    parts.push(<Tonearm key="arm" base={obj.boxes[2]} arm={obj.boxes[3]} lit={lit} playing />);
  }
  if (obj.kind === 'github') parts.push(<Skyline key="sky" plinth={obj.boxes[0]} github={live.github} lit={lit} />);
  const nl = night && id ? NIGHT_LIGHTS[id] : undefined;
  if (nl) parts.push(<pointLight key="nl" position={nl.at(obj)} color={nl.color} intensity={nl.intensity} distance={nl.distance} decay={1.6} />);

  const handlers = id
    ? {
        onPointerOver: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; },
        onPointerOut: () => { setHover(false); document.body.style.cursor = ''; },
        onClick: (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); if (e.delta < 5) onPick(id); },
      }
    : { onPointerOver: stop };

  const { mobile } = useLayout();
  const a = obj.anchor;
  const subs: string[] = !id ? []
    : id === 'spotify' ? [`${site.featuredTrack.title} · ${site.featuredTrack.artist}`]
    : [sectionById(id).kicker];
  return (
    <group ref={ref} {...handlers}>
      {parts}
      {id && a && hover && !active && !mobile && (
        <Html position={[a[0], a[2] + 2, a[1]]} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="tag3d">{sectionById(id).title} ↗{subs.map((s) => <small key={s}>{s}</small>)}</div>
        </Html>
      )}
    </group>
  );
}

const SCROLL_SPIRAL = Array.from({ length: 33 }, (_, index): [number, number, number] => {
  const progress = index / 32;
  const angle = progress * Math.PI * 3;
  const radius = 0.08 + progress * 0.76;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius, 0];
});

function ScrollStack({ boxes, lit }: { boxes: Box[]; lit: boolean }) {
  const theme = useTheme();
  const edge = lit ? theme.accent : theme.edge;
  return (
    <group>
      {boxes.map((box, index) => {
        const radius = box.w / 2;
        return (
          <group key={index} position={[box.x + radius, box.z + radius, box.y + box.d / 2]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[radius, radius, box.d, 28]} />
              <Surface color={theme.lit ? '#f3dbab' : theme.face} />
              <Edges threshold={15} color={edge} />
              <Outlines thickness={1} color={edge} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.35]}>
              <cylinderGeometry args={[radius + 0.02, radius + 0.02, 0.36, 28]} />
              <Surface color={theme.lit ? '#ae674b' : theme.face} />
              <Edges threshold={15} color={edge} />
            </mesh>
            <Line
              points={SCROLL_SPIRAL}
              position={[0, 0, box.d / 2 + 0.015]}
              scale={[radius, radius, 1]}
              color={theme.edge}
              lineWidth={1}
              raycast={() => null}
            />
          </group>
        );
      })}
    </group>
  );
}

const ShelfObject = memo(function ShelfObject(props: { obj: ShelfObj; active: boolean; onPick: (id: SectionId) => void; live: LiveProps }) {
  if (props.obj.kind === 'lamp') return <Lamp obj={props.obj} night={props.live.night} />;
  if (props.obj.kind === 'teddy') return <Teddy obj={props.obj} />;
  return <ShelfItem {...props} />;
});

// ---------------------------------------------------------------- camera

const ISO = new THREE.Vector3(-1, 1, 1).normalize();
const DIST = 400;
const FWD = ISO.clone().negate();
const RIGHT = new THREE.Vector3().crossVectors(FWD, new THREE.Vector3(0, 1, 0)).normalize();
const UP = new THREE.Vector3().crossVectors(RIGHT, FWD);
const TOP = new THREE.Vector3(0, 1, 0.05).normalize(); // intro start: straight down
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function toBox3(c: Box, offset: [number, number, number]) {
  return new THREE.Box3(
    new THREE.Vector3(c.x + offset[0], c.z + offset[1], c.y + offset[2]),
    new THREE.Vector3(c.x + c.w + offset[0], c.z + c.h + offset[1], c.y + c.d + offset[2]),
  );
}
const PREPARED: Record<LayoutKey, Prepared> = { desktop: prepare('desktop'), mobile: prepare('mobile') };

/** Extent of a box in iso screen space (RIGHT / UP axes). */
function isoExtent(box: THREE.Box3) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  const c = new THREE.Vector3();
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
    c.set(x, y, z);
    const px = c.dot(RIGHT), py = c.dot(UP);
    x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
  }
  return { x0, x1, y0, y1 };
}

const MOBILE_HEADER = 96; // px kept clear above the shelf
const MOBILE_FOOTER = 72; // px below it

/** Phone: fit the bay's width; the page scrolls and the camera moves down the shelf 1:1 with it. */
function mobileFraming(all: THREE.Box3, size: { width: number; height: number }) {
  const { x0, x1, y0, y1 } = isoExtent(all);
  const zoom = size.width / ((x1 - x0) * 1.06);
  const top = new THREE.Vector3().addScaledVector(RIGHT, (x0 + x1) / 2).addScaledVector(UP, y1 - (size.height / 2 - MOBILE_HEADER) / zoom);
  return { zoom, top, contentPx: Math.ceil((y1 - y0) * zoom + MOBILE_HEADER + MOBILE_FOOTER) };
}

function framing(box: THREE.Box3, size: { width: number; height: number }, pad: number) {
  const { x0, x1, y0, y1 } = isoExtent(box);
  const header = size.width < 700 ? 90 : 130;
  const zoom = Math.min(size.width / ((x1 - x0) * pad), (size.height - header) / ((y1 - y0) * pad));
  const target = new THREE.Vector3().addScaledVector(RIGHT, (x0 + x1) / 2).addScaledVector(UP, (y0 + y1) / 2 + 30 / zoom);
  return { target, zoom };
}

type Flight = { t: number; dur: number; intro?: boolean; fromT: THREE.Vector3; toT: THREE.Vector3; fromZ: number; toZ: number; fromDir: THREE.Vector3 };
type OrbitLike = { target: THREE.Vector3; update: () => void; enabled: boolean };

function Scene({ activeId, onPick, live, onContentHeight }: { activeId: SectionId | null; onPick: (id: SectionId) => void; live: LiveProps; onContentHeight?: (px: number) => void }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);
  const controls = useThree((s) => s.controls) as unknown as OrbitLike | null;
  const cam = camera as THREE.OrthographicCamera;
  const P = useLayout();
  const ALL = P.all;
  const fly = useRef<Flight | null>(null);
  const cameraVector = useMemo(() => new THREE.Vector3(), []);
  const current = useRef({ box: ALL, pad: 1.08 });

  // ---- teddy rain ----
  const [drops, setDrops] = useState<Drop[]>([]);
  const [dropCount, setDropCount] = useState(0);
  const nextId = useRef(0);
  const teddyObj = P.layout.objs.find((o) => o.kind === 'teddy');
  const mini = useMemo(() => (teddyObj ? miniTeddyModel(teddyObj) : null), [teddyObj]);
  // what minis can land on: boards, posts and object bounding boxes
  const solids = useMemo<Box[]>(() => {
    const objBoxes = P.layout.objs.map((o) => {
      const x0 = Math.min(...o.boxes.map((b) => b.x)), x1 = Math.max(...o.boxes.map((b) => b.x + b.w));
      const y0 = Math.min(...o.boxes.map((b) => b.y)), y1 = Math.max(...o.boxes.map((b) => b.y + b.d));
      const z0 = Math.min(...o.boxes.map((b) => b.z)), z1 = Math.max(...o.boxes.map((b) => b.z + b.h));
      return { x: x0, y: y0, z: z0, w: x1 - x0, d: y1 - y0, h: z1 - z0 };
    });
    return [...P.layout.shelf, ...objBoxes];
  }, [P]);
  const drop = useCallback((n: number) => {
    const width = P.layout.bays * 30;
    const top = Math.max(...P.layout.shelf.map((b) => b.z + b.h));
    const r = (a: number, b: number) => a + Math.random() * (b - a);
    // phone: the page is scrolled to the teddy, so drop them just above it, in front of the shelf, to fall past it
    const teddyBase = teddyObj ? teddyObj.boxes[0].z : 0;
    const fresh: Drop[] = Array.from({ length: n }, (_, i) => ({
      id: nextId.current++,
      // three coords (x, up, depth); staggered heights so a shift-click burst rains down rather than clumping
      pos: P.mobile
        ? [r(3, width - 3), teddyBase + 22 + r(0, 6) + i * 2.5, r(11, 14.5)]
        : [r(3, width - 3), top + 10 + r(0, 10) + i * 3, r(2, 10)],
      rot: [r(0, 6.28), r(0, 6.28), r(0, 6.28)],
      vel: [r(-4, 4), r(-4, 0), r(-3, 3)],
      spin: [r(-5, 5), r(-5, 5), r(-5, 5)],
    }));
    const max = maxTeddies(P.mobile); // keep it light: the oldest teddies vanish
    setDrops((d) => [...d, ...fresh].slice(-max));
    setDropCount((c) => c + n);
  }, [P, teddyObj]);
  const teddyApi = useMemo(() => ({ drop, count: dropCount }), [drop, dropCount]);

  // phone: camera follows the page scroll; tell the page how tall to be
  const mob = useMemo(() => (P.mobile ? mobileFraming(ALL, size) : null), [P.mobile, ALL, size]);
  useEffect(() => {
    if (!mob) return;
    onContentHeight?.(mob.contentPx);
    invalidate();
    const onScroll = () => invalidate();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mob, onContentHeight, invalidate]);

  const frameBox = useCallback((box: THREE.Box3, pad: number, instant = false) => {
    current.current = { box, pad };
    const { target, zoom } = framing(box, size, pad);
    if (instant || !controls) {
      cam.position.copy(target).addScaledVector(ISO, DIST);
      cam.zoom = zoom;
      cam.lookAt(target);
      cam.updateProjectionMatrix();
      if (controls) { controls.target.copy(target); controls.update(); }
      invalidate();
      return;
    }
    controls.enabled = true;
    fly.current = { t: 0, dur: 0.9, fromT: controls.target.clone(), toT: target, fromZ: cam.zoom, toZ: zoom, fromDir: cam.position.clone().sub(controls.target).normalize() };
    invalidate();
  }, [cam, controls, size, invalidate]);

  // intro on first load, then refit on resize
  const introStarted = useRef(false);
  useEffect(() => {
    if (P.mobile) return; // phone framing is driven by scroll in useFrame
    if (!introStarted.current) {
      introStarted.current = true;
      if (!reduceMotion()) {
        const { target, zoom } = framing(ALL, size, 1.08);
        cam.position.copy(target).addScaledVector(TOP, DIST);
        cam.zoom = zoom * 0.75;
        cam.lookAt(target);
        cam.updateProjectionMatrix();
        fly.current = { t: 0, dur: 1.1, intro: true, fromT: target, toT: target, fromZ: zoom * 0.75, toZ: zoom, fromDir: TOP.clone() };
        invalidate();
        return;
      }
    }
    if (fly.current?.intro) return;
    frameBox(current.current.box, current.current.pad, true);
  }, [size, controls]); // eslint-disable-line react-hooks/exhaustive-deps

  // follow the open panel
  const prevActive = useRef<SectionId | null>(null);
  useEffect(() => {
    if (activeId === prevActive.current) return;
    prevActive.current = activeId;
    if (P.mobile) return; // on phones the panel covers the screen; no camera move needed
    const obj = activeId ? P.layout.objs.find((o) => o.id === activeId) : null;
    if (obj) frameBox(toBox3(cubbyOf(obj), P.offset), 1.25);
    else frameBox(ALL, 1.08);
  }, [activeId, frameBox, P, ALL]);

  useFrame((state, delta) => {
    if (mob) {
      // scroll 1px → camera moves 1px down the shelf, like a normal page
      const target = cameraVector.copy(mob.top).addScaledVector(UP, -window.scrollY / mob.zoom);
      cam.position.copy(target).addScaledVector(ISO, DIST);
      cam.lookAt(target);
      if (cam.zoom !== mob.zoom) { cam.zoom = mob.zoom; cam.updateProjectionMatrix(); }
      return;
    }
    const f = fly.current;
    if (!f || (!f.intro && !controls)) return;
    f.t = Math.min(1, f.t + Math.min(delta, 0.1) / f.dur); // slow frames slow it down, never skip it
    const e = ease(f.t);
    const target = f.intro || !controls ? f.toT : controls.target.lerpVectors(f.fromT, f.toT, e);
    cam.position.copy(target).addScaledVector(cameraVector.copy(f.fromDir).lerp(ISO, e).normalize(), DIST);
    cam.zoom = THREE.MathUtils.lerp(f.fromZ, f.toZ, e);
    cam.updateProjectionMatrix();
    if (f.intro) {
      cam.lookAt(target); // controls.update() would clamp the top-down start
      if (controls) {
        controls.enabled = f.t === 1;
        if (f.t === 1) { controls.target.copy(target); controls.update(); }
      }
    } else {
      controls!.update();
    }
    if (f.t === 1) fly.current = null;
    else state.invalidate();
  });

  return (
    <TeddyCtx.Provider value={teddyApi}>
      <group position={P.offset}>
        <Shelf />
        {P.layout.objs.map((o, i) => (
          <ShelfObject key={i} obj={o} active={activeId !== null && o.id === activeId} onPick={onPick} live={live} />
        ))}
        {drops.length > 0 && mini && (
          <Suspense fallback={null}>
            <TeddyRain drops={drops} solids={solids} half={mini.half} teddy={<MiniTeddy model={mini} />} />
          </Suspense>
        )}
      </group>
    </TeddyCtx.Provider>
  );
}

// ---------------------------------------------------------------- canvas

export type ShelfCanvasProps = {
  theme: ThemeKey;
  activeId: SectionId | null;
  onSelect: (id: SectionId) => void;
  onMiss: () => void;
  github: GithubStats | null;
  /** night in the visitor’s time zone: lamp switches on; clay mode dims to a moonlit room */
  night?: boolean;
  visible: boolean;
  layout?: LayoutKey;
  /** phone layout only: total page height (px) needed to scroll through the shelf */
  onContentHeight?: (px: number) => void;
};

export default function ShelfCanvas({ theme: themeKey, activeId, onSelect, onMiss, github, night = false, visible, layout = 'desktop', onContentHeight }: ShelfCanvasProps) {
  const theme = THEMES[themeKey];
  const live = useMemo(() => ({ github, night }), [github, night]);
  // clay at night: dim, cool moonlight so the lamp becomes the main light (day = the original look)
  const moon = theme.lit && night;
  const P = PREPARED[layout];
  const s = P.mobile ? 160 : 110; // shadow camera has to cover the taller phone shelf
  const shadowSize = P.mobile ? 1024 : 2048;
  return (
    <Canvas
      orthographic
      shadows={theme.lit ? { type: THREE.PCFShadowMap } : false}
      flat
      frameloop={visible ? 'demand' : 'never'}
      dpr={[1, P.mobile ? 1.25 : 1.5]}
      camera={CAMERA}
      onPointerMissed={onMiss}
      style={P.mobile ? { touchAction: 'pan-y' } : undefined}
    >
      <ThemeCtx.Provider value={theme}>
        <LayoutCtx.Provider value={P}>
        <NightCtx.Provider value={moon}>
          <color attach="background" args={[moon ? NIGHT_BG : theme.bg]} />
          <ambientLight intensity={moon ? 0.32 : 0.6} />
          <hemisphereLight key={moon ? 'n' : 'd'} args={moon ? ['#93a5c8', '#3a332c', 0.6] : ['#ffffff', '#d9cfc2', 0.7]} />
          <directionalLight key={`light-${layout}`} position={[-70, 150, 110]} intensity={moon ? 0.9 : 2} color={moon ? '#b4c6e6' : '#ffffff'} castShadow={theme.lit} shadow-mapSize={[shadowSize, shadowSize]} shadow-bias={-0.0004} shadow-normalBias={0.05}>
            <orthographicCamera attach="shadow-camera" args={[-s, s, s, -s, 1, 600]} />
          </directionalLight>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, P.groundY, 0]} receiveShadow visible={theme.lit}>
            <planeGeometry args={[800, 800]} />
            <shadowMaterial opacity={moon ? 0.3 : 0.12} />
          </mesh>

          <Scene key={layout} activeId={activeId} onPick={onSelect} live={live} onContentHeight={onContentHeight} />

          {/* phones scroll the page instead of orbiting (OrbitControls would also block touch scrolling) */}
          {!P.mobile && (
            <OrbitControls
              makeDefault
              enablePan={false}
              enableDamping
              minAzimuthAngle={-Math.PI * 0.45}
              maxAzimuthAngle={-Math.PI * 0.05}
              minPolarAngle={Math.PI * 0.2}
              maxPolarAngle={Math.PI * 0.42}
            />
          )}
        </NightCtx.Provider>
        </LayoutCtx.Provider>
      </ThemeCtx.Provider>
    </Canvas>
  );
}
