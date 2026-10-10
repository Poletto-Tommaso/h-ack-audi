// Bake A6's supplied default pose with the same Three.js skinning used at runtime.
// No Desktop or full-detail GLB writes. Optional offline glTF Transform tooling only.
import fs from 'node:fs/promises'
import path from 'node:path'
import {createRequire} from 'node:module'
import {pathToFileURL} from 'node:url'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js'
import {Matrix3,Matrix4,Vector3,Vector4} from 'three'
const requireTool=createRequire(path.join(process.env.AUDI_ASSET_TOOLS||process.cwd(),'package.json'))
const load=name=>import(pathToFileURL(requireTool.resolve(name)).href)
const {NodeIO}=await load('@gltf-transform/core')
const {ALL_EXTENSIONS}=await load('@gltf-transform/extensions')
const {default:sharp}=await load('sharp')
globalThis.self=globalThis
globalThis.ProgressEvent=class extends Event{constructor(t,i={}){super(t);Object.assign(this,i)}}
globalThis.createImageBitmap=async b=>{const {data,info}=await sharp(Buffer.from(await b.arrayBuffer())).ensureAlpha().raw().toBuffer({resolveWithObject:true});return{width:info.width,height:info.height,data,close(){}}}
await MeshoptDecoder.ready
const bytes=await fs.readFile('public/models/cars/audi-a6-limousine/model.glb')
const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')
gltf.scene.updateMatrixWorld(true)
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder})
const doc=await io.readBinary(bytes),root=doc.getRoot(),buffer=root.listBuffers()[0]
const position=new Vector3(),normal=new Vector3(),joints=new Vector4(),weights=new Vector4(),bone=new Matrix4(),blended=new Matrix4(),normalMatrix=new Matrix3()
const baked=new Set()
gltf.scene.traverse(mesh=>{
 if(!mesh.isSkinnedMesh)return
 mesh.skeleton.update()
 const assoc=gltf.parser.associations.get(mesh)
 if(assoc?.meshes===undefined||assoc.primitives===undefined)throw Error('Missing mesh association')
 const prim=root.listMeshes()[assoc.meshes].listPrimitives()[assoc.primitives]
 if(baked.has(prim))throw Error('Shared skinned primitive requires per-node cloning')
 baked.add(prim)
 const geometry=mesh.geometry,source=geometry.attributes.position,normals=geometry.attributes.normal
 const p=new Float32Array(source.count*3),n=new Float32Array(source.count*3)
 for(let i=0;i<source.count;i++){
  position.fromBufferAttribute(source,i);mesh.applyBoneTransform(i,position);position.toArray(p,i*3)
  if(normals){
   joints.fromBufferAttribute(geometry.attributes.skinIndex,i);weights.fromBufferAttribute(geometry.attributes.skinWeight,i)
   blended.elements.fill(0)
   for(let j=0;j<4;j++){
    bone.fromArray(mesh.skeleton.boneMatrices,joints.getComponent(j)*16)
    const weight=weights.getComponent(j)
    for(let k=0;k<16;k++)blended.elements[k]+=bone.elements[k]*weight
   }
   blended.premultiply(mesh.bindMatrixInverse).multiply(mesh.bindMatrix)
   normal.fromBufferAttribute(normals,i).applyNormalMatrix(normalMatrix.getNormalMatrix(blended)).toArray(n,i*3)
  }
 }
 prim.setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(p).setBuffer(buffer))
 if(normals)prim.setAttribute('NORMAL',doc.createAccessor().setType('VEC3').setArray(n).setBuffer(buffer))
 // Generate derivative tangent space at runtime after the pose bake.
 prim.setAttribute('TANGENT',null)
 for(const name of prim.listSemantics())if(/^(JOINTS|WEIGHTS)_/.test(name))prim.setAttribute(name,null)
})
for(const node of root.listNodes())node.setSkin(null)
for(const skin of root.listSkins())skin.dispose()
for(const extension of root.listExtensionsUsed())if(extension.extensionName==='EXT_meshopt_compression')extension.dispose()
await fs.writeFile('/private/tmp/audi-asset-staging/a6-static.glb',await io.writeBinary(doc))
console.log(`Baked ${baked.size} A6 primitives to a temporary static GLB.`)
