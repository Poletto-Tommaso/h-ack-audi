// @vitest-environment jsdom
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import ReactThreeTestRenderer, { act } from '@react-three/test-renderer'
import { createRayPointer } from '@pmndrs/pointer-events'
import type { Pointer } from '@pmndrs/pointer-events'
import { Object3D, Vector3 } from 'three'
import type { PerspectiveCamera } from 'three'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { JourneyProvider, useJourney } from '../state/JourneyContext'
import { JourneyScene } from '../scenes/JourneyScene'
import { SceneTransition } from './SceneTransition'
import { questions } from '../data/questions'
import { portals } from '../data/portals'

// Only GPU/text/model upload and the physical XR session are stubbed.
// Target selection and event delivery use the installed XR pointer engine, not fireEvent.
vi.mock('./SceneLabel', () => ({ SceneLabel: ({ text }: { text: string }) => <group name={`Label:${text}`} /> }))
vi.mock('./VehicleStage', async (original) => ({ ...await original<typeof import('./VehicleStage')>(), GroundContact: () => null }))
vi.mock('@react-three/xr', () => ({ useXR: (select: (state: { session: undefined }) => unknown) => select({ session: undefined }) }))
vi.mock('../logic/xrStore', () => ({ xrStore: { getState: () => ({ session: undefined }), subscribe: () => () => {} } }))
vi.mock('./AudiCarModel', () => ({ AudiCarModel: () => null }))
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
let renderer: Awaited<ReturnType<typeof ReactThreeTestRenderer.create>> | undefined
let journey: ReturnType<typeof useJourney>
let camera: PerspectiveCamera
let time = 0
const rays: Array<{ pointer: Pointer; space: Object3D }> = []
function Probe() {
  const value = useJourney()
  const rootCamera = useThree(state => state.camera)
  useEffect(() => { journey = value; camera = rootCamera as PerspectiveCamera }, [value, rootCamera])
  return null
}
afterEach(async () => {
  await act(async () => { for (const { pointer } of rays) pointer.exit({ timeStamp: ++time }) })
  rays.length = 0
  await renderer?.unmount()
  renderer = undefined
  vi.useRealTimers()
})
async function setup() {
  vi.useFakeTimers()
  renderer = await ReactThreeTestRenderer.create(<JourneyProvider><SceneTransition><JourneyScene /></SceneTransition><Probe /></JourneyProvider>)
  for (const handedness of ['left', 'right']) {
    const space = new Object3D()
    space.position.set(handedness === 'left' ? -0.2 : 0.2, 1.4, 0)
    rays.push({ space, pointer: createRayPointer(() => camera, { current: space }, { handedness }) })
  }
}
function target(name: string) {
  const group = renderer!.scene.findByProps({ name })
  return group.findAll(node => typeof node.props.onClick === 'function')[0].instance as Object3D
}
async function aimAt(point: Vector3, controller = 0) {
  const ray = rays[controller]
  ray.space.quaternion.setFromUnitVectors(new Vector3(0, 0, -1), point.clone().sub(ray.space.position).normalize())
  ray.space.updateMatrixWorld(true)
  renderer!.scene.instance.updateMatrixWorld(true)
  await act(async () => { ray.pointer.move(renderer!.scene.instance, { timeStamp: ++time }) })
  return ray.pointer
}
async function select(name: string, controller = 0) {
  const object = target(name)
  object.updateWorldMatrix(true, false)
  const pointer = await aimAt(object.getWorldPosition(new Vector3()), controller)
  expect(pointer.getIntersection()?.object === object, `Controller ray must hit ${name}`).toBe(true)
  await act(async () => {
    pointer.down({ timeStamp: ++time, button: 0 })
    pointer.up({ timeStamp: time += 50, button: 0 })
  })
}
async function fade() {
  await act(async () => { await renderer!.advanceFrames(4, .05) })
  await act(async () => { await renderer!.advanceFrames(4, .05) })
}

describe('real XR ray targeting after transitions', () => {
  it.each(portals)('completes the $title journey with alternating controller rays', async portal => {
    await setup()
    await select('START YOUR JOURNEY')
    const blocked = await aimAt(new Vector3(0.55, 0.25, -2.3), 1)
    expect(blocked.getIntersection()?.object.isVoidObject).toBe(true)
    await fade()
    await select(`${portal.title} portal`, 1)
    await fade()
    expect(journey.state.portal).toBe(portal.id)
    await select('+ €5,000')
    expect(journey.state.budget).toBe(50_000)
    await select('CONTINUE', 1)
    await fade()
    for (const [index, question] of questions[portal.id].entries()) {
      expect(journey.state.questionIndex).toBe(index)
      await select(`A. ${question.answers[0]}`, index % 2)
      await act(async () => { vi.advanceTimersByTime(450) })
      await fade()
    }
    expect(journey.state.scene).toBe('result')
    expect(journey.state.answers).toEqual([0, 0, 0, 0])
    await act(async () => { vi.advanceTimersByTime(1200) })
    await select('BOOK A TEST DRIVE')
    expect(journey.state.mode).toBe('reveal')
    expect(renderer!.scene.findAll(node => String(node.props.name).includes('BOOKING PLACEHOLDER'))).toHaveLength(1)
    await select('EXPLORE YOUR AUDI', 1)
    await fade()
    const beforeRotation = journey.state.rotation
    await select('ROTATE RIGHT')
    expect(journey.state.rotation).toBeCloseTo(beforeRotation + Math.PI / 6)
    const inspecting = await aimAt(new Vector3(0, 1, -6.4))
    await act(async () => { inspecting.down({ timeStamp: ++time, button: 0 }) })
    expect(inspecting.getPointerCapture()).toBeDefined()
    await aimAt(new Vector3(0.4, 1, -6.4))
    expect(journey.state.rotation).toBeGreaterThan(beforeRotation + Math.PI / 6)
    await select('BACK TO YOUR AUDI', 1)
    await fade()
    expect(inspecting.getPointerCapture()).toBeUndefined()
    await act(async () => { inspecting.exit({ timeStamp: ++time }) })
    await act(async () => { vi.advanceTimersByTime(1200) })
    await select('EXPERIENCE YOUR DRIVE')
    await fade()
    await select('PLAY PREVIEW', 1)
    expect(journey.state.playing).toBe(true)
    await select('BACK TO YOUR AUDI')
    await fade()
    await select('RESTART', 1)
    await fade()
    expect(journey.state.scene).toBe('origin')
    await select('START YOUR JOURNEY')
    await fade()
    await select(`${portal.title} portal`, 1)
    await fade()
    expect(journey.state.scene).toBe('budget')
  })

  it('restores ray selection when Back cancels navigation before the scene swap', async () => {
    await setup()
    await select('START YOUR JOURNEY')
    await act(async () => { await renderer!.advanceFrames(1, .05) })
    // DOM navigation remains available while spatial interactions are intentionally blocked.
    await act(async () => { journey.dispatch({ type: 'back' }) })
    await fade()
    const dome = renderer!.scene.findAll(node => node.type === 'Mesh' && node.props.renderOrder === 10000)[0]
    expect(dome.instance.visible).toBe(false)
    await select('START YOUR JOURNEY', 1)
    await fade()
    await select('COMFORT portal')
    await fade()
    expect(journey.state.scene).toBe('budget')
  })

  it('releases slider capture on navigation and supports a returning controller', async () => {
    await setup()
    await select('START YOUR JOURNEY')
    await fade()
    await select('COMFORT portal', 1)
    await fade()
    const slider = renderer!.scene.findByProps({ name: 'Budget slider' }).findAll(node => typeof node.props.onPointerDown === 'function')[0].instance as Object3D
    const pointer = await aimAt(new Vector3(-0.06, 1.45, -3))
    await act(async () => { pointer.down({ timeStamp: ++time, button: 0 }) })
    expect(pointer.getPointerCapture()?.object).toBe(slider)
    expect(journey.state.budget).toBe(85_000)
    await aimAt(new Vector3(0.3, 1.45, -3))
    expect(journey.state.budget).toBe(100_000)
    const other = await aimAt(new Vector3(1.5, 1.45, -3), 1)
    await act(async () => {
      other.down({ timeStamp: ++time, button: 0 })
      other.up({ timeStamp: time += 50, button: 0 })
    })
    expect(journey.state.budget).toBe(100_000) // A second trigger cannot steal an active slider drag.
    await select('BACK', 1)
    await fade()
    expect(pointer.getPointerCapture()).toBeUndefined()
    await act(async () => { pointer.exit({ timeStamp: ++time }) })
    await select('COMFORT portal', 1)
    await fade()
    await select('− €5,000')
    expect(journey.state.budget).toBe(95_000)
  })
})
