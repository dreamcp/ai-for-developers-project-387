import { test, expect } from '@playwright/test'

function formatDayLabel(date: Date): string {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  const day = date.getDate()
  const year = date.getFullYear()
  const j = day % 10
  const k = day % 100
  const suffix = j === 1 && k !== 11 ? 'st' : j === 2 && k !== 12 ? 'nd' : j === 3 && k !== 13 ? 'rd' : 'th'
  return `${weekday}, ${month} ${day}${suffix}, ${year}`
}

function tomorrowLabel(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return formatDayLabel(d)
}

test.describe('Guest', () => {
  test('home page shows event types', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Book an event' })).toBeVisible()
    await expect(page.getByText('30-min Chat')).toBeVisible()
    await expect(page.getByText('1-hour Workshop')).toBeVisible()
    await expect(page.getByText('Quick call')).toBeVisible()
    await expect(page.getByText('Deep dive session')).toBeVisible()
    await expect(page.getByText('30 min')).toBeVisible()
    await expect(page.getByText('60 min')).toBeVisible()

    const selectButtons = page.getByRole('button', { name: 'Select' })
    await expect(selectButtons).toHaveCount(2)
  })

  test('navigates to booking page and shows slots', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Select' }).first().click()

    await expect(page.getByRole('heading', { name: /30-min Chat|1-hour Workshop/ })).toBeVisible()

    await page.getByRole('button', { name: tomorrowLabel() }).click()
    await expect(page.getByText(/Slots for/)).toBeVisible()

    const timeSlots = page.getByRole('button', { name: /^\d{2}:\d{2}$/ })
    await expect(timeSlots.first()).toBeVisible()
  })

  test('books a slot successfully', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Select' }).first().click()

    await page.getByRole('button', { name: tomorrowLabel() }).click()
    await page.getByRole('button', { name: /^\d{2}:\d{2}$/ }).first().click()

    await page.getByLabel('Your name').fill('Alice')
    await page.getByLabel('Email').fill('alice@example.com')
    await page.getByRole('button', { name: 'Confirm Booking' }).click()

    await expect(page.getByText('Booking confirmed!')).toBeVisible()
  })

  test('double-booking the same slot shows conflict', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Select' }).first().click()

    await page.getByRole('button', { name: tomorrowLabel() }).click()

    const slotButton = page.getByRole('button', { name: /^\d{2}:\d{2}$/ }).first()

    // First booking
    await slotButton.click()
    await page.getByLabel('Your name').fill('Bob')
    await page.getByLabel('Email').fill('bob@example.com')
    await page.getByRole('button', { name: 'Confirm Booking' }).click()
    await expect(page.getByText('Booking confirmed!')).toBeVisible()

    // Second booking — same slot
    await slotButton.click()
    await page.getByLabel('Your name').fill('Bob')
    await page.getByLabel('Email').fill('bob@example.com')
    await page.getByRole('button', { name: 'Confirm Booking' }).click()

    await expect(page.getByText('This slot is already taken')).toBeVisible()
  })

  test('guest view link from owner page navigates back', async ({ page }) => {
    await page.goto('/owner/event-types')

    await page.getByRole('link', { name: 'Guest View' }).click()

    await expect(page.getByRole('heading', { name: 'Book an event' })).toBeVisible()
  })
})
