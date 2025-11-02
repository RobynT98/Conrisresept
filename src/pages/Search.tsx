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

type SortKey = "updated" | "alpha" | "time";

export default function Search() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [chapter, setChapter] = useState<string>(""); // "" = alla
  const [maxTime, setMaxTime] = useState<string>(""); // "" = ingen gräns
  const [sortBy, setSortBy] = useState<SortKey>("updated");
  const [compact, setCompact] = useState<boolean>(true);

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

  // Filtrering + sortering
  const filtered = useMemo(() => {
    const s = fold(debouncedQ.trim());
    const max = maxTime ? Number(maxTime) : Infinity;

    const matches = (r: Recipe) => {
      const textHit =
        s.length === 0 ||
        fold(r.title).includes(s) ||
        fold(r.chapter).includes(s) ||
        r.ingredients.some(i => fold(i.item).includes(s));
      const chapterHit = !chapter || r.chapter === chapter;
      const timeTotal = r.time?.total ?? 0;
      const timeHit = timeTotal <= max;
      return textHit && chapterHit && timeHit;
    };

    const list = recipes.filter(matches);

    switch (sortBy) {
      case "alpha":
        return list.slice().sort((a, b) =>
          a.title.localeCompare(b.title, "sv")
        );
      case "time":
        return list.slice().sort((a, b) =>
          (a.time?.total ?? 0) - (b.time?.total ?? 0)
        );
      default: // updated
        return list.slice().sort((a, b) =>
          (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
        );
    }
  }, [recipes, debouncedQ, chapter, maxTime, sortBy]);

  const activeFilters = Boolean(q || chapter || maxTime);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl">Sök</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-600 hidden sm:block">Vy</label>
          <button
            className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
              compact
                ? "border-forest/30 bg-forest/5 text-forest"
                : "border-neutral-300 bg-white hover:bg-neutral-50"
            }`}
            onClick={() => setCompact(!compact)}
            title="Växla kompakt/kortvy"
          >
            {compact ? "Kompakt" : "Kort"}
          </button>
        </div>
      </div>

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
        </div>
      </div>

      {/* Sortering + filterchips */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="text-sm text-neutral-600">
          {filtered.length} träff{filtered.length === 1 ? "" : "ar"}
          {chapter ? ` • ${chapter}` : ""}
          {maxTime ? ` • ≤ ${maxTime} min` : ""}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-600">Sortera</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-sm"
            aria-label="Sortering"
          >
            <option value="updated">Senast uppdaterad</option>
            <option value="alpha">A–Ö</option>
            <option value="time">Kortast tid</option>
          </select>

          {activeFilters && (
            <button
              className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-sm"
              onClick={() => { setQ(""); setChapter(""); setMaxTime(""); }}
              title="Rensa filter"
            >
              Rensa
            </button>
          )}
        </div>
      </div>

      {/* Resultat */}
      {filtered.length === 0 ? (
        <EmptyState hasFilters={activeFilters} />
      ) : compact ? (
        <ul className="divide-y divide-amber-100 rounded-xl border border-amber-100 bg-white/70 overflow-hidden">
          {filtered.map(r => (
            <li key={r.id}>
              <RecipeRow recipe={r} />
            </li>
          ))}
        </ul>
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

/** Kompakt list-rad */
function RecipeRow({ recipe }: { recipe: Recipe }) {
  return (
    <a
      href={`#/recipe/${recipe.id}`}
      className="group flex gap-3 items-center p-2 sm:p-3 hover:bg-forest/5 transition-colors"
    >
      <div className="w-20 h-20 shrink-0 overflow-hidden rounded-lg border border-amber-100 bg-amber-50">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt=""
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase tracking-wide text-forest/70">
          {recipe.chapter || "—"}
        </div>
        <div className="font-display text-base text-neutral-900 truncate group-hover:text-forest">
          {recipe.title}
        </div>
        <div className="text-xs text-neutral-500 mt-0.5 flex gap-3">
          {recipe.servings ? <span>{recipe.servings} port</span> : null}
          {recipe.time?.total ? <span>{recipe.time.total} min</span> : null}
        </div>
      </div>
    </a>
  );
}