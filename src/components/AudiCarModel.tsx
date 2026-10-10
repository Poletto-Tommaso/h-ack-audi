import { Component, Suspense, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import { Group, Mesh, MeshPhysicalMaterial } from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { getAudiModel } from '../data/audiModels'
import { getModelTransform } from '../logic/modelTransform'
import { SceneLabel } from './SceneLabel'
import { CarStudioLighting } from './CarStudioLighting'
import { useModelResources } from '../hooks/useModelResources'
import { previewPaths } from '../data/recommendationAssets'
import { useCarShadow } from '../hooks/useCarShadow'

export type ModelStatus = 'loading' | 'ready' | 'error' | 'unavailable'
type Vector3Tuple = [number, number, number]
type Props = {
  vehicleId: string
  scale?: number | Vector3Tuple
  rotation?: Vector3Tuple
  position?: Vector3Tuple
  lighting?: boolean
  onStatus?: (status: ModelStatus) => void
  detail?: 'source' | 'preview'
  showStatusLabel?: boolean
}

class ModelErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onError?: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onError?.() }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function Fallback({ status, onStatus, showLabel }: { status: Exclude<ModelStatus, 'ready'>; onStatus?: Props['onStatus']; showLabel: boolean }) {
  useEffect(() => { onStatus?.(status) }, [status, onStatus])
  // Loading and errors must never masquerade as a generated Audi model.
  return showLabel ? <SceneLabel text={status === 'loading' ? 'LOADING AUDI MODEL…' : status === 'error' ? 'AUDI MODEL COULD NOT LOAD' : 'AUDI MODEL FILE UNAVAILABLE'} position={[0, 0.8, 0]} width={2.7} fontSize={0.1} /> : null
}

function LoadedModel({ path, orientationY, onStatus, shadowRevision }: { path: string; orientationY: number; onStatus?: Props['onStatus']; shadowRevision: string }) {
  // Meshopt decoder is bundled by Drei; assets need no remote Draco decoder.
  const { scene } = useGLTF(path, false, true)
  useModelResources(path, scene)
  const { object, factor, offset } = useMemo(() => {
    const object = new Group()
    object.rotation.y = orientationY
    object.add(clone(scene))
    // Only per-instance object flags change. Imported geometry, textures and PBR materials stay intact.
    object.traverse(node => {
      if (!(node instanceof Mesh)) return
      const materials = Array.isArray(node.material) ? node.material : [node.material]
      // Glass must not cast a solid opaque slab across the interior/ground.
      node.castShadow = materials.some(material => !(material instanceof MeshPhysicalMaterial && material.transmission > 0) && !(material.transparent && material.opacity < 0.9))
      node.receiveShadow = true
    })
    return { object, ...getModelTransform(object) }
  }, [scene, orientationY])
  useCarShadow(object, shadowRevision)
  useEffect(() => { onStatus?.('ready') }, [onStatus])
  // GLTF resources belong to the loader cache. Clones must not dispose shared geometry/materials.
  return <group scale={factor}><group position={offset}><primitive object={object} dispose={null} /></group></group>
}

export function AudiCarModel({ vehicleId, scale = 1, rotation = [0, 0, 0], position = [0, 0, 0], lighting = true, detail = 'source', showStatusLabel = true, onStatus }: Props) {
  const asset = getAudiModel(vehicleId)
  const path = asset?.available ? (detail === 'preview' ? previewPaths[asset.id] || asset.modelPath : asset.modelPath) : null
  return <group position={position} rotation={rotation} scale={scale} pointerEvents="none" name={asset?.name || 'Unavailable Audi asset'}>
    {lighting && <CarStudioLighting />}
    {path ? <ModelErrorBoundary key={path} fallback={<Fallback status="error" onStatus={onStatus} showLabel={showStatusLabel} />}>
      <Suspense fallback={<Fallback status="loading" onStatus={onStatus} showLabel={showStatusLabel} />}>
        <LoadedModel path={path} orientationY={asset!.orientationY} onStatus={onStatus} shadowRevision={`${rotation.join(',')}:${position.join(',')}:${scale}`} />
      </Suspense>
    </ModelErrorBoundary> : <Fallback status="unavailable" onStatus={onStatus} showLabel={showStatusLabel} />}
  </group>
}
