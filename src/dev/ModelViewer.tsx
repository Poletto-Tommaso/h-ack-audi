import { Component, Suspense, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { audiModels } from '../data/audiModels'
import { getPortal } from '../data/portals'
import { AudiCarModel } from '../components/AudiCarModel'
import type { ModelStatus } from '../components/AudiCarModel'
import './model-viewer.css'

class ViewerBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <p role="alert">WebGL viewer failed. Enable hardware acceleration and reload.</p> : this.props.children }
}

/** Imported only by the development entry branch. No XR store/session/controller imports. */
export default function ModelViewer() {
  const [selectedId, setSelectedId] = useState(audiModels[0].id)
  const [status, setStatus] = useState<ModelStatus>('loading')
  const [epoch, setEpoch] = useState(0)
  const controls = useRef<OrbitControlsImpl>(null)
  const vehicle = audiModels.find((entry) => entry.id === selectedId)!
  const select = (id: typeof selectedId) => {
    if (id === selectedId) return
    setStatus('loading')
    setSelectedId(id)
    controls.current?.reset()
  }
  return <main className="model-viewer">
    <aside className="model-sidebar">
      <a href="/">← BACK TO THE JOURNEY</a>
      <p className="eyebrow">AUDI / ASSET LAB</p><h1>Model library</h1>
      <p>Development inspection · source variants and preserved materials.</p>
      <nav aria-label="Choose a vehicle">{audiModels.map((entry) => <button className="model-option" key={entry.id} aria-pressed={entry.id === selectedId} onClick={() => select(entry.id)}>
        {entry.thumbnailPath && <img src={entry.thumbnailPath} alt="" loading="lazy" />}
        <span><strong>{entry.name}</strong><small>{entry.categories.map((id) => getPortal(id).title).join(' / ')}</small></span>
      </button>)}</nav>
    </aside>
    <section className="model-stage" aria-label="3D model inspection">
      <header><h2>{vehicle.name}</h2><p>{vehicle.categories.map((id) => getPortal(id).title).join(' / ')} · {vehicle.fileSizeBytes ? `${(vehicle.fileSizeBytes / 1048576).toFixed(2)} MiB` : 'Size unknown'}</p>
        <p role="status">Model status: {status}</p>
      </header>
      <div className="model-canvas"><ViewerBoundary><Suspense fallback={<p>Preparing viewer…</p>}>
        <Canvas camera={{ position: [3.2, 2, 3.8], fov: 42, near: 0.01, far: 60 }} dpr={[1, 1.5]} gl={{ antialias: true }} fallback={<p role="alert">WebGL is unavailable.</p>}>
          <color attach="background" args={['#151b25']} />
          <AudiCarModel key={`${selectedId}:${epoch}`} vehicleId={selectedId} onStatus={setStatus} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}><circleGeometry args={[6, 48]} /><meshStandardMaterial color="#242b36" roughness={0.8} /></mesh>
          <OrbitControls ref={controls} makeDefault target={[0, 0.5, 0]} minDistance={1} maxDistance={12} maxPolarAngle={Math.PI / 2 - 0.01} enableDamping />
        </Canvas>
      </Suspense></ViewerBoundary></div>
      <footer><button onClick={() => controls.current?.reset()}>RESET CAMERA</button>
        {status === 'error' && <button onClick={() => { if (vehicle.modelPath) useGLTF.clear(vehicle.modelPath); setStatus('loading'); setEpoch((value) => value + 1) }}>RETRY MODEL</button>}
        <p>Drag to rotate · scroll / pinch to zoom · right-drag to pan. No VR session in this viewer.</p>
        <p className="model-warning">{vehicle.performanceNotes.join(' ') || 'Profile on Quest before production use.'}</p>
        <a href={`/models/cars/${vehicle.id}/CREDITS.txt`}>Source attribution and license metadata</a>
      </footer>
    </section>
  </main>
}
