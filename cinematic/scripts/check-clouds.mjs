import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:5174/experience/'
const output = new URL('../docs/checks/clouds/', import.meta.url)
await mkdir(output, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const checks = []
const errors = []
const assert = (value, label) => {
  if (!value) throw new Error(label)
  checks.push(label)
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } })
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(base)
  await page.locator('canvas[data-scene-ready="true"]').waitFor()
  await page.locator('canvas').evaluate((canvas) => { canvas.dataset.persistence = 'phase-three' })
  await page.locator('.experience-shell').evaluate((node) => window.scrollTo(0, (node.scrollHeight - innerHeight) * 0.15))
  await page.waitForTimeout(700)
  assert(await page.locator('.experience-shell[data-scene="intro"]').count() === 1, 'Intro remains active while clouds rise')
  const introProgress = await page.locator('.experience-shell').evaluate((node) => Number(getComputedStyle(node).getPropertyValue('--intro-progress')))
  assert(introProgress > 0.25 && introProgress < 0.8, `Intro greeting and clouds follow scroll progress: ${introProgress}`)
  await page.screenshot({ path: new URL('00-intro-scroll.png', output).pathname })

  await page.locator('.experience-shell').evaluate((node) => window.scrollTo(0, (node.scrollHeight - innerHeight) * 0.28))
  await page.locator('.experience-shell[data-scene="clouds"]').waitFor()
  await page.locator('canvas[data-rendered-scene="journey"][data-scene-ready="true"]').waitFor()

  assert(await page.locator('canvas').count() === 1, 'Cloud transition preserves one Canvas')
  assert(await page.locator('canvas').getAttribute('data-persistence') === 'phase-three', 'Canvas element persists into cloud flight')
  assert(await page.locator('canvas').getAttribute('data-rendered-scene') === 'journey', 'Intro and flight share one mounted 3D journey')
  const earlyDoorReveal = await page.locator('.experience-shell').evaluate((node) => Number(getComputedStyle(node).getPropertyValue('--door-reveal')))
  assert(earlyDoorReveal < 0.01, `Door stays hidden during the cloud handoff: ${earlyDoorReveal}`)
  assert(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight * 3), 'Cloud flight creates a long scroll journey')
  await page.screenshot({ path: new URL('01-entry.png', output).pathname })

  await page.locator('.experience-shell').evaluate((node) => window.scrollTo(0, node.offsetTop + (node.scrollHeight - innerHeight) * 0.48))
  await page.waitForTimeout(900)
  const middleProgress = await page.locator('.experience-shell').evaluate((node) => Number(getComputedStyle(node).getPropertyValue('--flight-progress')))
  assert(middleProgress > 0.25 && middleProgress < 0.8, `Mid-flight progress responds to scroll: ${middleProgress}`)
  const middleDoorReveal = await page.locator('.experience-shell').evaluate((node) => Number(getComputedStyle(node).getPropertyValue('--door-reveal')))
  assert(middleDoorReveal > 0.5 && middleDoorReveal < 1, `Door fades in gradually after the clouds: ${middleDoorReveal}`)
  await page.screenshot({ path: new URL('02-mid-flight.png', output).pathname })

  await page.locator('.experience-shell').evaluate((node) => window.scrollTo(0, node.offsetTop + node.scrollHeight - innerHeight))
  await page.waitForTimeout(1200)
  await page.getByText('Kapıdan geçtin. Tünel bir sonraki fazda.').waitFor()
  await page.screenshot({ path: new URL('03-door.png', output).pathname })
  checks.push('Door threshold completes without entering the unbuilt tunnel')

  await page.getByRole('button', { name: 'Başa dön' }).click()
  await page.waitForFunction(() => window.scrollY < 20)
  await page.locator('.experience-shell[data-scene="intro"]').waitFor()
  checks.push('Restart reverses the same journey back to the intro')
  await page.locator('.experience-shell').evaluate((node) => window.scrollTo(0, (node.scrollHeight - innerHeight) * 0.32))
  await page.locator('.experience-shell[data-scene="clouds"]').waitFor()
  await page.getByRole('button', { name: 'Otomatik ilerle' }).click()
  await page.waitForTimeout(350)
  assert(await page.evaluate(() => window.scrollY > 0), 'Time fallback advances the same scroll journey')
  await page.mouse.wheel(0, 40)
  await page.waitForTimeout(100)
  assert(await page.getByRole('button', { name: 'Otomatik ilerle' }).count() === 1, 'Manual input stops time fallback')

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 })
  await mobile.goto(base)
  await mobile.locator('canvas[data-scene-ready="true"]').waitFor()
  await mobile.locator('.experience-shell').evaluate((node) => window.scrollTo(0, (node.scrollHeight - innerHeight) * 0.28))
  await mobile.locator('.experience-shell[data-scene="clouds"]').waitFor()
  await mobile.locator('canvas[data-rendered-scene="journey"][data-scene-ready="true"]').waitFor()
  assert(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Cloud scene has no mobile horizontal overflow')
  const dpr = await mobile.locator('canvas').evaluate((canvas) => canvas.width / canvas.clientWidth)
  assert(dpr <= 1.25, `Mobile DPR remains capped: ${dpr}`)
  await mobile.screenshot({ path: new URL('04-mobile-entry.png', output).pathname })

  assert(errors.length === 0, `No uncaught page errors: ${JSON.stringify(errors)}`)
  await writeFile(new URL('results.json', output), JSON.stringify({ checks, limits: ['Real touch hardware not tested', 'No mid-range GPU benchmark'] }, null, 2))
  console.log(checks.join('\n'))
} finally {
  await browser.close()
}
