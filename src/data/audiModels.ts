import type { PortalId } from './portals'

export type AudiVehicleId = 'audi-a1' | 'audi-a3-sedan' | 'audi-rs3' | 'audi-a5-sportback' | 'audi-a6-limousine' | 'audi-q4-etron' | 'audi-q5' | 'audi-rs6' | 'audi-etron-gt'
export type AudiModelAsset = {
  id: AudiVehicleId
  name: string
  sourceTitle: string
  categories: PortalId[]
  modelPath: string | null
  available: boolean
  thumbnailPath?: string
  /** Verified EUR price only. No pricing data has been supplied. */
  price: number | null
  powertrain?: string
  fileSizeBytes?: number
  /** Corrects source forward axis to +Z, without modifying the GLB. */
  orientationY: number
  performanceNotes: string[]
}

// Asset discovery metadata, independent of mock recommendation tiers / current-market availability.
// Source variant names are retained; A3 Sedan is never substituted for A3 Sportback.
export const audiModels: readonly AudiModelAsset[] = [
  {
    "id": "audi-a1",
    "name": "Audi A1",
    "sourceTitle": "Audi A1 Quattro (A1II)",
    "categories": [
      "everyday"
    ],
    "modelPath": "/models/cars/audi-a1/model.glb",
    "available": true,
    "thumbnailPath": "/models/cars/audi-a1/thumbnail.webp",
    "price": null,
    "fileSizeBytes": 13950864,
    "orientationY": 0,
    "performanceNotes": [
      "High geometry complexity; Quest profiling required."
    ]
  },
  {
    "id": "audi-a3-sedan",
    "name": "Audi A3 Sedan",
    "sourceTitle": "Audi A3 2021 trim",
    "categories": [
      "everyday"
    ],
    "modelPath": "/models/cars/audi-a3-sedan/model.glb",
    "available": true,
    "thumbnailPath": "/models/cars/audi-a3-sedan/thumbnail.webp",
    "price": null,
    "fileSizeBytes": 6719592,
    "orientationY": 3.141592653589793,
    "performanceNotes": [
      "High geometry complexity; Quest profiling required.",
      "Large decoded textures (~177 MiB RGBA8 with mipmaps, estimated)."
    ]
  },
  {
    "id": "audi-rs3",
    "name": "Audi RS 3 Sportback",
    "sourceTitle": "2021 Audi RS3 Sportback",
    "categories": [
      "performance"
    ],
    "modelPath": "/models/cars/audi-rs3/model.glb",
    "available": true,
    "thumbnailPath": "/models/cars/audi-rs3/thumbnail.webp",
    "price": null,
    "fileSizeBytes": 1201316,
    "orientationY": 0,
    "performanceNotes": []
  },
  {
    "id": "audi-a5-sportback",
    "name": "Audi A5 Sportback S line",
    "sourceTitle": "Audi A5 Sportback S Line - 2021",
    "categories": [
      "comfort"
    ],
    "modelPath": "/models/cars/audi-a5-sportback/model.glb",
    "available": true,
    "thumbnailPath": "/models/cars/audi-a5-sportback/thumbnail.webp",
    "price": null,
    "fileSizeBytes": 10943652,
    "orientationY": 0,
    "performanceNotes": [
      "High geometry complexity; Quest profiling required."
    ]
  },
  {
    "id": "audi-a6-limousine",
    "name": "Audi A6 C8 Limousine",
    "sourceTitle": "Audi A6 C8 Limousine",
    "categories": [
      "comfort"
    ],
    "modelPath": "/models/cars/audi-a6-limousine/model.glb",
    "available": true,
    "thumbnailPath": "/models/cars/audi-a6-limousine/thumbnail.webp",
    "price": null,
    "fileSizeBytes": 7499096,
    "orientationY": 3.141592653589793,
    "performanceNotes": [
      "High geometry complexity; Quest profiling required.",
      "Many separate draw calls / skinning; needs a static mobile LOD."
    ]
  },
  {
    "id": "audi-q4-etron",
    "name": "Audi Q4 e-tron",
    "sourceTitle": "2022 Audi Q4",
    "categories": [
      "emotion"
    ],
    "modelPath": "/models/cars/audi-q4-etron/model.glb",
    "available": true,
    "thumbnailPath": "/models/cars/audi-q4-etron/thumbnail.webp",
    "price": null,
    "fileSizeBytes": 3403808,
    "orientationY": -1.5707963267948966,
    "performanceNotes": [
      "High geometry complexity; Quest profiling required."
    ]
  },
  {
    "id": "audi-q5",
    "name": "Audi Q5",
    "sourceTitle": "2023 Audi Q5 quattro S line Premium Plus 45 TFSI",
    "categories": [
      "comfort",
      "everyday"
    ],
    "modelPath": "/models/cars/audi-q5/model.glb",
    "available": true,
    "thumbnailPath": "/models/cars/audi-q5/thumbnail.webp",
    "price": null,
    "fileSizeBytes": 6677576,
    "orientationY": 0,
    "performanceNotes": [
      "High geometry complexity; Quest profiling required."
    ]
  },
  {
    "id": "audi-rs6",
    "name": "Audi RS 6 Avant GT",
    "sourceTitle": "2024 Audi RS6 Avant GT",
    "categories": [
      "performance"
    ],
    "modelPath": "/models/cars/audi-rs6/model.glb",
    "available": true,
    "thumbnailPath": "/models/cars/audi-rs6/thumbnail.webp",
    "price": null,
    "fileSizeBytes": 5521728,
    "orientationY": 0,
    "performanceNotes": [
      "High geometry complexity; Quest profiling required.",
      "Many separate draw calls / skinning; needs a static mobile LOD."
    ]
  },
  {
    "id": "audi-etron-gt",
    "name": "Audi RS e-tron GT",
    "sourceTitle": "Audi RS e-tron GT",
    "categories": [
      "performance",
      "emotion"
    ],
    "modelPath": "/models/cars/audi-etron-gt/model.glb",
    "available": true,
    "thumbnailPath": "/models/cars/audi-etron-gt/thumbnail.webp",
    "price": null,
    "fileSizeBytes": 13667164,
    "orientationY": 3.141592653589793,
    "performanceNotes": [
      "High geometry complexity; Quest profiling required.",
      "Large decoded textures (~115 MiB RGBA8 with mipmaps, estimated)."
    ]
  }
]

export const getAudiModel = (vehicleId: string) => audiModels.find((vehicle) => vehicle.id === vehicleId)
