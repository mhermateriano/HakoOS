import { useEffect, useMemo, useState } from 'react'
import { Pin, Trash2, Plus, Search, ChevronLeft, FileText } from 'lucide-react'
import { useVault, type Note } from '../../store/VaultStore'
import { fmtDateFull } from '../../lib/format'
import { catColor } from '../../lib/colors'
import { Button, Select, Tag, Empty } from '../../components/ui'

const tags: Note['tag'][] = ['Idea', 'Meeting', 'Personal', 'Reference']

function ListItem({ note, active, onClick }: { note: Note; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full flex-col gap-1 border-l-2 px-4 py-3 text-left transition-colors ${
        active ? 'border-signal bg-panel-2' : 'border-transparent hover:bg-panel-2/50'
      }`}
    >
      <div className="flex items-center gap-2">
        {note.pinned && <Pin size={11} className="shrink-0 text-signal" fill="currentColor" />}
        <span className="truncate text-[13px] font-600 text-ink">{note.title || 'New note'}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-ink-faint">{fmtDateFull(note.updated)}</span>
        <span className="truncate text-[11.5px] text-ink-dim">{note.body || 'No additional text'}</span>
      </div>
    </button>
  )
}

function Editor({ note }: { note: Note }) {
  const { updateNote, togglePin, deleteNote } = useVault()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Select
            value={note.tag}
            onChange={(e) => updateNote(note.id, { tag: e.target.value as Note['tag'] })}
            className="w-32 py-1 text-[12px]"
          >
            {tags.map((t) => <option key={t}>{t}</option>)}
          </Select>
          <Tag color={catColor[note.tag]}>{note.tag}</Tag>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => togglePin(note.id)}
            className={`rounded-md p-2 transition-colors hover:bg-panel-2 ${note.pinned ? 'text-signal' : 'text-ink-faint hover:text-ink'}`}
            title={note.pinned ? 'Unpin' : 'Pin'}
          >
            <Pin size={15} fill={note.pinned ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => deleteNote(note.id)}
            className="rounded-md p-2 text-ink-faint transition-colors hover:bg-panel-2 hover:text-down"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <input
          value={note.title}
          onChange={(e) => updateNote(note.id, { title: e.target.value })}
          placeholder="Title"
          className="w-full bg-transparent font-sans text-[22px] font-700 tracking-tight text-ink placeholder:text-ink-faint focus:outline-none"
        />
        <div className="mt-1 text-[12px] font-500 text-ink-dim">
          edited {fmtDateFull(note.updated)}
        </div>
        <textarea
          value={note.body}
          onChange={(e) => updateNote(note.id, { body: e.target.value })}
          placeholder="Start writing…"
          className="mt-4 min-h-[50vh] w-full resize-none bg-transparent text-[14px] leading-relaxed text-ink-dim placeholder:text-ink-faint focus:outline-none"
        />
      </div>
    </div>
  )
}

export default function Notes() {
  const { notes, addNote } = useVault()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      notes
        .filter((n) => (filter === 'All' || n.tag === filter) && (n.title.toLowerCase().includes(query.toLowerCase()) || n.body.toLowerCase().includes(query.toLowerCase())))
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updated.localeCompare(a.updated)),
    [notes, query, filter],
  )

  // Keep a valid selection: default to the first note, clear if it vanishes.
  useEffect(() => {
    if (selectedId && !notes.some((n) => n.id === selectedId)) setSelectedId(null)
  }, [notes, selectedId])

  const selected = notes.find((n) => n.id === selectedId) ?? null
  const effectiveId = selected?.id ?? filtered[0]?.id ?? null
  const active = notes.find((n) => n.id === effectiveId) ?? null

  const create = () => {
    const id = addNote({ title: '', body: '', tag: 'Idea' })
    setSelectedId(id)
  }

  return (
    <div className="grid h-[calc(100vh-9.5rem)] grid-cols-1 overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-12px_rgba(0,0,0,0.5)] lg:grid-cols-[320px_1fr]">
      {/* Master list */}
      <div className={`flex min-h-0 flex-col border-line lg:border-r ${selected ? 'hidden lg:flex' : 'flex'}`}>
        <div className="space-y-3 border-b border-line p-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes…"
                className="w-full rounded-md border border-line bg-ground py-1.5 pl-8 pr-3 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-signal/60 focus:outline-none"
              />
            </div>
            <Button variant="signal" onClick={create} title="New note"><Plus size={15} /></Button>
          </div>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="py-1.5 text-[12px]">
            <option>All</option>
            {tags.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </div>
        <div className="min-h-0 flex-1 divide-y divide-line-soft overflow-y-auto">
          {filtered.length === 0 ? (
            <Empty>No notes found.</Empty>
          ) : (
            filtered.map((n) => (
              <ListItem key={n.id} note={n} active={n.id === effectiveId} onClick={() => setSelectedId(n.id)} />
            ))
          )}
        </div>
      </div>

      {/* Detail pane */}
      <div className={`min-h-0 ${selected ? 'flex' : 'hidden lg:flex'} flex-col`}>
        {/* Mobile back bar */}
        {selected && (
          <button
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-1 border-b border-line px-3 py-2 text-[12px] text-ink-dim lg:hidden"
          >
            <ChevronLeft size={15} /> Notes
          </button>
        )}
        {active ? (
          <Editor key={active.id} note={active} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <FileText size={28} className="text-ink-faint" strokeWidth={1.4} />
            <p className="text-[12px] text-ink-faint">Select a note or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  )
}
