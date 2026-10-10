# Audi asset import report — 2026-10-10

All nine requested folders were found in `~/Desktop/`, including the differently spelled `a6 limuousine`. The iCloud Desktop path was checked and does not exist on this Mac. Originals remain untouched; SHA-256 checks confirmed all 13 source GLBs were unchanged after processing. Initial disk headroom was approximately 38 GiB. Branch: `main`; working tree was clean. No LFS configuration was present. No commit or push was performed during the initial import; subsequent publication was explicitly requested by the project owner.

## Assets and destinations

Every row uses an existing, validated, self-contained GLB, optimized into another genuine GLB. No FBX/OBJ/DAE conversion was necessary. Blender 5.2.2 is installed and was used for inspection renders. Each destination is `public/models/cars/<ID>/model.glb`, with `thumbnail.webp` and `CREDITS.txt` alongside it. No original/alternate exports were duplicated in the repository.

| Source identity | ID / destination folder | Available model formats | GLB MiB, before → imported | Rendered triangles | Draw primitives | Discovery categories |
| --- | --- | --- | --- | --- | --- | --- |
| Audi A1 (source: A1 Quattro A1II) | `audi-a1` | GLB, GLTF, DAE in ZIP | 43.17 → 13.30 | 971,556 | 20 | EVERYDAY |
| Audi A3 Sedan (source: A3 2021 trim) | `audi-a3-sedan` | GLB, GLTF, alternate GLB | 13.92 → 6.41 | 194,324 | 21 | EVERYDAY |
| Audi RS 3 Sportback | `audi-rs3` | GLB, GLTF, alternate GLB | 2.99 → 1.15 | 47,320 | 10 | PERFORMANCE |
| Audi A5 Sportback S line | `audi-a5-sportback` | GLB, GLTF, alternate GLB | 33.70 → 10.44 | 950,856 | 30 | COMFORT |
| Audi A6 C8 Limousine | `audi-a6-limousine` | GLB, GLTF, FBX in ZIP | 30.84 → 7.15 | 301,880 | 128 | COMFORT |
| Audi Q4 e-tron (source: 2022 Audi Q4) | `audi-q4-etron` | GLB, GLTF, OBJ + MTL | 12.33 → 3.25 | 462,200 | 23 | E-MOTION |
| Audi Q5 (source: 2023 quattro S line Premium Plus 45 TFSI) | `audi-q5` | GLB, GLTF, FBX in ZIP | 20.00 → 6.37 | 370,347 | 26 | COMFORT / EVERYDAY |
| Audi RS 6 Avant GT | `audi-rs6` | GLB, GLTF, FBX in ZIP | 14.96 → 5.27 | 286,404 | 986 | PERFORMANCE |
| Audi RS e-tron GT | `audi-etron-gt` | GLB, GLTF, alternate GLB | 29.61 → 13.03 | 477,314 | 43 | PERFORMANCE / E-MOTION |

**Total GLBs: 201.52 → 66.36 MiB**, approximately 67% smaller. All individual imported GLBs are below 20 MiB. Thumbnails and credits add less than 0.2 MiB. Source folders also contain BIN, PNG/JPEG, license files and USDZ exports; the complete recursive inventory, source sizes, hashes, URI references, archive model listings, and source identity metadata are in [audi-source-inventory.json](audi-source-inventory.json).

## Representation selection and completeness

The top-level downloadable GLBs retain source attribution, embedded textures and material assignments, with valid GLTF companion exports available as cross-checks. All 13 GLB candidates passed the Khronos validator with zero errors. A3's alternate GLB has 16 warnings and the same triangle/material counts; the chosen top-level export has zero warnings and all declared textures. A5 and RS3 alternate exports have equivalent geometry counts; the complete downloadable GLBs with explicit source metadata were selected. The alternate RS e-tron GT has the same geometry count but different author/source metadata; it was retained only in the inventory, not assumed to be a byte-identical duplicate or mixed with the selected asset's provenance. Source checksums distinguish the exports; no byte-identical GLB duplicates were found.

All GLTF buffer/image references exist. Eight selected GLBs embed image textures; Q4 contains material colors and no image references. The **alternative Q4 OBJ/MTL references two missing JPEGs** using Windows paths (`56d444ccef8143119b6cbb6f4d85d178.jpeg` and `fffe8031164a48f4b02863b7d95b698a.jpeg`). These appear in four MTL map entries. They were not fabricated or substituted; rotor texture detail cannot be recovered from this download. The selected Q4 GLB is internally complete and renders with its supplied materials. Archived FBX/DAE dependencies were not converted or fully validated because valid GLBs are already available. No conversion failed or remains necessary for these nine vehicles.

Identity comes from source titles/material/node labels plus rendered body-style inspection, not a verified official model specification. A3 is a sedan. RS3 is a Sportback; RS6 is Avant GT; e-tron GT is the RS variant. The registry retains full source titles and no price or invented powertrain data. Market availability and current Italian catalog status remain unverified. Each model retains author, original source URL and source-declared license in `CREDITS.txt`; several source licenses include NC/SA terms and A6 has a Sketchfab Standard license. Keep this metadata with the assets and establish permitted distribution/use for any public release.

## Optimization and Quest limitations

The temporary glTF Transform 4.5.1 pipeline performs deduplication, scene flattening, compatible mesh joining, equivalent-vertex welding, unused-resource pruning, Meshopt compression/quantization and **lossless WebP** image encoding with a 2048-pixel cap. No triangle decimation or paint/material replacement was applied. UV coordinates outside the normal quantization range were preserved. In fact all original images were already 2048 pixels or smaller, so no image resolution reduction was needed. Required mesh/texture extensions are supported by the installed Three.js/Drei loaders; Meshopt decoding ships in the app and requires no remote Draco decoder.

A5's draw primitives fell from 978 to 30; RS3 from 72 to 10; Q5 from 223 to 26. File compression does not make the remaining geometry cheap to draw:

- **A1:** 971,556 triangles plus 746,079 line segments. Needs a mobile LOD and review of decorative line geometry.
- **A5:** 950,856 triangles, despite only 30 draw primitives. Needs decimation/LOD with visual comparison.
- **RS6:** 986 draw primitives remain because most source volumetric-material geometry cannot safely be joined by this pipeline. This is the highest draw-call risk; create a mobile material/mesh variant.
- **A6:** 128 draw primitives and 125 skins; bake a static inspection pose before merging into a mobile variant.
- **Q4, Q5 and RS e-tron GT:** 370k–477k triangles; profile and add mobile LODs. Texture pixels still expand in GPU memory: WebP reduces transfer size, not GPU memory. KTX2 is a future step.
- **A3 and RS e-tron GT texture memory:** approximately 177 MiB and 115 MiB respectively if expanded to RGBA8 with mipmaps, before other GPU resources. These are pixel-based estimates, not measured GPU allocations. Prioritize texture resizing/KTX2 for these cars.
- **RS3:** lightest candidate at 47,320 triangles and 10 draw primitives; use it for initial Quest profiling.

Only the chosen car loads on demand. Mounted instances lease shared loader resources; inactive geometry/materials/textures and the loader cache entry are released after a short transition grace period. No nine-car preload. Local studio reflections are generated once per mount, with no network HDR, shadows or per-frame reflection captures.

## Integration and validation

- `src/data/audiModels.ts`: nine unique assets, requested many-to-many categories, model/thumbnail paths, availability, file sizes, orientation correction and performance notes; all prices are null.
- `AudiCarModel`: per-instance scene/skeleton cloning, automatic centering/grounding and 2.25-unit normalization, source forward-axis correction to +Z, optional transforms, local studio lighting, Suspense loading state and error/unavailable placeholders.
- `recommendationAssets.ts` / `RecommendedCar`: explicit family-to-asset references for seven existing mock candidates, with the imported variant identified in desktop/VR UI. A3 Sedan is **not** substituted for A3 Sportback. A1 and A3 Sedan remain accessible through the registry/viewer for future discovery work. The recommendation engine and approved questions were not modified.
- `/dev/models`: development-only lazy entry, vehicle list/thumbnails/categories/size, model status, error retry, rotate/zoom/pan and camera reset. It imports no XR store and is excluded from production JS. `/dev/models` in a production build falls through to the normal journey.
- Every optimized GLB passed Khronos validation (zero errors). RS e-tron GT retains one harmless source warning: emissive strength has no effect on a zero emissive factor.
- Every imported GLB was parsed with the installed **Three.js GLTFLoader**, decoded with Meshopt, and all image pixels decoded with Sharp in a Node harness. Bounds agree with originals within 0.2%; rendered triangle counts are unchanged. This harness does not upload textures to a browser GPU.
- **All nine cars were rendered in Blender** from decoded inspection copies and visually inspected: [contact sheet](audi-model-contact-sheet.png). The temporary inspection GLBs are not shipped. Thumbnails are Blender renders, not browser screenshots.
- **24 automated tests pass**, including the complete journeys, category/asset integrity and normalization. TypeScript and production build pass. Existing large vendor/emulator chunk warnings remain. Lint has only three pre-existing React advisory warnings.
- The Vite viewer entry/module and all nine model HTTP routes respond correctly; production copies match their source hashes. Browser visual interaction and actual WebXR rendering have **not** been verified in this environment; computer-use browser access was unavailable. No physical Quest 3S was available. Do not treat the Blender renders or HTTP checks as headset performance validation.

Full asset metrics and loading/validator evidence are in [audi-asset-metrics.json](audi-asset-metrics.json) and [audi-asset-validation.json](audi-asset-validation.json).

## Reproduce optional offline checks

Runtime dependencies are unchanged. Asset tooling was installed outside the project and is not a runtime dependency:

```sh
npm install --prefix /tmp/audi-asset-tools @gltf-transform/cli@4.5.1 gltf-validator
python3 scripts/inspect-audi-sources.py
AUDI_ASSET_TOOLS=/tmp/audi-asset-tools node scripts/prepare-audi-assets.mjs
AUDI_ASSET_TOOLS=/tmp/audi-asset-tools node scripts/validate-audi-assets.mjs
# Optional Blender inspection (uses decoded staging copies):
/Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/render-audi-inspection.py
```

The preparation script uses the exact discovered Desktop names and writes only temporary staging output, never the originals or repository models. It does not automatically copy/re-import or commit anything. The validator requires the original Desktop files for source comparisons. Inspection renders use Blender Cycles; browser inspection is a separate manual step.

## STEP 3

Start with the RS3 on physical Quest 3S; exercise reveal/explore/driving, controller selection, VR exit/re-entry and scene changes while checking frame time and memory. Build mobile LODs for the heavy models (especially A1/A5 and RS6/A6), then compare visual quality and test fallback/error cases. Only after that expand the discovery recommendation catalog to these exact variants using verified market and price data.
