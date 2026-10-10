import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useXR } from '@react-three/xr'
import { Group, MathUtils } from 'three'
import { OriginEnvironment } from '../components/OriginEnvironment'
import { SceneLabel } from '../components/SceneLabel'
import { WorldButton } from '../components/WorldButton'

export type OriginSceneProps = { awakened: boolean; onActivate: () => void; onReset: () => void }

export function OriginScene({ awakened, onActivate, onReset }: OriginSceneProps) {
  const sculpture = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const session = useXR((state) => state.session)
  const [exitError, setExitError] = useState(false)
  useFrame((_, delta) => {
    if (sculpture.current) sculpture.current.scale.setScalar(MathUtils.damp(sculpture.current.scale.x, hovered ? 1.06 : 1, 8, Math.min(delta, 0.1)))
  })
  return <>
    <OriginEnvironment awakened={awakened} />
    <SceneLabel text="A U D I   /   F I N D  Y O U R  D R I V E" position={[0, 2.65, -4.3]} width={3.7} color="#bfc6d0" />
    <group position={[0, 1.35, -3]} ref={sculpture}>
      <group pointerEvents="none">
        {[-0.69, -0.23, 0.23, 0.69].map((x) => <mesh key={x} position={[x, 0, 0]}>
          <torusGeometry args={[0.36, 0.027, 10, 64]} />
          <meshStandardMaterial color={awakened ? '#ff2446' : hovered ? '#ffffff' : '#d1d8e2'} emissive={awakened ? '#c50827' : '#6d7a8c'} emissiveIntensity={awakened ? 1 : 0.25} metalness={0.45} roughness={0.22} />
        </mesh>)}
      </group>
      <mesh
        pointerEventsType={{ deny: 'grab' }}
        onClick={(event) => { event.stopPropagation(); onActivate() }}
        onPointerOver={(event) => { event.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[2.2, 0.85, 0.16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
    </group>
    <SceneLabel text={awakened ? 'YOUR JOURNEY STARTS WITHIN.' : 'EVERY JOURNEY BEGINS WITH A SPARK.'} position={[0, 0.84, -3]} width={2.7} />
    <SceneLabel text={exitError ? 'Use the Quest menu to exit VR.' : awakened ? 'The origin is awake. Select the rings to reset.' : session ? 'Point at the rings. Press your trigger to begin.' : 'Click the rings to awaken the origin.'} position={[0, 0.61, -3]} width={2.8} color="#9da8b9" />
    {session && <>
      <WorldButton label="RESET" position={[-0.45, 0.65, -2.6]} onClick={onReset} />
      <WorldButton label="EXIT VR" position={[0.45, 0.65, -2.6]} onClick={() => { void session.end().catch(() => setExitError(true)) }} />
    </>}
  </>
}
