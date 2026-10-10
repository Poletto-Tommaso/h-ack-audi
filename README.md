# AUDI — FIND YOUR DRIVE

A five-scene React / TypeScript / Vite prototype for Meta Quest 3S and desktop. Step 3 adds a provisional European square, four spatial portals, persistent route environments, comfortable fades, a real-model studio reveal and controller-driven inspection. Existing approved questions and deterministic, explicitly fictional matching data are retained.

## Run

Use Node **22.12+** (Node 24 recommended; `.nvmrc`) and npm.

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite, normally **http://localhost:5173**. Use `npm ci` when installing exactly from the lockfile. If Node is installed through nvm, load nvm and run `nvm use` first.

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

The production build is generated in `dist/`. Public WebXR hosting requires trusted HTTPS. These commands do not publish or push anything.

## The journey

1. **THE ORIGIN** — “WELCOME TO AUDI.” / “Your journey starts here.” changes after 2.8 seconds to “WHAT DRIVES YOU?” / “Discover the Audi that moves you.” Select **START YOUR JOURNEY**. The ring sculpture remains interactive. The European architectural square is provisional and does not claim to reconstruct a verified historical location.
2. **WHAT DRIVES YOU?** — Select one of four large portals arranged in a semicircle: PERFORMANCE (circuit), COMFORT (panoramic road), EVERYDAY (city), E-MOTION (contemporary electric architecture). Each has a 3D vignette, readable label and multi-controller focus feedback. The chosen world remains behind budget and question panels.
3. **SET YOUR BUDGET** — Use the slider, minus, or plus. Range €25,000–€150,000+, default €45,000, step €5,000. **CONTINUE** saves progress.
4. **DISCOVER YOUR DRIVE** — Four questions for the selected portal, one at a time, with three answers each. All **16 approved questions and 48 answers are reproduced unchanged** in `src/data/questions.ts`. Selecting an answer gives confirmation and advances automatically after 450 ms. Back cancels pending advance; revisiting a saved answer never advances by itself. Optional HTML Next controls remain available.
5. **YOUR AUDI** — See a deterministic prototype suggestion, three personalized explanations, selected route/budget, and a matching imported body asset where available, on a dark presentation platform. No eligible candidate produces an explicit no-match state with **ADJUST BUDGET**.

**EXPLORE YOUR AUDI** opens the vehicle inspection view. Hold the mouse or controller trigger over the car and drag horizontally, or use the large rotate buttons. Original imported geometry, paint and materials are preserved; no generated vehicle is used, including during loading or errors. **EXPERIENCE YOUR DRIVE** places the stationary vehicle in the selected route environment. Optional Play moves only distant road markings; the viewpoint stays still. Reduced-motion settings disable this movement. This is an atmosphere preview, not simulated vehicle performance.

**BACK** steps through individual questions and scenes; within exploration/preview it returns to the result. **RESTART** clears the journey to the initial state. React Context keeps route, budget, answers, and reveal controls synchronized between HTML and the 3D world. Re-selecting the same portal preserves answers; changing portal clears incompatible answers while keeping the budget. State persists across scene changes and VR entry/exit, **not page reloads**. There is no backend, analytics, or account.

## Desktop testing

- Start a journey and select each portal in separate runs. All steps are selectable directly in 3D, or through the responsive, keyboard-accessible HTML controls.
- Test hovering and clicking the 3D portals, then clicking/dragging the budget slider. Use minus/plus at the limits and check the €150,000+ display.
- Select an answer and check the brief confirmation and automatic advance. Go Back, edit an answer, and confirm it remains selected when revisiting. Select Back immediately after answering to check cancellation.
- Reliable real-model demo: **COMFORT → €45,000 → A / A / A / A → Audi A5 Sportback asset**, or **E-MOTION → €45,000 → A / A / A / A → Audi Q4 e-tron asset**. Inspect the reveal, mouse drag, rotate buttons, Back and stationary preview. Every successful recommendation resolves to one of the nine imported vehicles. **PERFORMANCE → €65,000 → any four answers** loads the actual RS 3 Sportback GLB.
- At €25,000, complete a route and confirm the honest no-match state. Adjust the budget and continue; previous answers remain available.
- Select **BOOK A TEST DRIVE** with the default configuration and confirm a booking placeholder is displayed. No external page or completed booking is simulated.
- Restart, resize the page, and use Tab/Enter to operate the HTML controls. On browsers without immersive VR, **ENTER VR** stays disabled with an explanatory message.
- Drag the 3D view for a limited orbit. Controls reset between scenes and unmount in VR so tracking owns the camera.

## Meta Quest 3S testing

### Wi-Fi / HTTPS

```sh
npm run dev:quest
```

1. Connect the computer and headset to the same Wi-Fi. Allow the local Vite port through the computer's firewall if required.
2. In **Meta Quest Browser**, open the printed **Network HTTPS URL**, e.g. `https://192.168.1.100:5173`. Plain HTTP on a LAN IP does not satisfy the secure-context requirement.
3. The HTTPS plugin generates a self-signed development certificate in Vite's ignored `node_modules/.vite` cache. Handle the local certificate warning manually. If the browser still does not consider the origin secure, use USB localhost below or a trusted HTTPS host; do not disable browser security flags.
4. Select **ENTER VR** and grant immersive-session access. Look around to check stereo rendering and positional tracking.
5. Aim either controller ray at **START YOUR JOURNEY** and press/release the trigger. Complete portal selection, budget, all four questions, and the result **entirely inside VR**.
6. On the slider, press/hold the trigger and move the ray along the track; also test point-and-select and the large minus/plus buttons. The slider captures a single pointer and projects its ray onto the track plane.
7. Test Back, Restart, vehicle trigger-drag/rotation, and driving Play/Pause/Left/Right. Navigation is on a separate low rail in front of the main panel. Test both controllers and verify hover remains correct when one ray leaves a target.
8. Test €25,000 no-match recovery, exit using the in-world **EXIT VR** control, and re-entry. Also exit through the Quest system menu. State should survive session exit.
9. Deny a session request once; confirm a visible error and retry. For a configured booking link in VR, follow the instruction to exit and open it from the HTML page.

All required controls/instructions are 3D meshes and text textures. The experience does not depend on a DOM overlay in the headset.

### USB localhost alternative

Enable Developer Mode / USB debugging, install Android Platform Tools, connect the headset over USB, and authorize the computer in the headset.

```sh
npm run dev
# In another terminal:
adb devices
adb reverse tcp:5173 tcp:5173
```

Open **http://localhost:5173** in Meta Quest Browser. Loopback is treated as a trustworthy origin; reverse mapping forwards the headset's localhost to the computer. Replace both ports if Vite uses a different port. Inspect the headset tab from `chrome://inspect/#devices` on the computer for console errors and frame timing.

See [Meta's browser debugging workflow](https://developers.meta.com/vr/documentation/web/browser-remote-debugging/) and [headset testing guide](https://developers.meta.com/vr/documentation/iwsdk/guides/02-testing-experience/). For production-build HTTPS testing on Wi-Fi, use `npm run preview -- --mode quest`.

## Recommendation data — read before a demo

`src/logic/recommendation.ts` is a pure deterministic engine, separate from React and the scenes. `src/data/mockModels.ts` derives the nine candidate identities, display names and categories directly from the available assets in `audiModels.ts`, alongside **fictional traits and synthetic eligibility tiers**. Candidates without a supplied GLB are excluded. No candidate has a price field. These asset-backed demo profiles are not Audi price estimates; RS3 eligibility in a demo tier does not assert it can be purchased for that budget.

The selected budget maps to an intentionally artificial demo tier:

| Selected budget | Synthetic tier |
| --- | --- |
| €25,000–€30,000 | 0 — no candidates |
| €35,000–€45,000 | 1 |
| €50,000–€65,000 | 2 |
| €70,000–€90,000 | 3 |
| €95,000–€115,000 | 4 |
| €120,000–€150,000+ | 5 |

**These cutoffs are neither Audi prices nor price estimates.** They only exercise budget filtering and no-match behavior. Each candidate has a demo tier; the engine first filters by portal and tier, then scores overlap with traits from all four answers. Ties prefer the lower demo tier and then a stable ID. There is no random recommendation. The explanations quote the user's priorities; fictional matching traits must not be read as official model specifications.

Every suggested result is marked **PROTOTYPE SUGGESTION / MOCK MATCH** and real affordability is explicitly unverified. A no-match is never replaced with an out-of-tier suggestion. Production matching must replace this dataset with verified, dated, market-specific models, trims, availability, and prices; compare actual budget eligibility before scoring preferences. The €150,000+ selection is open-ended, not a verified unlimited budget.

## Booking configuration

No verified official test-drive URL has been supplied, so the default action is a clearly labeled placeholder. No booking is made in this application.

Copy `.env.example` to `.env.local` and fill all three values **only after manually verifying the official test-drive page for the chosen market**:

```text
VITE_AUDI_TEST_DRIVE_URL=
VITE_AUDI_TEST_DRIVE_VERIFIED_ON=
VITE_AUDI_TEST_DRIVE_SOURCE=
```

`VERIFIED_ON` uses `YYYY-MM-DD`; `SOURCE` is the official page used for verification. The URL validator accepts HTTPS pages on `audi.com`, `audi.it`, `audi.de`, `audi.co.uk`, `audiusa.com`, or their subdomains. Other official market domains require an explicit allowlist update after verification. Merely passing the domain check is not a substitute for checking the page. Restart Vite after changing configuration.

On desktop, a valid configured action opens the official page in a separate tab. In VR it displays instructions to exit and use the HTML action, avoiding invisible browser navigation during an immersive session. The official website owns any actual booking.

## Structure and important files

```text
src/
  components/   Canvas, reusable controls, AudiCarModel, studio lighting, loading/error states
  scenes/       Origin, portals, budget, questionnaire, result, exploration, driving preview
  state/        JourneyContext.tsx — one shared provider above desktop UI and Canvas
  data/         portals, questions, mock candidates, audiModels registry, asset associations
  logic/        Journey, budget, recommendation, XR store, model normalization
  hooks/        VR/session, pointer feedback, booking, model resource lifetime
  dev/          Development-only model viewer (separate from XR)
  assets/       Source-code assets; vehicle GLBs live in public/models/cars/
  App.tsx       Experience shell, XR entry and journey progress
  main.tsx      React entry point
```

`FindYourAudiScene.tsx` retains the old Step 1 export as an alias for the new questionnaire. The previous shared placeholder is retained but not used in the journey.

The existing `createXRStore`, `<XR store={xrStore}>`, `store.enterVR()`, and standard mesh pointer events follow the official [XR store](https://pmndrs.github.io/xr/docs/tutorials/store) and [interaction APIs](https://pmndrs.github.io/xr/docs/tutorials/interactions). No legacy `VRButton`, `Controllers`, or `Interactive` API is used. Existing runtime dependency versions are retained. Step 3 adds only `@react-three/test-renderer` as a development dependency for spatial interaction tests. The default v6 controller implementation supplies visible rays/cursors; teleport/grab are disabled.

## Performance and verification

Procedural environments use instancing for repeated architecture. Desktop vehicle presentation uses one cached 1024 px shadow map, refreshed when the car loads or rotates. VR uses lightweight ground contact shading without a shadow-map pass. No postprocessing, particles or automatic camera travel. Scene/question/mode changes use a head-following stereo black dome (140 ms out + 140 ms in; 100 + 100 with reduced motion). Blackout swaps scene contents and temporarily blocks world interactions. No XR camera transform is changed.

Car paint, glass and trim retain their imported PBR materials and textures. A local five-softbox HDR environment supplies studio reflections through Three.js [PMREMGenerator](https://threejs.org/docs/pages/PMREMGenerator.html), generated once per mounted car presentation. Key/fill lights stay fixed while the car rotates. Both the journey and asset viewer use ACES tone mapping, exposure 0.95 and sRGB output; transparent glass does not cast an opaque shadow. No external HDR download or per-frame reflection capture is required.

Only the selected vehicle loads, with Meshopt decoding, cached resources and a short disposal grace period across scene changes. Four dedicated mobile copies cap textures at 1024 pixels; full-detail viewer assets remain unchanged. See [Step 3 report](docs/step3.md) for geometry, known asset gaps and validation evidence.

`npm run typecheck`, `npm test` (44 tests), `npm run lint` and `npm run build` pass. Lint retains two advisory warnings in the existing origin hook/Context structure. The suite exercises complete desktop journeys and 3D mesh pointer events, including ray-based vehicle drag, two-controller focus, cancellation of automatic answer advance, fixed lighting and shadow refresh after the vehicle reveal. Six regressions use the actual XR raycast/event engine to cover restored targeting after fades, interrupted Back and capture cleanup on navigation. See the [controller fix report](docs/vr-interactions.md). GLBs are validated separately with Three.js and Blender. Test-renderer events do not prove GPU rendering or hardware controller behavior.

Browser visual QA remains unavailable because Chrome computer-use access was not approved. A physical Quest 3S is connected over USB; the user confirmed portal selection reaches the budget after the controller fix. The full journey, stereo output, readability, re-entry and sustained frame rate still require the manual checks above.

## Imported Audi models

Nine real Desktop models remain under `public/models/cars/`, with source credits, full-detail GLBs and Blender thumbnails. Their unchanged registry is `src/data/audiModels.ts`. Prices remain null; asset availability does not imply current market availability. Source variants include RS 3 Sportback, RS 6 Avant GT and **RS** e-tron GT. A3 Sedan is never substituted for A3 Sportback, and RS e-tron GT is no longer used as a standard e-tron GT suggestion. The matching algorithm and questionnaire are unchanged.

All nine imported identities are candidates: A1, A3 Sedan, RS 3 Sportback, A5 Sportback S line, A6 C8 Limousine, Q4 e-tron, Q5, RS 6 Avant GT and RS e-tron GT. Names and categories come from the registry, so an S3 result can no longer appear with a generated car or an RS3 mislabeled as S3. Recommendation scoring and approved questions are unchanged; the candidate dataset is now restricted to these available assets.

**Desktop loads each exact `/models/cars/<vehicle-id>/model.glb`**, including RS6. In VR, A5/A6/Q4/Q5 may use an optimized copy of that same imported car; other vehicles use their original GLB. Loading and failures show text status only, never a procedural car. The RS6 source and other heavy originals still require profiling/optimization before a stable Quest frame rate can be promised.

```sh
npm install
npm run dev
# Open http://localhost:5173/dev/models for the development asset viewer.
npm run typecheck
npm test
npm run build
```

Select each vehicle in `/dev/models`; wait for `ready`, drag to orbit, scroll/pinch to zoom, right-drag to pan, and use **RESET CAMERA**. A failed model shows an explicit error message and retry action. The viewer is development-only, uses no XR session, and is omitted from production JS. Test loading failure in browser DevTools by blocking a model request and reloading. In the normal journey, use the existing desktop buttons or VR controller controls to rotate the selected source model.

For Quest 3S, use `npm run dev:quest` and the headset workflow above. Start with the COMFORT or E-MOTION demo path above. The development viewer stays separate from XR and defaults to the full-detail source asset. Full-detail source GLBs total **66.36 MiB**; mobile copies add approximately **12.30 MiB**. Only the selected preview is downloaded during the journey, not the entire asset directory.

Source GLBs and all four mobile copies passed glTF validation and Three.js parse/image-decode checks. All nine source cars and the mobile copies were actually rendered in **Blender**; these are asset inspections, not browser screenshots or physical headset tests. Mobile geometry and hash evidence is in [audi-mobile-metrics.json](docs/audi-mobile-metrics.json).

Read the [asset import report](docs/audi-assets.md) for source formats, category mapping, missing alternative Q4 OBJ textures and source-declared licenses. The [Step 3 report](docs/step3.md) describes the new immersive flow, optimization and remaining validation. Next: profile the two real-model demo paths on physical Quest, then source lightweight assets for missing exact variants and replace synthetic matching tiers with verified market/pricing data.
