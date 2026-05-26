# AGENTS.md

## Project state

Backend (Hono + in-memory store) built. Frontend (Vite + React + Tailwind + shadcn/ui) built. Both work together.

## Domain model

- **Owner** — predefined profile, no auth. Owner manages event types and views all bookings.
- **EventType** — created by owner: `id`, `name`, `description`, `durationMinutes`.
- **Slot** — computed time window within the 14-day horizon: `startTime`, `endTime`, `isAvailable`.
- **Booking** — created by guest: `eventTypeId`, `guestName`, `guestEmail`, `startTime`, `endTime`, `status` (confirmed/cancelled).

## Business rules

- No registration or auth. Owner is a hardcoded profile. Guest books anonymously.
- Booking window: **14 days from current date**. Slots outside this range are never offered.
- **No double-booking** on the same `startTime` even across different event types → return 409 Conflict.
- `Booking.endTime` is derived from `EventType.durationMinutes` + `startTime`.

## API contract (`spec/main.tsp`)

Base URL: `http://localhost:3000/api`

### Owner
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/owner/event-types` | GET | List all event types |
| `/api/owner/event-types` | POST | Create event type |
| `/api/owner/event-types/{id}` | PUT | Update event type |
| `/api/owner/event-types/{id}` | DELETE | Delete event type |
| `/api/owner/bookings` | GET | All upcoming bookings |

### Guest
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/guest/event-types` | GET | List available types |
| `/api/guest/event-types/{id}/slots?date=` | GET | Free slots for a date |
| `/api/guest/bookings` | POST | Create booking → 201 or 409 |

## Backend (`backend/`)

- **Stack:** Node.js + TypeScript + Hono + in-memory storage (Map)
- **Entry:** `src/index.ts` — serves on `:3000`, seeds 2 demo event types
- **Routes:** `src/routes/owner.ts` + `src/routes/guest.ts`
- **Services:** event-type CRUD, slot generation (09:00–17:00 window), booking with double-booking check
- **Slots** generated per day: step = `eventType.durationMinutes`, checked against existing bookings
- **To run:** `cd backend && npm run dev`

## Frontend (`frontend/`)

- **Stack:** Vite + React 19 + TypeScript + Tailwind v4 + shadcn/ui components
- **Routing:** React Router v7 (BrowserRouter)
- **API client:** `src/api/client.ts` — typed fetch wrapper with Vite proxy `/api → localhost:3000`
- **Pages:**
  - `/` — guest: list of event types (cards)
  - `/book/:eventTypeId` — guest: DayPicker calendar (14-day window) + slot grid + booking dialog
  - `/owner/event-types` — owner: CRUD table with create/edit dialogs
  - `/owner/bookings` — owner: all upcoming bookings table
- **To run:** `cd frontend && npm run dev`

## TypeSpec → OpenAPI compilation

- Config: `spec/tspconfig.yaml`
- Compile: `cd spec && npm run compile` (outputs to `spec/tsp-output/`)
- Mock server: `cd spec && npm run mock` (Prism on `:3000`)

## Dev workflow

```
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```
