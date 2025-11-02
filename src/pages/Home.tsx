import { useEffect, useMemo, useState } from "react";
import { getAllRecipes } from "../db";
import { Recipe } from "../types";
import RecipeCard from "../components/RecipeCard";
import { Link } from "react-router-dom";
import { defaultChapters } from "../state";

type SortKey = "recent" | "title";

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [q, setQ] = useState("");
  const [chapter, setChapter] = useState<string>("Alla kapitel");
  const [sortBy, setSortBy] = useState<SortKey>("recent");

  useEffect(() => {
    getAllRecipes().then(setRecipes); // db returnerar redan nyast först
  }, []);

  const chaptersFromData = useMemo(() => {
    const set = new Set<string>();
    (recipes ?? []).forEach(r => r.chapter && set.add(r.chapter));
    // visa alltid standardkapitel överst, fyll på med de som hittas
    const merged = Array.from(new Set(["Alla kapitel", ...defaultChapters, ...Array.from(set)]));
    return merged;
  }, [recipes]);

  const filtered = useMemo(() => {
    const list = (recipes ?? []);
    const s = q.trim().toLowerCase();

    let out = list.filter(r => {
      const inChapter = chapter === "Alla kapitel" || r.chapter === chapter;
      if (!s) return inChapter;
      const hay =
        r.title.toLowerCase() +
        " " +
        r.chapter.toLowerCase() +
        " " +
        r.ingredients.map(i => i.item.toLowerCase()).join(" ");
      return inChapter && hay.includes(s);
    });

    if (sortBy === "title") {
      out = [...out].sort((a, b) => a.title.localeCompare(b.title, "sv"));
    } else {
      // recent: redan sorterade nyast→äldst från db, men försäkra oss
      out = [...out].sort((a, b) => b.updatedAt - a.updatedAt);
    }

    return out;
  }, [recipes, q, chapter, sortBy]);

  const loading = recipes === null;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Kapitelhyllan</h1>
        <Link to="/recipe/new" className="btn-primary">Lägg till recept</Link>
      </div>

      {/* Filterrad */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          placeholder="Sök titel, ingrediens…"
          aria-label="Sök"
        />
        <select
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2"
          aria-label="Kapitel"
        >
          {chaptersFromData.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="rounded-lg border border-neutral-300 px-3 py-2"
          aria-label="Sortera"
        >
          <option value="recent">Senast uppdaterad</option>
          <option value="title">A–Ö (titel)</option>
        </select>
      </div>

      {/* Statusrad */}
      <div className="text-sm text-neutral-600">
        {loading ? "Laddar recept…" : `${filtered.length} recept`}
      </div>

      {/* Innehåll */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SkeletonCard /><SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="empty">
      <p className="mb-3">
        Här ekar det tomt – precis som en ny bok innan bläcket torkat.
      </p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Tryck <b>Nytt recept</b> för att börja</li>
        <li>Importera från fil i <b>Mer</b> → Inställningar</li>
        <li>Allt sparas lokalt. Inga konton. Ingen delning.</li>
      </ul>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden animate-pulse">
      <div className="h-40 bg-neutral-200/60" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-24 bg-neutral-200/80 rounded" />
        <div className="h-5 w-40 bg-neutral-200/80 rounded" />
      </div>
    </div>
  );
}