import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Ingredient, Recipe } from "../types";
import { getRecipe, putRecipe } from "../db";
import { defaultChapters, defaultThemes, uuid } from "../state";

const emptyRecipe = (): Recipe => ({
  id: uuid(),
  title: "",
  chapter: "",
  themes: [],
  servings: 4,
  time: { prep: 0, cook: 0, total: 0, unit: "min" },
  difficulty: "lätt",
  image: "",
  ingredients: [],
  steps: [],
  notes: "",
  tags: [],
  favorite: false,
  createdAt: Date.now(),
  updatedAt: Date.now()
});

export default function RecipeForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe>(emptyRecipe());

  useEffect(() => {
    if (id) getRecipe(id).then((r) => r && setRecipe(r));
  }, [id]);

  function update<K extends keyof Recipe>(key: K, val: Recipe[K]) {
    setRecipe((prev) => ({ ...prev, [key]: val, updatedAt: Date.now() }));
  }

  async function save() {
    await putRecipe(recipe);
    nav(`/recipe/${recipe.id}`);
  }

  async function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToDataUrl(file);
    update("image", b64);
  }

  return (
    <section className="space-y-4">
      <h1 className="font-display text-2xl">{id ? "Redigera recept" : "Nytt recept"}</h1>

      {/* Grundinfo */}
      <div className="grid gap-3 rounded-xl border bg-white p-4">
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Titel"
          value={recipe.title}
          onChange={(e) => update("title", e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            className="rounded-lg border px-3 py-2"
            value={recipe.chapter}
            onChange={(e) => update("chapter", e.target.value)}
          >
            <option value="">Kapitel…</option>
            {defaultChapters.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            className="rounded-lg border px-3 py-2"
            type="number"
            min={1}
            value={recipe.servings}
            onChange={(e) => update("servings", Number(e.target.value))}
            placeholder="Portioner"
          />

          <select
            className="rounded-lg border px-3 py-2"
            value={recipe.difficulty}
            onChange={(e) => update("difficulty", e.target.value as any)}
          >
            <option value="lätt">Lätt</option>
            <option value="medel">Medel</option>
            <option value="svår">Svår</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <NumberBox
            label="Förbered (min)"
            value={recipe.time.prep}
            onChange={(v) =>
              update("time", { ...recipe.time, prep: v, total: v + recipe.time.cook })
            }
          />
          <NumberBox
            label="Tillaga (min)"
            value={recipe.time.cook}
            onChange={(v) =>
              update("time", { ...recipe.time, cook: v, total: v + recipe.time.prep })
            }
          />
          <NumberBox
            label="Total (min)"
            value={recipe.time.total}
            onChange={(v) => update("time", { ...recipe.time, total: v })}
          />
        </div>

        <label className="block">
          <span className="text-sm">Bild</span>
          <input type="file" accept="image/*" onChange={onImage} className="block mt-1" />
        </label>

        <Themes value={recipe.themes} onChange={(t) => update("themes", t)} />
      </div>

      {/* Ingredienser */}
      <div className="grid gap-3 rounded-xl border bg-white p-4">
        <h2 className="font-display text-xl">Ingredienser</h2>
        {recipe.ingredients.map((ing, i) => (
          <div key={i} className="grid grid-cols-4 gap-2">
            <input
              className="border rounded px-2 py-2"
              type="number"
              placeholder="Mängd"
              value={ing.qty ?? ""}
              onChange={(e) =>
                changeIng(i, {
                  ...ing,
                  qty: e.target.value ? Number(e.target.value) : null
                })
              }
            />
            <input
              className="border rounded px-2 py-2"
              placeholder="Enhet"
              value={ing.unit}
              onChange={(e) => changeIng(i, { ...ing, unit: e.target.value })}
            />
            <input
              className="border rounded px-2 py-2"
              placeholder="Ingrediens"
              value={ing.item}
              onChange={(e) => changeIng(i, { ...ing, item: e.target.value })}
            />
            <input
              className="border rounded px-2 py-2"
              placeholder="Anteckning"
              value={ing.note || ""}
              onChange={(e) => changeIng(i, { ...ing, note: e.target.value })}
            />
          </div>
        ))}
        <button className="px-3 py-2 rounded bg-butter" onClick={() => addIng()}>
          + Lägg till ingrediens
        </button>
      </div>

      {/* Tillagning */}
      <div className="grid gap-3 rounded-xl border bg-white p-4">
        <h2 className="font-display text-xl">Tillagning</h2>
        {recipe.steps.map((st, i) => (
          <div key={i} className="grid grid-cols-6 gap-2 items-center">
            <div className="col-span-5">
              <input
                className="border rounded px-2 py-2 w-full"
                placeholder={`Steg ${i + 1}`}
                value={st.text}
                onChange={(e) => changeStep(i, { ...st, text: e.target.value })}
              />
            </div>
            <input
              className="border rounded px-2 py-2"
              type="number"
              min={0}
              placeholder="Timer (s)"
              value={st.timer ?? 0}
              onChange={(e) => changeStep(i, { ...st, timer: Number(e.target.value) })}
            />
          </div>
        ))}
        <button className="px-3 py-2 rounded bg-butter" onClick={() => addStep()}>
          + Lägg till steg
        </button>
      </div>

      {/* Spara */}
      <div className="flex gap-3">
        <button className="px-4 py-2 rounded-lg bg-forest text-white" onClick={save}>
          Spara
        </button>
      </div>
    </section>
  );

  function addIng() {
    setRecipe((r) => ({
      ...r,
      ingredients: [...r.ingredients, { qty: null, unit: "", item: "" } as Ingredient]
    }));
  }
  function changeIng(i: number, ing: Ingredient) {
    setRecipe((r) => {
      const next = [...r.ingredients];
      next[i] = ing;
      return { ...r, ingredients: next, updatedAt: Date.now() };
    });
  }
  function addStep() {
    setRecipe((r) => ({
      ...r,
      steps: [...r.steps, { text: "", timer: 0 }],
      updatedAt: Date.now()
    }));
  }
  function changeStep(i: number, st: any) {
    setRecipe((r) => {
      const next = [...r.steps];
      next[i] = st;
      return { ...r, steps: next, updatedAt: Date.now() };
    });
  }
}

function NumberBox({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm">{label}</span>
      <input
        type="number"
        className="w-full rounded-lg border px-3 py-2"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

async function fileToDataUrl(file: File) {
  const buf = await file.arrayBuffer();
  const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return `data:${file.type};base64,${b64}`;
}

/* ---------- Saknad komponent: TEMAN ---------- */
function Themes({
  value,
  onChange
}: {
  value: string[];
  onChange: (t: string[]) => void;
}) {
  const [newTheme, setNewTheme] = useState("");

  // Slå ihop standardteman med valda, utan dubletter
  const all = Array.from(new Set([...defaultThemes, ...value])).sort();

  function toggle(t: string) {
    if (value.includes(t)) {
      onChange(value.filter((x) => x !== t));
    } else {
      onChange([...value, t]);
    }
  }

  function addCustom() {
    const t = newTheme.trim();
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setNewTheme("");
  }

  return (
    <div className="space-y-2">
      <span className="text-sm">Tema</span>
      <div className="flex flex-wrap gap-2">
        {all.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => toggle(t)}
            className={
              "px-2 py-1 rounded-full border text-sm " +
              (value.includes(t)
                ? "bg-forest text-white border-forest"
                : "bg-white text-neutral-800 border-neutral-300")
            }
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border px-3 py-2"
          placeholder="Lägg till eget tema…"
          value={newTheme}
          onChange={(e) => setNewTheme(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
        />
        <button
          type="button"
          onClick={addCustom}
          className="px-3 py-2 rounded-lg border bg-butter"
        >
          Lägg till
        </button>
      </div>
    </div>
  );
}