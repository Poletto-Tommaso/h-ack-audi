import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide } from 'three'
import type { Mesh, MeshBasicMaterial } from 'three'
import { JourneyPresentation, useJourney } from '../state/JourneyContext'
import { sceneKey, fadeEase } from '../logic/sceneTransition'
import { useReducedMotion } from '../hooks/useReducedMotion'

/** One stereo-safe black dome, no postprocessing, no tracked-camera transforms. */
export function SceneTransition({ children }: { children: ReactNode }) {
  const { state } = useJourney()
  const key = sceneKey(state)
  const [view, setView] = useState(state)
  const [busy, setBusy] = useState(false)
  const live = useRef(state)
  const fade = useRef({ phase: 'idle' as 'idle' | 'out' | 'swap' | 'in', time: 0, from: 0, opacity: 0 })
  const mesh = useRef<Mesh>(null)
  const material = useRef<MeshBasicMaterial>(null)
  const reduced = useReducedMotion()
  // Retain edits within a scene so its last frame is current when navigation starts.
  if (sceneKey(view) === key && view !== state) setView(state)
  const shown = sceneKey(view) === key ? state : view
  useLayoutEffect(() => {
    live.current = state
    if (sceneKey(view) !== key) {
      if (fade.current.phase !== 'out') {
        fade.current = { ...fade.current, phase: 'out', time: 0, from: fade.current.opacity }
        setBusy(true)
      }
    } else if (fade.current.phase === 'swap' || fade.current.phase === 'out') {
      // Back can return to the displayed scene before blackout. Fade back from
      // the current opacity instead of waiting for a swap that will never commit.
      fade.current.phase = 'in'
      fade.current.time = 0
      fade.current.from = fade.current.opacity
    }
  }, [key, state, view])
  useFrame(({ camera, gl }, delta) => {
    if (!mesh.current || !material.current) return
    const head = gl.xr.isPresenting ? gl.xr.getCamera() : camera
    head.getWorldPosition(mesh.current.position)
    const current = fade.current
    const halfDuration = reduced ? 0.1 : 0.14
    if (current.phase === 'out' || current.phase === 'in') {
      current.time += Math.min(delta, 0.05)
      const progress = Math.min(1, current.time / halfDuration)
      current.opacity = current.phase === 'out' ? current.from + (1 - current.from) * fadeEase(progress) : current.from * (1 - fadeEase(progress))
      if (progress === 1) {
        if (current.phase === 'out') {
          current.phase = 'swap'
          setView(live.current)
        } else { current.phase = 'idle'; setBusy(false) }
      }
    }
    material.current.opacity = current.opacity
    mesh.current.visible = current.opacity > 0
  })
  return <>
    {/* R3F ignores undefined assignments: explicitly restore XR's default listener policy. */}
    <JourneyPresentation state={shown}><group pointerEvents={busy ? 'none' : 'listener'}>{children}</group></JourneyPresentation>
    <mesh ref={mesh} visible={false} renderOrder={10000} frustumCulled={false} pointerEvents="none">
      <sphereGeometry args={[0.6, 16, 12]} />
      <meshBasicMaterial ref={material} color="#000000" side={BackSide} transparent opacity={0} depthTest={false} depthWrite={false} toneMapped={false} />
    </mesh>
  </>
}
