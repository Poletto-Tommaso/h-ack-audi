/// <reference types="node" />
import { readFileSync, statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { Box3, BoxGeometry, Group, Mesh, Vector3 } from 'three'
import { audiModels } from '../data/audiModels'
import { getRecommendationAsset } from '../data/recommendationAssets'
import { getModelTransform } from './modelTransform'

describe('Audi asset integrity', () => {
  it('resolves nine distinct, self-contained GLBs and exact discovery category membership', () => {
    expect(new Set(audiModels.map((model) => model.id)).size).toBe(9)
    expect(new Set(audiModels.map((model) => model.modelPath)).size).toBe(9)
    const categories = {
      performance: ['audi-rs3', 'audi-rs6', 'audi-etron-gt'],
      comfort: ['audi-a5-sportback', 'audi-a6-limousine', 'audi-q5'],
      everyday: ['audi-a1', 'audi-a3-sedan', 'audi-q5'],
      emotion: ['audi-q4-etron', 'audi-etron-gt'],
    } as const
    for (const [category, ids] of Object.entries(categories)) {
      expect(audiModels.filter((model) => model.categories.some((id) => id === category)).map((model) => model.id).sort()).toEqual([...ids].sort())
    }
    for (const model of audiModels) {
      expect(model.available).toBe(true)
      expect(model.price).toBeNull()
      const path = `public${model.modelPath}`
      expect(statSync(path).size).toBe(model.fileSizeBytes)
      expect(model.fileSizeBytes).toBeLessThan(20 * 1048576)
      const bytes = readFileSync(path)
      expect(bytes.toString('utf8', 0, 4)).toBe('glTF')
      expect(bytes.readUInt32LE(4)).toBe(2)
      expect(bytes.readUInt32LE(8)).toBe(bytes.length)
      const data = JSON.parse(bytes.toString('utf8', 20, 20 + bytes.readUInt32LE(12)))
      expect([...data.buffers, ...(data.images || [])].every((item) => !item.uri || item.uri.startsWith('data:'))).toBe(true)
      expect(statSync(`public${model.thumbnailPath}`).size).toBeGreaterThan(0)
    }
    expect(getRecommendationAsset('a3')).toBeUndefined() // Sedan ≠ Sportback.
    expect(getRecommendationAsset('etron-gt')?.name).toBe('Audi RS e-tron GT')
    expect(getRecommendationAsset('rs6')?.name).toBe('Audi RS 6 Avant GT')
  })

  it('normalizes arbitrarily translated / rotated source geometry to a centered grounded preview', () => {
    const source = new Group()
    source.rotation.y = Math.PI / 2
    const mesh = new Mesh(new BoxGeometry(200, 100, 400))
    mesh.position.set(500, -900, 700)
    source.add(mesh)
    const { factor, offset } = getModelTransform(source)
    const grounded = new Group()
    grounded.position.set(...offset)
    grounded.add(source)
    const normalized = new Group()
    normalized.scale.setScalar(factor)
    normalized.add(grounded)
    const box = new Box3().setFromObject(normalized, true)
    const size = box.getSize(new Vector3())
    expect(Math.max(size.x, size.y, size.z)).toBeCloseTo(2.25)
    expect(box.min.y).toBeCloseTo(0)
    expect(box.getCenter(new Vector3()).x).toBeCloseTo(0)
    expect(box.getCenter(new Vector3()).z).toBeCloseTo(0)
    expect(() => getModelTransform(new Group())).toThrow(/empty|invalid/)
    mesh.geometry.dispose()
  })
})
