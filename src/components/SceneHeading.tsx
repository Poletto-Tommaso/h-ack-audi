import { SceneLabel } from './SceneLabel'
export function SceneHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return <>
    <SceneLabel text={title} position={[0, 2.65, -3.5]} width={4.2} height={0.35} fontSize={0.18} />
    <SceneLabel text={subtitle} position={[0, 2.35, -3.5]} width={4.2} fontSize={0.105} color="#b5c0d1" />
  </>
}
