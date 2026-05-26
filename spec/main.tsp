import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

@server("http://localhost:3000/api", "Local dev server")
namespace CalendarApi;

// --- Aliases ---

alias utcDateTime = TypeSpec.DateTime;

// --- Models ---

model EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: int32;
}

model EventTypeCreate {
  name: string;
  description: string;
  durationMinutes: int32;
}

model Slot {
  startTime: utcDateTime;
  endTime: utcDateTime;
  isAvailable: boolean;
}

model Booking {
  id: string;
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: utcDateTime;
  endTime: utcDateTime;
  status: "confirmed" | "cancelled";
  createdAt: utcDateTime;
}

model BookingCreate {
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: utcDateTime;
}

model Error {
  code: int32;
  message: string;
}

// --- Owner Endpoints ---

@route("owner/event-types")
@tag("Owner: Event Types")
interface OwnerEventTypes {
  /** List all event types */
  @get list(): EventType[];

  /** Create a new event type */
  @post create(@body body: EventTypeCreate): EventType;

  /** Update an event type */
  @route("{id}")
  @put update(@path id: string, @body body: EventTypeCreate): EventType;

  /** Delete an event type */
  @route("{id}")
  @delete delete(@path id: string): void;
}

@route("owner/bookings")
@tag("Owner: Bookings")
interface OwnerBookings {
  /** List all upcoming bookings across all event types */
  @get list(): Booking[];
}

// --- Guest Endpoints ---

@route("guest/event-types")
@tag("Guest: Event Types")
interface GuestEventTypes {
  /** List available event types */
  @get list(): EventType[];

  /** Get available slots for a specific event type and date */
  @route("{id}/slots")
  @get getSlots(
    @path id: string,
    @query date: string
  ): Slot[];
}

@route("guest/bookings")
@tag("Guest: Bookings")
interface GuestBookings {
  /** Create a booking. Returns 409 if the slot is already taken. */
  @post create(@body body: BookingCreate): {
    @statusCode statusCode: 201;
    @body booking: Booking;
  } | {
    @statusCode statusCode: 409;
    @body error: Error;
  };
}
