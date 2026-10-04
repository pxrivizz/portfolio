import { useEffect, useState } from 'react'
import { Texture, TextureLoader, SRGBColorSpace } from 'three'
import { assets } from '../../config/assets'
import { useSceneStore } from '../../store/scene.store'
export function useIntroTextures() {
  const [textures, setTextures] = useState<Texture[] | null>(null)
  useEffect(() => {
    let alive = true
    const owned: Texture[] = []
    const loader = new TextureLoader()
    useSceneStore.getState().setIntroAssets('loading')
    Promise.all([...assets.clouds, assets.star].map((url) => new Promise<Texture>((resolve, reject) => {
      const texture = loader.load(url, (loaded) => {
        if (!alive) { loaded.dispose(); return }
        loaded.colorSpace = SRGBColorSpace
        resolve(loaded)
      }, undefined, reject)
      owned.push(texture)
    }))).then((loaded) => {
      if (alive) { setTextures(loaded); useSceneStore.getState().setIntroAssets('ready') }
    }).catch(() => {
      if (alive) useSceneStore.getState().setIntroAssets('failed')
    })
    return () => { alive = false; owned.forEach((texture) => texture.dispose()) }
  }, [])
  return textures
}
