import { Component, Suspense, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import { Group } from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { getAudiModel } from '../data/audiModels'
import { getModelTransform } from '../logic/modelTransform'
import { VehiclePlaceholder } from './VehiclePlaceholder'
import { SceneLabel } from './SceneLabel'
import { CarStudioLighting } from './CarStudioLighting'
import { useModelResources } from '../hooks/useModelResources'

export type ModelStatus = 'loading' | 'ready' | 'error' | 'unavailable'
type Vector3Tuple = [number, number, number]
type Props = {
  vehicleId: string
  scale?: number | Vector3Tuple
  rotation?: Vector3Tuple
  position?: Vector3Tuple
  lighting?: boolean
  onStatus?: (status: ModelStatus) => void
}

class ModelErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onError?: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onError?.() }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function Fallback({ status, onStatus }: { status: Exclude<ModelStatus, 'ready'>; onStatus?: Props['onStatus'] }) {
  useEffect(() => { onStatus?.(status) }, [status, onStatus])
  return <>
    <VehiclePlaceholder />
    <SceneLabel text={status === 'loading' ? 'LOADING VEHICLE…' : status === 'error' ? 'MODEL LOAD FAILED · PLACEHOLDER' : 'MODEL UNAVAILABLE · PLACEHOLDER'} position={[0, 1.3, 0]} width={2.7} fontSize={0.08} />
  </>
}

function LoadedModel({ path, orientationY, onStatus }: { path: string; orientationY: number; onStatus?: Props['onStatus'] }) {
  // Meshopt decoder is bundled by Drei; assets need no remote Draco decoder.
  const { scene } = useGLTF(path, false, true)
  useModelResources(path, scene)
  const { object, factor, offset } = useMemo(() => {
    const object = new Group()
    object.rotation.y = orientationY
    object.add(clone(scene))
    return { object, ...getModelTransform(object) }
  }, [scene, orientationY])
  useEffect(() => { onStatus?.('ready') }, [onStatus])
  // GLTF resources belong to the loader cache. Clones must not dispose shared geometry/materials.
  return <group scale={factor}><group position={offset}><primitive object={object} dispose={null} /></group></group>
}

export function AudiCarModel({ vehicleId, scale = 1, rotation = [0, 0, 0], position = [0, 0, 0], lighting = true, onStatus }: Props) {
  const asset = getAudiModel(vehicleId)
  const path = asset?.available ? asset.modelPath : null
  return <group position={position} rotation={rotation} scale={scale} pointerEvents="none" name={asset?.name || 'Unavailable Audi asset'}>
    {lighting && <CarStudioLighting />}
    {path ? <ModelErrorBoundary key={path} fallback={<Fallback status="error" onStatus={onStatus} />}>
      <Suspense fallback={<Fallback status="loading" onStatus={onStatus} />}>
        <LoadedModel path={path} orientationY={asset!.orientationY} onStatus={onStatus} />
      </Suspense>
    </ModelErrorBoundary> : <Fallback status="unavailable" onStatus={onStatus} />}
  </group>
}
