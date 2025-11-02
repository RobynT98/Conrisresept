// src/pages/Home.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllRecipes, getAllNotes } from "../db";
import type { Recipe, Note } from "../types";
import RecipeCard from "../components/RecipeCard";
import WidgetCard from "../components/WidgetCard";
import { readShopping } from "../lib/shopping";

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [shoppingLeft, setShoppingLeft] = useState<number>(0);

  useEffect(() => {
    getAllRecipes().then(setRecipes);
    getAllNotes().then(setNotes);

    // Läs nuvarande inköpslista (localStorage: shopping.v1)
    const items = readShopping();
    setShoppingLeft(items.filter(i => !i.done).length);

    // Lyssna på förändringar från Shopping-sidan
    const onShoppingChanged = () => {
      const xs = readShopping();
      setShoppingLeft(xs.filter(i => !i.done).length);
    };
    window.addEventListener("shopping:changed", onShoppingChanged);
    return () => window.removeEventListener("shopping:changed", onShoppingChanged);
  }, []);

  const latestNote = useMemo(() => notes[0], [notes]);

  return (
    <section className="space-y-6">
      {/* Topp */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Översikt</h1>
        <Link to="/recipe/new" className="btn-primary">Lägg till recept</Link>
      </div>

      {/* Widgets-rad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <WidgetCard title="Inköpslista" icon="🛒" to="/shopping" actionLabel="Öppna">
          {shoppingLeft > 0 ? (
            <span>{shoppingLeft} kvar att köpa</span>
          ) : (
            <span className="text-neutral-600">Inget kvar att köpa</span>
          )}
        </WidgetCard>

        <WidgetCard title="Anteckningar" icon="📝" to="/notes" actionLabel="Öppna">
          {latestNote ? (
            <div className="space-y-1">
              <div className="text-neutral-600 text-xs">
                {new Date(latestNote.updatedAt).toISOString().slice(0, 10)}
                {latestNote.pinned ? " • Fäst" : ""}
              </div>
              <div className="line-clamp-2">{latestNote.text}</div>
            </div>
          ) : (
            <span className="text-neutral-600">Inga anteckningar än.</span>
          )}
        </WidgetCard>
      </div>

      {/* Recept-lista */}
      <div className="flex items-center justify-between mt-2">
        <h2 className="font-display text-2xl">Kapitelhyllan</h2>
        <Link
          to="/search"
          className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-sm"
        >
          Sök
        </Link>
      </div>

      {recipes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recipes.map((r) => (
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
      <p className="mb-3">Här ekar det tomt – precis som en ny bok innan bläcket torkat.</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Tryck <b>Nytt recept</b> för att börja</li>
        <li>Importera från fil i <b>Mer</b> → Backup</li>
        <li>Allt sparas lokalt. Inga konton. Ingen delning.</li>
      </ul>
    </div>
  );
}