/**
 * Cron trigger/pause/resume is restricted to the app owner (D-011,
 * docs/DECISIONS.md) — enforced server-side in
 * src/server/realtime-routes.ts, which this spec can't exercise directly
 * since the app owner signs in via real OAuth, not a `@deepspace.test`
 * account. What a non-owner test account CAN prove: the monitor renders
 * read-only for them, with no trigger controls to even attempt — the UI
 * half of "owner-only."
 */
import { test, expect, loadAllTestAccounts } from 'deepspace/testing'

const usableTestAccounts = loadAllTestAccounts().length
test.skip(
  usableTestAccounts < 1,
  `Needs 1 usable test account, found ${usableTestAccounts}. Create one with ` +
    '`npx deepspace test accounts create --email <name>@deepspace.test --name "<name>" ' +
    '--password-stdin`.',
)

test('a non-owner sees the cron monitor read-only, with no trigger controls', async ({ users }) => {
  const [user] = await users(1)

  await user.page.goto('/cron-admin')
  await expect(user.page.getByText('overdue-scan', { exact: true })).toBeVisible({ timeout: 15_000 })
  await expect(user.page.getByText(/only the app owner can trigger/i)).toBeVisible()
  await expect(user.page.getByRole('button', { name: /run now/i })).toHaveCount(0)
  await expect(user.page.getByRole('button', { name: /pause|resume/i })).toHaveCount(0)
})
