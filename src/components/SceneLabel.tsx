import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

type Props = { text: string; position: [number, number, number]; width?: number; color?: string }

// Self-contained in-headset text without a network font dependency.
export function SceneLabel({ text, position, width = 2.8, color = '#ffffff' }: Props) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 128
    const context = canvas.getContext('2d')!
    context.fillStyle = color
    context.font = '500 44px Arial, sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(text, 512, 64, 1000)
    const result = new CanvasTexture(canvas)
    result.colorSpace = SRGBColorSpace
    return result
  }, [text, color])
  useEffect(() => () => texture.dispose(), [texture])
  return <mesh position={position} pointerEvents="none">
    <planeGeometry args={[width, width / 8]} />
    <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
  </mesh>
}
