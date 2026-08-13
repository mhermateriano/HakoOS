import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, Dot, Check, ListChecks } from 'lucide-react'
import { useVault, type CalEvent } from '../../store/VaultStore'
import { fmtDateFull, relDays } from '../../lib/format'
import { catColor, priorityColor } from '../../lib/colors'
import { Panel, SectionHead, Button, Field, Input, Select, Empty } from '../../components/ui'

const kinds: CalEvent['kind'][] = ['meeting', 'deadline', 'personal', 'bill']
const iso = (d: Date) => d.toISOString().slice(0, 10)

export default function Calendar() {
  const { events, addEvent, deleteEvent, tasks, toggleTask } = useVault()
  const [cursor, setCursor] = useState(() => new Date())
  const [selected, setSelected] = useState(() => iso(new Date()))
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', time: '09:00', kind: 'meeting' as CalEvent['kind'] })

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayIso = iso(new Date())

  const cells = useMemo(() => {
    const arr: (string | null)[] = []
    for (let i = 0; i < firstDay; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(iso(new Date(year, month, d)))
    return arr
  }, [firstDay, daysInMonth, year, month])

  const eventsFor = (day: string) => events.filter((e) => e.date === day)
  const tasksFor = (day: string) => tasks.filter((t) => t.due === day)
  const selectedEvents = eventsFor(selected).sort((a, b) => a.time.localeCompare(b.time))
  const selectedTasks = tasksFor(selected).sort((a, b) => Number(a.done) - Number(b.done))

  const submit = () => {
    if (!form.title) return
    addEvent({ title: form.title, date: selected, time: form.time, kind: form.kind })
    setForm({ title: '', time: '09:00', kind: 'meeting' })
    setOpen(false)
  }

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <Panel>
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-[13px] font-600 tracking-tight text-ink">{monthLabel}</h2>
          <div className="flex items-center gap-1">
            <Button variant="line" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft size={14} /></Button>
            <Button variant="line" onClick={() => setCursor(new Date())}>Today</Button>
            <Button variant="line" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight size={14} /></Button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-line-soft">
          {[['Sun','S'],['Mon','M'],['Tue','T'],['Wed','W'],['Thu','T'],['Fri','F'],['Sat','S']].map(([long, short]) => (
            <div key={long} className="px-1 py-2 text-center text-[9px] uppercase tracking-widest text-ink-faint">
              <span className="hidden sm:inline">{long}</span>
              <span className="sm:hidden">{short}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="min-h-[52px] border-b border-r border-line-soft bg-panel-2/20 sm:min-h-[84px]" />
            const evs = eventsFor(day)
            const dayTasks = tasksFor(day)
            const items = [
              ...evs.map((e) => ({ kind: 'event' as const, id: e.id, title: e.title, color: catColor[e.kind], done: false })),
              ...dayTasks.map((t) => ({ kind: 'task' as const, id: t.id, title: t.title, color: priorityColor[t.priority], done: t.done })),
            ]
            const isToday = day === todayIso
            const isSel = day === selected
            return (
              <button
                key={day}
                onClick={() => setSelected(day)}
                className={`min-h-[52px] border-b border-r border-line-soft p-1 text-left transition-colors hover:bg-panel-2/60 sm:min-h-[84px] sm:p-1.5 ${isSel ? 'bg-panel-2' : ''}`}
              >
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10px] tnum sm:h-6 sm:w-6 sm:text-[11px] ${isToday ? 'bg-signal text-signal-ink font-600' : isSel ? 'text-ink' : 'text-ink-dim'}`}>
                  {Number(day.slice(-2))}
                </span>
                <div className="mt-0.5 hidden space-y-0.5 sm:mt-1 sm:block sm:space-y-1">
                  {items.slice(0, 2).map((it) => (
                    <div key={it.id} className={`flex items-center gap-1 truncate rounded px-1 py-0.5 text-[9.5px] ${it.done ? 'opacity-50' : ''}`} style={{ backgroundColor: `color-mix(in srgb, ${it.color} 15%, transparent)`, color: it.color }}>
                      {it.kind === 'task' ? <ListChecks size={9} className="shrink-0" /> : <Dot size={12} className="-ml-1 shrink-0" />}
                      <span className={`truncate ${it.done ? 'line-through' : ''}`}>{it.title}</span>
                    </div>
                  ))}
                  {items.length > 2 && <div className="px-1 text-[9px] text-ink-faint">+{items.length - 2} more</div>}
                </div>
                {items.length > 0 && (
                  <div className="mt-0.5 flex gap-0.5 sm:hidden">
                    {items.slice(0, 3).map((it) => (
                      <span key={it.id} className="h-1 w-1 rounded-full shrink-0" style={{ backgroundColor: it.color }} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </Panel>

      <Panel className="h-fit">
        <SectionHead
          label={fmtDateFull(selected)}
          count={String(selectedEvents.length + selectedTasks.length)}
          action={<Button variant="signal" onClick={() => setOpen((v) => !v)}><Plus size={14} /></Button>}
        />
        {open && (
          <div className="space-y-3 border-b border-line bg-panel-2/40 p-4">
            <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event name" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Time"><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
              <Field label="Kind">
                <Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as CalEvent['kind'] })}>
                  {kinds.map((k) => <option key={k}>{k}</option>)}
                </Select>
              </Field>
            </div>
            <Button variant="signal" onClick={submit} className="w-full justify-center">Add event</Button>
          </div>
        )}
        <div className="divide-y divide-line-soft">
          {selectedEvents.length === 0 && selectedTasks.length === 0 ? (
            <Empty>Nothing scheduled. {relDays(selected).toLowerCase()}.</Empty>
          ) : (
            selectedEvents.map((e) => (
              <div key={e.id} className="group flex items-center gap-3 px-4 py-3">
                <span className="h-8 w-0.5 rounded-full" style={{ backgroundColor: catColor[e.kind] }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] text-ink">{e.title}</div>
                  <div className="text-[10px] uppercase tracking-wide text-ink-faint">{e.kind} · {e.time}</div>
                </div>
                <button onClick={() => deleteEvent(e.id)} className="rounded-md p-1.5 text-ink-faint opacity-0 transition-all hover:bg-panel-2 hover:text-down group-hover:opacity-100"><Trash2 size={13} /></button>
              </div>
            ))
          )}
        </div>

        {selectedTasks.length > 0 && (
          <>
            <div className="flex items-center gap-1.5 border-t border-line px-4 pt-3 pb-2 text-[10px] uppercase tracking-widest text-ink-faint">
              <ListChecks size={11} /> To-dos due
            </div>
            <div className="divide-y divide-line-soft">
              {selectedTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={() => toggleTask(t.id)}
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors ${t.done ? 'border-transparent bg-signal text-signal-ink' : 'border-line hover:border-ink-faint'}`}
                  >
                    {t.done && <Check size={11} strokeWidth={3} />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-[12.5px] ${t.done ? 'text-ink-faint line-through' : 'text-ink'}`}>{t.title}</div>
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-ink-faint">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: priorityColor[t.priority] }} />
                      {t.priority} · {t.list}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Panel>
    </div>
  )
}
