export interface EventType {
  id: string
  name: string
  description: string
  durationMinutes: number
}

export interface EventTypeCreate {
  name: string
  description: string
  durationMinutes: number
}

export interface Slot {
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface Booking {
  id: string
  eventTypeId: string
  guestName: string
  guestEmail: string
  startTime: string
  endTime: string
  status: 'confirmed' | 'cancelled'
  createdAt: string
}

export interface BookingCreate {
  eventTypeId: string
  guestName: string
  guestEmail: string
  startTime: string
}

export interface ApiError {
  code: number
  message: string
}
