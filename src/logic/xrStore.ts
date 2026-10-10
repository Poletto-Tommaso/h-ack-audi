import { createXRStore } from '@react-three/xr'

// One persistent store, shared by the DOM entry button and the R3F scene.
export const xrStore = createXRStore({
  emulate: false,
  offerSession: false,
  enterGrantedSession: false,
  frameRate: 'low',
  foveation: 1,
  frameBufferScaling: 1,
  handTracking: false,
  hand: false,
  controller: {
    grabPointer: false,
    teleportPointer: false,
    rayPointer: {
      rayModel: { color: '#ffffff', opacity: 0.65, maxLength: 12, size: 0.003 },
      cursorModel: { color: '#ffffff', opacity: 0.95, size: 0.025 },
    },
  },
  meshDetection: false,
  planeDetection: false,
  hitTest: false,
  anchors: false,
  layers: false,
  domOverlay: false,
})
