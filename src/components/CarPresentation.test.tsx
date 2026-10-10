// @vitest-environment jsdom
import ReactThreeTestRenderer, { act } from '@react-three/test-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BoxGeometry, Group, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Vector3 } from 'three'
import type { DirectionalLight, Material } from 'three'
import { AudiCarModel } from './AudiCarModel'
import { CarKeyLighting } from './CarKeyLighting'
import { createCarStudioEnvironment } from '../logic/carLighting'

// Test the same clone/shadow lifecycle with a tiny GLTF fixture; GPU radiance remains a visual check.
const fixture = vi.hoisted(() => ({ scene: undefined as Group | undefined }))
vi.mock('@react-three/drei', () => ({ useGLTF: () => ({ scene: fixture.scene }) }))
vi.mock('./CarStudioLighting', () => ({ CarStudioLighting: () => null }))
vi.mock('../hooks/useModelResources', () => ({ useModelResources: () => {} }))
vi.mock('./SceneLabel', () => ({ SceneLabel: () => null }))
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
let renderer: Awaited<ReturnType<typeof ReactThreeTestRenderer.create>> | undefined
let sourceBody: Mesh
let sourceGlass: Mesh
afterEach(async () => {
  await renderer?.unmount()
  renderer = undefined
  for (const mesh of [sourceBody, sourceGlass]) {
    mesh?.geometry.dispose()
    ;(mesh?.material as Material | undefined)?.dispose()
  }
})

describe('car presentation lighting and source preservation', () => {
  it('keeps stage lights fixed while rotating the imported clone and refreshes cached shadows after reveal', async () => {
    sourceBody = new Mesh(new BoxGeometry(2, 1, 4), new MeshStandardMaterial({ color: '#ab1520', metalness: 0.7, roughness: 0.3 }))
    sourceBody.name = 'Imported painted body'
    sourceGlass = new Mesh(new BoxGeometry(1, 0.3, 1), new MeshPhysicalMaterial({ transmission: 1, roughness: 0.1 }))
    sourceGlass.name = 'Imported glass'
    const source = new Group()
    source.add(sourceBody, sourceGlass)
    fixture.scene = source
    const tree = (visible: boolean, rotation: number) => <>
      <CarKeyLighting shadows />
      <group visible={visible}><AudiCarModel vehicleId="audi-rs3" rotation={[0, rotation, 0]} lighting={false} /></group>
    </>
    renderer = await ReactThreeTestRenderer.create(tree(false, 0))
    const light = renderer.scene.findAll(node => node.type === 'DirectionalLight')[0].instance as DirectionalLight
    const initialPosition = light.getWorldPosition(new Vector3()).clone()
    light.shadow.needsUpdate = false
    await act(async () => { await renderer!.advanceFrames(1, .016) })
    expect(light.shadow.needsUpdate).toBe(false) // Hidden reveal never bakes an empty shadow map.
    await renderer.update(tree(true, Math.PI / 3))
    await act(async () => { await renderer!.advanceFrames(1, .016) })
    expect(light.shadow.needsUpdate).toBe(true)
    expect(light.shadow.autoUpdate).toBe(false)
    renderer.scene.instance.updateMatrixWorld(true)
    expect(light.getWorldPosition(new Vector3()).toArray()).toEqual(initialPosition.toArray())
    const allMeshes = renderer.scene.instance.getObjectsByProperty('isMesh', true) as Mesh[]
    const clonedBody = allMeshes.find(mesh => mesh.name === sourceBody.name)!
    const clonedGlass = allMeshes.find(mesh => mesh.name === sourceGlass.name)!
    expect(clonedBody).not.toBe(sourceBody)
    expect(clonedBody.geometry).toBe(sourceBody.geometry)
    expect(clonedBody.material).toBe(sourceBody.material)
    expect(sourceBody.castShadow).toBe(false)
    expect(clonedBody.castShadow).toBe(true)
    expect(clonedGlass.castShadow).toBe(false)
    light.shadow.needsUpdate = false
    await act(async () => { await renderer!.advanceFrames(2, .016) })
    expect(light.shadow.needsUpdate).toBe(false)
    await renderer.update(tree(true, Math.PI / 2))
    await act(async () => { await renderer!.advanceFrames(1, .016) })
    expect(light.shadow.needsUpdate).toBe(true)
  })

  it('provides neutral HDR softboxes facing the vehicle without changing its source material', () => {
    const studio = createCarStudioEnvironment()
    for (const mesh of studio.scene.children as Mesh[]) {
      const direction = mesh.getWorldDirection(new Vector3())
      const towardVehicle = new Vector3(0, 0.7, 0).sub(mesh.position).normalize()
      expect(direction.dot(towardVehicle)).toBeCloseTo(1)
      const material = mesh.material as MeshStandardMaterial
      expect(material.toneMapped).toBe(false)
      expect(material.color.r).toBeGreaterThan(1)
      expect(material.color.r).toBe(material.color.g)
      expect(material.color.g).toBe(material.color.b)
    }
    studio.dispose()
  })
})
