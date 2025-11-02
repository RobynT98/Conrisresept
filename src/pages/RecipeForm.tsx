// src/pages/RecipeForm.tsx
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
  image: undefined, // ⬅️ tomt från start
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
    if (id) getRecipe(id).then(r => r && setRecipe(r));
  }, [id]);

  function update<K extends keyof Recipe>(key: K, val: Recipe[K]) {
    setRecipe(prev => ({ ...prev, [key]: val, updatedAt: Date.now() }));
  }

  async function save() {
    // (valfritt) trimma lite innan spar
    const cleaned: Recipe = {
      ...recipe,
      title: recipe.title.trim(),
      chapter: recipe.chapter.trim(),
      themes: dedupe(recipe.themes.map(t => t.trim()).filter(Boolean)),
    };
    await putRecipe(cleaned);
    nav(`/recipe/${recipe.id}`);
  }

  async function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataURL(file); // ✅ robust
    update("image", dataUrl);
  }

  function clearImage() {
    update("image", undefined);
  }

  return (
    <section className="space-y-4">
      <h1 className="font-display text-3xl">
        {id ? "Redigera recept" : "Nytt recept"}
      </h1>

      {/* Grundinfo */}
      <div className="grid gap-3 panel p-4">
        <input
          className="field"
          placeholder="Titel"
          value={recipe.title}
          onChange={(e) => update("title", e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            className="field"
            value={recipe.chapter}
            onChange={(e) => update("chapter", e.target.value)}
          >
            <option value="">Kapitel…</option>
            {defaultChapters.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            className="field"
            type="number"
            min={1}
            value={recipe.servings}
            onChange={(e) => update("servings", Number(e.target.value || 0))}
            placeholder="Portioner"
          />

          <select
            className="field"
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

        {/* Bild */}
        <div className="grid gap-2">
          <span className="text-sm">Bild</span>

          {recipe.image ? (
            <div className="grid gap-2">
              <img
                src={recipe.image}
                alt=""
                className="w-full h-48 object-cover rounded-xl border"
                loading="lazy"
              />
              <div className="flex gap-2">
                <label className="btn">
                  Byt bild
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImage}
                    className="hidden"
                  />
                </label>
                <button className="btn text-red-700 border-red-300" onClick={clearImage}>
                  Rensa bild
                </button>
              </div>
            </div>
          ) : (
            <label className="btn bg-butter hover:bg-butter/90 w-fit">
              Välj bild…
              <input type="file" accept="image/*" onChange={onImage} className="hidden" />
            </label>
          )}
        </div>

        <Themes value={recipe.themes} onChange={(t) => update("themes", t)} />
      </div>

      {/* Ingredienser */}
      <div className="grid gap-3 panel p-4">
        <h2 className="section-title">Ingredienser</h2>
        {recipe.ingredients.map((ing, i) => (
          <div key={i} className="grid grid-cols-4 gap-2">
            <input
              className="field"
              type="number"
              placeholder="Mängd"
              value={ing.qty ?? ""}
              onChange={(e) => changeIng(i, { ...ing, qty: e.target.value ? Number(e.target.value) : null })}
            />
            <input
              className="field"
              placeholder="Enhet"
              value={ing.unit}
              onChange={(e) => changeIng(i, { ...ing, unit: e.target.value })}
            />
            <input
              className="field"
              placeholder="Ingrediens"
              value={ing.item}
              onChange={(e) => changeIng(i, { ...ing, item: e.target.value })}
            />
            <input
              className="field"
              placeholder="Anteckning"
              value={ing.note || ""}
              onChange={(e) => changeIng(i, { ...ing, note: e.target.value })}
            />
          </div>
        ))}
        <button className="btn bg-butter hover:bg-butter/90" onClick={addIng}>
          + Lägg till ingrediens
        </button>
      </div>

      {/* Tillagning */}
      <div className="grid gap-3 panel p-4">
        <h2 className="section-title">Tillagning</h2>
        {recipe.steps.map((st, i) => (
          <div key={i} className="grid grid-cols-6 gap-2 items-center">
            <div className="col-span-5">
              <input
                className="field w-full"
                placeholder={`Steg ${i + 1}`}
                value={st.text}
                onChange={(e) => changeStep(i, { ...st, text: e.target.value })}
              />
            </div>
            <input
              className="field"
              type="number"
              min={0}
              placeholder="Timer (s)"
              value={st.timer ?? 0}
              onChange={(e) => changeStep(i, { ...st, timer: Number(e.target.value || 0) })}
            />
          </div>
        ))}
        <button className="btn bg-butter hover:bg-butter/90" onClick={addStep}>
          + Lägg till steg
        </button>
      </div>

      {/* Spara */}
      <div className="flex gap-3">
        <button className="btn-primary" onClick={save}>Spara</button>
      </div>
    </section>
  );

  function addIng() {
    setRecipe(r => ({
      ...r,
      ingredients: [...r.ingredients, { qty: null, unit: "", item: "" } as Ingredient],
      updatedAt: Date.now()
    }));
  }
  function changeIng(i: number, ing: Ingredient) {
    setRecipe(r => {
      const next = [...r.ingredients];
      next[i] = ing;
      return { ...r, ingredients: next, updatedAt: Date.now() };
    });
  }
  function addStep() {
    setRecipe(r => ({
      ...r,
      steps: [...r.steps, { text: "", timer: 0 }],
      updatedAt: Date.now()
    }));
  }
  function changeStep(i: number, st: any) {
    setRecipe(r => {
      const next = [...r.steps];
      next[i] = st;
      return { ...r, steps: next, updatedAt: Date.now() };
    });
  }
}

function NumberBox({
  label, value, onChange
}: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="text-sm">{label}</span>
      <input
        type="number"
        className="field w-full"
        value={value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
      />
    </label>
  );
}

// ✅ Robust och minnes-snäll
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Kunde inte läsa bildfilen"));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/* ---------- Teman ---------- */
function Themes({
  value, onChange
}: { value: string[]; onChange: (t: string[]) => void }) {
  const [newTheme, setNewTheme] = useState("");
  const all = dedupe([...defaultThemes, ...value]).sort();

  function toggle(t: string) {
    onChange(value.includes(t) ? value.filter(x => x !== t) : [...value, t]);
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
        {all.map(t => (
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
          className="field flex-1"
          placeholder="Lägg till eget tema…"
          value={newTheme}
          onChange={(e) => setNewTheme(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
        />
        <button type="button" onClick={addCustom} className="btn bg-butter hover:bg-butter/90">
          Lägg till
        </button>
      </div>
    </div>
  );
}