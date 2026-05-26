import { test, expect } from '@playwright/test'

test.describe('Owner', () => {
  test('event types page shows table with seed data', async ({ page }) => {
    await page.goto('/owner/event-types')

    await expect(page.getByRole('heading', { name: 'Event Types' })).toBeVisible()
    await expect(page.getByRole('button', { name: '+ New Event Type' })).toBeVisible()

    await expect(page.getByRole('cell', { name: '30-min Chat' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '1-hour Workshop' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '30 min' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '60 min' })).toBeVisible()
  })

  test('creates a new event type', async ({ page }) => {
    await page.goto('/owner/event-types')

    await page.getByRole('button', { name: '+ New Event Type' }).click()
    await page.getByLabel('Name').fill('15-min Standup')
    await page.getByLabel('Description').fill('Daily sync')
    await page.getByLabel('Duration').fill('15')
    await page.getByRole('button', { name: 'Create' }).click()

    await expect(page.getByRole('cell', { name: '15-min Standup' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '15 min' })).toBeVisible()
  })

  test('edits an existing event type', async ({ page }) => {
    await page.goto('/owner/event-types')

    // Edit the first row
    await page.getByRole('button', { name: 'Edit' }).first().click()
    await page.getByLabel('Name').clear()
    await page.getByLabel('Name').fill('Updated Chat')
    await page.getByRole('button', { name: 'Update' }).click()

    await expect(page.getByRole('cell', { name: 'Updated Chat' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '30-min Chat' })).not.toBeVisible()
  })

  test('deletes an event type', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept())

    await page.goto('/owner/event-types')

    const deleteButtons = page.getByRole('button', { name: 'Delete' })
    const countBefore = await deleteButtons.count()

    await deleteButtons.first().click()
    await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(countBefore - 1)
  })

  test('bookings page shows created bookings', async ({ page }) => {
    await page.goto('/owner/bookings')

    await expect(page.getByRole('heading', { name: 'Upcoming Bookings' })).toBeVisible()

    await expect(page.getByRole('cell', { name: 'Alice', exact: true })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'alice@example.com' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Bob', exact: true })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'bob@example.com' })).toBeVisible()

    await expect(page.getByRole('cell', { name: 'confirmed' })).toHaveCount(2)
  })
})
