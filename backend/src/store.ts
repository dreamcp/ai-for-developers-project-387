import type { EventType, Booking } from './types.js'

export class Store {
  eventTypes = new Map<string, EventType>()
  bookings = new Map<string, Booking>()
}

export const store = new Store()
