import { Component, Suspense, useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from 'three'
import { OrbitControls } from '@react-three/drei'
import { XR, useXR } from '@react-three/xr'
import { xrStore } from '../logic/xrStore'
import { JourneyScene } from '../scenes/JourneyScene'
import { SceneTransition } from './SceneTransition'
import { useJourney } from '../state/JourneyContext'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { carRendererSettings } from '../logic/carLighting'

class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? <div className="canvas-fallback" role="alert">The 3D experience could not load. Enable WebGL or try another browser, then reload.</div> : this.props.children
  }
}

function DesktopControls() {
  const session = useXR((state) => state.session)
  const { state } = useJourney()
  const controls = useRef<OrbitControlsImpl>(null)
  const camera = useThree((root) => root.camera)
  const size = useThree((root) => root.size)
  useEffect(() => {
    if (session || !(camera instanceof PerspectiveCamera)) return
    // Three's imperative desktop camera is owned by R3F; the tracked XR camera is excluded.
    // oxlint-disable-next-line react/immutability
    camera.fov = Math.min(105, Math.max(64, 2 * Math.atan(Math.tan(46 * Math.PI / 180) / (size.width / size.height)) * 180 / Math.PI))
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height, session])
  useEffect(() => {
    if (session) return
    // Restore a predictable desktop view after scene changes or leaving tracked VR.
    camera.position.set(0, 1.6, 0)
    controls.current?.target.set(0, 1.5, -3.5)
    controls.current?.update()
    controls.current?.saveState()
  }, [camera, state.scene, state.mode, session])
  return session ? null : <OrbitControls ref={controls} enabled={state.mode !== 'explore'} target={[0, 1.5, -3.5]} enablePan={false} enableZoom={false} minAzimuthAngle={-0.65} maxAzimuthAngle={0.65} minPolarAngle={1.15} maxPolarAngle={1.85} />
}

export function ExperienceCanvas() {
  const [contextLost, setContextLost] = useState(false)
  return <SceneErrorBoundary>
    {contextLost && <div className="canvas-fallback" role="alert">The graphics connection was lost. Reload to restart the experience.</div>}
    <Canvas
      camera={{ position: [0, 1.6, 0], fov: 64, near: 0.1, far: 50 }}
      dpr={[1, 1.5]}
      shadows="percentage"
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', ...carRendererSettings }}
      fallback={<div className="canvas-fallback" role="alert">WebGL is unavailable. Enable hardware acceleration or try another browser.</div>}
      onCreated={({ gl }) => {
        gl.setClearColor('#080a0d')
        gl.domElement.addEventListener('webglcontextlost', () => setContextLost(true), { once: true })
      }}
    >
      <XR store={xrStore}>
        <Suspense fallback={null}><SceneTransition><JourneyScene /></SceneTransition></Suspense>
        <DesktopControls />
      </XR>
    </Canvas>
  </SceneErrorBoundary>
}
