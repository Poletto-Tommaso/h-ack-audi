"""Blender background render of decoded staging copies; originals remain untouched."""
import bpy, json, math, pathlib, os
from mathutils import Vector
staging = pathlib.Path(os.environ.get('AUDI_ASSET_STAGING', '/private/tmp/audi-asset-staging'))
results = []
for folder in sorted(staging.iterdir()):
    source = folder / 'inspection.glb'
    if not source.is_file(): continue
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(source))
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    coords = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    low = Vector([min(c[i] for c in coords) for i in range(3)])
    high = Vector([max(c[i] for c in coords) for i in range(3)])
    size = high-low
    center = (low+high)/2
    # Blender is Z-up; imported GLTF Y-up dimensions are [x,z,y].
    results.append({'id':folder.name,'gltfSize':[size.x,size.z,size.y],'gltfCenter':[center.x,center.z,-center.y]})
    factor = 4.5 / max(size)
    pivot = bpy.data.objects.new('Inspection normalization',None)
    bpy.context.collection.objects.link(pivot)
    for obj in list(bpy.context.scene.objects):
        if obj != pivot and obj.parent is None: obj.parent = pivot
    pivot.location = -center*factor
    pivot.scale = (factor,)*3
    scene = bpy.context.scene
    scene.world = bpy.data.worlds.new('Studio')
    scene.world.use_nodes=True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value=(0.12,0.15,0.2,1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value=0.7
    for position,energy,scale in [((3,-4,7),1800,5),((-4,2,4),1400,5),((0,5,6),1600,5)]:
        data=bpy.data.lights.new('Softbox','AREA');data.energy=energy;data.shape='DISK';data.size=scale
        obj=bpy.data.objects.new('Softbox',data);scene.collection.objects.link(obj);obj.location=position
        obj.rotation_euler=(-obj.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.object.camera_add(location=(6,-7,4.3))
    camera=bpy.context.object;camera.rotation_euler=(-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.type='ORTHO';camera.data.ortho_scale=6.3;scene.camera=camera
    scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.use_denoising=True
    scene.render.resolution_x=640;scene.render.resolution_y=440;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
    scene.view_settings.view_transform='AgX'
    scene.render.filepath=str(folder/'preview.png')
    bpy.ops.render.render(write_still=True)
    (staging/'render-report.json').write_text(json.dumps(results,indent=2))
