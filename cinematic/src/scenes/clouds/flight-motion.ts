export const journeyMotion = { progress: 0 }
export const flightMotion = { progress: 0 }

export function smoothRange(value: number, start: number, end: number) {
  const normalized = Math.min(1, Math.max(0, (value - start) / (end - start)))
  return normalized * normalized * (3 - 2 * normalized)
}

export function rangeProgress(value: number, start: number, end: number) {
  return Math.min(1, Math.max(0, (value - start) / (end - start)))
}
