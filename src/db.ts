import { openDB, DBSchema } from "idb";
import type { Recipe } from "./types";

interface CRSchema extends DBSchema {
  recipes: {
    key: string;
    value: Recipe;
    indexes: { "by-updatedAt": number; "by-title": string };
  };
  meta: { key: string; value: any };
}

const DB_NAME = "conrisresept";
const DB_VERSION = 1;

export async function db() {
  return openDB<CRSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore("recipes", { keyPath: "id" });
      store.createIndex("by-updatedAt", "updatedAt");
      store.createIndex("by-title", "title");
      db.createObjectStore("meta");
    }
  });
}

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
  return d.getAllFromIndex("recipes", "by-updatedAt");
}

export async function deleteRecipe(id: string) {
  const d = await db();
  await d.delete("recipes", id);
}

export async function exportAll() {
  const d = await db();
  const recipes = await d.getAll("recipes");
  const meta = (await d.get("meta", "settings")) || {};
  return { version: 1, recipes, settings: meta };
}

export async function importAll(payload: any) {
  const d = await db();
  const tx = d.transaction("recipes", "readwrite");
  for (const r of payload.recipes || []) {
    await tx.store.put(r);
  }
  await tx.done;
  if (payload.settings) {
    await d.put("meta", payload.settings, "settings");
  }
}