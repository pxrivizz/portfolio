import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { useSceneStore } from './store/scene.store'
import { experienceConfig as config } from './config/experience.config'
import './styles/globals.css'
useSceneStore.getState().setReducedMotion(window.matchMedia(config.quality.reducedQuery).matches)
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
