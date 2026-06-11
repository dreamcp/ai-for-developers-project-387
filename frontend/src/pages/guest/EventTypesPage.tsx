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
    <div className="max-w-3xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif tracking-[0.15em] uppercase text-primary mb-3">
          Our Services
        </h1>
        <p className="text-muted-foreground tracking-wider text-sm">
          Choose your experience
        </p>
        <div className="w-12 h-px bg-accent mx-auto mt-4" />
      </div>
      <div className="grid gap-6">
        {types.map((t, i) => (
          <Card key={t.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <CardHeader>
              <CardTitle className="tracking-wide">{t.name}</CardTitle>
              <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground tracking-wider">{t.durationMinutes} min</span>
              <Button onClick={() => navigate(`/book/${t.id}`)}>Select</Button>
            </CardContent>
          </Card>
        ))}
        {!loading && types.length === 0 && (
          <p className="text-muted-foreground">No services available yet.</p>
        )}
      </div>
    </div>
  )
}
