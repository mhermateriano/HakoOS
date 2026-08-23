import { getDatabase } from "../database";
import { Password, IncomeEntry, Expense, Account, Task, CalEvent, Note } from "../interfaces/vault.interface";

// ---- Notes -----------------------------------------------------------------

export async function sqlGetAllNotes(): Promise<Note[]> {
  const db = await getDatabase();
  if (!db) return [];

  try {
    const rows = await db.select<any[]>(
      "SELECT id, title, body, tag, pinned, updated FROM notes ORDER BY pinned DESC, updated DESC"
    );
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      tag: r.tag as Note["tag"],
      pinned: r.pinned === 1,
      updated: r.updated,
    }));
  } catch (err) {
    console.error("Failed to fetch notes from SQLite:", err);
    return [];
  }
}

export async function sqlAddNote(note: Note): Promise<void> {
  const db = await getDatabase();
  if (!db) return;

  try {
    await db.execute(
      "INSERT INTO notes (id, title, body, tag, pinned, updated) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        note.id,
        note.title,
        note.body,
        note.tag,
        note.pinned ? 1 : 0,
        note.updated,
      ]
    );
  } catch (err) {
    console.error("Failed to add note to SQLite:", err);
  }
}

export async function sqlUpdateNote(
  id: string,
  patch: Partial<Pick<Note, "title" | "body" | "tag" | "updated">>
): Promise<void> {
  const db = await getDatabase();
  if (!db) return;

  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  if (patch.title !== undefined) {
    fields.push(`title = $${index++}`);
    values.push(patch.title);
  }
  if (patch.body !== undefined) {
    fields.push(`body = $${index++}`);
    values.push(patch.body);
  }
  if (patch.tag !== undefined) {
    fields.push(`tag = $${index++}`);
    values.push(patch.tag);
  }
  if (patch.updated !== undefined) {
    fields.push(`updated = $${index++}`);
    values.push(patch.updated);
  }

  if (fields.length === 0) return;

  values.push(id);
  const query = `UPDATE notes SET ${fields.join(", ")} WHERE id = $${index}`;

  try {
    await db.execute(query, values);
  } catch (err) {
    console.error("Failed to update note in SQLite:", err);
  }
}

export async function sqlTogglePin(id: string, pinned: boolean): Promise<void> {
  const db = await getDatabase();
  if (!db) return;

  try {
    await db.execute("UPDATE notes SET pinned = $1 WHERE id = $2", [
      pinned ? 1 : 0,
      id,
    ]);
  } catch (err) {
    console.error("Failed to toggle pin in SQLite:", err);
  }
}

export async function sqlDeleteNote(id: string): Promise<void> {
  const db = await getDatabase();
  if (!db) return;

  try {
    await db.execute("DELETE FROM notes WHERE id = $1", [id]);
  } catch (err) {
    console.error("Failed to delete note from SQLite:", err);
  }
}

// ---- Passwords -------------------------------------------------------------

export async function sqlGetAllPasswords(): Promise<Password[]> {
  const db = await getDatabase();
  if (!db) return [];
  const rows = await db.select<any[]>("SELECT * FROM passwords");
  return rows.map((r) => ({ ...r }));
}

export async function sqlAddPassword(p: Password): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.execute("INSERT INTO passwords (id, name, username, password, url, category, updated) VALUES ($1, $2, $3, $4, $5, $6, $7)", [p.id, p.name, p.username, p.password, p.url, p.category, p.updated]);
}

export async function sqlDeletePassword(id: string): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.execute("DELETE FROM passwords WHERE id = $1", [id]);
}

// ---- Income ----------------------------------------------------------------

export async function sqlGetAllIncome(): Promise<IncomeEntry[]> {
  const db = await getDatabase();
  if (!db) return [];
  const rows = await db.select<any[]>("SELECT * FROM income");
  return rows.map((r) => ({ ...r, amount: Number(r.amount) }));
}

export async function sqlAddIncome(e: IncomeEntry): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.execute("INSERT INTO income (id, source, category, amount, date, accountId) VALUES ($1, $2, $3, $4, $5, $6)", [e.id, e.source, e.category, e.amount, e.date, e.accountId]);
}

export async function sqlDeleteIncome(id: string): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.execute("DELETE FROM income WHERE id = $1", [id]);
}

// ---- Expenses --------------------------------------------------------------

export async function sqlGetAllExpenses(): Promise<Expense[]> {
  const db = await getDatabase();
  if (!db) return [];
  const rows = await db.select<any[]>("SELECT * FROM expenses");
  return rows.map((r) => ({ ...r, amount: Number(r.amount) }));
}

export async function sqlAddExpense(e: Expense): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.execute("INSERT INTO expenses (id, merchant, category, amount, date, accountId) VALUES ($1, $2, $3, $4, $5, $6)", [e.id, e.merchant, e.category, e.amount, e.date, e.accountId]);
}

export async function sqlDeleteExpense(id: string): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.execute("DELETE FROM expenses WHERE id = $1", [id]);
}

// ---- Accounts --------------------------------------------------------------

export async function sqlGetAllAccounts(): Promise<Account[]> {
  const db = await getDatabase();
  if (!db) return [];
  const rows = await db.select<any[]>("SELECT * FROM accounts");
  return rows.map((r) => ({ ...r, balance: Number(r.balance) }));
}

export async function sqlAddAccount(a: Account): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.execute("INSERT INTO accounts (id, name, type, institution, mask, balance) VALUES ($1, $2, $3, $4, $5, $6)", [a.id, a.name, a.type, a.institution, a.mask, a.balance]);
}

export async function sqlDeleteAccount(id: string): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.execute("DELETE FROM accounts WHERE id = $1", [id]);
}

// ---- Tasks -----------------------------------------------------------------

export async function sqlGetAllTasks(): Promise<Task[]> {
  const db = await getDatabase();
  if (!db) return [];
  const rows = await db.select<any[]>("SELECT * FROM tasks");
  return rows.map((r) => ({ ...r, done: r.done === 1 }));
}

export async function sqlAddTask(t: Task): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.execute("INSERT INTO tasks (id, title, done, priority, due, list) VALUES ($1, $2, $3, $4, $5, $6)", [t.id, t.title, t.done ? 1 : 0, t.priority, t.due, t.list]);
}

export async function sqlToggleTask(id: string, done: boolean): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.execute("UPDATE tasks SET done = $1 WHERE id = $2", [done ? 1 : 0, id]);
}

export async function sqlDeleteTask(id: string): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.execute("DELETE FROM tasks WHERE id = $1", [id]);
}

// ---- Events ----------------------------------------------------------------

export async function sqlGetAllEvents(): Promise<CalEvent[]> {
  const db = await getDatabase();
  if (!db) return [];
  const rows = await db.select<any[]>("SELECT * FROM events");
  return rows.map((r) => ({ ...r }));
}

export async function sqlAddEvent(e: CalEvent): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.execute("INSERT INTO events (id, title, date, time, kind) VALUES ($1, $2, $3, $4, $5)", [e.id, e.title, e.date, e.time, e.kind]);
}

export async function sqlDeleteEvent(id: string): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.execute("DELETE FROM events WHERE id = $1", [id]);
}
