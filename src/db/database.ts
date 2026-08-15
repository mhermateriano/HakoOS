import Database from "@tauri-apps/plugin-sql";

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

const uid = () => Math.random().toString(36).slice(2, 10);
const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};

export async function initDatabase(): Promise<Database | null> {
  const db = await getDatabase();
  if (!db) {
    return null;
  }

  try {
    // Create notes table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        tag TEXT NOT NULL,
        pinned INTEGER NOT NULL DEFAULT 0,
        updated TEXT NOT NULL
      );
    `);

    // Check if empty to seed initial notes
    const existing = await db.select<any[]>("SELECT id FROM notes LIMIT 1");
    if (existing.length === 0) {
      const seedNotes = [
        {
          id: uid(),
          title: "Q3 launch checklist",
          body: "Finalize pricing tiers, ship the onboarding flow, and draft the changelog announcement before the 20th.",
          tag: "Meeting",
          pinned: 1,
          updated: daysFromNow(-1),
        },
        {
          id: uid(),
          title: "Palawan trip planning",
          body: "Book El Nido flights early, reserve the island-hopping Tour A, and pack reef-safe sunblock. Ask Miguel for the resort contact.",
          tag: "Personal",
          pinned: 0,
          updated: daysFromNow(-3),
        },
        {
          id: uid(),
          title: "API rate limit fix",
          body: "Switch to token bucket, 100 req/min per key. Cache the auth introspection call for 60s.",
          tag: "Reference",
          pinned: 1,
          updated: daysFromNow(-2),
        },
        {
          id: uid(),
          title: "Side project idea",
          body: "A tiny CLI that turns git history into a weekly standup summary. Ship as a single binary.",
          tag: "Idea",
          pinned: 0,
          updated: daysFromNow(-7),
        },
        {
          id: uid(),
          title: "Standup notes 08/08",
          body: "Blocked on the auth migration. Bea is taking the calendar sync. Demo moved to Thursday.",
          tag: "Meeting",
          pinned: 0,
          updated: daysFromNow(-4),
        },
      ];

      for (const note of seedNotes) {
        await db.execute(
          "INSERT INTO notes (id, title, body, tag, pinned, updated) VALUES ($1, $2, $3, $4, $5, $6)",
          [note.id, note.title, note.body, note.tag, note.pinned, note.updated]
        );
      }
    }
  } catch (err) {
    console.error("Database initialization error:", err);
  }

  return db;
}
