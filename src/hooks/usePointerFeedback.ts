import { useRef, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'

// Track both controllers independently; one ray leaving must not clear the other.
export function usePointerFeedback() {
  const pointers = useRef(new Set<number>())
  const [hovered, setHovered] = useState(false)
  const leave = (event: ThreeEvent<PointerEvent>) => {
    pointers.current.delete(event.pointerId)
    setHovered(pointers.current.size > 0)
  }
  return { hovered, handlers: {
    onPointerOver: (event: ThreeEvent<PointerEvent>) => { event.stopPropagation(); pointers.current.add(event.pointerId); setHovered(true) },
    onPointerOut: leave,
    onPointerCancel: leave,
  } }
}
