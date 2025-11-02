// src/lib/shopping.ts
export const SHOPPING_LS_KEY = "shopping.v1";

export type ShoppingItem = { id: string; text: string; done: boolean };

export function readShopping(): ShoppingItem[] {
  try {
    const raw = localStorage.getItem(SHOPPING_LS_KEY);
    return raw ? (JSON.parse(raw) as ShoppingItem[]) : [];
  } catch {
    return [];
  }
}

export function writeShopping(items: ShoppingItem[]) {
  localStorage.setItem(SHOPPING_LS_KEY, JSON.stringify(items));
}