import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, addDays, startOfDay } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import { api } from '../../api/client'
import type { EventType, Slot } from '../../api/types'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog'
import 'react-day-picker/style.css'

export function BookingPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>()
  const navigate = useNavigate()

  const [eventType, setEventType] = useState<EventType | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const today = startOfDay(new Date())
  const fromDate = today
  const toDate = addDays(today, 13)

  useEffect(() => {
    if (!eventTypeId) return
    api.guest.listEventTypes().then((types) => {
      const found = types.find((t) => t.id === eventTypeId)
      setEventType(found ?? null)
    })
  }, [eventTypeId])

  useEffect(() => {
    if (!eventTypeId) return
    setLoading(true)
    api.guest.getSlots(eventTypeId, format(selectedDate, 'yyyy-MM-dd'))
      .then(setSlots)
      .finally(() => setLoading(false))
  }, [eventTypeId, selectedDate])

  function openBookingForm(slot: Slot) {
    setSelectedSlot(slot)
    setGuestName('')
    setGuestEmail('')
    setMessage(null)
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!selectedSlot || !eventTypeId) return
    setSubmitting(true)
    setMessage(null)
    try {
      await api.guest.createBooking({
        eventTypeId,
        guestName,
        guestEmail,
        startTime: selectedSlot.startTime,
      })
      setMessage('Booking confirmed!')
      setDialogOpen(false)
    } catch (e: unknown) {
      const err = e as Error
      if (err.cause === 409) {
        setMessage('This slot is already taken. Please choose another.')
      } else {
        setMessage(err.message || 'Something went wrong.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const availableSlots = slots.filter((s) => s.isAvailable)

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <Button variant="ghost" className="mb-6" onClick={() => navigate('/')}>
        &larr; Back
      </Button>

      {eventType && (
        <h1 className="text-3xl font-serif tracking-[0.1em] mb-2">{eventType.name}</h1>
      )}

      <div className="grid md:grid-cols-[auto_1fr] gap-8 mt-8">
        <div>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && setSelectedDate(d)}
            disabled={{ before: fromDate, after: toDate }}
          />
        </div>

        <div>
          <h2 className="font-semibold mb-3">
            Slots for {format(selectedDate, 'MMM d, yyyy')}
          </h2>

          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : availableSlots.length === 0 ? (
            <p className="text-muted-foreground">No free slots on this day.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableSlots.map((s) => (
                <Button
                  key={s.startTime}
                  variant="outline"
                  onClick={() => openBookingForm(s)}
                >
                  {format(new Date(s.startTime), 'HH:mm')}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete your booking</DialogTitle>
            <DialogDescription>
              {selectedSlot && (
                <>Slot: {format(new Date(selectedSlot.startTime), 'MMM d, yyyy HH:mm')}</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            {message && (
              <p className="text-sm text-destructive">{message}</p>
            )}

            <Button
              className="w-full"
              disabled={!guestName || !guestEmail || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {message && !dialogOpen && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{message}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')}>Back to events</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
