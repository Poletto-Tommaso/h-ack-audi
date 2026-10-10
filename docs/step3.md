# STEP 3 — immersive VR prototype

Implemented on the existing Step 2/asset-import application. The baseline production build passed before edits. Runtime libraries, approved questionnaire (`questions.ts`), recommendation scoring and original vehicle registry are unchanged. The candidate dataset now derives only the nine available imported car identities from that registry, as requested in the desktop correction. No commit or push was made.

## Experience

- **Origin:** provisional European square, instanced architecture, warm lighting and the approved two-part introduction. No historical-location claim.
- **Portals:** four large cards in a ±33° semicircle, with circuit, mountain road, urban and contemporary electric-architecture vignettes. A focus frame, description and selection hint work with either controller or mouse. No walking required.
- **Budget:** existing €25,000–€150,000+ / €5,000 logic and ray-projected slider retained. The chosen route becomes the surrounding environment and remains through all questions.
- **Questions:** the original 16 questions / 48 answers. A floating panel shows one question and three answers; progress is 01 / 04 through 04 / 04. Selecting an answer confirms it for 450 ms, then advances. Back/restart cancel pending advance; revisiting saved answers never advances automatically.
- **Reveal:** black transition, “WE FOUND YOUR DRIVE.”, then the matching body on a dark platform with studio reflections, geometry-based cached desktop shadows, lightweight VR contact shading, three existing personalized reasons, route and budget. Loading/errors and prototype affordability remain explicit.
- **Inspection:** hold the controller trigger or mouse over the vehicle and drag horizontally; large rotation buttons are an alternative. Desktop camera orbit is disabled during car drag. Original materials are preserved; generated car geometry and placeholder paint controls are not used.
- **Atmosphere preview:** stationary car in the selected world, optional slow motion of distant road markings, pause/lane controls and Back to Your Audi. No camera travel, physics, traffic or performance claims. Reduced-motion preference disables environmental motion.
- **Navigation/booking:** Back, Restart and in-session Exit VR remain spatial controls on a separate low rail. Booking stays an explicit placeholder without a verified configured URL; no completed booking is simulated.

Transitions use a stereo-safe black sphere following the head, with opacity only: 140 ms out + 140 ms in, or 100 + 100 with reduced motion. Contents swap at full blackout; world interactions are blocked during the fade. The tracked XR camera is never repositioned. Reveal copy holds for 1.2 seconds, independently of motion preference. These timings still need a physical headset feel/readability check.

## Real assets and performance

Full-detail `model.glb` files and Desktop sources are unchanged. Only the selected car loads; no nine-car preload. Existing resource leases retain a model briefly between modes and dispose inactive GPU resources. Environments use repeated instanced geometry, simple materials and a few lights. No postprocessing, particles or per-frame reflection captures. Desktop presentation uses one cached shadow map; VR disables shadow-map rendering.

### Vehicle lighting

The imported PBR materials, UVs and textures remain unchanged. A locally generated HDR environment contains five neutral softboxes, prefiltered once with Three.js [PMREMGenerator](https://threejs.org/docs/pages/PMREMGenerator.html) at 256 px. Fixed world-space key/fill lights replace the lights previously attached to the rotating car. Journey and development viewer share ACES tone mapping, exposure 0.95, sRGB output and environment intensity 0.9.

Desktop presentation uses a 1024 px PCF directional shadow map, refreshed after the visible car loads or rotates rather than every frame. Hidden reveal content waits before refreshing its shadow. Opaque geometry casts shadows; transparent/transmissive glass is excluded to avoid solid window-shaped shadows. VR retains inexpensive ground contact shading and no additional shadow-map pass. The nine source GLBs pass Three.js loading and material checks: color textures use sRGB; normal, roughness, metalness and occlusion maps remain linear data. Source-file hashes are unchanged. The new browser lighting still requires a visual check; Blender asset previews do not validate this WebGL configuration.

Four **additional** `model-mobile.glb` files total **12.30 MiB**. All are standalone, Meshopt-compressed, with lossless WebP textures capped at 1024 px. WebP saves transfer size, not GPU texture memory. These are preview copies, not verified automotive specifications.

| Vehicle preview | MiB | Triangles | Draw primitives | Skin count |
| --- | ---: | ---: | ---: | ---: |
| A5 Sportback | 3.85 | 273,458 | 30 | 0 |
| A6 Limousine | 3.61 | 120,990 | 20 | 0 |
| Q4 e-tron | 0.98 | 107,191 | 23 | 0 |
| Q5 | 3.86 | 154,245 | 26 | 0 |

A5 preserves its reflective painted exterior, glass and mirrors; detail geometry is reduced more conservatively on wheels. An initial whole-car reduction introduced visible paint artifacts and was rejected. A6's supplied pose is baked using Three.js skinning before merging, removing 125 skins and reducing 128 draw primitives to 20. The first Blender pose-bake produced a deformation and was rejected. The final four copies were decoded and **actually rendered in Blender**, then inspected: [mobile contact sheet](audi-mobile-contact-sheet.png). Detail is reduced, especially interior/trim; compare in the headset before further decimation.

RS3 uses its existing light asset: 47,320 triangles, 10 draw primitives, about 1.15 MiB. No duplicate copy is created. A5 remains the highest geometry load among the mobile copies; none has a certified Quest frame-rate measurement yet.

`recommendationAssets.ts` now resolves all nine imported identities. Desktop reveal, exploration and driving use the exact original `model.glb`; VR can select an optimized copy of the same car. RS6 is enabled despite its profiling needs. Loading/errors show a status message only, never a generated substitute.

The reported S3 placeholder came from a mismatch between the old mock candidate catalog and the actual GLB collection. Candidates now derive their asset ID, display name and categories from the unchanged registry: A1, A3 Sedan, RS 3 Sportback, A5 Sportback S line, A6 C8 Limousine, Q4 e-tron, Q5, RS 6 Avant GT and RS e-tron GT. S3/S5 and other missing vehicles are no longer candidates. The matching formula and approved questions remain unchanged. All nine imported cars are reachable through the demo questionnaire. Synthetic tiers/traits remain fictional; no vehicle price or affordability is asserted.

## Validation evidence

- Production build passed before and after implementation; strict TypeScript passes.
- **44 automated tests pass**: all four portal journeys, budget limits/persistence, recommendation/no-match, asset/category checks, desktop controls, and new Three test-renderer scene interactions. New checks cover fades, four automatic questions, matching A5 original selection and all nine desktop asset identities, controller-ray drag/capture, two-controller focus, Back cancellation, driving, restart, fixed lights during rotation, preservation of imported materials and cached shadow refresh after reveal. Six [controller regressions](vr-interactions.md) use the actual XR raycast/event engine instead of directly firing mesh handlers.
- New test renderer is development-only; runtime dependency versions are unchanged.
- Every mobile GLB passed Khronos validation with **zero errors** and loaded in the installed **Three.js GLTFLoader** with Meshopt and Sharp pixel decoding. Metrics include checksums, dimensions and material counts: [audi-mobile-metrics.json](audi-mobile-metrics.json).
- A6 retains **two warnings** about runtime-generated tangent space after the static pose bake. These are not missing textures; normal-mapped details require browser/headset inspection across implementations.
- All four copies were rendered in **Blender**, not a browser GPU. Test renderer mocks text textures/model upload and does not prove WebXR hardware behavior.
- Browser visual automation remains unavailable because Chrome computer-use access was not approved. Following the controller fix, the user confirmed on the connected Quest 3S that portal selection opens the budget. Full journey, stereo readability, controller drag behavior, GPU upload, frame time, memory and session re-entry remain manual checks.
- Lint passes with two advisory warnings in the existing origin phase hook / Context export structure. The dependency's Three CommonJS deprecation notice and existing Vite chunk-size warnings are non-fatal.

## Run and test

```sh
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

Desktop: open the printed Vite URL. Use **COMFORT → €45,000 → A / A / A / A** for a real A5 preview, or **E-MOTION → €45,000 → A / A / A / A** for Q4. Inspect the studio reveal, drag rotation, Back, atmosphere preview, booking placeholder and Restart. **PERFORMANCE → €65,000 → four answers** now loads the original RS 3 Sportback rather than an S3 blockout. Test €25,000 separately for no-match; editing budget must keep answers.

Quest: `npm run dev:quest`, same Wi-Fi, open the printed **HTTPS Network URL** in Meta Quest Browser, then **ENTER VR**. A self-signed certificate may require manual handling; if the origin remains insecure use USB localhost forwarding or trusted HTTPS as described in [README](../README.md#meta-quest-3s-testing). Complete the same demo path with controller rays/triggers only. Verify slider drag, both controllers, Back during answer confirmation, both vehicle modes, Exit VR and re-entry. Do not use plain HTTP on a LAN address.

## Optional offline asset reproduction

The scripts require the decoded staging files generated by the prior import workflow and optional tools outside runtime dependencies. They write temporary staging output and **additional mobile copies** only; review/retain generated copies deliberately.

```sh
npm install --prefix /tmp/audi-asset-tools @gltf-transform/cli@4.5.1 gltf-validator
# Prior import preparation generates /private/tmp/audi-asset-staging/*/inspection.glb:
AUDI_ASSET_TOOLS=/tmp/audi-asset-tools node scripts/prepare-audi-assets.mjs
/Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/bake-audi-static.py
AUDI_ASSET_TOOLS=/tmp/audi-asset-tools node scripts/bake-audi-skins.mjs
AUDI_ASSET_TOOLS=/tmp/audi-asset-tools node scripts/prepare-audi-mobile.mjs
AUDI_ASSET_TOOLS=/tmp/audi-asset-tools node scripts/validate-audi-mobile.mjs
AUDI_ASSET_STAGING=/private/tmp/audi-mobile-staging /Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/render-audi-inspection.py
```

Next development step: test these two real-model journeys on Quest 3S, profile frame time/memory, check text and interaction reach, then add optimized exact missing variants and verified pricing. Avoid expanding effects before hardware validation.

## Files changed

Modified:

```text
README.md
docs/audi-assets.md
package-lock.json
package.json
public/models/cars/audi-a5-sportback/CREDITS.txt
public/models/cars/audi-a6-limousine/CREDITS.txt
public/models/cars/audi-q4-etron/CREDITS.txt
public/models/cars/audi-q5/CREDITS.txt
scripts/render-audi-inspection.py
src/App.css
src/components/AudiCarModel.tsx
src/components/CarStudioLighting.tsx
src/components/ExperienceCanvas.tsx
src/components/JourneyNavigation.tsx
src/components/JourneyPanel.tsx
src/components/OriginEnvironment.tsx
src/components/PortalCard.tsx
src/components/PortalLandscape.tsx
src/components/RecommendedCar.tsx
src/dev/ModelViewer.tsx
src/data/portals.ts
src/data/recommendationAssets.ts
src/logic/modelAssets.test.ts
src/logic/xrStore.ts
src/scenes/BudgetScene.tsx
src/scenes/DiscoverYourDriveScene.tsx
src/scenes/DrivingPreviewScene.tsx
src/scenes/FindYourWorldScene.tsx
src/scenes/JourneyScene.tsx
src/scenes/OriginScene.tsx
src/scenes/VehicleExplorationScene.tsx
src/scenes/YourAudiScene.tsx
src/state/JourneyContext.tsx
```

Added:

```text
docs/audi-mobile-contact-sheet.png
docs/audi-mobile-metrics.json
docs/step3.md
public/models/cars/audi-a5-sportback/model-mobile.glb
public/models/cars/audi-a6-limousine/model-mobile.glb
public/models/cars/audi-q4-etron/model-mobile.glb
public/models/cars/audi-q5/model-mobile.glb
scripts/bake-audi-skins.mjs
scripts/bake-audi-static.py
scripts/prepare-audi-mobile.mjs
scripts/validate-audi-mobile.mjs
src/components/CarKeyLighting.tsx
src/components/CarPresentation.test.tsx
src/components/ImmersiveJourney.test.tsx
src/components/InstancedBoxes.tsx
src/components/PortalEnvironment.tsx
src/components/SceneTransition.tsx
src/components/SpatialPanel.tsx
src/components/VehicleInspection.tsx
src/components/VehicleStage.tsx
src/hooks/useReducedMotion.ts
src/hooks/useCarShadow.ts
src/logic/carLighting.ts
src/logic/sceneTransition.ts
```
