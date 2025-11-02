import { openDB, DBSchema } from "idb";
import type { Recipe } from "./types";
import type { Note } from "./types";

interface CRSchema extends DBSchema {
  recipes: {
    key: string;
    value: Recipe;
    indexes: { "by-updatedAt": number; "by-title": string };
  };
  notes: {
    key: string;
    value: Note;
    indexes: { "by-updatedAt": number; "by-pinned": number };
  };
  meta: { key: string; value: any };
}

const DB_NAME = "conrisresept";
/** v2 = lägger till "notes" store */
export const DB_VERSION = 2;

export async function db() {
  return openDB<CRSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // v1
      if (oldVersion < 1) {
        const store = db.createObjectStore("recipes", { keyPath: "id" });
        store.createIndex("by-updatedAt", "updatedAt");
        store.createIndex("by-title", "title");
        db.createObjectStore("meta");
      }
      // v2
      if (oldVersion < 2) {
        const n = db.createObjectStore("notes", { keyPath: "id" });
        n.createIndex("by-updatedAt", "updatedAt");
        n.createIndex("by-pinned", "pinned");
      }
    }
  });
}

/* ---------- Recipes ---------- */
export async function putRecipe(recipe: Recipe) {
  const d = await db();
  await d.put("recipes", recipe);
}

export async function getRecipe(id: string) {
  const d = await db();
  return d.get("recipes", id);
}

export async function getAllRecipes() {
  const d = await db();
  // IDB-index är stigande – sortera så nyast kommer först
  const list = await d.getAllFromIndex("recipes", "by-updatedAt");
  return list.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteRecipe(id: string) {
  const d = await db();
  await d.delete("recipes", id);
}

/* ---------- Notes ---------- */
export async function putNote(note: Note) {
  const d = await db();
  await d.put("notes", note);
}

export async function getNote(id: string) {
  const d = await db();
  return d.get("notes", id);
}

export async function deleteNote(id: string) {
  const d = await db();
  await d.delete("notes", id);
}

export async function getAllNotes() {
  const d = await db();
  // Hämta alla via updatedAt-index och sortera: pinned först, sedan updatedAt DESC
  const list = await d.getAllFromIndex("notes", "by-updatedAt");
  return list.sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned ? 1 : -1; // true först
    return b.updatedAt - a.updatedAt;
  });
}

/* ---------- Export / Import ---------- */
export async function exportAll() {
  const d = await db();
  const recipes = await d.getAll("recipes");
  const notes = await d.getAll("notes");
  const meta = (await d.get("meta", "settings")) || {};
  return { version: DB_VERSION, recipes, notes, settings: meta };
}

export async function importAll(payload: any) {
  const d = await db();

  // Recept
  if (payload.recipes?.length) {
    const txR = d.transaction("recipes", "readwrite");
    for (const r of payload.recipes) await txR.store.put(r);
    await txR.done;
  }

  // Anteckningar
  if (payload.notes?.length) {
    const txN = d.transaction("notes", "readwrite");
    for (const n of payload.notes) await txN.store.put(n);
    await txN.done;
  }

  // Settings
  if (payload.settings) {
    await d.put("meta", payload.settings, "settings");
  }
}