import { KeyRound, StickyNote, Wallet, ListChecks, ArrowUpRight, CalendarClock } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useVault } from '../../store/VaultStore'
import { money, relDays, fmtDate, isUpcoming } from '../../lib/format'
import { catColor, priorityColor } from '../../lib/colors'
import { Panel, SectionHead, Tag } from '../../components/ui'
import type { PageKey } from '../../components/Sidebar'

function Stat({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  onClick,
}: {
  label: string
  value: string
  sub: string
  icon: typeof KeyRound
  accent: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-lg border border-line bg-panel p-5 text-left transition-all duration-200 hover:border-ink-faint"
    >
      <div className="flex items-start justify-between">
        <span className="text-[10px] uppercase tracking-[0.18em] text-ink-faint">{label}</span>
        <Icon size={16} strokeWidth={1.8} style={{ color: accent }} />
      </div>
      <div className="mt-6 text-[34px] font-600 leading-none tnum text-ink">{value}</div>
      <div className="mt-2 flex items-center gap-1 text-[11px] text-ink-dim">
        {sub}
        <ArrowUpRight size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
        style={{ backgroundColor: accent }}
      />
    </button>
  )
}

export default function Dashboard({ setPage }: { setPage: (p: PageKey) => void }) {
  const { passwords, notes, income, tasks, events } = useVault()

  const openTasks = tasks.filter((t) => !t.done)
  const upcomingEvents = events.filter((e) => isUpcoming(e.date)).sort((a, b) => a.date.localeCompare(b.date))

  const now = new Date()
  const thisMonth = income.filter((e) => {
    const d = new Date(e.date + 'T00:00:00')
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const monthTotal = thisMonth.reduce((s, e) => s + e.amount, 0)

  // Build a 6-month income trend
  const trend = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const total = income
      .filter((e) => {
        const ed = new Date(e.date + 'T00:00:00')
        return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear()
      })
      .reduce((s, e) => s + e.amount, 0)
    return { month: d.toLocaleDateString('en-US', { month: 'short' }), total }
  })

  const recentIncome = [...income].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Stat row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Passwords" value={String(passwords.length)} sub="stored & encrypted" icon={KeyRound} accent={catColor.Dev} onClick={() => setPage('passwords')} />
        <Stat label="Notes" value={String(notes.length)} sub={`${notes.filter((n) => n.pinned).length} pinned`} icon={StickyNote} accent={catColor.Idea} onClick={() => setPage('notes')} />
        <Stat label="Open tasks" value={String(openTasks.length)} sub={`${openTasks.filter((t) => t.priority === 'high').length} high priority`} icon={ListChecks} accent={priorityColor.high} onClick={() => setPage('tasks')} />
        <Stat label="Income · month" value={money(monthTotal)} sub={`${thisMonth.length} entries`} icon={Wallet} accent={catColor.Salary} onClick={() => setPage('income')} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Income trend */}
        <Panel className="min-w-0 lg:col-span-2">
          <SectionHead label="Income trend" count="last 6 months" />
          <div className="p-4">
            <div className="mb-4 flex items-baseline gap-3">
              <span className="text-[28px] font-600 tnum text-ink">{money(trend.reduce((s, t) => s + t.total, 0))}</span>
              <span className="text-[11px] uppercase tracking-widest text-ink-faint">cumulative</span>
            </div>
            <div className="h-52 w-full min-w-0">
              <ResponsiveContainer width="100%" height={208} minWidth={0}>
                <AreaChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                  <defs>
                    <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4fd9a4" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#4fd9a4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'system-ui', fill: '#6d6c78' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontFamily: 'system-ui', fill: '#6d6c78' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    cursor={{ stroke: '#34343e' }}
                    contentStyle={{ background: '#1b1b21', border: '1px solid #34343e', borderRadius: 8, fontFamily: 'system-ui', fontSize: 12 }}
                    labelStyle={{ color: '#a2a1ad' }}
                    formatter={(v) => [money(Number(v)), 'Income']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#4fd9a4" strokeWidth={2} fill="url(#inc)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Panel>

        {/* Upcoming */}
        <Panel>
          <SectionHead label="Upcoming" count={String(upcomingEvents.length)} action={<CalendarClock size={14} className="text-ink-faint" />} />
          <div className="divide-y divide-line-soft">
            {upcomingEvents.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: catColor[e.kind] }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] text-ink">{e.title}</div>
                  <div className="text-[10px] uppercase tracking-wide text-ink-faint">{e.kind} · {e.time}</div>
                </div>
                <span className="text-[11px] text-ink-dim">{relDays(e.date)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent income */}
        <Panel>
          <SectionHead label="Recent income" count={String(recentIncome.length)} />
          <div className="divide-y divide-line-soft">
            {recentIncome.map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] text-ink">{e.source}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Tag color={catColor[e.category]}>{e.category}</Tag>
                    <span className="text-[10px] text-ink-faint">{fmtDate(e.date)}</span>
                  </div>
                </div>
                <span className="text-[13px] font-600 tnum text-up">+{money(e.amount)}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Priority tasks */}
        <Panel>
          <SectionHead label="Priority tasks" count={String(openTasks.length)} action={<button onClick={() => setPage('tasks')} className="text-[11px] text-ink-dim hover:text-signal">view all →</button>} />
          <div className="divide-y divide-line-soft">
            {[...openTasks]
              .sort((a, b) => a.due.localeCompare(b.due))
              .slice(0, 5)
              .map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: priorityColor[t.priority] }} />
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{t.title}</span>
                  <Tag color={catColor[t.list] ?? '#a2a1ad'}>{t.list}</Tag>
                  <span className="w-16 text-right text-[11px] text-ink-dim">{relDays(t.due)}</span>
                </div>
              ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
