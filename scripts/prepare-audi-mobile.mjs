// Optional offline tooling. Original and full-detail repository GLBs remain unchanged.
// AUDI_ASSET_TOOLS=/tmp/audi-asset-tools node scripts/prepare-audi-mobile.mjs
// A5 detail-only reduction and A6 CPU pose bake are staged first; see docs/step3.md.
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
const resolve=createRequire(path.join(process.env.AUDI_ASSET_TOOLS||process.cwd(),'package.json'))
const load=name=>import(pathToFileURL(resolve.resolve(name)).href)
const {NodeIO,Logger}=await load('@gltf-transform/core')
const {ALL_EXTENSIONS}=await load('@gltf-transform/extensions')
const {dequantize,dedup,flatten,join,weld,prune,simplify,simplifyPrimitive,textureCompress,meshopt}=await load('@gltf-transform/functions')
const {MeshoptEncoder,MeshoptDecoder,MeshoptSimplifier}=await load('meshoptimizer')
const {default:sharp}=await load('sharp')
const validator=await load('gltf-validator')
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready])
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder})
const report=[]
for(const [id,ratio]of [['audi-a5-sportback',1],['audi-a6-limousine',.3],['audi-q4-etron',.23],['audi-q5',.28]]){
 const base=`public/models/cars/${id}/model.glb`
 const original=await io.read(base)
 const doc=await io.read(id==='audi-a6-limousine'?'/private/tmp/audi-asset-staging/a6-static.glb':id==='audi-a5-sportback'?'/private/tmp/audi-asset-staging/a5-static.glb':base)
 doc.getRoot().getAsset().extras=original.getRoot().getAsset().extras
 doc.setLogger(new Logger(Logger.Verbosity.ERROR))
 await doc.transform(dequantize(),dedup(),flatten(),join(),weld(),prune())
 const options={simplifier:MeshoptSimplifier,ratio,error:.002}
 if(id==='audi-q5'){
  // Preserve reflective body and glass; detail reduction alone is enough for this SUV.
  for(const mesh of doc.getRoot().listMeshes())for(const prim of mesh.listPrimitives()){
   if(!/dummy_material|Windows|Dark_glass/.test(prim.getMaterial()?.getName()||''))simplifyPrimitive(prim,options)
  }
 }else await doc.transform(simplify(options))
 await doc.transform(textureCompress({encoder:sharp,targetFormat:'webp',resize:[1024,1024],lossless:true,effort:25}),meshopt({encoder:MeshoptEncoder,level:'medium'}))
 const bytes=await io.writeBinary(doc)
 const validation=await validator.validateBytes(bytes,{maxIssues:100})
 if(validation.issues.numErrors)throw new Error(JSON.stringify(validation.issues))
 const output=`public/models/cars/${id}/model-mobile.glb`
 await fs.writeFile(output,bytes)
 const decoded=await io.readBinary(bytes)
 const r=decoded.getRoot()
 const entry={id,path:`/models/cars/${id}/model-mobile.glb`,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),triangles:r.listNodes().reduce((s,n)=>s+(n.getMesh()?.listPrimitives().reduce((v,p)=>v+(p.getIndices()?.getCount()||p.getAttribute('POSITION').getCount())/3,0)||0),0),drawPrimitives:r.listNodes().reduce((s,n)=>s+(n.getMesh()?.listPrimitives().length||0),0),skins:r.listSkins().length,errors:validation.issues.numErrors,warnings:validation.issues.numWarnings}
 report.push(entry);console.log(entry)
 // Decoded inspection copies stay outside the repository.
 r.listExtensionsUsed().filter(e=>e.extensionName==='EXT_meshopt_compression').forEach(e=>e.dispose())
 for(const t of r.listTextures())if(t.getMimeType()==='image/webp')t.setImage(await sharp(t.getImage()).png().toBuffer()).setMimeType('image/png')
 r.listExtensionsUsed().filter(e=>e.extensionName==='EXT_texture_webp').forEach(e=>e.dispose())
 await fs.mkdir(`/private/tmp/audi-mobile-staging/${id}`,{recursive:true})
 await fs.writeFile(`/private/tmp/audi-mobile-staging/${id}/inspection.glb`,await io.writeBinary(decoded))
}
await fs.writeFile('docs/audi-mobile-metrics.json',JSON.stringify(report,null,2)+'\n')
