import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { api } from '../../api/client'
import type { Booking } from '../../api/types'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '../../components/ui/table'

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.owner.listBookings()
      .then(setBookings)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-[350] tracking-[0.1em] uppercase mb-8">Upcoming Bookings</h1>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.guestName}</TableCell>
                <TableCell>{b.guestEmail}</TableCell>
                <TableCell>{b.eventTypeId}</TableCell>
                <TableCell>{format(new Date(b.startTime), 'MMM d, HH:mm')}</TableCell>
                <TableCell>{format(new Date(b.endTime), 'MMM d, HH:mm')}</TableCell>
                <TableCell className="capitalize">{b.status}</TableCell>
              </TableRow>
            ))}
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No bookings yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
