import type { Slot, EventType } from '../types.js'
import { store } from '../store.js'

const START_HOUR = 9
const END_HOUR = 17

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function generateSlots(eventType: EventType, dateStr: string): Slot[] {
  const dayStart = parseDate(dateStr)
  const slots: Slot[] = []

  const startMs = dayStart.getTime() + START_HOUR * 60 * 60 * 1000
  const endMs = dayStart.getTime() + END_HOUR * 60 * 60 * 1000
  const durationMs = eventType.durationMinutes * 60 * 1000

  const now = new Date()

  for (let t = startMs; t + durationMs <= endMs; t += durationMs) {
    const slotStart = new Date(t)
    const startTime = slotStart.toISOString()
    const endTime = new Date(t + durationMs).toISOString()

    const isPast = slotStart <= now
    const isBooked = [...store.bookings.values()].some(
      (b) => b.status === 'confirmed' && b.startTime === startTime
    )

    slots.push({ startTime, endTime, isAvailable: !isBooked && !isPast })
  }

  return slots
}
