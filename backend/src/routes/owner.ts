import { Hono } from 'hono'
import * as eventTypeService from '../services/event-type.js'
import * as bookingService from '../services/booking.js'
import type { EventTypeCreate } from '../types.js'

export const ownerRouter = new Hono()

// Event Types CRUD
ownerRouter.get('/event-types', (c) => {
  return c.json(eventTypeService.list())
})

ownerRouter.post('/event-types', async (c) => {
  const body = await c.req.json<EventTypeCreate>()
  const created = eventTypeService.create(body)
  return c.json(created, 201)
})

ownerRouter.put('/event-types/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<EventTypeCreate>()
  const updated = eventTypeService.update(id, body)
  if (!updated) return c.json({ code: 404, message: 'Event type not found' }, 404)
  return c.json(updated)
})

ownerRouter.delete('/event-types/:id', (c) => {
  const id = c.req.param('id')
  const deleted = eventTypeService.remove(id)
  if (!deleted) return c.json({ code: 404, message: 'Event type not found' }, 404)
  return c.body(null, 204)
})

// Bookings
ownerRouter.get('/bookings', (c) => {
  return c.json(bookingService.listAll())
})
