import { useEffect, useMemo, useState } from "react";
import { getAllRecipes } from "../db";
import { Recipe } from "../types";
import RecipeCard from "../components/RecipeCard";

export default function Search() {
  const [q, setQ] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    getAllRecipes().then(setRecipes);
  }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return recipes.filter(r =>
      r.title.toLowerCase().includes(s) ||
      r.ingredients.some(i => i.item.toLowerCase().includes(s)) ||
      r.chapter.toLowerCase().includes(s)
    );
  }, [q, recipes]);

  return (
    <section className="space-y-3">
      <h1 className="font-display text-2xl">Sök</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2"
        placeholder="Sök titel, ingrediens, kapitel…"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((r) => <RecipeCard key={r.id} recipe={r} />)}
      </div>
    </section>
  );
}