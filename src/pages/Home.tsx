// src/pages/Home.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllRecipes } from "../db";
import { Recipe } from "../types";
import RecipeCard from "../components/RecipeCard";

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    getAllRecipes().then((r) =>
      setRecipes(r.sort((a, b) => b.updatedAt - a.updatedAt))
    );
  }, []);

  const byChapter = useMemo(() => {
    const map = new Map<string, Recipe[]>();
    for (const r of recipes) {
      const key = r.chapter || "Övrigt";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    // sortera varje kapitel internt på updatedAt DESC
    for (const [k, arr] of map) {
      map.set(
        k,
        arr.slice().sort((a, b) => b.updatedAt - a.updatedAt)
      );
    }
    // returnera som stabil array av [kapitel, recept[]] sorterad på kapitelnamn
    return Array.from(map.entries()).sort(([a], [b]) =>
      a.localeCompare(b, "sv")
    );
  }, [recipes]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Kapitelhyllan</h1>
        <Link to="/recipe/new" className="btn-primary">Lägg till recept</Link>
      </div>

      {recipes.length === 0 ? (
        <EmptyState />
      ) : (
        byChapter.map(([chapter, list]) => (
          <div key={chapter} className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-xl">{chapter}</h2>
              <span className="text-xs text-neutral-600">
                {list.length} recept
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {list.map((r) => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="empty">
      <p className="mb-3">Här ekar det tomt – precis som en ny bok innan bläcket torkat.</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Tryck <b>Nytt recept</b> för att börja</li>
        <li>Importera från fil i <b>Mer</b> → Backup</li>
        <li>Allt sparas lokalt. Inga konton. Ingen delning.</li>
      </ul>
    </div>
  );
}