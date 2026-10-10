// Optional offline tooling; install into a temporary prefix, never into the runtime bundle.
// AUDI_ASSET_TOOLS=/tmp/audi-asset-tools node scripts/prepare-audi-assets.mjs
// Writes ONLY to AUDI_ASSET_STAGING (default /tmp/audi-asset-staging). Desktop is read-only.
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
const requireTool = createRequire(path.join(process.env.AUDI_ASSET_TOOLS || process.cwd(), 'package.json'))
const load = async name => import(pathToFileURL(requireTool.resolve(name)).href)
const { NodeIO, Logger } = await load('@gltf-transform/core')
const { ALL_EXTENSIONS } = await load('@gltf-transform/extensions')
const { dedup, flatten, join, weld, prune, meshopt, textureCompress } = await load('@gltf-transform/functions')
const { MeshoptEncoder, MeshoptDecoder } = await load('meshoptimizer')
const { default: sharp } = await load('sharp')
const validator = await load('gltf-validator')
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready])
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder })
const root = path.join(os.homedir(), 'Desktop')
const staging = process.env.AUDI_ASSET_STAGING || '/private/tmp/audi-asset-staging'
if (path.resolve(staging).startsWith(path.resolve(root))) throw new Error('Refusing to write to Desktop')
const selections = [
 ['audi-a1', 'a1 gialla model/audi_a1_quattro_a1ii.glb'],
 ['audi-a3-sedan', 'a3 sedan models/audi_a3_2021_trim.glb'],
 ['audi-rs3', 'rs3 models/2021_audi_rs3_sportback.glb'],
 ['audi-a5-sportback', 'a5 sportback sline model/audi_a5_sportback_s_line_-_2021.glb'],
 ['audi-a6-limousine', 'a6 limuousine/audi_a6_c8_limousine.glb'],
 ['audi-q4-etron', 'q4 models/2022_audi_q4.glb'],
 ['audi-q5', 'q5 model/2023_audi_q5_quattro_s_line_premium_plus_45_tfsi.glb'],
 ['audi-rs6', 'rs6 model/2024_audi_rs6_avant_gt.glb'],
 ['audi-etron-gt', 'e tron gt audi models/audi_rs_e-tron_gt.glb'],
]
const results = []
const metrics = async doc => {
 const r = doc.getRoot()
 const textures = await Promise.all(r.listTextures().map(async t => {const m = await sharp(t.getImage()).metadata(); return {name:t.getName(),width:m.width,height:m.height,mime:t.getMimeType()}}))
 const count = p => p.getIndices()?.getCount() || p.getAttribute('POSITION')?.getCount() || 0
 const triangles = p => p.getMode() === 4 ? count(p)/3 : [5,6].includes(p.getMode()) ? Math.max(0,count(p)-2) : 0
 const meshes = r.listMeshes()
 return {triangles:meshes.reduce((s,m)=>s+m.listPrimitives().reduce((n,p)=>n+triangles(p),0),0),renderedTriangles:r.listNodes().reduce((s,n)=>s+(n.getMesh()?.listPrimitives().reduce((v,p)=>v+triangles(p),0)||0),0),lineSegments:meshes.reduce((s,m)=>s+m.listPrimitives().reduce((n,p)=>n+(p.getMode()===1?count(p)/2:0),0),0),primitives:meshes.reduce((s,m)=>s+m.listPrimitives().length,0),drawPrimitives:r.listNodes().reduce((s,n)=>s+(n.getMesh()?.listPrimitives().length||0),0),materials:r.listMaterials().length,textures,animations:r.listAnimations().length,skins:r.listSkins().length}
}
for (const [id, source] of selections) {
 const input = new Uint8Array(await fs.readFile(path.join(root, source)))
 const originalCheck = await validator.validateBytes(input, {maxIssues:100})
 const doc = await io.readBinary(input)
 doc.setLogger(new Logger(Logger.Verbosity.WARN))
 const before = await metrics(doc)
 // No decimation, palette baking, or material substitution. Preserve UVs and scene-space orientation.
 await doc.transform(dedup(), flatten(), join({keepNamed:false}), weld(), prune({keepAttributes:true}),
   textureCompress({encoder:sharp,targetFormat:'webp',resize:[2048,2048],lossless:true,effort:25}),
   meshopt({encoder:MeshoptEncoder,level:'medium'}))
 const output = await io.writeBinary(doc)
 const check = await validator.validateBytes(output, {maxIssues:100})
 if (check.issues.numErrors) throw new Error(`${id}: invalid optimized GLB: ${JSON.stringify(check.issues)}`)
 // Round-trip read ensures the Meshopt-compressed file actually decodes, not just a valid header.
 const reread = await io.readBinary(output)
 const after = await metrics(reread)
 const folder = path.join(staging,id)
 await fs.mkdir(folder,{recursive:true})
 await fs.writeFile(path.join(folder,'model.glb'),output)
 // A temporary decoded GLB is useful for Blender inspection (Blender doesn't decode Meshopt).
 reread.getRoot().listExtensionsUsed().filter(e=>e.extensionName==='EXT_meshopt_compression').forEach(e=>e.dispose())
 // Blender's glTF importer does not support EXT_texture_webp; decode temporary inspection textures to PNG.
 for (const texture of reread.getRoot().listTextures()) {
  if(texture.getMimeType()==='image/webp') texture.setImage(await sharp(texture.getImage()).png().toBuffer()).setMimeType('image/png')
 }
 reread.getRoot().listExtensionsUsed().filter(e=>e.extensionName==='EXT_texture_webp').forEach(e=>e.dispose())
 await fs.writeFile(path.join(folder,'inspection.glb'),await io.writeBinary(reread))
 const provenance=doc.getRoot().getAsset().extras || {}
 const entry={id,source,sourceBytes:input.length,bytes:output.length,sha256:createHash('sha256').update(output).digest('hex'),provenance,before,after,sourceValidation:{errors:originalCheck.issues.numErrors,warnings:originalCheck.issues.numWarnings,messages:originalCheck.issues.messages},validation:{errors:check.issues.numErrors,warnings:check.issues.numWarnings,messages:check.issues.messages}}
 results.push(entry)
 await fs.writeFile(path.join(staging,'report.json'),JSON.stringify(results,null,2)+'\n')
 console.log(`${id}: ${(input.length/1048576).toFixed(2)} → ${(output.length/1048576).toFixed(2)} MiB; ${before.primitives} → ${after.primitives} primitives; ${check.issues.numErrors} errors, ${check.issues.numWarnings} warnings`)
}
console.log('Total optimized MiB:',results.reduce((s,r)=>s+r.bytes,0)/1048576)
