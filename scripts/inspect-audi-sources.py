"""Read-only Desktop inventory. No extraction or mutation of source assets."""
import hashlib
import json
import pathlib
import struct
import urllib.parse
import zipfile
from collections import Counter

ROOTS = [pathlib.Path.home() / 'Desktop', pathlib.Path.home() / 'Library/Mobile Documents/com~apple~CloudDocs/Desktop']
TOKENS = ['a1 ', 'a3 ', 'a5 ', 'a6 ', 'q4 ', 'q5 ', 'rs3', 'rs6', 'tron gt']
MODEL_EXT = {'.glb', '.gltf', '.fbx', '.obj', '.blend', '.dae', '.stl'}

def inspect(path):
    raw = path.read_bytes()
    if path.suffix.lower() == '.glb':
        magic, version, length = struct.unpack_from('<III', raw)
        n, kind = struct.unpack_from('<II', raw, 12)
        if magic != 0x46546C67 or version != 2 or length != len(raw) or kind != 0x4E4F534A:
            return {'error': 'Invalid GLB header'}
        data = json.loads(raw[20:20+n])
    else:
        data = json.loads(raw)
    dependencies = []
    for item in data.get('buffers', []) + data.get('images', []):
        uri = item.get('uri', '')
        if uri and not uri.startswith('data:'):
            target = path.parent / urllib.parse.unquote(uri)
            dependencies.append({'uri': uri, 'exists': target.is_file()})
    triangles = sum((data['accessors'][p['indices']]['count'] if 'indices' in p else data['accessors'][p['attributes']['POSITION']]['count']) // 3 for m in data.get('meshes', []) for p in m['primitives'] if p.get('mode', 4) == 4)
    return {'asset': data.get('asset', {}), 'dependencies': dependencies, 'embeddedImages': sum('bufferView' in i for i in data.get('images', [])), 'images': len(data.get('images', [])), 'triangles': triangles, 'primitives': sum(len(m['primitives']) for m in data.get('meshes', [])), 'materials': len(data.get('materials', [])), 'extensionsRequired': data.get('extensionsRequired', [])}

result = {'roots': [{'path': str(p), 'exists': p.is_dir()} for p in ROOTS], 'folders': []}
for root in ROOTS:
    if not root.is_dir():
        continue
    for folder in sorted(root.iterdir()):
        if not folder.is_dir() or not any(t in folder.name.lower() for t in TOKENS):
            continue
        files, counts = [], Counter()
        for p in sorted(folder.rglob('*')):
            if not p.is_file():
                continue
            ext = p.suffix.lower()
            counts[ext] += 1
            item = {'path': str(p.relative_to(root)), 'bytes': p.stat().st_size}
            if ext in MODEL_EXT | {'.bin', '.mtl', '.png', '.jpg', '.jpeg', '.webp', '.ktx2', '.zip', '.txt'}:
                if ext in {'.gltf', '.glb'}:
                    try:
                        item['analysis'] = inspect(p)
                    except Exception as e:
                        item['analysis'] = {'error': str(e)}
                if ext in {'.obj', '.mtl'}:
                    dependencies = []
                    for line in p.read_text(errors='replace').splitlines():
                        fields = line.strip().split(maxsplit=1)
                        if len(fields) < 2:
                            continue
                        if fields[0].lower() == 'mtllib' or fields[0].lower().startswith('map_') or fields[0].lower() in {'bump', 'disp', 'decal'}:
                            uri = fields[1].strip('"')
                            dependencies.append({'uri': uri, 'exists': (p.parent / uri).is_file()})
                    item['analysis'] = {'dependencies': dependencies}
                if ext in MODEL_EXT:
                    item['sha256'] = hashlib.sha256(p.read_bytes()).hexdigest()
                if ext == '.zip':
                    try:
                        with zipfile.ZipFile(p) as z:
                            item['archivedModels'] = [n for n in z.namelist() if pathlib.Path(n).suffix.lower() in MODEL_EXT]
                    except zipfile.BadZipFile:
                        item['archiveError'] = True
                files.append(item)
        result['folders'].append({'name': folder.name, 'formats': dict(counts), 'files': files})
output = pathlib.Path('docs/audi-source-inventory.json')
output.write_text(json.dumps(result, indent=2) + '\n')
for folder in result['folders']:
    missing = [(f['path'], d['uri']) for f in folder['files'] for d in f.get('analysis', {}).get('dependencies', []) if not d['exists']]
    print(folder['name'], folder['formats'], 'missing:', missing)
print('Full recursive inventory:', output)
