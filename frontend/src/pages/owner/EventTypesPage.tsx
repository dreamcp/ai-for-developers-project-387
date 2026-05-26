import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { EventType } from '../../api/types'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '../../components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '../../components/ui/dialog'

const emptyForm = { name: '', description: '', durationMinutes: 30 }

export function EventTypesPage() {
  const [types, setTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<EventType | null>(null)
  const [form, setForm] = useState({ ...emptyForm })

  function load() {
    setLoading(true)
    api.owner.listEventTypes().then(setTypes).finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm })
    setDialogOpen(true)
  }

  function openEdit(t: EventType) {
    setEditing(t)
    setForm({ name: t.name, description: t.description, durationMinutes: t.durationMinutes })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (editing) {
      await api.owner.updateEventType(editing.id, form)
    } else {
      await api.owner.createEventType(form)
    }
    setDialogOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event type?')) return
    await api.owner.deleteEventType(id)
    load()
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Event Types</h1>
        <Button onClick={openCreate}>+ New Event Type</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="w-40">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {types.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="text-muted-foreground">{t.description}</TableCell>
                <TableCell>{t.durationMinutes} min</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(t)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(t.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {types.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No event types yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Event Type' : 'New Event Type'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update the event type details.' : 'Create a new event type.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Input id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dur">Duration (minutes)</Label>
              <Input
                id="dur"
                type="number"
                min={5}
                step={5}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
              />
            </div>

            <Button className="w-full" disabled={!form.name || !form.description || form.durationMinutes < 1} onClick={handleSave}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
