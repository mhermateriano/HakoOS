import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { initDatabase, isTauri } from '../db/database'
import { Account, CalEvent, Expense, IncomeEntry, Note, Password, Task, VaultState } from '@/db/interfaces/vault.interface';
import * as VaultRepo from '@/db/repositories/vault.repository';
import * as SqlRepo from '@/db/repositories/sql.repository';

// ---- Types -----------------------------------------------------------------

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

const daysFromNow = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return VaultRepo.iso(d)
}

// ---- Seed data -------------------------------------------------------------

// Stable account ids so seeded income/expenses can reference them.
const ACC = { bpi: 'acc_bpi', bdo: 'acc_bdo', gcash: 'acc_gcash', cash: 'acc_cash', card: 'acc_card' }

const seed: VaultState = {
  passwords: [
    { id: VaultRepo.uid(), name: 'GitHub', username: 'mer.materiano', password: 'x8$Kp2#mQz9!', url: 'github.com', category: 'Dev', updated: daysFromNow(-4) },
    { id: VaultRepo.uid(), name: 'BPI Online', username: 'mmateriano1994', password: 'Tr0ub4dor&3!', url: 'bpi.com.ph', category: 'Finance', updated: daysFromNow(-12) },
    { id: VaultRepo.uid(), name: 'GCash', username: '0917-555-2043', password: 'Vw7#nLp0qR2', url: 'gcash.com', category: 'Finance', updated: daysFromNow(-1) },
    { id: VaultRepo.uid(), name: 'Netflix', username: 'mer.materiano', password: 'Str3am!ng42', url: 'netflix.com', category: 'Personal', updated: daysFromNow(-30) },
    { id: VaultRepo.uid(), name: 'Instagram', username: '@mermateriano', password: 'Gr@mL1fe#88', url: 'instagram.com', category: 'Social', updated: daysFromNow(-8) },
    { id: VaultRepo.uid(), name: 'AWS Console', username: 'mer-root', password: 'Cl0ud$ecure!9', url: 'aws.amazon.com', category: 'Dev', updated: daysFromNow(-2) },
    { id: VaultRepo.uid(), name: 'Lazada', username: 'mer.materiano', password: 'Sh0pSm@rt7', url: 'lazada.com.ph', category: 'Personal', updated: daysFromNow(-45) },
    { id: VaultRepo.uid(), name: 'Figma', username: 'mer@studio.ph', password: 'N0te$pace#1', url: 'figma.com', category: 'Work', updated: daysFromNow(-6) },
  ],
  notes: [
    { id: VaultRepo.uid(), title: 'Q3 launch checklist', body: 'Finalize pricing tiers, ship the onboarding flow, and draft the changelog announcement before the 20th.', tag: 'Meeting', pinned: true, updated: daysFromNow(-1) },
    { id: VaultRepo.uid(), title: 'Palawan trip planning', body: 'Book El Nido flights early, reserve the island-hopping Tour A, and pack reef-safe sunblock. Ask Miguel for the resort contact.', tag: 'Personal', pinned: false, updated: daysFromNow(-3) },
    { id: VaultRepo.uid(), title: 'API rate limit fix', body: 'Switch to token bucket, 100 req/min per key. Cache the auth introspection call for 60s.', tag: 'Reference', pinned: true, updated: daysFromNow(-2) },
    { id: VaultRepo.uid(), title: 'Side project idea', body: 'A tiny CLI that turns git history into a weekly standup summary. Ship as a single binary.', tag: 'Idea', pinned: false, updated: daysFromNow(-7) },
    { id: VaultRepo.uid(), title: 'Standup notes 08/08', body: 'Blocked on the auth migration. Bea is taking the calendar sync. Demo moved to Thursday.', tag: 'Meeting', pinned: false, updated: daysFromNow(-4) },
  ],
  income: [
    { id: VaultRepo.uid(), source: 'Studio Nimbus — Salary', category: 'Salary', amount: 68000, date: daysFromNow(-2), accountId: ACC.bdo },
    { id: VaultRepo.uid(), source: 'Brand identity — Kombuchari', category: 'Freelance', amount: 32000, date: daysFromNow(-6), accountId: ACC.bpi },
    { id: VaultRepo.uid(), source: 'BPI dividend payout', category: 'Investment', amount: 4200, date: daysFromNow(-9), accountId: ACC.bpi },
    { id: VaultRepo.uid(), source: 'Print sale — Shopee', category: 'Sale', amount: 2850, date: daysFromNow(-11), accountId: ACC.gcash },
    { id: VaultRepo.uid(), source: 'Consulting — Angkas', category: 'Freelance', amount: 24000, date: daysFromNow(-18), accountId: ACC.bpi },
    { id: VaultRepo.uid(), source: 'Studio Nimbus — Salary', category: 'Salary', amount: 68000, date: daysFromNow(-32), accountId: ACC.bdo },
    { id: VaultRepo.uid(), source: 'Workshop ticket sales', category: 'Other', amount: 7500, date: daysFromNow(-40), accountId: ACC.gcash },
    { id: VaultRepo.uid(), source: 'BPI dividend payout', category: 'Investment', amount: 3980, date: daysFromNow(-42), accountId: ACC.bpi },
  ],
  expenses: [
    { id: VaultRepo.uid(), merchant: 'Jollibee — Ayala', category: 'Food', amount: 285, date: daysFromNow(0), accountId: ACC.gcash },
    { id: VaultRepo.uid(), merchant: 'Grab ride to office', category: 'Transport', amount: 210, date: daysFromNow(0), accountId: ACC.gcash },
    { id: VaultRepo.uid(), merchant: 'SM Supermarket', category: 'Groceries', amount: 3420, date: daysFromNow(-1), accountId: ACC.card },
    { id: VaultRepo.uid(), merchant: 'Meralco electric bill', category: 'Bills', amount: 2650, date: daysFromNow(-2), accountId: ACC.bpi },
    { id: VaultRepo.uid(), merchant: 'Uniqlo — Trinoma', category: 'Shopping', amount: 1990, date: daysFromNow(-3), accountId: ACC.card },
    { id: VaultRepo.uid(), merchant: 'Starbucks — BGC', category: 'Food', amount: 320, date: daysFromNow(-3), accountId: ACC.gcash },
    { id: VaultRepo.uid(), merchant: 'Watsons pharmacy', category: 'Health', amount: 640, date: daysFromNow(-4), accountId: ACC.cash },
    { id: VaultRepo.uid(), merchant: 'Globe postpaid', category: 'Bills', amount: 1499, date: daysFromNow(-5), accountId: ACC.bpi },
    { id: VaultRepo.uid(), merchant: 'Netflix subscription', category: 'Leisure', amount: 549, date: daysFromNow(-6), accountId: ACC.card },
    { id: VaultRepo.uid(), merchant: 'Beep card load', category: 'Transport', amount: 500, date: daysFromNow(-7), accountId: ACC.cash },
    { id: VaultRepo.uid(), merchant: 'Puregold groceries', category: 'Groceries', amount: 2180, date: daysFromNow(-8), accountId: ACC.card },
    { id: VaultRepo.uid(), merchant: 'Mercury Drug', category: 'Health', amount: 430, date: daysFromNow(-10), accountId: ACC.cash },
  ],
  accounts: [
    { id: ACC.bpi, name: 'BPI Savings', type: 'Bank', institution: 'Bank of the Philippine Islands', mask: '4821', balance: 184520 },
    { id: ACC.bdo, name: 'BDO Payroll', type: 'Bank', institution: 'BDO Unibank', mask: '7095', balance: 62340 },
    { id: ACC.gcash, name: 'GCash', type: 'E-Wallet', institution: 'G-Xchange', mask: '2043', balance: 8460 },
    { id: ACC.cash, name: 'Cash on hand', type: 'Cash', institution: 'Wallet', mask: '—', balance: 3500 },
    { id: ACC.card, name: 'Metrobank Credit', type: 'Credit', institution: 'Metrobank', mask: '3318', balance: -14280 },
  ],
  tasks: [
    { id: VaultRepo.uid(), title: 'Rotate the AWS root password', done: false, priority: 'high', due: daysFromNow(0), list: 'Work' },
    { id: VaultRepo.uid(), title: 'Send invoice to Kombuchari', done: false, priority: 'high', due: daysFromNow(1), list: 'Work' },
    { id: VaultRepo.uid(), title: 'Reply to Bea about calendar sync', done: true, priority: 'medium', due: daysFromNow(-1), list: 'Work' },
    { id: VaultRepo.uid(), title: 'Book dentist appointment', done: false, priority: 'low', due: daysFromNow(3), list: 'Personal' },
    { id: VaultRepo.uid(), title: 'Palengke run — ulam list', done: false, priority: 'medium', due: daysFromNow(0), list: 'Errands' },
    { id: VaultRepo.uid(), title: 'Review pull request #482', done: false, priority: 'medium', due: daysFromNow(2), list: 'Work' },
    { id: VaultRepo.uid(), title: 'Plan Batangas weekend', done: true, priority: 'low', due: daysFromNow(-2), list: 'Personal' },
  ],
  events: [
    { id: VaultRepo.uid(), title: 'Design review', date: daysFromNow(0), time: '10:00', kind: 'meeting' },
    { id: VaultRepo.uid(), title: 'Condo rent payment', date: daysFromNow(1), time: '09:00', kind: 'bill' },
    { id: VaultRepo.uid(), title: 'Q3 launch deadline', date: daysFromNow(4), time: '17:00', kind: 'deadline' },
    { id: VaultRepo.uid(), title: 'Client call — Angkas', date: daysFromNow(3), time: '14:00', kind: 'meeting' },
    { id: VaultRepo.uid(), title: 'Meralco bill due', date: daysFromNow(6), time: '09:00', kind: 'bill' },
  ],
}

// ---- Context ---------------------------------------------------------------

const VaultContext = createContext<VaultContextType | null>(null)

export function VaultProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VaultState>(() => {
    const saved = VaultRepo.loadVaultState()
    return { ...seed, ...saved, notes: isTauri() ? [] : (saved?.notes || seed.notes) }
  })

  useEffect(() => {
    if (isTauri()) {
      initDatabase(seed)
        .then(async () => {
          const data = await Promise.all([
            SqlRepo.sqlGetAllNotes(),
            SqlRepo.sqlGetAllPasswords(),
            SqlRepo.sqlGetAllIncome(),
            SqlRepo.sqlGetAllExpenses(),
            SqlRepo.sqlGetAllAccounts(),
            SqlRepo.sqlGetAllTasks(),
            SqlRepo.sqlGetAllEvents(),
          ])
          const [notes, passwords, income, expenses, accounts, tasks, events] = data
          console.log("Loaded from SQL:", { notes, passwords, income, expenses, accounts, tasks, events })
          setState({ notes, passwords, income, expenses, accounts, tasks, events })
        })
        .catch((err) => {
          console.error('Failed to load data from SQLite:', err)
        })
    }
  }, [])



  VaultRepo.useVaultPersistence(state, isTauri())

  const api: VaultContextType = {
    ...state,
    addPassword: (p) => {
      const id = VaultRepo.uid()
      const updated = VaultRepo.iso(new Date())
      const password = { ...p, id, updated }
      setState((s) => VaultRepo.addPassword(s, p))
      if (isTauri()) SqlRepo.sqlAddPassword(password).catch(console.error)
    },
    deletePassword: (id) => {
      setState((s) => VaultRepo.deletePassword(s, id))
      if (isTauri()) SqlRepo.sqlDeletePassword(id).catch(console.error)
    },
    addNote: (n) => {
      const id = VaultRepo.uid()
      const updated = VaultRepo.iso(new Date())
      const newNote = { ...n, id, pinned: false, updated }
      setState((s) => VaultRepo.addNote(s, n, id))
      if (isTauri()) SqlRepo.sqlAddNote(newNote).catch(console.error)
      return id
    },
    updateNote: (id, patch) => {
      setState((s) => VaultRepo.updateNote(s, id, patch))
      if (isTauri()) SqlRepo.sqlUpdateNote(id, { ...patch, updated: VaultRepo.iso(new Date()) }).catch(console.error)
    },
    togglePin: (id) => {
      setState((s) => {
        const note = s.notes.find((x) => x.id === id)
        const nextPinned = note ? !note.pinned : false
        if (isTauri()) SqlRepo.sqlTogglePin(id, nextPinned).catch(console.error)
        return VaultRepo.togglePin(s, id)
      })
    },
    deleteNote: (id) => {
      setState((s) => VaultRepo.deleteNote(s, id))
      if (isTauri()) SqlRepo.sqlDeleteNote(id).catch(console.error)
    },
    addIncome: (e) => {
      const id = VaultRepo.uid()
      const incomeEntry = { ...e, id }
      setState((s) => VaultRepo.addIncome(s, e))
      if (isTauri()) SqlRepo.sqlAddIncome(incomeEntry).catch(console.error)
    },
    deleteIncome: (id) => {
      setState((s) => VaultRepo.deleteIncome(s, id))
      if (isTauri()) SqlRepo.sqlDeleteIncome(id).catch(console.error)
    },
    addExpense: (e) => {
      const id = VaultRepo.uid()
      const expense = { ...e, id }
      setState((s) => VaultRepo.addExpense(s, e))
      if (isTauri()) SqlRepo.sqlAddExpense(expense).catch(console.error)
    },
    deleteExpense: (id) => {
      setState((s) => VaultRepo.deleteExpense(s, id))
      if (isTauri()) SqlRepo.sqlDeleteExpense(id).catch(console.error)
    },
    addAccount: (a) => {
      const id = VaultRepo.uid()
      const account = { ...a, id }
      setState((s) => VaultRepo.addAccount(s, a))
      if (isTauri()) SqlRepo.sqlAddAccount(account).catch(console.error)
    },
    deleteAccount: (id) => {
      setState((s) => VaultRepo.deleteAccount(s, id))
      if (isTauri()) SqlRepo.sqlDeleteAccount(id).catch(console.error)
    },
    addTask: (t) => {
      const id = VaultRepo.uid()
      const task = { ...t, id, done: false }
      setState((s) => VaultRepo.addTask(s, t))
      if (isTauri()) SqlRepo.sqlAddTask(task).catch(console.error)
    },
    toggleTask: (id) => {
      setState((s) => {
        const task = s.tasks.find((x) => x.id === id)
        const nextDone = task ? !task.done : false
        if (isTauri()) SqlRepo.sqlToggleTask(id, nextDone).catch(console.error)
        return VaultRepo.toggleTask(s, id)
      })
    },
    deleteTask: (id) => {
      setState((s) => VaultRepo.deleteTask(s, id))
      if (isTauri()) SqlRepo.sqlDeleteTask(id).catch(console.error)
    },
    addEvent: (e) => {
      const id = VaultRepo.uid()
      const event = { ...e, id }
      setState((s) => VaultRepo.addEvent(s, e))
      if (isTauri()) SqlRepo.sqlAddEvent(event).catch(console.error)
    },
    deleteEvent: (id) => {
      setState((s) => VaultRepo.deleteEvent(s, id))
      if (isTauri()) SqlRepo.sqlDeleteEvent(id).catch(console.error)
    },
  }

  return <VaultContext.Provider value={api}>{children}</VaultContext.Provider>
}

export function useVault() {
  const ctx = useContext(VaultContext)
  if (!ctx) throw new Error('useVault must be used within VaultProvider')
  return ctx
}
