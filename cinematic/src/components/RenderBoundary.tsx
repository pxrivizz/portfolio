import { useSceneStore } from '../store/scene.store'
import { Component, type ReactNode } from 'react'
export class RenderBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { useSceneStore.getState().setIntroAssets('failed') }
  render() { return this.state.failed ? <p className="render-notice" role="status">Sade görünüm etkin. Tüm içerikler aşağıda.</p> : this.props.children }
}
