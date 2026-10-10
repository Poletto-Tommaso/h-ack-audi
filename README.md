# AUDI — FIND YOUR DRIVE

A functional five-scene React / TypeScript / Vite prototype for desktop and Meta Quest 3S. Step 1's XR store, VR entry/support handling, and architectural environment are retained. Step 2 adds a complete journey using lightweight procedural geometry and explicitly fictional matching data.

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

1. **THE ORIGIN** — “WELCOME TO AUDI.” / “Your journey starts here.” changes after 2.8 seconds to “WHAT DRIVES YOU?” / “Discover the Audi that moves you.” Select **START YOUR JOURNEY**. The ring sculpture remains interactive. The setting is abstract architecture, not a historically accurate reconstruction.
2. **WHAT DRIVES YOU?** — Select one of four 3D portals: PERFORMANCE (circuit), COMFORT (panoramic road), EVERYDAY (city), E-MOTION (future). Each has its own color, geometry, and hover feedback.
3. **SET YOUR BUDGET** — Use the slider, minus, or plus. Range €25,000–€150,000+, default €45,000, step €5,000. **CONTINUE** saves progress.
4. **DISCOVER YOUR DRIVE** — Four questions for the selected portal, one at a time, with three answers each. All **16 approved questions and 48 answers are reproduced unchanged** in `src/data/questions.ts`. Select an answer, then **NEXT QUESTION** / **FIND MY AUDI**.
5. **YOUR AUDI** — See a deterministic prototype suggestion, three personalized explanations, selected route/budget, and a generic vehicle blockout. No eligible candidate produces an explicit no-match state with **ADJUST BUDGET**.

**EXPLORE YOUR AUDI** opens a 3D blockout with rotation and color controls. **EXPERIENCE YOUR DRIVE** opens a miniature road simulation with play/pause and lane controls. The viewer's camera remains stationary; movement starts only after pressing Play. Neither mode asserts the real model's design, specifications, or performance.

**BACK** steps through individual questions and scenes; within exploration/preview it returns to the result. **RESTART** clears the journey to the initial state. React Context keeps route, budget, answers, and reveal controls synchronized between HTML and the 3D world. Re-selecting the same portal preserves answers; changing portal clears incompatible answers while keeping the budget. State persists across scene changes and VR entry/exit, **not page reloads**. There is no backend, analytics, or account.

## Desktop testing

- Start a journey and select each portal in separate runs. All steps are selectable directly in 3D, or through the responsive, keyboard-accessible HTML controls.
- Test hovering and clicking the 3D portals, then clicking/dragging the budget slider. Use minus/plus at the limits and check the €150,000+ display.
- Check that Next is disabled before answering; go Back, edit an answer, and confirm it remains selected when revisiting.
- At €45,000 or above, complete a route and inspect the prototype result, exploration, color controls, and play/pause/lane preview.
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
7. Test Back, Restart, exploration rotation/color, and driving Play/Pause/Left/Right. Navigation is below the main panel. Test both controllers and verify hover remains correct when one ray leaves a target.
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

`src/logic/recommendation.ts` is a pure deterministic engine, separate from React and the scenes. `src/data/mockModels.ts` holds the user-supplied candidate names plus **fictional traits and synthetic eligibility tiers**. No candidate has a price field.

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
  components/   Canvas, reusable controls, AudiCarModel, studio lighting, fallback blockout
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

The existing `createXRStore`, `<XR store={xrStore}>`, `store.enterVR()`, and standard mesh pointer events follow the official [XR store](https://pmndrs.github.io/xr/docs/tutorials/store) and [interaction APIs](https://pmndrs.github.io/xr/docs/tutorials/interactions). No legacy `VRButton`, `Controllers`, or `Interactive` API is used. Existing dependency versions were retained and no new dependency was needed for Step 2.

## Performance and verification

- Procedural low-poly environments, imported vehicle GLBs loaded on demand, no shadows, postprocessing, particles, or network fonts. Text uses local canvas textures that are disposed when replaced/unmounted. Several vehicle assets still need mobile LODs; see the asset report below.
- Desktop DPR is capped at 1.5; its camera adjusts for narrow viewports. XR uses framebuffer scale 1 and maximum fixed foveation where supported. The store requests the lowest advertised device frame rate, usually targeting Quest's 72 Hz mode. Sustained frame time must be measured on hardware.
- Hand tracking and AR/environment features remain disabled for this controller-first prototype. Controller models/profiles still load from the library's jsDelivr CDN on first use, so internet is needed initially. Self-host these assets before an offline event.
- The 3D scene module loads separately, but Vite still warns about large Three.js/XR vendor chunks. The XR dependency emits optional emulator/room chunks; built-in emulation is disabled and those chunks are not requested in this runtime.
- **24 automated tests pass**: six VR-support/session checks, five complete-journey/no-match UI checks, eight state/matching/booking checks, three ray-projection checks, and two asset integrity/normalization checks. The engine test covers all **8,424 portal × budget × answer combinations**. These run with simulated WebXR and DOM APIs, not physical controllers or GPU rendering.
- `npm install`, strict TypeScript checks, tests, the production build, and an HTTP smoke check of the built page/entry assets were run successfully. Browser visual QA remains blocked because Chrome computer-use access was not approved. No physical Quest is available here; stereo output, actual controller selection/dragging, readability, re-entry, and frame rate still require the manual checks above.

## Imported Audi models

Nine real Desktop models are now imported under `public/models/cars/`, with one physical GLB per vehicle, Blender-rendered thumbnails and source credits. Their registry is `src/data/audiModels.ts`. Prices remain null; asset availability does not imply current market availability. Source variants are retained, including RS 3 Sportback, RS 6 Avant GT and RS e-tron GT. The A3 Sedan is never used as an A3 Sportback substitute. Seven existing mock candidate families show the corresponding source variant in reveal/exploration/miniature preview; other candidates retain the labeled procedural fallback. Source materials are preserved, so paint controls are offered only on placeholders.

```sh
npm install
npm run dev
# Open http://localhost:5173/dev/models for the development asset viewer.
npm run typecheck
npm test
npm run build
```

Select each vehicle in `/dev/models`; wait for `ready`, drag to orbit, scroll/pinch to zoom, right-drag to pan, and use **RESET CAMERA**. A failed model shows an explicit placeholder and retry action. The viewer is development-only, uses no XR session, and is omitted from production JS. Test loading failure in browser DevTools by blocking a model request and reloading. In the normal journey, use the existing desktop buttons or VR controller controls to rotate the selected source model.

For Quest 3S, use the HTTPS workflow above (`npm run dev:quest`), open the root journey on the headset, and test the controller-driven reveal/explore/preview after a matching recommendation. Use RS3 first for profiling; the asset viewer itself has desktop OrbitControls and does not enter VR. Verify stereo appearance, source orientation/materials, frame time, back/restart and repeated VR entry on physical hardware. Heavy A1/A5 geometry and RS6/A6 draw/skin counts are not yet certified for headset frame rate.

The GLBs total **66.36 MiB**, down from 201.52 MiB, using Meshopt and lossless WebP with unchanged rendered triangle counts. [Drei's documented useGLTF API](https://drei.docs.pmnd.rs/loaders/gltf-use-gltf) is used with bundled Meshopt decoding. Runtime dependencies were unchanged; optional offline tooling stayed outside the repository. All files passed glTF validation and Three.js loading/image-decode checks. All nine were visually rendered in **Blender**; browser visual QA and physical Quest rendering remain unverified.

Read the [asset import report](docs/audi-assets.md) for the per-vehicle formats, destination paths, categories, exact sizes, missing alternative Q4 OBJ textures, retained source licenses and Quest optimization priorities. The report links the full source inventory, validation results and [rendered contact sheet](docs/audi-model-contact-sheet.png).

Recommended STEP 3: profile RS3 on physical Quest, create mobile LOD/material variants for the heavy cars, then expand matching to exact variants using verified market/pricing data.
