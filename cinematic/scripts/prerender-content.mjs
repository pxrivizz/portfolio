import { readFile } from 'node:fs/promises'
const html = await readFile(new URL('../../experience/index.html', import.meta.url), 'utf8')
for (const marker of ['portfolio-content', 'Sabancı Üniversitesi', 'QR Yoklama']) {
  if (!html.includes(marker)) throw new Error(`Static content missing: ${marker}`)
}
console.log('Static HTML verified: profile, experience and projects are present without JavaScript.')
