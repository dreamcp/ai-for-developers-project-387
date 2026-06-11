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
      <Button variant="ghost" className="mb-6 -ml-2 text-muted-foreground" onClick={() => navigate('/')}>
        &larr; Back
      </Button>

      {eventType && (
        <h1 className="text-2xl font-[350] tracking-[0.1em] mb-2">{eventType.name}</h1>
      )}

      <div className="grid md:grid-cols-[auto_1fr] gap-10 mt-8">
        <div className="[&_.rdp]:!m-0 [&_.rdp-month]:!m-0 [&_.rdp-table]:!w-full [&_.rdp-day_button]:!rounded-full [&_.rdp-day_button]:!transition-colors [&_.rdp-day_button:hover]:!bg-primary/10 [&_.rdp-day_button[aria-selected=true]]:!bg-primary [&_.rdp-day_button[aria-selected=true]]:!text-primary-foreground [&_.rdp-day_button[aria-selected=true]]:!shadow-md [&_.rdp-caption_label]:!tracking-[0.05em] [&_.rdp-head_cell]:!text-muted-foreground [&_.rdp-head_cell]:!text-xs [&_.rdp-head_cell]:!tracking-[0.1em] [&_.rdp-head_cell]:!uppercase [&_.rdp-nav_button]:!text-primary [&_.rdp-nav_button:hover]:!bg-primary/10">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && setSelectedDate(d)}
            disabled={{ before: fromDate, after: toDate }}
          />
        </div>

        <div>
          <h2 className="text-sm tracking-[0.1em] uppercase text-muted-foreground mb-4">
            {format(selectedDate, 'MMM d, yyyy')}
          </h2>

          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : availableSlots.length === 0 ? (
            <p className="text-muted-foreground">No free slots on this day.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableSlots.map((s) => (
                <Button
                  key={s.startTime}
                  variant="outline"
                  className="tracking-[0.05em]"
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
            <DialogTitle className="tracking-[0.05em]">Complete your booking</DialogTitle>
            <DialogDescription>
              {selectedSlot && (
                <>{format(new Date(selectedSlot.startTime), 'MMM d, yyyy HH:mm')}</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
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
              className="w-full tracking-[0.05em]"
              disabled={!guestName || !guestEmail || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {message && !dialogOpen && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{message}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')}>Back to services</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
