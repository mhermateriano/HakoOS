
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
  id: string;
  title: string;
  body: string;
  tag: "Idea" | "Meeting" | "Personal" | "Reference";
  pinned: boolean;
  updated: string;
};

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

export type VaultState = {
  passwords: Password[]
  notes: Note[]
  income: IncomeEntry[]
  expenses: Expense[]
  accounts: Account[]
  tasks: Task[]
  events: CalEvent[]
}
