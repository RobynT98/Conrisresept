import { useEffect, useMemo, useState } from "react";
import { getAllRecipes } from "../db";
import type { Recipe } from "../types";
import RecipeCard from "../components/RecipeCard";

/** Förenklad "accent folding" så 'ä' == 'a', 'é' == 'e' etc. */
function fold(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function Search() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [chapter, setChapter] = useState<string>(""); // "" = alla
  const [maxTime, setMaxTime] = useState<string>(""); // "" = ingen gräns

  useEffect(() => { getAllRecipes().then(setRecipes); }, []);

  // Debounce 200ms för mjukare skrivning
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 200);
    return () => clearTimeout(t);
  }, [q]);

  // Unika kapitel för filtermenyn
  const chapters = useMemo(() => {
    const set = new Set(recipes.map(r => r.chapter).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "sv"));
  }, [recipes]);

  const filtered = useMemo(() => {
    const s = fold(debouncedQ.trim());
    const max = maxTime ? Number(maxTime) : Infinity;

    const matches = (r: Recipe) => {
      // textmatch
      const textHit =
        s.length === 0 ||
        fold(r.title).includes(s) ||
        fold(r.chapter).includes(s) ||
        r.ingredients.some(i => fold(i.item).includes(s));

      // kapitel + tid
      const chapterHit = !chapter || r.chapter === chapter;
      const timeTotal = r.time?.total ?? 0;
      const timeHit = timeTotal <= max;

      return textHit && chapterHit && timeHit;
    };

    return recipes
      .filter(matches)
      .slice()
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  }, [recipes, debouncedQ, chapter, maxTime]);

  const activeFilters = Boolean(q || chapter || maxTime);

  return (
    <section className="space-y-4">
      <h1 className="font-display text-2xl">Sök</h1>

      {/* Sök + filter */}
      <div className="grid gap-2 sm:grid-cols-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:col-span-2 rounded-lg border border-neutral-300 px-3 py-2"
          placeholder="Sök titel, ingrediens, kapitel…"
          aria-label="Söktext"
        />

        <select
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2"
          aria-label="Filtrera på kapitel"
        >
          <option value="">Alla kapitel</option>
          {chapters.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={maxTime}
            onChange={(e) => setMaxTime(e.target.value)}
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2"
            placeholder="Max tid (min)"
            aria-label="Maximal tid i minuter"
          />
          {activeFilters && (
            <button
              className="px-3 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50"
              onClick={() => { setQ(""); setChapter(""); setMaxTime(""); }}
              title="Rensa filter"
            >
              Rensa
            </button>
          )}
        </div>
      </div>

      {/* Statusrad */}
      <div className="text-sm text-neutral-600">
        {filtered.length} träff{filtered.length === 1 ? "" : "ar"}
        {chapter ? ` • ${chapter}` : ""}
        {maxTime ? ` • ≤ ${maxTime} min` : ""}
      </div>

      {/* Resultat */}
      {filtered.length === 0 ? (
        <EmptyState hasFilters={activeFilters} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(r => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </section>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 p-6 bg-white/60">
      {hasFilters ? (
        <>
          <p className="mb-2">Inga recept matchar din sökning.</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Prova färre ord eller annan stavning.</li>
            <li>Rensa filter eller öka max-tiden.</li>
          </ul>
        </>
      ) : (
        <>
          <p className="mb-2">Skriv något i rutan ovan för att börja.</p>
          <p className="text-sm text-neutral-600">
            Du kan söka på titel, ingredienser och kapitel.
          </p>
        </>
      )}
    </div>
  );
}