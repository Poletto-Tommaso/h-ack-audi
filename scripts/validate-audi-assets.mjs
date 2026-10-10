// Node validation harness: real Three.js GLTFLoader + Meshopt and Sharp image decoding.
// This checks loading and bounds, NOT browser/GPU rendering. Tool deps are optional/offline.
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { Box3, Mesh, Line, Points } from 'three'
const resolve = createRequire(path.join(process.env.AUDI_ASSET_TOOLS || process.cwd(), 'package.json'))
const load = name => import(pathToFileURL(resolve.resolve(name)).href)
const { default: sharp } = await load('sharp')
const validator = await load('gltf-validator')
const { NodeIO } = await load('@gltf-transform/core')
const { ALL_EXTENSIONS } = await load('@gltf-transform/extensions')
// GLTFLoader's ImageBitmapLoader needs browser globals. Decode pixels accurately, but do not
// represent the plain data object as an actual GPU-uploaded/browser ImageBitmap.
if (!globalThis.ProgressEvent) globalThis.ProgressEvent = class extends Event { constructor(type, init = {}) { super(type); Object.assign(this, init) } }
globalThis.self = globalThis
globalThis.createImageBitmap = async blob => {
 const { data, info } = await sharp(Buffer.from(await blob.arrayBuffer())).ensureAlpha().raw().toBuffer({resolveWithObject:true})
 return { width:info.width, height:info.height, data, close() { this.data = null } }
}
await MeshoptDecoder.ready
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder})
const report = JSON.parse(await fs.readFile('docs/audi-asset-metrics.json'))
const inventory = JSON.parse(await fs.readFile('docs/audi-source-inventory.json'))
const desktop = path.join(os.homedir(),'Desktop')
const geometry = doc => {
 const r=doc.getRoot(), count=p=>p.getIndices()?.getCount()||p.getAttribute('POSITION')?.getCount()||0
 const tri=p=>p.getMode()===4?count(p)/3:[5,6].includes(p.getMode())?Math.max(0,count(p)-2):0
 return {triangles:r.listMeshes().reduce((s,m)=>s+m.listPrimitives().reduce((n,p)=>n+tri(p),0),0),renderedTriangles:r.listNodes().reduce((s,n)=>s+(n.getMesh()?.listPrimitives().reduce((v,p)=>v+tri(p),0)||0),0),lineSegments:r.listMeshes().reduce((s,m)=>s+m.listPrimitives().reduce((n,p)=>n+(p.getMode()===1?count(p)/2:0),0),0),drawPrimitives:r.listNodes().reduce((s,n)=>s+(n.getMesh()?.listPrimitives().length||0),0),skins:r.listSkins().length}
}
const parse = async bytes => {
 const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')
 gltf.scene.updateMatrixWorld(true)
 const bounds=new Box3().setFromObject(gltf.scene,true)
 assert.ok(!bounds.isEmpty() && Number.isFinite(bounds.min.x),'Invalid Three.js bounds')
 const textures=new Set()
 gltf.scene.traverse(o=>{if(!(o instanceof Mesh||o instanceof Line||o instanceof Points))return;o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material]){for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose()}})
 for(const t of textures){t.source.data?.close?.();t.dispose()}
 return [...bounds.min.toArray(),...bounds.max.toArray()]
}
// Validate all source GLB candidates, not just the selected smaller representation.
const candidates=[]
for(const folder of inventory.folders)for(const file of folder.files){
 if(!file.path.toLowerCase().endsWith('.glb'))continue
 const raw=new Uint8Array(await fs.readFile(path.join(desktop,file.path)))
 assert.equal(createHash('sha256').update(raw).digest('hex'),file.sha256,'Desktop source was modified')
 const checked=await validator.validateBytes(raw,{maxIssues:20})
 candidates.push({source:file.path,errors:checked.issues.numErrors,warnings:checked.issues.numWarnings})
}
const results=[]
for(const car of report){
 const bytes=new Uint8Array(await fs.readFile(`public/models/cars/${car.id}/model.glb`))
 assert.equal(bytes.length,car.bytes)
 assert.equal(createHash('sha256').update(bytes).digest('hex'),car.sha256)
 const checked=await validator.validateBytes(bytes,{maxIssues:100})
 assert.equal(checked.issues.numErrors,0,`${car.id}: invalid GLB`)
 const original=new Uint8Array(await fs.readFile(path.join(desktop,car.source)))
 const sourceBounds=await parse(original),bounds=await parse(bytes)
 const extent=Math.max(...[0,1,2].map(i=>sourceBounds[i+3]-sourceBounds[i]))
 assert.ok(bounds.every((v,i)=>Math.abs(v-sourceBounds[i])<extent*0.002),`${car.id}: optimization changed bounds`)
 const before=geometry(await io.readBinary(original)),after=geometry(await io.readBinary(bytes))
 assert.equal(after.renderedTriangles,before.renderedTriangles,`${car.id}: changed rendered triangle count`)
 car.before={...car.before,...before};car.after={...car.after,...after}
 results.push({id:car.id,threeJsLoaded:true,texturesDecoded:true,bounds,sourceBounds,validationErrors:checked.issues.numErrors,validationWarnings:checked.issues.numWarnings})
 console.log(`${car.id}: Three.js load + image decode OK; ${after.renderedTriangles} triangles; ${after.drawPrimitives} draw primitives`)
}
await fs.writeFile('docs/audi-asset-metrics.json',JSON.stringify(report,null,2)+'\n')
await fs.writeFile('docs/audi-asset-validation.json',JSON.stringify({gpuRendered:false,sourceCandidates:candidates,models:results},null,2)+'\n')
