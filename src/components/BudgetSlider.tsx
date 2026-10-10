import { useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { Group } from 'three'
import { BUDGET_STEP, MAX_BUDGET, MIN_BUDGET } from '../logic/budget'
import { budgetFromRay } from '../logic/slider'
import { useJourney } from '../state/JourneyContext'

export function BudgetSlider() {
  const { state, dispatch } = useJourney()
  const group = useRef<Group>(null)
  const pointer = useRef<number | null>(null)
  const width = 3
  const update = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    if (!group.current) return
    const budget = budgetFromRay(event.ray, group.current.matrixWorld, width)
    if (budget !== null) dispatch({ type: 'budget', budget })
  }
  const finish = (event: ThreeEvent<PointerEvent>) => {
    if (pointer.current !== event.pointerId) return
    pointer.current = null
    const target = event.target as unknown as { releasePointerCapture: (id: number) => void } | null
    target?.releasePointerCapture(event.pointerId)
  }
  const fraction = (state.budget - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)
  return <group position={[0, 1.45, -3]} ref={group} name="Budget slider">
    <mesh pointerEvents="none"><boxGeometry args={[width, 0.035, 0.025]} /><meshBasicMaterial color="#5d6776" /></mesh>
    <mesh position={[(fraction - 1) * width / 2, 0, 0.02]} pointerEvents="none"><boxGeometry args={[Math.max(0.005, fraction * width), 0.04, 0.025]} /><meshBasicMaterial color="#fa3156" /></mesh>
    <mesh position={[(fraction - 0.5) * width, 0, 0.04]} pointerEvents="none"><sphereGeometry args={[0.085, 16, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>
    {Array.from({ length: (MAX_BUDGET - MIN_BUDGET) / BUDGET_STEP + 1 }, (_, index) => <mesh key={index} position={[-width / 2 + index * width / 25, -0.08, 0]} pointerEvents="none"><boxGeometry args={[0.008, 0.035, 0.01]} /><meshBasicMaterial color="#5d6776" /></mesh>)}
    <mesh
      pointerEventsType={{ deny: 'grab' }}
      onPointerDown={(event) => {
        if (pointer.current !== null) return
        pointer.current = event.pointerId
        const target = event.target as unknown as { setPointerCapture: (id: number) => void } | null
        target?.setPointerCapture(event.pointerId)
        update(event)
      }}
      onPointerMove={(event) => { if (pointer.current === event.pointerId) update(event) }}
      onPointerUp={(event) => { if (pointer.current === event.pointerId) update(event); finish(event) }}
      onPointerCancel={finish}
      onLostPointerCapture={() => { pointer.current = null }}
      onClick={update}
    >
      <boxGeometry args={[width + 0.18, 0.32, 0.06]} /><meshBasicMaterial transparent opacity={0} colorWrite={false} depthWrite={false} />
    </mesh>
  </group>
}
