import { LayoutGrid, KeyRound, StickyNote, Wallet, Landmark, CalendarDays, ListChecks, LogOut } from 'lucide-react'
import { useVault } from '../store/VaultStore'
import { isUpcoming } from '../lib/format'
import { getUser } from '../lib/auth'
import { HakoMark } from './Logo'

export type PageKey = 'dashboard' | 'passwords' | 'notes' | 'income' | 'accounts' | 'calendar' | 'tasks'

const nav: { key: PageKey; label: string; icon: typeof LayoutGrid }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { key: 'passwords', label: 'Passwords', icon: KeyRound },
  { key: 'notes', label: 'Notes', icon: StickyNote },
  { key: 'income', label: 'Income', icon: Wallet },
  { key: 'accounts', label: 'Accounts', icon: Landmark },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
  { key: 'tasks', label: 'Tasks', icon: ListChecks },
]

export default function Sidebar({ page, setPage, onLogout }: { page: PageKey; setPage: (p: PageKey) => void; onLogout?: () => void }) {
  const { passwords, notes, income, accounts, tasks, events } = useVault()
  const user = getUser()
  const displayName = user?.username ?? 'HakoOS User'
  const initials = displayName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  const counts: Record<PageKey, number> = {
    dashboard: 0,
    passwords: passwords.length,
    notes: notes.length,
    income: income.length,
    accounts: accounts.length,
    calendar: events.filter((e) => isUpcoming(e.date)).length,
    tasks: tasks.filter((t) => !t.done).length,
  }

  return (
    <aside className="glass flex h-full w-full flex-col border-r border-line">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <HakoMark size={36} />
        <div className="leading-tight">
          <div className="text-[15px] font-600 tracking-[-0.02em] text-ink">Hako<span className="hako-os font-700">OS</span></div>
          <div className="text-[11px] text-ink-faint">Your life. In one box.</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2.5">
        {nav.map(({ key, label, icon: Icon }) => {
          const active = page === key
          return (
            <button
              key={key}
              onClick={() => setPage(key)}
              className={`group flex items-center gap-3 rounded-[10px] px-3 py-2 text-left transition-all duration-150 ${
                active ? 'bg-signal text-signal-ink shadow-[0_1px_2px_rgba(0,0,0,0.3)]' : 'text-ink-dim hover:bg-panel-2/70 hover:text-ink'
              }`}
            >
              <Icon size={17} strokeWidth={2} className={active ? 'text-signal-ink' : 'text-ink-dim group-hover:text-ink'} />
              <span className="flex-1 text-[14px] font-500 tracking-[-0.01em]">{label}</span>
              {key !== 'dashboard' && counts[key] > 0 && (
                <span
                  className={`rounded-full px-1.5 text-[11px] tnum ${
                    active ? 'bg-white/25 text-signal-ink' : 'text-ink-faint group-hover:text-ink-dim'
                  }`}
                >
                  {counts[key]}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="p-3">
        <div className="flex items-center gap-2.5 rounded-xl bg-panel-2/60 p-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-signal text-[13px] font-600 text-signal-ink">
            {initials}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[13px] font-500 text-ink">{displayName}</div>
            <div className="flex items-center gap-1 text-[11px] text-up">
              <span className="h-1.5 w-1.5 rounded-full bg-up" /> Encrypted
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Lock vault"
            className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-line-soft hover:text-ink"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
