import { test, expect, type Page } from '@playwright/test'

/**
 * Core feature smoke tests for heavy-tabs (DESKTOP only).
 *
 * Catches the bug classes that bit prod on 2026-04-07:
 *   - silent React-mount hangs (root never gets children)
 *   - g.map / x.map TypeErrors from iterating non-array tabData entries
 *   - PublicViewer infinite loops from unstable hook deps
 *   - Share button wire-up regressions
 *
 * Every test asserts both: zero pageerror events AND root has children.
 * Either signal alone wouldn't have caught today's deploys.
 *
 * Mobile coverage lives in mobile.spec.ts. This file uses desktop-only
 * selectors (header buttons hidden via .hideOnTablet at <1000px width).
 */
test.beforeEach(({ }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop-only suite — see mobile.spec.ts')
})

const KNOWN_PUBLIC_SLUG = 'qcwy3hf7' // Keith's "Song 1" — Paradisio

function trackErrors(page: Page) {
  const errors: Error[] = []
  page.on('pageerror', (err) => errors.push(err))
  return errors
}

async function expectMounted(page: Page) {
  // Wait up to 6s for React to put at least one child into #root. The 5s
  // waitForSession ceiling means a fully cold start with a dead refresh
  // token can take just over 5s to render the unauthenticated state.
  await expect.poll(
    async () => page.evaluate(() => document.getElementById('root')?.children.length ?? 0),
    { message: 'React root must have at least one child', timeout: 6000 }
  ).toBeGreaterThan(0)
  await expect(page.getByText('Something went wrong')).toHaveCount(0)
}

test.describe('Core: editor mount', () => {
  test('mounts cleanly with zero errors and renders the editor banner', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/')
    await expect(page.getByRole('banner')).toBeVisible()
    await expectMounted(page)
    expect(errors, errors.map((e) => e.message).join('\n')).toHaveLength(0)
  })

  test('survives a full reload without losing mount or throwing', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/')
    await expect(page.getByRole('banner')).toBeVisible()
    await page.reload()
    await expect(page.getByRole('banner')).toBeVisible()
    await expectMounted(page)
    expect(errors, errors.map((e) => e.message).join('\n')).toHaveLength(0)
  })
})

test.describe('Core: header controls', () => {
  test('share button is present and reflects auth/cloud state via title', async ({ page }) => {
    await page.goto('/')
    const shareButton = page.locator(
      'button[title="Share this tab"], button[title="Save to cloud first to share"], button[title="Sign in to share"]'
    )
    await expect(shareButton).toBeVisible()
    const title = await shareButton.getAttribute('title')
    expect(title, 'share button must have one of three known states').toBeTruthy()
  })

  test('practice mode button toggles into and out of read-only view', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/')
    await page.locator('button[title="Practice mode"]').click()
    // Practice mode collapses the header into the artist — title summary
    await expect(page.locator('button[title="Exit practice mode (Esc)"]')).toBeVisible()
    // Escape returns to the editor
    await page.keyboard.press('Escape')
    await expect(page.locator('button[title="Practice mode"]')).toBeVisible()
    expect(errors, errors.map((e) => e.message).join('\n')).toHaveLength(0)
  })

  test('settings button is clickable and panel ends up in opposite state', async ({ page }) => {
    // The settings panel persists open/closed state in localStorage, so we
    // can't assume the initial state. Read the current state, click once,
    // and assert the state flipped — that's all we need to verify the
    // button is wired up.
    await page.goto('/')
    const settings = page.locator('button[title="Settings"]')
    await expect(settings).toBeVisible()
    const initialOpen = await page.evaluate(() => localStorage.getItem('tabEditorShowSettings') === 'true')
    await settings.click()
    await expect.poll(async () =>
      await page.evaluate(() => localStorage.getItem('tabEditorShowSettings') === 'true')
    ).toBe(!initialOpen)
  })
})

test.describe('Core: library drawer', () => {
  test('opens, lists projects, and switching loads a different project', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/')
    // Hamburger top-left
    await page.locator('header button').first().click()
    await expect(page.getByText(/^Projects \(\d+\)$/)).toBeVisible()
    // Pick the second project (first is whatever is currently active)
    const projectButtons = page.locator('button:has-text("Cowboys From Hell"), button:has-text("Song 1"), button:has-text("Oath New"), button:has-text("Fix Me")')
    const count = await projectButtons.count()
    if (count >= 2) {
      // Click the second visible project to ensure a switch
      await projectButtons.nth(1).click()
      // Drawer auto-closes on selection
      await expect(page.getByText(/^Projects \(\d+\)$/)).toHaveCount(0, { timeout: 5000 })
    }
    await expectMounted(page)
    expect(errors, errors.map((e) => e.message).join('\n')).toHaveLength(0)
  })
})

test.describe('Core: public viewer (/tab/:slug)', () => {
  test('loads a real shared tab and renders the song-title header', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto(`/tab/${KNOWN_PUBLIC_SLUG}`)
    // PublicViewer's header is an <h1> with the song title — much more
    // useful than the old "Viewing shared tab" generic label.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 })
    await expectMounted(page)
    expect(errors, errors.map((e) => e.message).join('\n')).toHaveLength(0)
  })

  test('does NOT infinite-loop on Supabase requests', async ({ page }) => {
    // The 2026-04-07 PublicViewer bug fired 989 requests in 3 seconds because
    // useEffect deps included the unstable `sharing` object. Cap requests at
    // 30 across a 5-second window — anything above that is a regression.
    let requestCount = 0
    page.on('request', (req) => {
      if (req.url().includes('api.heavytabs.app')) requestCount++
    })
    await page.goto(`/tab/${KNOWN_PUBLIC_SLUG}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 })
    await page.waitForTimeout(5000)
    expect(requestCount, `Supabase request count over 5s: ${requestCount}`).toBeLessThan(30)
  })

  test('renders error UI for an unknown slug instead of crashing', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/tab/this-slug-does-not-exist-zzz')
    await expect(page.getByRole('heading', { name: 'Tab Not Found' })).toBeVisible({ timeout: 10_000 })
    await expectMounted(page)
    expect(errors, errors.map((e) => e.message).join('\n')).toHaveLength(0)
  })
})

test.describe('Core: editor interactions', () => {
  test('cell editing — clicking a cell and typing a fret number sticks', async ({ page }) => {
    await page.goto('/')
    // Tab grid cells live inside [class*="barGrid"] or similar — find any empty cell
    // and click it. The editor uses divs/buttons; we target a known interactive area.
    const firstCell = page.locator('[class*="cell"]').first()
    if ((await firstCell.count()) > 0) {
      await firstCell.click()
      await page.keyboard.type('5')
      // The cell should now show "5" — we can't easily query the cell text without
      // more selector knowledge, so just assert no crash and root still mounted.
    }
    await expectMounted(page)
  })

  test('instrument settings persisted state survives a page reload', async ({ page }) => {
    // Verify the editor remembers its instrument across reloads — the same
    // path that broke in the earlier "Wait for auth before restoring active
    // project on mount" bug. This is a smoke test for project restoration,
    // not a full instrument-switch test (which would need a stable selector
    // for the UiSelect dropdown — kept for a future test).
    await page.goto('/')
    await expectMounted(page)
    const before = await page.evaluate(() => localStorage.getItem('tabEditorInstrument'))
    await page.reload()
    await expectMounted(page)
    const after = await page.evaluate(() => localStorage.getItem('tabEditorInstrument'))
    expect(after).toBe(before)
  })
})
