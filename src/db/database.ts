import Database from "@tauri-apps/plugin-sql";
import { VaultState } from "./interfaces/vault.interface";

let hakoDB: Database | null = null;

export const isTauri = () => {
  return typeof window !== "undefined" && ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);
};

export async function getDatabase(): Promise<Database | null> {
  if (!isTauri()) {
    return null;
  }
  if (!hakoDB) {
    try {
      hakoDB = await Database.load("sqlite:hako.db");
    } catch (e) {
      console.error("Failed to load sqlite:hako.db", e);
      return null;
    }
  }
  return hakoDB;
}

export async function initDatabase(seed: VaultState): Promise<Database | null> {
  const db = await getDatabase();
  if (!db) {
    return null;
  }

  try {
    // Create tables
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        tag TEXT NOT NULL,
        pinned INTEGER NOT NULL DEFAULT 0,
        updated TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS passwords (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        url TEXT NOT NULL,
        category TEXT NOT NULL,
        updated TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS income (
        id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        accountId TEXT
      );
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        merchant TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        accountId TEXT
      );
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        institution TEXT NOT NULL,
        mask TEXT NOT NULL,
        balance REAL NOT NULL
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        done INTEGER NOT NULL DEFAULT 0,
        priority TEXT NOT NULL,
        due TEXT NOT NULL,
        list TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        kind TEXT NOT NULL
      );
    `);

    // Check if tables are empty to seed data
    const checkEmpty = async (table: string) => {
      const existing = await db.select<any[]>(`SELECT id FROM ${table} LIMIT 1`);
      return existing.length === 0;
    };

    if (await checkEmpty("notes")) {
      console.log("Seeding notes...");
      for (const n of seed.notes) {
        try {
          await db.execute(
            "INSERT INTO notes (id, title, body, tag, pinned, updated) VALUES ($1, $2, $3, $4, $5, $6)",
            [n.id, n.title, n.body, n.tag, n.pinned ? 1 : 0, n.updated]
          );
          console.log(`Seeded note: ${n.id}`);
        } catch (e) {
          console.error(`Failed to seed note ${n.id}:`, e);
        }
      }
      console.log("Notes seeding process completed.");
    }
    
    // Similarly seed other tables if empty...
    // For brevity, I will implement seeding for all as requested.
    
    if (await checkEmpty("passwords")) {
      for (const p of seed.passwords) {
        await db.execute(
          "INSERT INTO passwords (id, name, username, password, url, category, updated) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [p.id, p.name, p.username, p.password, p.url, p.category, p.updated]
        );
      }
    }

    if (await checkEmpty("income")) {
      for (const i of seed.income) {
        await db.execute(
          "INSERT INTO income (id, source, category, amount, date, accountId) VALUES ($1, $2, $3, $4, $5, $6)",
          [i.id, i.source, i.category, i.amount, i.date, i.accountId]
        );
      }
    }

    if (await checkEmpty("expenses")) {
      for (const e of seed.expenses) {
        await db.execute(
          "INSERT INTO expenses (id, merchant, category, amount, date, accountId) VALUES ($1, $2, $3, $4, $5, $6)",
          [e.id, e.merchant, e.category, e.amount, e.date, e.accountId]
        );
      }
    }

    if (await checkEmpty("accounts")) {
      for (const a of seed.accounts) {
        await db.execute(
          "INSERT INTO accounts (id, name, type, institution, mask, balance) VALUES ($1, $2, $3, $4, $5, $6)",
          [a.id, a.name, a.type, a.institution, a.mask, a.balance]
        );
      }
    }

    if (await checkEmpty("tasks")) {
      for (const t of seed.tasks) {
        await db.execute(
          "INSERT INTO tasks (id, title, done, priority, due, list) VALUES ($1, $2, $3, $4, $5, $6)",
          [t.id, t.title, t.done ? 1 : 0, t.priority, t.due, t.list]
        );
      }
    }

    if (await checkEmpty("events")) {
      for (const e of seed.events) {
        await db.execute(
          "INSERT INTO events (id, title, date, time, kind) VALUES ($1, $2, $3, $4, $5)",
          [e.id, e.title, e.date, e.time, e.kind]
        );
      }
    }

  } catch (err) {
    console.error("Database initialization error:", err);
  }

  return db;
}
