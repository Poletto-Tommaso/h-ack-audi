import { useLayoutEffect, useRef } from 'react'
import { Object3D } from 'three'
import type { InstancedMesh } from 'three'
export type BoxInstance = { position: [number, number, number]; scale: [number, number, number] }
export function InstancedBoxes({ boxes, color, metalness = 0 }: { boxes: BoxInstance[]; color: string; metalness?: number }) {
  const mesh = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    const dummy = new Object3D()
    boxes.forEach((box, i) => { dummy.position.set(...box.position); dummy.scale.set(...box.scale); dummy.updateMatrix(); mesh.current!.setMatrixAt(i, dummy.matrix) })
    mesh.current!.instanceMatrix.needsUpdate = true
    mesh.current!.computeBoundingSphere()
  }, [boxes])
  return <instancedMesh ref={mesh} args={[undefined, undefined, boxes.length]} pointerEvents="none"><boxGeometry /><meshStandardMaterial color={color} roughness={0.78} metalness={metalness} /></instancedMesh>
}
