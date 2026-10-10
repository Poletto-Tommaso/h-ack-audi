import { Component, Suspense, useState } from 'react'
import type { ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { XR, useXR } from '@react-three/xr'
import { xrStore } from '../logic/xrStore'
import { OriginScene } from '../scenes/OriginScene'
import type { OriginSceneProps } from '../scenes/OriginScene'

class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? <div className="canvas-fallback" role="alert">The 3D experience could not load. Enable WebGL or try another browser, then reload.</div> : this.props.children
  }
}

function DesktopControls() {
  const session = useXR((state) => state.session)
  return session ? null : <OrbitControls target={[0, 1.35, -3]} enablePan={false} enableZoom={false} minAzimuthAngle={-0.35} maxAzimuthAngle={0.35} minPolarAngle={1.25} maxPolarAngle={1.65} />
}

export function ExperienceCanvas(props: OriginSceneProps) {
  const [contextLost, setContextLost] = useState(false)
  return <SceneErrorBoundary>
    {contextLost && <div className="canvas-fallback" role="alert">The graphics connection was lost. Reload to restart the experience.</div>}
    <Canvas
      camera={{ position: [0, 1.6, 0], fov: 58, near: 0.1, far: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      fallback={<div className="canvas-fallback" role="alert">WebGL is unavailable. Enable hardware acceleration or try another browser.</div>}
      onCreated={({ gl }) => {
        gl.setClearColor('#080a0d')
        gl.domElement.addEventListener('webglcontextlost', () => setContextLost(true), { once: true })
      }}
    >
      <XR store={xrStore}>
        <Suspense fallback={null}><OriginScene {...props} /></Suspense>
        <DesktopControls />
      </XR>
    </Canvas>
  </SceneErrorBoundary>
}
