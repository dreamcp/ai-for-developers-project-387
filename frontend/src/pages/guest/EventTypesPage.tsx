import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import type { EventType } from '../../api/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export function EventTypesPage() {
  const [types, setTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.guest.listEventTypes()
      .then(setTypes)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-center text-muted-foreground py-12">Loading...</p>

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Book an event</h1>
      <div className="grid gap-4">
        {types.map((t) => (
          <Card key={t.id}>
            <CardHeader>
              <CardTitle>{t.name}</CardTitle>
              <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t.durationMinutes} min</span>
              <Button onClick={() => navigate(`/book/${t.id}`)}>Select</Button>
            </CardContent>
          </Card>
        ))}
        {!loading && types.length === 0 && (
          <p className="text-muted-foreground">No event types available yet.</p>
        )}
      </div>
    </div>
  )
}
