export interface ProjectEntry { id: string; title: string; description: string; date: string | null; technologies: string[]; href: string; image: string }
export const projects: ProjectEntry[] = [
  { id: 'qr-yoklama', title: 'QR Yoklama', description: 'Kısa ömürlü QR kodları, kampüs ağı ve konum doğrulamasını bir araya getiren üniversite yoklama sistemi.', date: null, technologies: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'], href: 'https://github.com/pxrivizz/qr_yoklama', image: 'projects/qr-yoklama.svg' },
  { id: 'pxrivizz', title: 'pxrivizz', description: 'Projelerimi ve deneyimlerimi buluşturan, hareket odaklı kişisel portfolyom.', date: null, technologies: ['JavaScript', 'GSAP', 'CSS'], href: '/index.html', image: 'projects/pxrivizz.svg' },
]
