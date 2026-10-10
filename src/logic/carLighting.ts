import { ACESFilmicToneMapping, Color, Mesh, MeshBasicMaterial, PlaneGeometry, Scene, SRGBColorSpace, Vector3 } from 'three'
import type { Object3D } from 'three'

// Linear-light HDR radiance; the renderer tone maps it once, then outputs sRGB.
export const carRendererSettings = { toneMapping: ACESFilmicToneMapping, toneMappingExposure: 0.95, outputColorSpace: SRGBColorSpace }
export const carEnvironmentIntensity = 0.9

/** Local automotive studio: broad ceiling/key/fill panels and narrow rear separation. */
export function createCarStudioEnvironment() {
  const scene = new Scene()
  scene.name = 'Fixed automotive softbox environment'
  scene.background = new Color().setRGB(0.035, 0.035, 0.035)
  const geometry = new PlaneGeometry(1, 1)
  const panels = [
    { name: 'Ceiling softbox', at: [0, 7, 0], size: [9, 3], radiance: 5 },
    { name: 'Left key softbox', at: [-6, 3.5, 1], size: [6, 3], radiance: 7 },
    { name: 'Right fill softbox', at: [6, 3, -1], size: [5, 3], radiance: 3.5 },
    { name: 'Rear rim strip', at: [0, 3, -8], size: [8, 1.3], radiance: 5.5 },
    { name: 'Front glass fill', at: [0, 2, 7], size: [6, 2], radiance: 2 },
  ]
  for (const panel of panels) {
    const material = new MeshBasicMaterial({ toneMapped: false })
    material.color.setScalar(panel.radiance)
    const mesh = new Mesh(geometry, material)
    mesh.name = panel.name
    mesh.position.fromArray(panel.at)
    mesh.scale.set(panel.size[0], panel.size[1], 1)
    mesh.lookAt(new Vector3(0, 0.7, 0))
    scene.add(mesh)
  }
  const dispose = () => {
    geometry.dispose()
    scene.traverse(node => { if (node instanceof Mesh) (node.material as MeshBasicMaterial).dispose() })
  }
  return { scene, dispose }
}

/** Cached desktop shadow maps are refreshed only after car loading, placement or rotation. */
export function invalidateCarShadows(scene: Object3D) {
  scene.traverse(node => {
    if ('isDirectionalLight' in node && 'shadow' in node) {
      const shadow = node.shadow as { needsUpdate: boolean }
      shadow.needsUpdate = true
    }
  })
}
