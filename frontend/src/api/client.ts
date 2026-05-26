const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const message = body?.message ?? `Request failed (${res.status})`
    throw new Error(message, { cause: res.status })
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  // --- Guest ---
  guest: {
    listEventTypes: () =>
      request<import('./types').EventType[]>('/guest/event-types'),

    getSlots: (eventTypeId: string, date: string) =>
      request<import('./types').Slot[]>(
        `/guest/event-types/${eventTypeId}/slots?date=${date}`
      ),

    createBooking: (body: import('./types').BookingCreate) =>
      request<import('./types').Booking>('/guest/bookings', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  // --- Owner ---
  owner: {
    listEventTypes: () =>
      request<import('./types').EventType[]>('/owner/event-types'),

    createEventType: (body: import('./types').EventTypeCreate) =>
      request<import('./types').EventType>('/owner/event-types', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    updateEventType: (id: string, body: import('./types').EventTypeCreate) =>
      request<import('./types').EventType>(`/owner/event-types/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    deleteEventType: (id: string) =>
      request<void>(`/owner/event-types/${id}`, { method: 'DELETE' }),

    listBookings: () =>
      request<import('./types').Booking[]>('/owner/bookings'),
  },
}
