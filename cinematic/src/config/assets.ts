const asset = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`
export const assets = {
  clouds: ['far', 'middle', 'near'].map((layer) => asset(`clouds/${layer}.png`)),
  star: asset('clouds/star.png'),
  artwork: ['background', 'far', 'middle', 'foreground'].map((layer) => asset(`artwork/${layer}.svg`)),
  door: asset('door/frame.svg'),
  hub: { experience: asset('projects/experience.svg'), projects: asset('projects/projects.svg') },
  project: (path: string) => asset(path),
}
