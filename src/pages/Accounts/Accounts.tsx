import { useMemo, useState } from 'react'
import { Plus, Trash2, Landmark, Wallet, Banknote, CreditCard, ArrowDownLeft, ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react'
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

function AccountRow({ a, onDelete }: { a: Account; onDelete: () => void }) {
  const Icon = typeIcon[a.type]
  const color = accountColor[a.type]
  const negative = a.balance < 0

  return (
    <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-panel-2/50">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`, color }}
      >
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-500 text-ink">{a.name}</span>
          <Tag color={color}>{a.type}</Tag>
        </div>
        <div className="text-[11px] text-ink-faint">{a.institution} · •••• {a.mask}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[14px] font-600 tnum" style={{ color: negative ? '#ff453a' : '#f2f1f6' }}>
          {negative ? '−' : ''}{money(Math.abs(a.balance))}
        </span>
        <button
          onClick={onDelete}
          className="rounded-md p-1.5 text-ink-faint transition-all hover:bg-panel-2 hover:text-down"
          title="Delete account"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export default function Accounts() {
  const { accounts, income, expenses, addAccount, deleteAccount } = useVault()
  const [filter, setFilter] = useState('All')
  const [addOpen, setAddOpen] = useState(false)
  const [accountsOpen, setAccountsOpen] = useState(true)
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
    setAddOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Net worth summary */}
      <div className="grid grid-cols-3 gap-3">
        <Panel className="col-span-3 p-4 sm:col-span-1">
          <div className="text-[12px] font-500 text-ink-dim">Net worth</div>
          <div className="mt-1.5 text-[26px] font-700 tnum tracking-tight sm:mt-2 sm:text-[28px]" style={{ color: netWorth >= 0 ? '#f2f1f6' : '#ff453a' }}>{money(netWorth)}</div>
          <div className="mt-1 text-[11px] text-ink-faint">Across {accounts.length} accounts</div>
        </Panel>
        <Panel className="col-span-3 p-4 sm:col-span-1">
          <div className="text-[12px] font-500 text-ink-dim">Assets</div>
          <div className="mt-2 text-[22px] font-600 tnum text-up">{money(assets)}</div>
        </Panel>
        <Panel className="col-span-3 p-4 sm:col-span-1">
          <div className="text-[12px] font-500 text-ink-dim">Liabilities</div>
          <div className="mt-2 text-[22px] font-600 tnum text-down">{money(liabilities)}</div>
        </Panel>
      </div>

      {/* Accounts list — collapsible */}
      <Panel>
        <div className="flex items-center justify-between px-4 py-3 border-b border-line-soft">
          <button
            onClick={() => setAccountsOpen((v) => !v)}
            className="flex items-center gap-2 text-left"
          >
            <span className="text-[13px] font-600 text-ink">Accounts</span>
            <span className="rounded-full bg-panel-2 px-2 py-0.5 text-[11px] tnum text-ink-dim">{accounts.length}</span>
            {accountsOpen ? <ChevronUp size={14} className="text-ink-faint" /> : <ChevronDown size={14} className="text-ink-faint" />}
          </button>
          <Button variant="signal" onClick={() => { setAddOpen((v) => !v); setAccountsOpen(true) }}>
            <Plus size={14} /> Add
          </Button>
        </div>

        {addOpen && (
          <div className="grid grid-cols-1 gap-3 border-b border-line-soft bg-panel-2/40 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. UnionBank" /></Field>
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Account['type'] })}>
                {types.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Institution"><Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="Bank / provider" /></Field>
            <Field label="Last 4"><Input value={form.mask} onChange={(e) => setForm({ ...form, mask: e.target.value })} placeholder="0000" /></Field>
            <Field label="Balance"><Input type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} placeholder="0.00" /></Field>
            <div className="flex items-end gap-2">
              <Button variant="signal" onClick={submit} className="flex-1 justify-center">Add account</Button>
              <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {accountsOpen && (
          <div className="divide-y divide-line-soft">
            {accounts.length === 0
              ? <Empty>No accounts yet. Add one above.</Empty>
              : accounts.map((a) => <AccountRow key={a.id} a={a} onDelete={() => deleteAccount(a.id)} />)
            }
          </div>
        )}
      </Panel>

      {/* Transactions */}
      <Panel>
        <SectionHead
          label="Transactions"
          count={String(txns.length)}
          action={
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40 py-1.5 text-[12px]">
              <option value="All">All accounts</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          }
        />
        <div className="max-h-[480px] divide-y divide-line-soft overflow-y-auto">
          {txns.length === 0 ? (
            <Empty>No transactions for this account.</Empty>
          ) : txns.map((t) => (
            <div key={`${t.kind}-${t.id}`} className="flex items-center gap-3 px-4 py-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `color-mix(in srgb, ${t.color} 16%, transparent)`, color: t.color }}
              >
                {t.kind === 'income' ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] text-ink">{t.label}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <Tag color={t.color}>{t.category}</Tag>
                  <span className="text-[10.5px] text-ink-faint">{fmtDateFull(t.date)}</span>
                  <span className="hidden text-[10.5px] text-ink-faint sm:inline">· {accName(t.accountId)}</span>
                </div>
              </div>
              <span className="text-[13px] font-600 tnum" style={{ color: t.kind === 'income' ? '#30d158' : '#ff453a' }}>
                {t.kind === 'income' ? '+' : '−'}{money2(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
