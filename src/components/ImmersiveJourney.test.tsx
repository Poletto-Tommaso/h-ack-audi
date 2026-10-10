// @vitest-environment jsdom
import { useEffect } from 'react'
import ReactThreeTestRenderer, { act } from '@react-three/test-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Ray, Vector3 } from 'three'
import { JourneyProvider, useJourney } from '../state/JourneyContext'
import { JourneyScene } from '../scenes/JourneyScene'
import { SceneTransition } from './SceneTransition'
import { questions } from '../data/questions'
import { mockModels } from '../data/mockModels'
import { RecommendedCar } from './RecommendedCar'

// Texture drawing, GLB/GPU work and a physical XR session are separate validation steps.
vi.mock('./SceneLabel', () => ({ SceneLabel: ({ text }: { text: string }) => <group name={`Label:${text}`} /> }))
vi.mock('./VehicleStage', async (importOriginal) => ({ ...await importOriginal<typeof import('./VehicleStage')>(), GroundContact: () => <group name="Contact patch" /> }))
vi.mock('@react-three/xr', () => ({ useXR: (select: (state: { session: undefined }) => unknown) => select({ session: undefined }) }))
vi.mock('../logic/xrStore', () => ({ xrStore: { getState: () => ({ session: undefined }), subscribe: () => () => {} } }))
vi.mock('./AudiCarModel', () => ({ AudiCarModel: ({ vehicleId, detail, onStatus }: { vehicleId: string; detail: string; onStatus?: (s: string) => void }) => {
  useEffect(() => { onStatus?.('ready') }, [onStatus])
  return <group name={`AudiModel:${vehicleId}:${detail}`} />
} }))
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
let renderer: Awaited<ReturnType<typeof ReactThreeTestRenderer.create>> | undefined
let journey: ReturnType<typeof useJourney>
function Probe() { const value = useJourney(); useEffect(() => { journey = value }, [value]); return null }
afterEach(async () => { await renderer?.unmount(); renderer = undefined; vi.useRealTimers() })
const click = async (name: string) => {
  const group = renderer!.scene.findByProps({ name })
  const mesh = group.findAll(node => typeof node.props.onClick === 'function')[0]
  await renderer!.fireEvent(mesh, 'click', { pointerId: 1 })
}
const fade = async () => {
  await act(async () => { await renderer!.advanceFrames(4, .05) })
  await act(async () => { await renderer!.advanceFrames(4, .05) })
}

describe('spatial controller-compatible journey', () => {
  it('selects a portal, preserves budget, automatically answers four questions, reveals and inspects the matching asset', async () => {
    vi.useFakeTimers()
    renderer = await ReactThreeTestRenderer.create(<JourneyProvider><SceneTransition><JourneyScene /></SceneTransition><Probe /></JourneyProvider>)
    await click('START YOUR JOURNEY'); await fade()
    expect(renderer.scene.findAll(node => String(node.props.name).endsWith(' portal'))).toHaveLength(4)
    await click('COMFORT portal'); await fade()
    expect(journey.state.portal).toBe('comfort')
    expect(renderer.scene.findByProps({ name: 'comfort route environment' })).toBeDefined()
    renderer.scene.instance.updateMatrixWorld(true)
    const slider = renderer.scene.findByProps({ name: 'Budget slider' }).findAll(node => typeof node.props.onPointerDown === 'function')[0]
    const sliderTarget = { setPointerCapture: vi.fn(), releasePointerCapture: vi.fn() }
    const sliderRay = (x: number) => new Ray(new Vector3(0, 1.6, 0), new Vector3(x, -0.15, -3).normalize())
    await renderer.fireEvent(slider, 'pointerDown', { pointerId: 9, target: sliderTarget, ray: sliderRay(-0.06) })
    expect(journey.state.budget).toBe(85_000)
    await renderer.fireEvent(slider, 'pointerMove', { pointerId: 10, target: sliderTarget, ray: sliderRay(1.5) })
    expect(journey.state.budget).toBe(85_000) // The other controller cannot take over a captured slider.
    await renderer.fireEvent(slider, 'pointerUp', { pointerId: 9, target: sliderTarget, ray: sliderRay(-1.02) })
    expect(journey.state.budget).toBe(45_000)
    expect(sliderTarget.releasePointerCapture).toHaveBeenCalledWith(9)
    await click('+ €5,000')
    expect(journey.state.budget).toBe(50_000)
    await click('CONTINUE'); await fade()
    for (const q of questions.comfort) {
      await click(`A. ${q.answers[0]}`)
      expect(journey.answerPending).toBe(true)
      await act(async () => { vi.advanceTimersByTime(450) })
      await fade()
    }
    expect(journey.state.scene).toBe('result')
    expect(journey.state.answers).toEqual([0, 0, 0, 0])
    expect(journey.state.budget).toBe(50_000)
    await act(async () => { vi.advanceTimersByTime(1200) })
    expect(renderer.scene.findByProps({ name: 'AudiModel:audi-a5-sportback:source' })).toBeDefined()
    await click('EXPLORE YOUR AUDI'); await fade()
    const before = journey.state.rotation
    const hit = renderer.scene.findAll(node => typeof node.props.onPointerDown === 'function')[0]
    const target = { setPointerCapture: vi.fn(), releasePointerCapture: vi.fn() }
    renderer.scene.instance.updateMatrixWorld(true)
    await renderer.fireEvent(hit, 'pointerDown', { pointerId: 7, target, ray: new Ray(new Vector3(0, 1.6, 0), new Vector3(0, 0, -1)) })
    await renderer.fireEvent(hit, 'pointerMove', { pointerId: 7, target, ray: new Ray(new Vector3(0, 1.6, 0), new Vector3(.15, 0, -1).normalize()) })
    await renderer.fireEvent(hit, 'pointerUp', { pointerId: 7, target })
    expect(journey.state.rotation).toBeGreaterThan(before)
    expect(target.setPointerCapture).toHaveBeenCalledWith(7)
    expect(target.releasePointerCapture).toHaveBeenCalledWith(7)
    await click('BACK TO YOUR AUDI'); await fade()
    await act(async () => { vi.advanceTimersByTime(1200) })
    await click('EXPERIENCE YOUR DRIVE'); await fade()
    expect(renderer.scene.findByProps({ name: 'comfort route environment' })).toBeDefined()
    await click('PLAY PREVIEW')
    expect(journey.state.playing).toBe(true)
    await click('BACK TO YOUR AUDI'); await fade()
    await act(async () => { vi.advanceTimersByTime(1200) })
    await click('RESTART'); await fade()
    expect(journey.state.scene).toBe('origin')
  })

  it('keeps hover focus when one of two controllers leaves a portal and cancels answer advance on Back', async () => {
    vi.useFakeTimers()
    renderer = await ReactThreeTestRenderer.create(<JourneyProvider><JourneyScene /><Probe /></JourneyProvider>)
    await click('START YOUR JOURNEY')
    const portal = renderer.scene.findByProps({ name: 'PERFORMANCE portal' })
    const hit = portal.findAll(node => typeof node.props.onPointerOver === 'function')[0]
    await renderer.fireEvent(hit, 'pointerOver', { pointerId: 1 })
    await renderer.fireEvent(hit, 'pointerOver', { pointerId: 2 })
    await renderer.fireEvent(hit, 'pointerOut', { pointerId: 1 })
    expect(portal.findByProps({ name: 'Label:SELECT TO ENTER →' })).toBeDefined()
    await click('PERFORMANCE portal'); await click('CONTINUE')
    await click(`A. ${questions.performance[0].answers[0]}`)
    await click('BACK')
    await act(async () => { vi.advanceTimersByTime(1000) })
    expect(journey.state.scene).toBe('budget')
    await click('CONTINUE')
    await act(async () => { vi.advanceTimersByTime(1000) })
    expect(journey.state.questionIndex).toBe(0)
    expect(journey.state.answers[0]).toBe(0)
  })

  it.each(mockModels)('loads the original $name asset on desktop', async model => {
    renderer = await ReactThreeTestRenderer.create(<RecommendedCar model={model} />)
    expect(renderer.scene.findByProps({ name: `AudiModel:${model.assetId}:source` })).toBeDefined()
  })
})
