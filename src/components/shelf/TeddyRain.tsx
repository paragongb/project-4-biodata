'use client';

// Teddy rain easter egg: mini teddies drop from above the shelf, bounce off boards and objects, and pile up.
// Loaded lazily (React.lazy) on the first poke, so the physics engine never slows down the initial page load.

import type { ReactNode } from 'react';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import type { Box } from './scene';

export type Drop = { id: number; pos: [number, number, number]; rot: [number, number, number]; vel: [number, number, number]; spin: [number, number, number] };

/** world box (X along, Y depth, Z up) → three collider: center + half extents (rotated boxes approximated by their unrotated size) */
const toCollider = (b: Box) => ({
  center: [b.x + b.w / 2, b.z + b.h / 2, b.y + b.d / 2] as [number, number, number],
  half: [b.w / 2, b.h / 2, b.d / 2] as [number, number, number],
});

export default function TeddyRain({ drops, solids, teddy, half }: {
  drops: Drop[];
  /** everything a teddy can land on: boards, posts, objects (world boxes) */
  solids: Box[];
  /** one mini teddy, centred on the origin */
  teddy: ReactNode;
  /** half extents of the mini teddy's collision box */
  half: [number, number, number];
}) {
  return (
    // our units are ~centimetres-ish, so gravity is stronger than 9.81 to feel right
    <Physics gravity={[0, -60, 0]}>
      <RigidBody type="fixed" colliders={false}>
        {solids.map((b, i) => {
          const c = toCollider(b);
          return <CuboidCollider key={i} args={c.half} position={c.center} friction={0.7} restitution={0.25} />;
        })}
        {/* the floor, extended well past the shelf so teddies that bounce out still land */}
        <CuboidCollider args={[300, 1, 300]} position={[45, -1, 6]} friction={0.9} restitution={0.2} />
      </RigidBody>

      {drops.map((d) => (
        <RigidBody
          key={d.id}
          colliders={false}
          position={d.pos}
          rotation={d.rot}
          linearVelocity={d.vel}
          angularVelocity={d.spin}
          restitution={0.45}
          friction={0.6}
          linearDamping={0.35}
          angularDamping={0.5}
          ccd
        >
          <CuboidCollider args={half} />
          {teddy}
        </RigidBody>
      ))}
    </Physics>
  );
}
