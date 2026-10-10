import { useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { Matrix4, Plane, Vector3 } from 'three'
import type { Group } from 'three'
import type { ReactNode } from 'react'
import { useDragCapture } from '../hooks/useDragCapture'
export function VehicleInspection({ children, onRotate }: { children: ReactNode; onRotate: (delta: number) => void }) {
  const group = useRef<Group>(null)
  const drag = useRef<{ id: number; x: number } | null>(null)
  const { capturePointer, releasePointer } = useDragCapture()
  const xFromRay = (event: ThreeEvent<PointerEvent>) => {
    if (!group.current) return null
    const ray = event.ray.clone().applyMatrix4(new Matrix4().copy(group.current.matrixWorld).invert())
    return ray.intersectPlane(new Plane(new Vector3(0, 0, 1), 0), new Vector3())?.x ?? null
  }
  const finish = (event: ThreeEvent<PointerEvent>) => {
    if (drag.current?.id !== event.pointerId) return
    drag.current = null
    releasePointer(event.pointerId)
  }
  return <group ref={group} position={[0, 0.22, -6.4]}>
    {children}
    <mesh position={[0, 0.9, 0]} pointerEventsType={{ deny: 'grab' }}
      onPointerDown={event => {
        if (drag.current) return
        event.stopPropagation()
        const x = xFromRay(event)
        if (x === null) return
        if (!capturePointer(event)) return
        drag.current = { id: event.pointerId, x }
      }}
      onPointerMove={event => {
        if (drag.current?.id !== event.pointerId) return
        event.stopPropagation()
        const x = xFromRay(event)
        if (x === null) return
        onRotate((x - drag.current.x) * 0.6)
        drag.current.x = x
      }} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish}>
      <boxGeometry args={[4.5, 1.8, 4.8]} /><meshBasicMaterial transparent opacity={0} colorWrite={false} depthWrite={false} />
    </mesh>
  </group>
}
