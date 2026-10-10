# AUDI — FIND YOUR DRIVE

A React + TypeScript + Vite WebXR hackathon foundation for Meta Quest 3S and desktop. The repository was empty when inspected; there was no existing implementation or dependency manifest to replace.

Only **01 — THE ORIGIN** is interactive. Select the Audi rings to awaken the scene: the sculpture, portal, and floor accents turn red and the welcome message changes. Select again to reset. No vehicle recommendation or emotional profiling is implemented yet.

## Start locally

Use Node **22.12+**, preferably Node 24 (`.nvmrc`), and npm. The lockfile records the installed versions; use `npm ci` for reproducible installs.

```sh
npm ci
npm run dev
```

Open the Local URL printed by Vite, usually **http://localhost:5173**. If Node is installed through nvm but unavailable in your shell, load nvm and run `nvm use` first.

## Desktop testing

1. Open the page in a browser with WebGL and hardware acceleration enabled.
2. Hover over the ring sculpture, then click it. The rings and surrounding accents should turn red; both the in-world text and the page caption should change.
3. Click again to return to the original state. The **Explore on desktop / Reset experience** button provides the same action through a keyboard-accessible HTML control.
4. Drag the scene to inspect it within a limited orbit. Pan and zoom are disabled.
5. On a browser without an immersive headset, **ENTER VR** stays disabled and explains how to continue. Desktop mode remains usable.
6. Resize to a narrow viewport. The introduction, 3D view, and chapter list should stack without horizontal scrolling.

The XR library's built-in emulator is deliberately disabled so desktop users see genuine headset availability. A separately installed WebXR emulator can assist development, but cannot validate Quest performance or tracking.

## Test on Meta Quest 3S

### Wi-Fi and HTTPS

```sh
npm run dev:quest
```

1. Connect the computer and headset to the same Wi-Fi network. Allow the local Vite port through the computer's firewall if prompted.
2. In **Meta Quest Browser**, open the **Network HTTPS URL** printed by Vite, for example `https://192.168.1.100:5173`. Plain HTTP on a LAN IP does not satisfy the secure-context requirement.
3. This command generates a self-signed development certificate in Vite's ignored `node_modules/.vite` cache. The headset may show a certificate warning that the developer must handle manually for this local test. If the origin still fails the browser's secure-context check, use the USB method below or a site served with a trusted HTTPS certificate. Do not change browser security flags.
4. Select **ENTER VR**, then grant the browser's immersive-session permission if requested.
5. Look ahead. The scene uses a floor-level reference space with the sculpture roughly three metres ahead. Move your head to verify stereo rendering and positional tracking.
6. With either Touch controller, aim the default ray at the rings and press/release the trigger. Check hover feedback, red activation, changed in-world instructions, and a second selection to reset.
7. Aim at the in-world **RESET** and **EXIT VR** buttons. Also test ending VR through the Quest system menu, then entering again from the page.
8. Deny one session request and verify that the error is shown on the page and retry remains possible.

All essential instructions and reset/exit controls are rendered as 3D objects. They do not depend on a DOM overlay inside the headset.

### USB localhost alternative

Enable Developer Mode and USB debugging on the headset, install Android Platform Tools, connect it over USB, and authorize the computer in the headset.

```sh
npm run dev
# In a second terminal:
adb devices
adb reverse tcp:5173 tcp:5173
```

Open **http://localhost:5173** in Meta Quest Browser. Loopback is treated as a trustworthy origin; the reverse mapping forwards the headset's localhost to the computer. Replace both ports if Vite reports a different one. Use `chrome://inspect/#devices` on the computer to inspect the Quest tab and check console errors and frame timing.

The USB workflow follows [Meta's browser debugging documentation](https://developers.meta.com/vr/documentation/web/browser-remote-debugging/). For Wi-Fi/headset setup, see [Meta's testing guide](https://developers.meta.com/vr/documentation/iwsdk/guides/02-testing-experience/).

## Commands and checks

```sh
npm run typecheck     # Strict TypeScript checks for application and Vite configuration
npm test              # Six automated VR-entry/session/fallback checks, simulated APIs
npm run build         # TypeScript checks + production bundle in dist/
npm run preview       # Serve the production build locally
```

For a headset test of the production build over Wi-Fi, use `npm run preview -- --mode quest`; this enables the same development HTTPS plugin. Public hosting requires trusted HTTPS and should serve `dist/`. No deployment or push is performed by these commands.

## Structure

```text
src/
  components/         Canvas, environment, rings, 3D labels/buttons, VR entry UI
  scenes/
    OriginScene.tsx             01 — THE ORIGIN (interactive foundation)
    FindYourWorldScene.tsx      02 — FIND YOUR WORLD (placeholder)
    DiscoverYourDriveScene.tsx  03 — DISCOVER YOUR DRIVE (placeholder)
    FindYourAudiScene.tsx       04 — FIND YOUR AUDI (placeholder)
    YourAudiScene.tsx           05 — YOUR AUDI (placeholder)
    ScenePlaceholder.tsx       Shared placeholder presentation
  hooks/              Browser VR availability and reactive session state
  data/               Chapter metadata
  logic/              Shared XR store and session configuration
  assets/             Space for future local assets
  App.tsx             Desktop experience shell and introduction state
  main.tsx            React entry point
```

The chapter list previews the intended journey; later chapters are not navigation links. Their placeholder components are ready to integrate when those chapters are implemented.

## XR implementation and performance

- Uses installed **@react-three/xr 6.6.31**, **Fiber 9.8.1**, **Drei 10.7.9**, **Three.js 0.186.1**, **React 19.3.0**, and **Vite 8.3.4**. See `package-lock.json` for exact dependency versions.
- Follows the official [XR introduction](https://pmndrs.github.io/xr/docs/getting-started/introduction), [store API](https://pmndrs.github.io/xr/docs/tutorials/store), and [pointer interaction API](https://pmndrs.github.io/xr/docs/tutorials/interactions): a persistent `createXRStore`, `<XR store={xrStore}>`, `store.enterVR()` from a click gesture, default controller rays, and mesh `onClick` / pointer-over/out handlers shared with desktop.
- Keeps the viewer stationary; no forced camera motion or artificial locomotion. Orbit controls unmount during immersive sessions so head tracking owns the camera.
- Uses low-complexity procedural geometry, no shadows, no postprocessing, no HDR environment, and no vehicle models. Canvas-rendered labels avoid remote font downloads.
- Caps desktop pixel ratio at 1.5. XR uses native framebuffer scale and maximum fixed foveation where supported. `frameRate: 'low'` requests the device's lowest advertised frame rate, targeting the usual Quest 72 Hz mode; actual support and sustained frame timing must be checked on hardware.
- Hand tracking, AR/environment detection, anchors, layers, and DOM overlays are disabled for this controller-first prototype. Default controller models/profiles currently load from the library's jsDelivr CDN, so the headset needs internet access for their initial load. Self-host those profile assets before an offline demo.

## Verification and remaining work

Verified here: strict TypeScript check, production build, six automated tests, and an HTTP response from the Vite development server. Automated tests use simulated WebXR APIs; they do not exercise physical tracking or controller rays.

Browser visual QA could not run because browser automation was unavailable and native Chrome access was denied. No physical Quest was connected, so stereo output, controller selection, headset re-entry, certificate handling, and sustained frame rate remain unverified. Use the manual checks above before presenting the prototype.

Vite reports large JavaScript chunks. The initial 3D bundle includes Three.js/XR (~1.3 MB minified, ~360 KB gzip); the XR dependency also emits optional emulator/environment chunks even with emulation disabled. Those dynamic emulator chunks are not requested in the configured runtime. Further splitting or removing optional emulator build assets can be considered after measuring load time on the target device.

Scenes 02–05, emotional discovery logic, recommendations, sound, vehicle assets, and production hosting are intentionally left for later tasks.
