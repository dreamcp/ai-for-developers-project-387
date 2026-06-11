import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { EventTypesPage as GuestEventTypes } from './pages/guest/EventTypesPage'
import { BookingPage } from './pages/guest/BookingPage'
import { EventTypesPage as OwnerEventTypes } from './pages/owner/EventTypesPage'
import { BookingsPage as OwnerBookings } from './pages/owner/BookingsPage'
import { Button } from './components/ui/button'

function Header() {
  const { pathname } = useLocation()
  const isOwner = pathname.startsWith('/owner')

  return (
    <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl tracking-[0.15em] uppercase font-serif text-primary">
          Lumiere
        </Link>
        <nav className="flex gap-2 items-center">
          {isOwner ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/owner/event-types">Event Types</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/owner/bookings">Bookings</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/">Guest View</Link>
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/owner/event-types">Owner Panel</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<GuestEventTypes />} />
            <Route path="/book/:eventTypeId" element={<BookingPage />} />
            <Route path="/owner/event-types" element={<OwnerEventTypes />} />
            <Route path="/owner/bookings" element={<OwnerBookings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
