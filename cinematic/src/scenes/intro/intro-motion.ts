// Mutable animation values are shared by GSAP and R3F without React renders per frame.
export const introMotion = { progress: 0, elapsed: 0 }
export function layerProgress(progress: number, start: number, end: number) {
  return Math.min(1, Math.max(0, (progress - start) / (end - start)))
}
