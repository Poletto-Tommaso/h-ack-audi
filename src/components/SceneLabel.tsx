import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

type Props = { text: string; position: [number, number, number]; width?: number; height?: number; color?: string; fontSize?: number; align?: 'left' | 'center' }

// Local canvas textures keep wrapped in-headset copy readable without network fonts.
export function SceneLabel({ text, position, width = 2.8, height = 0.3, color = '#ffffff', fontSize = 0.11, align = 'center' }: Props) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = Math.max(64, Math.ceil(1024 * height / width))
    const context = canvas.getContext('2d')!
    context.fillStyle = color
    const pixels = fontSize * 1024 / width
    context.font = `500 ${pixels}px Arial, sans-serif`
    context.textAlign = align
    context.textBaseline = 'middle'
    const lines: string[] = []
    for (const paragraph of text.split('\n')) {
      let line = ''
      for (const word of paragraph.split(' ')) {
        const next = line ? `${line} ${word}` : word
        if (line && context.measureText(next).width > 984) { lines.push(line); line = word }
        else line = next
      }
      lines.push(line)
    }
    lines.forEach((line, index) => context.fillText(line, align === 'left' ? 20 : 512, canvas.height / 2 + (index - (lines.length - 1) / 2) * pixels * 1.3))
    const result = new CanvasTexture(canvas)
    result.colorSpace = SRGBColorSpace
    return result
  }, [text, color, width, height, fontSize, align])
  useEffect(() => () => texture.dispose(), [texture])
  return <mesh position={position} pointerEvents="none">
    <planeGeometry args={[width, height]} />
    <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
  </mesh>
}
