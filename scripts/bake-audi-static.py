"""Reduce A5 detail geometry only; preserve the reflective exterior and source normals."""
import bpy
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath='/private/tmp/audi-asset-staging/audi-a5-sportback/inspection.glb')
bpy.context.view_layer.update()
for obj in list(bpy.context.scene.objects):
 if obj.type != 'MESH': continue
 materials = [m.name for m in obj.data.materials if m]
 if any('Ibis_White' in name or name.endswith('_Windows') or name.endswith('_Mirrors') for name in materials): continue
 if len(obj.data.polygons) < 1000: continue
 bpy.ops.object.select_all(action='DESELECT')
 obj.select_set(True)
 bpy.context.view_layer.objects.active=obj
 decimate=obj.modifiers.new('Mobile detail collapse','DECIMATE')
 decimate.ratio=0.5 if any('Rims' in name or 'Tires' in name for name in materials) else 0.12
 decimate.use_collapse_triangulate=True
 bpy.ops.object.modifier_apply(modifier=decimate.name)
bpy.ops.export_scene.gltf(filepath='/private/tmp/audi-asset-staging/a5-static.glb',export_format='GLB',export_animations=False,export_cameras=False,export_lights=False)
