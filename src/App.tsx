import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { VaultProvider } from './store/VaultStore'
import Sidebar, { type PageKey } from './components/Sidebar'
import Dashboard from './pages/Dashboard/Dashboard'
import Passwords from './pages/Passwords/Passwords'
import Notes from './pages/Notes/Notes'
import Income from './pages/Income/Income'
import Accounts from './pages/Accounts/Accounts'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import Calendar from './pages/Calendar/Calendar'
import Tasks from './pages/Tasks/Tasks'
import { getUser } from './lib/auth'

const meta: Record<PageKey, { title: string; blurb: string }> = {
  dashboard: { title: 'Dashboard', blurb: 'Everything at a glance' },
  passwords: { title: 'Password Vault', blurb: 'Encrypted credentials' },
  notes: { title: 'Notes', blurb: 'Thoughts, worth keeping' },
  income: { title: 'Income & Expenses', blurb: 'Every inflow and outflow' },
  accounts: { title: 'Accounts', blurb: 'Balances & transactions' },
  calendar: { title: 'Calendar', blurb: 'Schedule & deadlines' },
  tasks: { title: 'Tasks', blurb: 'Get things done' },
}

function Shell({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<PageKey>('dashboard')
  const [navOpen, setNavOpen] = useState(false)

  const nav = (p: PageKey) => {
    setPage(p)
    setNavOpen(false)
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-ground text-ink">
      {/* Desktop sidebar */}
      <div className="fixed inset-y-0 left-0 hidden w-60 lg:block">
        <Sidebar page={page} setPage={nav} onLogout={onLogout} />
      </div>

      {/* Mobile drawer overlay */}
      {navOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setNavOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw]">
            <Sidebar page={page} setPage={nav} onLogout={onLogout} />
          </div>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="glass sticky top-0 z-30 flex items-center gap-3 border-b border-line-soft px-4 py-3 sm:px-6">
          <button
            className="rounded-full border border-line p-2 text-ink-dim lg:hidden"
            onClick={() => setNavOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {navOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[18px] font-700 leading-tight tracking-[-0.02em] text-ink sm:text-[22px]">
              {meta[page].title}
            </h1>
            <p className="hidden text-[12px] text-ink-faint sm:block">{meta[page].blurb}</p>
          </div>
          <div className="hidden text-right sm:block">
            <div className="text-[12px] font-500 text-ink-dim">{today}</div>
            <div className="text-[11px] text-ink-faint">Local · offline vault</div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 sm:py-6">
          {page === 'dashboard' && <Dashboard setPage={nav} />}
          {page === 'passwords' && <Passwords />}
          {page === 'notes' && <Notes />}
          {page === 'income' && <Income />}
          {page === 'accounts' && <Accounts />}
          {page === 'calendar' && <Calendar />}
          {page === 'tasks' && <Tasks />}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [registered, setRegistered] = useState(() => getUser() !== null)
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('hako.authed') === '1')

  const handleSignUp = () => {
    sessionStorage.setItem('hako.authed', '1')
    setRegistered(true)
    setAuthed(true)
  }

  const handleSignIn = () => {
    sessionStorage.setItem('hako.authed', '1')
    setAuthed(true)
  }

  const handleSignOut = () => {
    sessionStorage.removeItem('hako.authed')
    setAuthed(false)
  }

  if (!registered) return <Signup onSignUp={handleSignUp} />
  if (!authed) return <Login onSignIn={handleSignIn} />

  return (
    <VaultProvider>
      <Shell onLogout={handleSignOut} />
    </VaultProvider>
  )
}
