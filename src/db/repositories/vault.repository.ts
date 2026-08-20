import { useEffect } from 'react'
import { VaultState, Password, IncomeEntry, Expense, Account, Task, CalEvent, Note } from '../interfaces/vault.interface'

const KEY = 'vault.state.v5'

// Custom hook for persistence
export const useVaultPersistence = (state: VaultState, isTauri: boolean) => {
  useEffect(() => {
    if (isTauri) {
      const { notes, ...nonNotes } = state
      saveVaultState({ ...nonNotes, notes: [] } as VaultState)
    } else {
      saveVaultState(state)
    }
  }, [state, isTauri])
}

export const saveVaultState = (state: VaultState) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save vault state to localStorage:', e)
  }
}

export const loadVaultState = (): Partial<VaultState> | null => {
  try {
    const data = localStorage.getItem(KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('Failed to load vault state from localStorage:', e)
    return null
  }
}

// Helpers
export const uid = () => Math.random().toString(36).slice(2, 10)
export const iso = (d: Date) => d.toISOString().slice(0, 10)
export const daysFromNow = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return iso(d)
}

// Actions
export const addPassword = (s: VaultState, p: Omit<Password, 'id' | 'updated'>): VaultState => ({
  ...s,
  passwords: [{ ...p, id: uid(), updated: iso(new Date()) }, ...s.passwords],
})

export const deletePassword = (s: VaultState, id: string): VaultState => ({
  ...s,
  passwords: s.passwords.filter((x) => x.id !== id),
})

// income expense
export const addIncome = (s: VaultState, e: Omit<IncomeEntry, 'id'>): VaultState => ({
  ...s,
  income: [{ ...e, id: uid() }, ...s.income],
})

export const deleteIncome = (s: VaultState, id: string): VaultState => ({
  ...s,
  income: s.income.filter((x) => x.id !== id),
})

export const addExpense = (s: VaultState, e: Omit<Expense, 'id'>): VaultState => ({
  ...s,
  expenses: [{ ...e, id: uid() }, ...s.expenses],
})

export const deleteExpense = (s: VaultState, id: string): VaultState => ({
  ...s,
  expenses: s.expenses.filter((x) => x.id !== id),
})

//account
export const addAccount = (s: VaultState, a: Omit<Account, 'id'>): VaultState => ({
  ...s,
  accounts: [...s.accounts, { ...a, id: uid() }],
})

export const deleteAccount = (s: VaultState, id: string): VaultState => ({
  ...s,
  accounts: s.accounts.filter((x) => x.id !== id),
})

//task
export const addTask = (s: VaultState, t: Omit<Task, 'id' | 'done'>): VaultState => ({
  ...s,
  tasks: [{ ...t, id: uid(), done: false }, ...s.tasks],
})

export const toggleTask = (s: VaultState, id: string): VaultState => ({
  ...s,
  tasks: s.tasks.map((x) => (x.id === id ? { ...x, done: !x.done } : x)),
})

export const deleteTask = (s: VaultState, id: string): VaultState => ({
  ...s,
  tasks: s.tasks.filter((x) => x.id !== id),
})

//event
export const addEvent = (s: VaultState, e: Omit<CalEvent, 'id'>): VaultState => ({
  ...s,
  events: [{ ...e, id: uid() }, ...s.events],
})

export const deleteEvent = (s: VaultState, id: string): VaultState => ({
  ...s,
  events: s.events.filter((x) => x.id !== id),
})

// note
export const addNote = (s: VaultState, n: Omit<Note, 'id' | 'updated' | 'pinned'>, id: string): VaultState => ({
  ...s,
  notes: [{ ...n, id, pinned: false, updated: iso(new Date()) }, ...s.notes],
})

export const updateNote = (s: VaultState, id: string, patch: Partial<Pick<Note, 'title' | 'body' | 'tag'>>): VaultState => ({
  ...s,
  notes: s.notes.map((x) => (x.id === id ? { ...x, ...patch, updated: iso(new Date()) } : x)),
})

export const togglePin = (s: VaultState, id: string): VaultState => ({
  ...s,
  notes: s.notes.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)),
})

export const deleteNote = (s: VaultState, id: string): VaultState => ({
  ...s,
  notes: s.notes.filter((x) => x.id !== id),
})
