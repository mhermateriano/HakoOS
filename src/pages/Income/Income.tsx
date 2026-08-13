import { useMemo, useState } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useVault, type IncomeEntry, type Expense } from '../../store/VaultStore'
import { money, money2, fmtDateFull } from '../../lib/format'
import { catColor, expenseColor } from '../../lib/colors'
import { Panel, SectionHead, Button, Field, Input, Select, Tag, Empty } from '../../components/ui'

const incCats: IncomeEntry['category'][] = ['Salary', 'Freelance', 'Investment', 'Sale', 'Other']
const expCats: Expense['category'][] = ['Food', 'Transport', 'Groceries', 'Bills', 'Shopping', 'Health', 'Leisure']

const inThisMonth = (isoStr: string) => {
  const d = new Date(isoStr + 'T00:00:00')
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

export default function Income() {
  const { income, expenses, accounts, addIncome, deleteIncome, addExpense, deleteExpense } = useVault()
  const today = new Date().toISOString().slice(0, 10)

  const [incOpen, setIncOpen] = useState(false)
  const [expOpen, setExpOpen] = useState(false)
  const [incForm, setIncForm] = useState({ source: '', category: 'Freelance' as IncomeEntry['category'], amount: '', date: today, accountId: '' })
  const [expForm, setExpForm] = useState({ merchant: '', category: 'Food' as Expense['category'], amount: '', date: today, accountId: '' })

  const incomeSorted = useMemo(() => [...income].sort((a, b) => b.date.localeCompare(a.date)), [income])
  const expenseSorted = useMemo(() => [...expenses].sort((a, b) => b.date.localeCompare(a.date)), [expenses])

  const monthIncome = income.filter((e) => inThisMonth(e.date)).reduce((s, e) => s + e.amount, 0)
  const monthExpense = expenses.filter((e) => inThisMonth(e.date)).reduce((s, e) => s + e.amount, 0)
  const net = monthIncome - monthExpense
  const savingsRate = monthIncome > 0 ? Math.round((net / monthIncome) * 100) : 0

  const incomeByCat = incCats
    .map((c) => ({ category: c, total: income.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0) }))
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total)

  const expenseByCat = expCats
    .map((c) => ({ category: c, total: expenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0) }))
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total)

  const accName = (id?: string) => accounts.find((a) => a.id === id)?.name

  const submitIncome = () => {
    const amt = parseFloat(incForm.amount)
    if (!incForm.source || !amt) return
    addIncome({ source: incForm.source, category: incForm.category, amount: amt, date: incForm.date, accountId: incForm.accountId || undefined })
    setIncForm({ source: '', category: 'Freelance', amount: '', date: today, accountId: '' })
    setIncOpen(false)
  }

  const submitExpense = () => {
    const amt = parseFloat(expForm.amount)
    if (!expForm.merchant || !amt) return
    addExpense({ merchant: expForm.merchant, category: expForm.category, amount: amt, date: expForm.date, accountId: expForm.accountId || undefined })
    setExpForm({ merchant: '', category: 'Food', amount: '', date: today, accountId: '' })
    setExpOpen(false)
  }

  const tooltipStyle = { background: '#1b1b21', border: '1px solid #34343e', borderRadius: 8, fontFamily: 'system-ui', fontSize: 12 }

  return (
    <div className="space-y-4">
      {/* Month summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Panel className="p-4"><div className="text-[12px] font-500 text-ink-dim">Income · month</div><div className="mt-2 text-[24px] font-600 tnum text-up">{money(monthIncome)}</div></Panel>
        <Panel className="p-4"><div className="text-[12px] font-500 text-ink-dim">Expenses · month</div><div className="mt-2 text-[24px] font-600 tnum text-down">{money(monthExpense)}</div></Panel>
        <Panel className="p-4"><div className="text-[12px] font-500 text-ink-dim">Net · month</div><div className="mt-2 text-[24px] font-600 tnum" style={{ color: net >= 0 ? '#30d158' : '#ff453a' }}>{net >= 0 ? '+' : '−'}{money(Math.abs(net))}</div></Panel>
        <Panel className="p-4">
          <div className="text-[12px] font-500 text-ink-dim">Savings rate</div>
          <div className="mt-2 text-[24px] font-600 tnum text-signal">{savingsRate}%</div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-ground"><div className="h-full rounded-full bg-signal transition-all" style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }} /></div>
        </Panel>
      </div>

      {/* Income */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="min-w-0 lg:col-span-1">
          <SectionHead label="Income by source" action={<TrendingUp size={15} className="text-up" />} />
          <div className="w-full min-w-0 p-4">
            <ResponsiveContainer width="100%" height={200} minWidth={0}>
              <BarChart data={incomeByCat} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 8 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="category" width={78} tick={{ fontSize: 11, fontFamily: 'system-ui', fill: '#a2a1ad' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#26262e' }} contentStyle={tooltipStyle} formatter={(v) => [money(Number(v)), 'Total']} />
                <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={20}>
                  {incomeByCat.map((d) => <Cell key={d.category} fill={catColor[d.category]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="lg:col-span-2">
          <SectionHead
            label="Income log"
            count={String(income.length)}
            action={<Button variant="signal" onClick={() => setIncOpen((v) => !v)}><Plus size={14} /> Log income</Button>}
          />
          {incOpen && (
            <div className="grid grid-cols-1 gap-3 border-b border-line-soft bg-panel-2/40 p-4 sm:grid-cols-2 lg:grid-cols-6">
              <Field label="Source"><Input value={incForm.source} onChange={(e) => setIncForm({ ...incForm, source: e.target.value })} placeholder="Client / payer" /></Field>
              <Field label="Category">
                <Select value={incForm.category} onChange={(e) => setIncForm({ ...incForm, category: e.target.value as IncomeEntry['category'] })}>
                  {incCats.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Amount"><Input type="number" value={incForm.amount} onChange={(e) => setIncForm({ ...incForm, amount: e.target.value })} placeholder="0.00" /></Field>
              <Field label="Account">
                <Select value={incForm.accountId} onChange={(e) => setIncForm({ ...incForm, accountId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </Select>
              </Field>
              <Field label="Date"><Input type="date" value={incForm.date} onChange={(e) => setIncForm({ ...incForm, date: e.target.value })} /></Field>
              <div className="flex items-end"><Button variant="signal" onClick={submitIncome} className="w-full">Add</Button></div>
            </div>
          )}
          <div className="max-h-[360px] divide-y divide-line-soft overflow-y-auto">
            {incomeSorted.length === 0 ? <Empty>No income logged yet.</Empty> : incomeSorted.map((e) => (
              <div key={e.id} className="group flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] text-ink">{e.source}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Tag color={catColor[e.category]}>{e.category}</Tag>
                    <span className="text-[11px] text-ink-faint">{fmtDateFull(e.date)}</span>
                    {accName(e.accountId) && <span className="text-[11px] text-ink-faint">· {accName(e.accountId)}</span>}
                  </div>
                </div>
                <span className="text-[14px] font-600 tnum text-up">+{money2(e.amount)}</span>
                <button onClick={() => deleteIncome(e.id)} className="rounded-md p-1.5 text-ink-faint transition-all hover:bg-panel-2 hover:text-down opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Daily expenses */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="min-w-0 lg:col-span-1">
          <SectionHead label="Spending by category" action={<TrendingDown size={15} className="text-down" />} />
          <div className="w-full min-w-0 p-4">
            <ResponsiveContainer width="100%" height={224} minWidth={0}>
              <BarChart data={expenseByCat} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 8 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="category" width={78} tick={{ fontSize: 11, fontFamily: 'system-ui', fill: '#a2a1ad' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#26262e' }} contentStyle={tooltipStyle} formatter={(v) => [money(Number(v)), 'Spent']} />
                <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={18}>
                  {expenseByCat.map((d) => <Cell key={d.category} fill={expenseColor[d.category]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="lg:col-span-2">
          <SectionHead
            label="Daily expenses"
            count={String(expenses.length)}
            action={<Button variant="signal" onClick={() => setExpOpen((v) => !v)}><Plus size={14} /> Add expense</Button>}
          />
          {expOpen && (
            <div className="grid grid-cols-1 gap-3 border-b border-line-soft bg-panel-2/40 p-4 sm:grid-cols-2 lg:grid-cols-6">
              <Field label="Merchant"><Input value={expForm.merchant} onChange={(e) => setExpForm({ ...expForm, merchant: e.target.value })} placeholder="Where you spent" /></Field>
              <Field label="Category">
                <Select value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value as Expense['category'] })}>
                  {expCats.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Amount"><Input type="number" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} placeholder="0.00" /></Field>
              <Field label="Account">
                <Select value={expForm.accountId} onChange={(e) => setExpForm({ ...expForm, accountId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </Select>
              </Field>
              <Field label="Date"><Input type="date" value={expForm.date} onChange={(e) => setExpForm({ ...expForm, date: e.target.value })} /></Field>
              <div className="flex items-end"><Button variant="signal" onClick={submitExpense} className="w-full">Add</Button></div>
            </div>
          )}
          <div className="max-h-[360px] divide-y divide-line-soft overflow-y-auto">
            {expenseSorted.length === 0 ? <Empty>No expenses logged yet.</Empty> : expenseSorted.map((e) => (
              <div key={e.id} className="group flex items-center gap-3 px-4 py-3">
                <span className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: expenseColor[e.category] }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] text-ink">{e.merchant}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Tag color={expenseColor[e.category]}>{e.category}</Tag>
                    <span className="text-[11px] text-ink-faint">{fmtDateFull(e.date)}</span>
                    {accName(e.accountId) && <span className="text-[11px] text-ink-faint">· {accName(e.accountId)}</span>}
                  </div>
                </div>
                <span className="text-[14px] font-600 tnum text-down">−{money2(e.amount)}</span>
                <button onClick={() => deleteExpense(e.id)} className="rounded-md p-1.5 text-ink-faint transition-all hover:bg-panel-2 hover:text-down opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
