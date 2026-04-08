/**
 * One-time auth capture script for heavy-tabs e2e tests.
 *
 * Heavy Tabs is fully passwordless (Google OAuth + magic link), so we can't
 * programmatically sign in. This script opens a real browser, navigates to
 * the dev server, and waits for you to sign in manually with the test user
 * (`keith+heavytabs-test@gmail.com`). Once signed in, it saves the resulting
 * cookies + localStorage to `.playwright/storageState.json`.
 *
 * All e2e tests then reuse that state and are signed in instantly.
 *
 * Run with: npm run test:e2e:capture
 *
 * When to re-run: only when the Supabase refresh token expires (weeks/months)
 * — you'll know because tests start failing with auth errors.
 */
import { chromium } from '@playwright/test'
import { mkdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const STORAGE_DIR = resolve('.playwright')
const STORAGE_FILE = resolve(STORAGE_DIR, 'storageState.json')
const TEST_USER_EMAIL = 'keith+heavytabs-test@gmail.com'
const DEV_URL = 'http://localhost:3002'

async function main() {
  if (!existsSync(STORAGE_DIR)) mkdirSync(STORAGE_DIR, { recursive: true })

  console.log('\n=== Heavy Tabs e2e auth capture ===\n')
  console.log(`Test user:  ${TEST_USER_EMAIL}`)
  console.log(`Dev URL:    ${DEV_URL}`)
  console.log(`Save path:  ${STORAGE_FILE}\n`)
  console.log('Steps:')
  console.log('  1. A Chromium window will open at the dev server')
  console.log('  2. Click Sign In')
  console.log(`  3. Enter ${TEST_USER_EMAIL}`)
  console.log('  4. Click "Send magic link"')
  console.log('  5. Open the magic link from your inbox in the SAME window')
  console.log('  6. Wait until the editor loads with you signed in')
  console.log('  7. Press Enter in this terminal to save the state\n')

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(DEV_URL)

  console.log('Browser open. Sign in, then press Enter here to save...')
  await new Promise<void>((res) => {
    process.stdin.resume()
    process.stdin.once('data', () => res())
  })

  await context.storageState({ path: STORAGE_FILE })
  console.log(`\n✓ Saved storage state to ${STORAGE_FILE}\n`)
  console.log('You can now run `npm run test:e2e`.')

  await browser.close()
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
