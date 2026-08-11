import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

// ---- Types -----------------------------------------------------------------

export type Password = {
  id: string
  name: string
  username: string
  password: string
  url: string
  category: 'Personal' | 'Work' | 'Finance' | 'Social' | 'Dev'
  updated: string // ISO date
}

export type Note = {
  id: string
  title: string
  body: string
  tag: 'Idea' | 'Meeting' | 'Personal' | 'Reference'
  pinned: boolean
  updated: string
}

export type IncomeEntry = {
  id: string
  source: string
  category: 'Salary' | 'Freelance' | 'Investment' | 'Sale' | 'Other'
  amount: number
  date: string // ISO date
  accountId?: string
}

export type Expense = {
  id: string
  merchant: string
  category: 'Food' | 'Transport' | 'Groceries' | 'Bills' | 'Shopping' | 'Health' | 'Leisure'
  amount: number
  date: string // ISO date
  accountId?: string
}

export type Account = {
  id: string
  name: string
  type: 'Bank' | 'E-Wallet' | 'Cash' | 'Credit'
  institution: string
  mask: string // last 4 digits
  balance: number
}

export type Task = {
  id: string
  title: string
  done: boolean
  priority: 'low' | 'medium' | 'high'
  due: string // ISO date
  list: 'Today' | 'Work' | 'Personal' | 'Errands'
}

export type CalEvent = {
  id: string
  title: string
  date: string // ISO date
  time: string
  kind: 'meeting' | 'deadline' | 'personal' | 'bill'
}

type VaultState = {
  passwords: Password[]
  notes: Note[]
  income: IncomeEntry[]
  expenses: Expense[]
  accounts: Account[]
  tasks: Task[]
  events: CalEvent[]
}

type VaultContextType = VaultState & {
  addPassword: (p: Omit<Password, 'id' | 'updated'>) => void
  deletePassword: (id: string) => void
  addNote: (n: Omit<Note, 'id' | 'updated' | 'pinned'>) => string
  updateNote: (id: string, patch: Partial<Pick<Note, 'title' | 'body' | 'tag'>>) => void
  togglePin: (id: string) => void
  deleteNote: (id: string) => void
  addIncome: (e: Omit<IncomeEntry, 'id'>) => void
  deleteIncome: (id: string) => void
  addExpense: (e: Omit<Expense, 'id'>) => void
  deleteExpense: (id: string) => void
  addAccount: (a: Omit<Account, 'id'>) => void
  deleteAccount: (id: string) => void
  addTask: (t: Omit<Task, 'id' | 'done'>) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  addEvent: (e: Omit<CalEvent, 'id'>) => void
  deleteEvent: (id: string) => void
}

// ---- Helpers ---------------------------------------------------------------

const uid = () => Math.random().toString(36).slice(2, 10)
const iso = (d: Date) => d.toISOString().slice(0, 10)
const daysFromNow = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return iso(d)
}

// ---- Seed data -------------------------------------------------------------

// Stable account ids so seeded income/expenses can reference them.
const ACC = { bpi: 'acc_bpi', bdo: 'acc_bdo', gcash: 'acc_gcash', cash: 'acc_cash', card: 'acc_card' }

const seed: VaultState = {
  passwords: [
    { id: uid(), name: 'GitHub', username: 'mer.materiano', password: 'x8$Kp2#mQz9!', url: 'github.com', category: 'Dev', updated: daysFromNow(-4) },
    { id: uid(), name: 'BPI Online', username: 'mmateriano1994', password: 'Tr0ub4dor&3!', url: 'bpi.com.ph', category: 'Finance', updated: daysFromNow(-12) },
    { id: uid(), name: 'GCash', username: '0917-555-2043', password: 'Vw7#nLp0qR2', url: 'gcash.com', category: 'Finance', updated: daysFromNow(-1) },
    { id: uid(), name: 'Netflix', username: 'mer.materiano', password: 'Str3am!ng42', url: 'netflix.com', category: 'Personal', updated: daysFromNow(-30) },
    { id: uid(), name: 'Instagram', username: '@mermateriano', password: 'Gr@mL1fe#88', url: 'instagram.com', category: 'Social', updated: daysFromNow(-8) },
    { id: uid(), name: 'AWS Console', username: 'mer-root', password: 'Cl0ud$ecure!9', url: 'aws.amazon.com', category: 'Dev', updated: daysFromNow(-2) },
    { id: uid(), name: 'Lazada', username: 'mer.materiano', password: 'Sh0pSm@rt7', url: 'lazada.com.ph', category: 'Personal', updated: daysFromNow(-45) },
    { id: uid(), name: 'Figma', username: 'mer@studio.ph', password: 'N0te$pace#1', url: 'figma.com', category: 'Work', updated: daysFromNow(-6) },
  ],
  notes: [
    { id: uid(), title: 'Q3 launch checklist', body: 'Finalize pricing tiers, ship the onboarding flow, and draft the changelog announcement before the 20th.', tag: 'Meeting', pinned: true, updated: daysFromNow(-1) },
    { id: uid(), title: 'Palawan trip planning', body: 'Book El Nido flights early, reserve the island-hopping Tour A, and pack reef-safe sunblock. Ask Miguel for the resort contact.', tag: 'Personal', pinned: false, updated: daysFromNow(-3) },
    { id: uid(), title: 'API rate limit fix', body: 'Switch to token bucket, 100 req/min per key. Cache the auth introspection call for 60s.', tag: 'Reference', pinned: true, updated: daysFromNow(-2) },
    { id: uid(), title: 'Side project idea', body: 'A tiny CLI that turns git history into a weekly standup summary. Ship as a single binary.', tag: 'Idea', pinned: false, updated: daysFromNow(-7) },
    { id: uid(), title: 'Standup notes 08/08', body: 'Blocked on the auth migration. Bea is taking the calendar sync. Demo moved to Thursday.', tag: 'Meeting', pinned: false, updated: daysFromNow(-4) },
  ],
  income: [
    { id: uid(), source: 'Studio Nimbus — Salary', category: 'Salary', amount: 68000, date: daysFromNow(-2), accountId: ACC.bdo },
    { id: uid(), source: 'Brand identity — Kombuchari', category: 'Freelance', amount: 32000, date: daysFromNow(-6), accountId: ACC.bpi },
    { id: uid(), source: 'BPI dividend payout', category: 'Investment', amount: 4200, date: daysFromNow(-9), accountId: ACC.bpi },
    { id: uid(), source: 'Print sale — Shopee', category: 'Sale', amount: 2850, date: daysFromNow(-11), accountId: ACC.gcash },
    { id: uid(), source: 'Consulting — Angkas', category: 'Freelance', amount: 24000, date: daysFromNow(-18), accountId: ACC.bpi },
    { id: uid(), source: 'Studio Nimbus — Salary', category: 'Salary', amount: 68000, date: daysFromNow(-32), accountId: ACC.bdo },
    { id: uid(), source: 'Workshop ticket sales', category: 'Other', amount: 7500, date: daysFromNow(-40), accountId: ACC.gcash },
    { id: uid(), source: 'BPI dividend payout', category: 'Investment', amount: 3980, date: daysFromNow(-42), accountId: ACC.bpi },
  ],
  expenses: [
    { id: uid(), merchant: 'Jollibee — Ayala', category: 'Food', amount: 285, date: daysFromNow(0), accountId: ACC.gcash },
    { id: uid(), merchant: 'Grab ride to office', category: 'Transport', amount: 210, date: daysFromNow(0), accountId: ACC.gcash },
    { id: uid(), merchant: 'SM Supermarket', category: 'Groceries', amount: 3420, date: daysFromNow(-1), accountId: ACC.card },
    { id: uid(), merchant: 'Meralco electric bill', category: 'Bills', amount: 2650, date: daysFromNow(-2), accountId: ACC.bpi },
    { id: uid(), merchant: 'Uniqlo — Trinoma', category: 'Shopping', amount: 1990, date: daysFromNow(-3), accountId: ACC.card },
    { id: uid(), merchant: 'Starbucks — BGC', category: 'Food', amount: 320, date: daysFromNow(-3), accountId: ACC.gcash },
    { id: uid(), merchant: 'Watsons pharmacy', category: 'Health', amount: 640, date: daysFromNow(-4), accountId: ACC.cash },
    { id: uid(), merchant: 'Globe postpaid', category: 'Bills', amount: 1499, date: daysFromNow(-5), accountId: ACC.bpi },
    { id: uid(), merchant: 'Netflix subscription', category: 'Leisure', amount: 549, date: daysFromNow(-6), accountId: ACC.card },
    { id: uid(), merchant: 'Beep card load', category: 'Transport', amount: 500, date: daysFromNow(-7), accountId: ACC.cash },
    { id: uid(), merchant: 'Puregold groceries', category: 'Groceries', amount: 2180, date: daysFromNow(-8), accountId: ACC.card },
    { id: uid(), merchant: 'Mercury Drug', category: 'Health', amount: 430, date: daysFromNow(-10), accountId: ACC.cash },
  ],
  accounts: [
    { id: ACC.bpi, name: 'BPI Savings', type: 'Bank', institution: 'Bank of the Philippine Islands', mask: '4821', balance: 184520 },
    { id: ACC.bdo, name: 'BDO Payroll', type: 'Bank', institution: 'BDO Unibank', mask: '7095', balance: 62340 },
    { id: ACC.gcash, name: 'GCash', type: 'E-Wallet', institution: 'G-Xchange', mask: '2043', balance: 8460 },
    { id: ACC.cash, name: 'Cash on hand', type: 'Cash', institution: 'Wallet', mask: '—', balance: 3500 },
    { id: ACC.card, name: 'Metrobank Credit', type: 'Credit', institution: 'Metrobank', mask: '3318', balance: -14280 },
  ],
  tasks: [
    { id: uid(), title: 'Rotate the AWS root password', done: false, priority: 'high', due: daysFromNow(0), list: 'Work' },
    { id: uid(), title: 'Send invoice to Kombuchari', done: false, priority: 'high', due: daysFromNow(1), list: 'Work' },
    { id: uid(), title: 'Reply to Bea about calendar sync', done: true, priority: 'medium', due: daysFromNow(-1), list: 'Work' },
    { id: uid(), title: 'Book dentist appointment', done: false, priority: 'low', due: daysFromNow(3), list: 'Personal' },
    { id: uid(), title: 'Palengke run — ulam list', done: false, priority: 'medium', due: daysFromNow(0), list: 'Errands' },
    { id: uid(), title: 'Review pull request #482', done: false, priority: 'medium', due: daysFromNow(2), list: 'Work' },
    { id: uid(), title: 'Plan Batangas weekend', done: true, priority: 'low', due: daysFromNow(-2), list: 'Personal' },
  ],
  events: [
    { id: uid(), title: 'Design review', date: daysFromNow(0), time: '10:00', kind: 'meeting' },
    { id: uid(), title: 'Condo rent payment', date: daysFromNow(1), time: '09:00', kind: 'bill' },
    { id: uid(), title: 'Q3 launch deadline', date: daysFromNow(4), time: '17:00', kind: 'deadline' },
    { id: uid(), title: 'Client call — Angkas', date: daysFromNow(3), time: '14:00', kind: 'meeting' },
    { id: uid(), title: 'Meralco bill due', date: daysFromNow(6), time: '09:00', kind: 'bill' },
  ],
}

// ---- Context ---------------------------------------------------------------

const KEY = 'vault.state.v5'
const VaultContext = createContext<VaultContextType | null>(null)

export function VaultProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VaultState>(() => {
    try {
      const raw = localStorage.getItem(KEY)
      // Merge over seed so any missing keys fall back to sensible defaults.
      if (raw) return { ...seed, ...(JSON.parse(raw) as Partial<VaultState>) }
    } catch {
      /* ignore */
    }
    return seed
  })

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  const api: VaultContextType = {
    ...state,
    addPassword: (p) =>
      setState((s) => ({ ...s, passwords: [{ ...p, id: uid(), updated: iso(new Date()) }, ...s.passwords] })),
    deletePassword: (id) => setState((s) => ({ ...s, passwords: s.passwords.filter((x) => x.id !== id) })),
    addNote: (n) => {
      const id = uid()
      setState((s) => ({ ...s, notes: [{ ...n, id, pinned: false, updated: iso(new Date()) }, ...s.notes] }))
      return id
    },
    updateNote: (id, patch) =>
      setState((s) => ({
        ...s,
        notes: s.notes.map((x) => (x.id === id ? { ...x, ...patch, updated: iso(new Date()) } : x)),
      })),
    togglePin: (id) =>
      setState((s) => ({ ...s, notes: s.notes.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)) })),
    deleteNote: (id) => setState((s) => ({ ...s, notes: s.notes.filter((x) => x.id !== id) })),
    addIncome: (e) => setState((s) => ({ ...s, income: [{ ...e, id: uid() }, ...s.income] })),
    deleteIncome: (id) => setState((s) => ({ ...s, income: s.income.filter((x) => x.id !== id) })),
    addExpense: (e) => setState((s) => ({ ...s, expenses: [{ ...e, id: uid() }, ...s.expenses] })),
    deleteExpense: (id) => setState((s) => ({ ...s, expenses: s.expenses.filter((x) => x.id !== id) })),
    addAccount: (a) => setState((s) => ({ ...s, accounts: [...s.accounts, { ...a, id: uid() }] })),
    deleteAccount: (id) => setState((s) => ({ ...s, accounts: s.accounts.filter((x) => x.id !== id) })),
    addTask: (t) => setState((s) => ({ ...s, tasks: [{ ...t, id: uid(), done: false }, ...s.tasks] })),
    toggleTask: (id) =>
      setState((s) => ({ ...s, tasks: s.tasks.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) })),
    deleteTask: (id) => setState((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== id) })),
    addEvent: (e) => setState((s) => ({ ...s, events: [{ ...e, id: uid() }, ...s.events] })),
    deleteEvent: (id) => setState((s) => ({ ...s, events: s.events.filter((x) => x.id !== id) })),
  }

  return <VaultContext.Provider value={api}>{children}</VaultContext.Provider>
}

export function useVault() {
  const ctx = useContext(VaultContext)
  if (!ctx) throw new Error('useVault must be used within VaultProvider')
  return ctx
}
