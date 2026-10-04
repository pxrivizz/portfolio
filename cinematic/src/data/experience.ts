export interface ExperienceEntry { id: string; year: string; period: string; company: string; role: string; description: string; icon: 'code' | 'robot' }
export const experience: ExperienceEntry[] = [
  { id: 'sabanci', year: '2026', period: 'Ağustos – Eylül 2026', company: 'Sabancı Üniversitesi', role: 'Yazılım Geliştirme Stajyeri', description: 'Moodle eklentileri geliştirdim ve yeni öğrenme platformuna geçiş çalışmalarına katkıda bulundum.', icon: 'code' },
  { id: 'apectra', year: '2025', period: 'Eylül 2025 – Devam ediyor', company: 'APECTRA', role: 'Yazılım Ekip Lideri', description: 'Teknofest Robolig ve roket yarışmaları için yazılım çalışmalarını koordine ediyor, robotik ve Arduino projeleri geliştiriyorum.', icon: 'robot' },
]
