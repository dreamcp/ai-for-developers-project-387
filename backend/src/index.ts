import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { readFileSync } from 'node:fs'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ownerRouter } from './routes/owner.js'
import { guestRouter } from './routes/guest.js'
import * as eventTypeService from './services/event-type.js'

const app = new Hono()

app.use('/api/*', cors())

app.route('/api/owner', ownerRouter)
app.route('/api/guest', guestRouter)

// Serve built frontend (only in production / Docker)
try {
  readFileSync('./public/index.html', 'utf-8')
  app.use('/assets/*', serveStatic({ root: './public' }))
  app.get('*', (c) => {
    return c.html(readFileSync('./public/index.html', 'utf-8'))
  })
} catch {
  // In dev mode — frontend runs via Vite proxy
}

// Seed demo event types
eventTypeService.create({ name: '30-min Chat', description: 'Quick call', durationMinutes: 30 })
eventTypeService.create({ name: '1-hour Workshop', description: 'Deep dive session', durationMinutes: 60 })

const PORT = Number(process.env.PORT) || 3000
console.log(`Server running on http://0.0.0.0:${PORT}`)

serve({ fetch: app.fetch, port: PORT })
