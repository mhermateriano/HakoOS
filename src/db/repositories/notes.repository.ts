import { getDatabase } from "../database";
import { Note } from "../interfaces/notes.interface";

export async function getAllNotes(): Promise<Note[]> {
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

export async function dbAddNote(note: Note): Promise<void> {
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

export async function dbUpdateNote(
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

export async function dbTogglePin(id: string, pinned: boolean): Promise<void> {
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

export async function dbDeleteNote(id: string): Promise<void> {
  const db = await getDatabase();
  if (!db) return;

  try {
    await db.execute("DELETE FROM notes WHERE id = $1", [id]);
  } catch (err) {
    console.error("Failed to delete note from SQLite:", err);
  }
}
