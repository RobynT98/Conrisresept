import { useEffect, useMemo, useState } from "react";
import { getAllRecipes } from "../db";
import { Recipe } from "../types";
import { uuid } from "../state";

type Item = { id: string; text: string; done: boolean };
const LS_KEY = "shopping.v1";

export default function Shopping() {
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pickOpen, setPickOpen] = useState(false);
  const [pickedIds, setPickedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try { setItems(JSON.parse(raw)); } catch {}
    }
    getAllRecipes().then(setRecipes);
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  function addManual() {
    const t = draft.trim();
    if (!t) return;
    setItems([{ id: uuid(), text: t, done: false }, ...items]);
    setDraft("");
  }

  function toggle(id: string) {
    setItems(xs => xs.map(x => x.id === id ? { ...x, done: !x.done } : x));
  }

  function remove(id: string) {
    setItems(xs => xs.filter(x => x.id !== id));
  }

  function clearDone() {
    setItems(xs => xs.filter(x => !x.done));
  }

  function addFromRecipes() {
    const chosen = recipes.filter(r => pickedIds[r.id]);
    const lines: Item[] = [];
    for (const r of chosen) {
      for (const ing of r.ingredients) {
        const txt = [ing.qty ?? "", ing.unit || "", ing.item || "", ing.note ? `– ${ing.note}` : ""]
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        if (txt) lines.push({ id: uuid(), text: txt, done: false });
      }
    }
    if (lines.length) setItems(xs => [...lines, ...xs]);
    setPickOpen(false);
    setPickedIds({});
  }

  const remaining = useMemo(() => items.filter(i => !i.done).length, [items]);

  return (
    <section className="space-y-4">
      <h1 className="font-display text-3xl">Inköpslista</h1>

      {/* Input-rad */}
      <div className="panel p-3 grid gap-2">
        <div className="flex gap-2">
          <input
            className="field flex-1"
            placeholder="Lägg till rad… (t.ex. 3 dl grädde)"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addManual()}
          />
          <button className="btn bg-butter hover:bg-butter/90" onClick={addManual}>Lägg till</button>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={() => setPickOpen(true)}>Lägg till från recept</button>
          <button className="btn text-red-700 border-red-300" onClick={clearDone}>Rensa avbockade</button>
        </div>
      </div>

      {/* Lista */}
      {items.length === 0 ? (
        <p className="text-neutral-600">Tom lista. Lägg till manuellt eller importera från recept.</p>
      ) : (
        <ul className="grid gap-2">
          {items.map(i => (
            <li key={i.id} className="flex items-center gap-2 rounded-xl border bg-white/70 p-2">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-neutral-300"
                checked={i.done}
                onChange={() => toggle(i.id)}
              />
              <span className={`flex-1 ${i.done ? "line-through text-neutral-400" : ""}`}>
                {i.text}
              </span>
              <button className="text-neutral-500 hover:text-red-600" onClick={() => remove(i.id)}>Ta bort</button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-sm text-neutral-600">{remaining} kvar att köpa</p>

      {/* Receptväljare (enkel modal) */}
      {pickOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border bg-white p-4 shadow-xl">
            <h2 className="font-display text-xl mb-2">Välj recept</h2>
            <div className="max-h-72 overflow-auto grid gap-2 mb-3">
              {recipes.map(r => (
                <label key={r.id} className="flex items-center gap-2 rounded border p-2">
                  <input
                    type="checkbox"
                    checked={!!pickedIds[r.id]}
                    onChange={e => setPickedIds(s => ({ ...s, [r.id]: e.target.checked }))}
                  />
                  <span>{r.title}</span>
                </label>
              ))}
              {recipes.length === 0 && <p className="text-neutral-600 text-sm">Inga recept ännu.</p>}
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => setPickOpen(false)}>Avbryt</button>
              <button className="btn-primary" onClick={addFromRecipes}>Lägg till ingredienser</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}