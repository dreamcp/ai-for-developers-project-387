import { Hono } from 'hono'
import * as eventTypeService from '../services/event-type.js'
import * as slotService from '../services/slot.js'
import * as bookingService from '../services/booking.js'
import type { BookingCreate } from '../types.js'

export const guestRouter = new Hono()

guestRouter.get('/event-types', (c) => {
  return c.json(eventTypeService.list())
})

guestRouter.get('/event-types/:id/slots', (c) => {
  const id = c.req.param('id')
  const date = c.req.query('date')

  if (!date) return c.json({ code: 400, message: 'date query parameter is required' }, 400)

  const eventType = eventTypeService.getById(id)
  if (!eventType) return c.json({ code: 404, message: 'Event type not found' }, 404)

  const slots = slotService.generateSlots(eventType, date)
  return c.json(slots)
})

guestRouter.post('/bookings', async (c) => {
  const body = await c.req.json<BookingCreate>()
  const result = bookingService.create(body)

  if (result.status === 201) {
    return c.json(result.booking, 201)
  }
  return c.json(result.error, 409)
})
