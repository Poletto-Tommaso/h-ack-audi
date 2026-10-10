import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { Mesh, Line, Points, Texture } from 'three'
import type { Object3D } from 'three'

// Keep only actively mounted cars. Brief retention avoids reloads during reveal/explore transitions
// and React StrictMode's effect replay. Never dispose a scene still used by another instance.
const leases = new Map<string, { count: number; timer?: ReturnType<typeof setTimeout> }>()
export function useModelResources(path: string, scene: Object3D) {
  useEffect(() => {
    const lease = leases.get(path) || { count: 0 }
    clearTimeout(lease.timer)
    lease.count++
    leases.set(path, lease)
    return () => {
      lease.count--
      lease.timer = setTimeout(() => {
        if (lease.count) return
        const textures = new Set<Texture>()
        scene.traverse((node) => {
          if (!(node instanceof Mesh || node instanceof Line || node instanceof Points)) return
          node.geometry.dispose()
          for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
            for (const value of Object.values(material)) if (value instanceof Texture) textures.add(value)
            material.dispose()
          }
        })
        const images = new Set<unknown>()
        for (const texture of textures) {
          texture.dispose()
          const image = texture.source.data
          if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap && !images.has(image)) { image.close(); images.add(image) }
        }
        useGLTF.clear(path)
        leases.delete(path)
      }, 1500)
    }
  }, [path, scene])
}
