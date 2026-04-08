import { test, expect } from '@playwright/test'

test.beforeEach(({ }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop-only — share button is hidden on mobile via .hideOnTablet')
})

/**
 * Share button smoke test.
 *
 * Regression for the 2026-04-07 deploy crash where wiring up the Share
 * button shipped to prod and immediately threw `x.map is not a function`
 * inside the React error boundary on initial mount.
 *
 * This test signs in (via captured storageState), loads the editor with
 * the auto-restored project, exercises the Share button end-to-end, and
 * confirms no error boundary fires across two full mount cycles.
 */
test.describe('Share button', () => {
  test('renders, opens modal, closes, survives reload', async ({ page }) => {
    // Surface any uncaught client-side errors as test failures
    const pageErrors: Error[] = []
    page.on('pageerror', (err) => pageErrors.push(err))

    // Cycle 1: initial mount with auto-restored project
    await page.goto('/')
    await expect(page.getByRole('banner')).toBeVisible()

    // React must actually mount — root must have children. Today's
    // silent-hang bug passed the no-error check but rendered nothing.
    const rootChildren = await page.evaluate(() => document.getElementById('root')?.children.length ?? 0)
    expect(rootChildren).toBeGreaterThan(0)

    // Editor must mount, NOT the React error boundary
    await expect(page.getByText('Something went wrong')).toHaveCount(0)

    // Share button must be present in the header (title varies by state)
    const shareButton = page.locator(
      'button[title="Share this tab"], button[title="Save to cloud first to share"], button[title="Sign in to share"]'
    )
    await expect(shareButton).toBeVisible()

    // If signed in with a cloudId, clicking opens the modal
    const isShareable = (await shareButton.getAttribute('title')) === 'Share this tab'

    if (isShareable) {
      await shareButton.click()

      // Modal heading appears
      await expect(page.getByRole('heading', { name: /^Share /i })).toBeVisible()

      // Close button (X)
      await page.getByRole('button', { name: 'Close' }).first().click()

      // Modal gone
      await expect(page.getByRole('heading', { name: /^Share /i })).toHaveCount(0)
    }

    // Cycle 2: full reload, confirm editor still mounts cleanly
    await page.reload()
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByText('Something went wrong')).toHaveCount(0)

    // No client errors across either mount
    expect(pageErrors, `pageerrors: ${pageErrors.map((e) => e.message).join('\n')}`).toHaveLength(0)
  })
})
