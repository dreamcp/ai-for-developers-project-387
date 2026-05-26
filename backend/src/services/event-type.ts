import { randomUUID } from 'node:crypto'
import type { EventType, EventTypeCreate } from '../types.js'
import { store } from '../store.js'

export function list(): EventType[] {
  return [...store.eventTypes.values()]
}

export function getById(id: string): EventType | undefined {
  return store.eventTypes.get(id)
}

export function create(data: EventTypeCreate): EventType {
  const eventType: EventType = {
    id: randomUUID(),
    name: data.name,
    description: data.description,
    durationMinutes: data.durationMinutes,
  }
  store.eventTypes.set(eventType.id, eventType)
  return eventType
}

export function update(id: string, data: EventTypeCreate): EventType | undefined {
  const existing = store.eventTypes.get(id)
  if (!existing) return undefined

  const updated: EventType = {
    ...existing,
    name: data.name,
    description: data.description,
    durationMinutes: data.durationMinutes,
  }
  store.eventTypes.set(id, updated)
  return updated
}

export function remove(id: string): boolean {
  return store.eventTypes.delete(id)
}
