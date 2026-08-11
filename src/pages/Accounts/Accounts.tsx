import { useMemo, useState } from 'react'
import { Plus, Trash2, Landmark, Wallet, Banknote, CreditCard, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useVault, type Account } from '../../store/VaultStore'
import { money, money2, fmtDateFull } from '../../lib/format'
import { accountColor, catColor, expenseColor } from '../../lib/colors'
import { Panel, SectionHead, Button, Field, Input, Select, Tag, Empty } from '../../components/ui'

const types: Account['type'][] = ['Bank', 'E-Wallet', 'Cash', 'Credit']
const typeIcon = { Bank: Landmark, 'E-Wallet': Wallet, Cash: Banknote, Credit: CreditCard }

type Txn = {
  id: string
  kind: 'income' | 'expense'
  label: string
  category: string
  amount: number
  date: string
  accountId?: string
  color: string
}

export default function Accounts() {
  const { accounts, income, expenses, addAccount, deleteAccount } = useVault()
  const [filter, setFilter] = useState('All')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'Bank' as Account['type'], institution: '', mask: '', balance: '' })

  const netWorth = accounts.reduce((s, a) => s + a.balance, 0)
  const assets = accounts.filter((a) => a.balance > 0).reduce((s, a) => s + a.balance, 0)
  const liabilities = accounts.filter((a) => a.balance < 0).reduce((s, a) => s + a.balance, 0)

  const txns = useMemo<Txn[]>(() => {
    const inc: Txn[] = income.map((e) => ({ id: e.id, kind: 'income', label: e.source, category: e.category, amount: e.amount, date: e.date, accountId: e.accountId, color: catColor[e.category] ?? '#30d158' }))
    const exp: Txn[] = expenses.map((e) => ({ id: e.id, kind: 'expense', label: e.merchant, category: e.category, amount: e.amount, date: e.date, accountId: e.accountId, color: expenseColor[e.category] ?? '#ff453a' }))
    return [...inc, ...exp]
      .filter((t) => filter === 'All' || t.accountId === filter)
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [income, expenses, filter])

  const accName = (id?: string) => accounts.find((a) => a.id === id)?.name ?? 'Unassigned'

  const submit = () => {
    if (!form.name) return
    addAccount({ name: form.name, type: form.type, institution: form.institution || form.type, mask: form.mask || '—', balance: parseFloat(form.balance) || 0 })
    setForm({ name: '', type: 'Bank', institution: '', mask: '', balance: '' })
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Net worth summary */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Panel className="p-4 lg:col-span-1">
          <div className="text-[12px] font-500 text-ink-dim">Net worth</div>
          <div className="mt-2 text-[28px] font-700 tnum tracking-tight" style={{ color: netWorth >= 0 ? '#f2f1f6' : '#ff453a' }}>{money(netWorth)}</div>
          <div className="mt-1 text-[12px] text-ink-faint">Across {accounts.length} accounts</div>
        </Panel>
        <Panel className="p-4"><div className="text-[12px] font-500 text-ink-dim">Assets</div><div className="mt-2 text-[24px] font-600 tnum text-up">{money(assets)}</div></Panel>
        <Panel className="p-4"><div className="text-[12px] font-500 text-ink-dim">Liabilities</div><div className="mt-2 text-[24px] font-600 tnum text-down">{money(liabilities)}</div></Panel>
      </div>

      {/* Account cards */}
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-600 tracking-[-0.01em] text-ink">Your accounts</h2>
        <Button variant="signal" onClick={() => setOpen((v) => !v)}><Plus size={14} /> Add account</Button>
      </div>

      {open && (
        <Panel>
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
            <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. UnionBank" /></Field>
            <Field label="Type"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Account['type'] })}>{types.map((t) => <option key={t}>{t}</option>)}</Select></Field>
            <Field label="Institution"><Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="Bank / provider" /></Field>
            <Field label="Last 4"><Input value={form.mask} onChange={(e) => setForm({ ...form, mask: e.target.value })} placeholder="0000" /></Field>
            <Field label="Balance"><Input type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} placeholder="0.00" /></Field>
            <div className="flex items-end"><Button variant="signal" onClick={submit} className="w-full">Add</Button></div>
          </div>
        </Panel>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {accounts.map((a) => {
          const Icon = typeIcon[a.type]
          const color = accountColor[a.type]
          const negative = a.balance < 0
          return (
            <Panel key={a.id} className="group relative overflow-hidden p-4">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.07]" style={{ backgroundColor: color }} />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`, color }}>
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[14px] font-600 text-ink">{a.name}</div>
                    <div className="text-[11.5px] text-ink-faint">{a.institution}</div>
                  </div>
                </div>
                <button onClick={() => deleteAccount(a.id)} className="rounded-md p-1.5 text-ink-faint opacity-0 transition-all hover:bg-panel-2 hover:text-down group-hover:opacity-100"><Trash2 size={14} /></button>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-[11px] text-ink-faint">Balance</div>
                  <div className="text-[22px] font-700 tnum tracking-tight" style={{ color: negative ? '#ff453a' : '#f2f1f6' }}>{negative ? '−' : ''}{money(Math.abs(a.balance))}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag color={color}>{a.type}</Tag>
                  <span className="font-mono text-[12px] tnum text-ink-faint">•••• {a.mask}</span>
                </div>
              </div>
            </Panel>
          )
        })}
      </div>

      {/* Transactions */}
      <Panel>
        <SectionHead
          label="Transactions"
          count={String(txns.length)}
          action={
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-44 py-1.5 text-[12px]">
              <option value="All">All accounts</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          }
        />
        <div className="max-h-[440px] divide-y divide-line-soft overflow-y-auto">
          {txns.length === 0 ? <Empty>No transactions for this account.</Empty> : txns.map((t) => (
            <div key={`${t.kind}-${t.id}`} className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${t.color} 16%, transparent)`, color: t.color }}>
                {t.kind === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] text-ink">{t.label}</div>
                <div className="mt-1 flex items-center gap-2">
                  <Tag color={t.color}>{t.category}</Tag>
                  <span className="text-[11px] text-ink-faint">{fmtDateFull(t.date)}</span>
                  <span className="text-[11px] text-ink-faint">· {accName(t.accountId)}</span>
                </div>
              </div>
              <span className="text-[14px] font-600 tnum" style={{ color: t.kind === 'income' ? '#30d158' : '#ff453a' }}>
                {t.kind === 'income' ? '+' : '−'}{money2(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
