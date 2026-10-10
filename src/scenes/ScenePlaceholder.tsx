import { SceneLabel } from '../components/SceneLabel'
export function ScenePlaceholder({ title }: { title: string }) {
  return <group><SceneLabel text={title} position={[0, 1.8, -3]} /><SceneLabel text="This chapter is coming next." position={[0, 1.4, -3]} color="#9da8b9" /></group>
}
