import { useEffect, useState } from "react";
import { getAllRecipes } from "../db";
import { Recipe } from "../types";
import RecipeCard from "../components/RecipeCard";
import { Link } from "react-router-dom";

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    getAllRecipes().then((r) => setRecipes(r.sort((a,b)=>b.updatedAt-a.updatedAt)));
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Kapitelhyllan</h1>
        <Link to="/recipe/new" className="px-3 py-2 rounded-lg bg-forest text-white">
          Lägg till recept
        </Link>
      </div>

      {recipes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-neutral-300 rounded-xl p-6 bg-white/60">
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