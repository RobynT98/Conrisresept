import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getAllRecipes, getAllNotes, getShopping } from "../db";
import type { Recipe, Note, ShoppingItem } from "../types";
import RecipeCard from "../components/RecipeCard";

/* -------- helpers -------- */
function groupByChapter(recipes: Recipe[]) {
  const map = new Map<string, Recipe[]>();
  for (const r of recipes) {
    const key = r.chapter?.trim() || "Okategoriserat";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b, "sv"))
    .map(([chapter, items]) => ({
      chapter,
      items: items.slice().sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)),
    }));
}

const fmtDate = (n: number) =>
  new Date(n).toLocaleDateString("sv-SE", { year: "numeric", month: "2-digit", day: "2-digit" });

/* -------- page -------- */
export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    getAllRecipes().then(setRecipes);
    getAllNotes().then(setNotes);
    getShopping().then(setShopping);
  }, []);

  const sections = useMemo(() => groupByChapter(recipes), [recipes]);

  // “senaste/pinnade” anteckningar: max 2
  const topNotes = useMemo(() => {
    const sorted = notes
      .slice()
      .sort((a, b) => (b.pinned === a.pinned ? b.updatedAt - a.updatedAt : b.pinned ? 1 : -1))
      .reverse(); // pinned true först (du kan ta bort reverse om din getAllNotes redan ger pinned först)
    // säkra ordningen: pinned först, sen uppdaterad desc
    sorted.sort((a, b) => (a.pinned === b.pinned ? b.updatedAt - a.updatedAt : a.pinned ? -1 : 1));
    return sorted.slice(0, 2);
  }, [notes]);

  const remainingShopping = shopping.filter((s) => !s.done);
  const topShopping = remainingShopping.slice(0, 3);

  const hasAnything = recipes.length + notes.length + shopping.length > 0;

  return (
    <section className="space-y-6">
      {/* Titel + CTA */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Översikt</h1>
        <Link to="/recipe/new" className="btn-primary">Lägg till recept</Link>
      </div>

      {/* Widgets-rad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          to="/shopping"
          className="block rounded-xl border border-amber-100 bg-white/70 p-4 hover:bg-white transition"
        >
          <div className="text-xs uppercase tracking-wide text-forest/70 font-medium mb-1">
            Inköpslista
          </div>
          <div className="text-sm text-neutral-700 mb-2">
            {remainingShopping.length === 0
              ? "Inget kvar att köpa"
              : `${remainingShopping.length} kvar att köpa`}
          </div>
          {topShopping.length > 0 && (
            <ul className="text-sm text-neutral-800 list-disc pl-5 space-y-1">
              {topShopping.map((i) => (
                <li key={i.id} className="truncate">{i.text}</li>
              ))}
            </ul>
          )}
        </Link>

        <Link
          to="/notes"
          className="block rounded-xl border border-amber-100 bg-white/70 p-4 hover:bg-white transition"
        >
          <div className="text-xs uppercase tracking-wide text-forest/70 font-medium mb-1">
            Anteckningar
          </div>
          {topNotes.length === 0 ? (
            <div className="text-sm text-neutral-700">Inga anteckningar än</div>
          ) : (
            <ul className="space-y-2">
              {topNotes.map((n) => (
                <li key={n.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    {n.pinned && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-butter/70 border border-amber-200">
                        Fäst
                      </span>
                    )}
                    <span className="text-neutral-500 text-xs">{fmtDate(n.updatedAt)}</span>
                  </div>
                  <div className="truncate text-neutral-800">{n.text}</div>
                </li>
              ))}
            </ul>
          )}
        </Link>
      </div>

      {/* Kapitelhyllan */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="font-display text-2xl">Kapitelhyllan</h2>
        <Link to="/search" className="btn-ghost">Sök</Link>
      </div>

      {!hasAnything ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          {sections.map(({ chapter, items }) => (
            <div key={chapter} className="space-y-3">
              <div className="flex items-baseline justify-between px-1">
                <h3 className="text-xl font-semibold text-neutral-800">{chapter}</h3>
                <span className="text-xs text-neutral-500">
                  {items.length} recept
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((r) => (
                  <RecipeCard key={r.id} recipe={r} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 p-6 bg-white/60">
      <p className="mb-2">Här ekar det tomt – dags att skriva första kortet.</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Tryck <b>Nytt recept</b> för att börja.</li>
        <li>Eller importera från fil under <b>Mer</b> → Backup.</li>
        <li>Allt sparas lokalt på enheten.</li>
      </ul>
    </div>
  );
}