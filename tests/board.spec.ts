/**
 * Core-path spec for the live shore board (M1): a departure logged by one
 * signed-in user shows up live for another, and either one can check a
 * boat in. See tests/collab.spec.ts for the `users` fixture's contract.
 */
import { test, expect, loadAllTestAccounts } from 'deepspace/testing'

const usableTestAccounts = loadAllTestAccounts().length
test.skip(
  usableTestAccounts < 2,
  `Needs 2 usable test accounts, found ${usableTestAccounts}. Create them with ` +
    '`npx deepspace test accounts create --email <name>@deepspace.test --name "<name>" ' +
    '--password-stdin`, or fetch existing pool accounts with `npx deepspace test accounts recover --all`.',
)

test('a departure logged by one user is live for another, and either can check it in', async ({
  users,
}) => {
  const [a, b] = await users(2)

  await Promise.all([a.page.goto('/board'), b.page.goto('/board')])
  await expect(a.page.getByTestId('board-page')).toBeVisible({ timeout: 15_000 })
  await expect(b.page.getByTestId('board-page')).toBeVisible({ timeout: 15_000 })

  // Unique name so this test is robust to other trips already on the board
  // (sample fleet, prior runs, a second developer's test accounts).
  const vesselName = `Playwright Boat ${Date.now()}`

  await a.page.getByTestId('log-departure-button').click()
  await a.page.getByLabel('Vessel name').fill(vesselName)
  await a.page.getByLabel('Skipper').fill('Playwright Skipper')
  // Expected-return keeps the form's default (now + 2h) — this test cares
  // about sync and check-in, not the overdue cron.
  await a.page.getByRole('button', { name: 'Log departure' }).click()
  await expect(a.page.getByText('Departure logged')).toBeVisible({ timeout: 15_000 })

  // User B never reloads — seeing it appear proves realtime sync, not a
  // fresh fetch.
  const cardOnB = b.page.locator('[data-testid="trip-card"]').filter({ hasText: vesselName })
  await expect(cardOnB).toBeVisible({ timeout: 15_000 })
  await expect(cardOnB.getByText('Out', { exact: true })).toBeVisible()

  // B checks it in; A sees the status flip to Returned without reloading.
  await cardOnB.getByRole('button', { name: 'Check in' }).click()

  const cardOnA = a.page.locator('[data-testid="trip-card"]').filter({ hasText: vesselName })
  await expect(cardOnA.getByText('Returned', { exact: true })).toBeVisible({ timeout: 15_000 })
  await expect(a.page.getByTestId('group-returned').getByText(vesselName)).toBeVisible()
})

test('sample fleet and quick test trip buttons add trips everyone can see', async ({ users }) => {
  const [a, b] = await users(2)

  await Promise.all([a.page.goto('/board'), b.page.goto('/board')])
  await expect(a.page.getByTestId('board-page')).toBeVisible({ timeout: 15_000 })

  await a.page.getByTestId('quick-test-trip-button').click()
  await expect(a.page.getByText('Quick test trip added')).toBeVisible({ timeout: 15_000 })

  const quickTestCardOnB = b.page
    .locator('[data-testid="trip-card"]')
    .filter({ hasText: 'Quick Test Boat' })
    .first()
  await expect(quickTestCardOnB).toBeVisible({ timeout: 15_000 })
})
