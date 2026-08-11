import { useMemo, useState } from 'react'
import { Plus, Trash2, Check, Circle, Flag } from 'lucide-react'
import { useVault, type Task } from '../../store/VaultStore'
import { relDays, isUpcoming } from '../../lib/format'
import { catColor, priorityColor } from '../../lib/colors'
import { Panel, SectionHead, Button, Field, Input, Select, Tag, Empty } from '../../components/ui'

const lists: Task['list'][] = ['Today', 'Work', 'Personal', 'Errands']
const priorities: Task['priority'][] = ['high', 'medium', 'low']

export default function Tasks() {
  const { tasks, addTask, toggleTask, deleteTask } = useVault()
  const [tab, setTab] = useState<'all' | 'active' | 'done'>('active')
  const [listFilter, setListFilter] = useState('All')
  const [open, setOpen] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({ title: '', priority: 'medium' as Task['priority'], due: today, list: 'Today' as Task['list'] })

  const filtered = useMemo(
    () =>
      tasks
        .filter((t) => (tab === 'all' ? true : tab === 'active' ? !t.done : t.done))
        .filter((t) => listFilter === 'All' || t.list === listFilter)
        .sort((a, b) => Number(a.done) - Number(b.done) || a.due.localeCompare(b.due)),
    [tasks, tab, listFilter],
  )

  const active = tasks.filter((t) => !t.done)
  const overdue = active.filter((t) => !isUpcoming(t.due)).length
  const done = tasks.filter((t) => t.done).length
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  const submit = () => {
    if (!form.title) return
    addTask(form)
    setForm({ title: '', priority: 'medium', due: today, list: 'Today' })
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Panel className="p-4"><div className="text-[12px] font-500 text-ink-dim">Active</div><div className="mt-2 text-[24px] font-600 tnum text-ink">{active.length}</div></Panel>
        <Panel className="p-4"><div className="text-[12px] font-500 text-ink-dim">Overdue</div><div className="mt-2 text-[24px] font-600 tnum text-down">{overdue}</div></Panel>
        <Panel className="p-4"><div className="text-[12px] font-500 text-ink-dim">Completed</div><div className="mt-2 text-[24px] font-600 tnum text-up">{done}</div></Panel>
        <Panel className="p-4">
          <div className="text-[12px] font-500 text-ink-dim">Progress</div>
          <div className="mt-2 text-[24px] font-600 tnum text-signal">{pct}%</div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-ground"><div className="h-full rounded-full bg-signal transition-all" style={{ width: `${pct}%` }} /></div>
        </Panel>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-0.5 rounded-[10px] bg-panel-2 p-0.5">
          {(['active', 'all', 'done'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-3.5 py-1 text-[13px] font-500 capitalize transition-all ${tab === t ? 'bg-panel text-ink shadow-[0_1px_2px_rgba(0,0,0,0.35)]' : 'text-ink-dim hover:text-ink'}`}>{t}</button>
          ))}
        </div>
        <Select value={listFilter} onChange={(e) => setListFilter(e.target.value)} className="w-36">
          <option>All</option>
          {lists.map((l) => <option key={l}>{l}</option>)}
        </Select>
        <div className="flex-1" />
        <Button variant="signal" onClick={() => setOpen((v) => !v)}><Plus size={14} /> New task</Button>
      </div>

      {open && (
        <Panel>
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
            <Field label="Task"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What needs doing?" /></Field>
            <Field label="List"><Select value={form.list} onChange={(e) => setForm({ ...form, list: e.target.value as Task['list'] })}>{lists.map((l) => <option key={l}>{l}</option>)}</Select></Field>
            <Field label="Priority"><Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Task['priority'] })}>{priorities.map((p) => <option key={p}>{p}</option>)}</Select></Field>
            <Field label="Due"><Input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} /></Field>
            <div className="flex items-end gap-2 lg:col-span-4">
              <Button variant="signal" onClick={submit}>Add task</Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </Panel>
      )}

      <Panel>
        <SectionHead label="Tasks" count={String(filtered.length)} />
        <div className="divide-y divide-line-soft">
          {filtered.length === 0 ? <Empty>Nothing here. Enjoy the quiet.</Empty> : filtered.map((t) => {
            const late = !t.done && !isUpcoming(t.due)
            return (
              <div key={t.id} className="group flex items-center gap-3 px-4 py-3">
                <button onClick={() => toggleTask(t.id)} className="shrink-0 transition-transform hover:scale-110" style={{ color: t.done ? '#4fd9a4' : '#5c586f' }}>
                  {t.done ? <Check size={18} className="rounded-full bg-up/15 p-0.5" /> : <Circle size={18} strokeWidth={1.6} />}
                </button>
                <div className="min-w-0 flex-1">
                  <span className={`text-[13px] ${t.done ? 'text-ink-faint line-through' : 'text-ink'}`}>{t.title}</span>
                </div>
                <Flag size={12} style={{ color: priorityColor[t.priority] }} className="hidden sm:block" />
                <Tag color={catColor[t.list] ?? '#9591ab'}>{t.list}</Tag>
                <span className={`w-16 text-right text-[11px] ${late ? 'text-down' : 'text-ink-dim'}`}>{relDays(t.due)}</span>
                <button onClick={() => deleteTask(t.id)} className="rounded-md p-1.5 text-ink-faint opacity-0 transition-all hover:bg-panel-2 hover:text-down group-hover:opacity-100"><Trash2 size={14} /></button>
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
