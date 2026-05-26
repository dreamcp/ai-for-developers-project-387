import { randomUUID } from 'node:crypto'
import type { Booking, BookingCreate } from '../types.js'
import { store } from '../store.js'
import { getById } from './event-type.js'

const WINDOW_DAYS = 14

export function listAll(): Booking[] {
  return [...store.bookings.values()].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )
}

export function create(data: BookingCreate): { status: 201; booking: Booking } | { status: 409; error: { code: number; message: string } } {
  const eventType = getById(data.eventTypeId)
  if (!eventType) {
    return { status: 409, error: { code: 404, message: 'Event type not found' } }
  }

  if (!data.guestName?.trim() || !data.guestEmail?.trim()) {
    return { status: 409, error: { code: 400, message: 'guestName and guestEmail are required' } }
  }

  const startTime = new Date(data.startTime)
  if (isNaN(startTime.getTime())) {
    return { status: 409, error: { code: 400, message: 'Invalid startTime' } }
  }

  // 14-day window check
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maxDate = new Date(today.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000)
  if (startTime < today || startTime > maxDate) {
    return { status: 409, error: { code: 400, message: 'Booking must be within 14 days from now' } }
  }

  // Double-booking check
  const startISO = startTime.toISOString()
  const conflict = [...store.bookings.values()].some(
    (b) => b.status === 'confirmed' && b.startTime === startISO
  )
  if (conflict) {
    return { status: 409, error: { code: 409, message: 'This slot is already booked' } }
  }

  const endTime = new Date(startTime.getTime() + eventType.durationMinutes * 60 * 1000)

  const booking: Booking = {
    id: randomUUID(),
    eventTypeId: data.eventTypeId,
    guestName: data.guestName.trim(),
    guestEmail: data.guestEmail.trim(),
    startTime: startISO,
    endTime: endTime.toISOString(),
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }

  store.bookings.set(booking.id, booking)
  return { status: 201, booking }
}
