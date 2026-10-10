// Optional offline check: actual Three.js decode + pixel decode, not browser/GPU rendering.
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { Box3 } from 'three'
const resolve = createRequire(path.join(process.env.AUDI_ASSET_TOOLS || process.cwd(), 'package.json'))
const load = name => import(pathToFileURL(resolve.resolve(name)).href)
const { default: sharp } = await load('sharp')
const validator = await load('gltf-validator')
globalThis.self = globalThis
if (!globalThis.ProgressEvent) globalThis.ProgressEvent = class extends Event { constructor(t, i = {}) { super(t); Object.assign(this, i) } }
globalThis.createImageBitmap = async blob => {
  const { data, info } = await sharp(Buffer.from(await blob.arrayBuffer())).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return { width: info.width, height: info.height, data, close() { this.data = null } }
}
await MeshoptDecoder.ready
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
const report = JSON.parse(await fs.readFile('docs/audi-mobile-metrics.json'))
for (const car of report) {
  const bytes = await fs.readFile(`public${car.path}`)
  assert.equal(createHash('sha256').update(bytes).digest('hex'), car.sha256)
  const parsed = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '')
  parsed.scene.updateMatrixWorld(true)
  const bounds = new Box3().setFromObject(parsed.scene, true)
  assert.ok(!bounds.isEmpty() && Number.isFinite(bounds.min.x))
  const checked = await validator.validateBytes(new Uint8Array(bytes), { maxIssues: 100 })
  assert.equal(checked.issues.numErrors, 0, `${car.id}: invalid GLB`)
  const textures = new Set(), materials = new Set()
  parsed.scene.traverse(mesh => {
    if (!mesh.isMesh) return
    mesh.geometry.dispose()
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      materials.add(material)
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value)
    }
  })
  car.materials = materials.size
  car.textures = [...textures].map(t => ({ width: t.source.data.width, height: t.source.data.height }))
  assert.ok(car.textures.every(t => t.width <= 1024 && t.height <= 1024), `${car.id}: oversized texture`)
  car.validationMessages = checked.issues.messages.filter(x => x.severity <= 1)
  car.threeJsLoaded = true
  car.bounds = [...bounds.min.toArray(), ...bounds.max.toArray()]
  car.browserGpuRendered = false
  for (const texture of textures) { texture.source.data.close(); texture.dispose() }
  for (const material of materials) material.dispose()
  console.log(`${car.id}: valid, Three.js loaded, ${car.triangles} triangles, ${car.drawPrimitives} primitives, ${car.warnings} warnings`)
}
await fs.writeFile('docs/audi-mobile-metrics.json', JSON.stringify(report, null, 2) + '\n')
