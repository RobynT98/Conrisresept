import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecipe, deleteRecipe } from "../db";
import { Recipe } from "../types";

export default function RecipeView() {
  const { id } = useParams();
  const nav = useNavigate();
  const [r, setR] = useState<Recipe | null>(null);

  useEffect(() => {
    if (id) getRecipe(id).then(setR);
  }, [id]);

  if (!r) return <p className="p-4 text-neutral-600">Laddar…</p>;

  return (
    <article className="space-y-6">
      {/* Titel + actions */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">{r.title}</h1>
        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-butter"
            onClick={() => nav(`/recipe/${r.id}/edit`)}
          >
            Redigera
          </button>
          <button
            className="px-3 py-2 rounded-lg border border-red-300 bg-white text-red-700 hover:bg-red-50"
            onClick={async () => {
              if (!confirm("Ta bort receptet? Det går inte att ångra.")) return;
              await deleteRecipe(r.id);
              nav("/");
            }}
          >
            Ta bort
          </button>
        </div>
      </div>

      {/* Bild */}
      {r.image && (
        <img
          src={r.image}
          alt=""
          className="w-full max-h-[400px] object-cover rounded-xl border"
        />
      )}

      {/* Grundinfo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Info label="Kapitel" value={r.chapter || "–"} />
        <Info label="Portioner" value={String(r.servings || "–")} />
        <Info label="Tid" value={`${r.time.total || 0} min`} />
      </div>

      {/* Ingredienser */}
      <section>
        <h2 className="font-display text-2xl mb-2">Ingredienser</h2>
        {r.ingredients.length === 0 ? (
          <p className="text-neutral-600 text-sm">Inga ingredienser tillagda.</p>
        ) : (
          <ul className="list-disc pl-6 space-y-1">
            {r.ingredients.map((i, idx) => (
              <li key={idx}>
                {(i.qty ?? "") + " " + (i.unit || "")} {i.item}
                {i.note ? ` – ${i.note}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Tillagning */}
      <section>
        <h2 className="font-display text-2xl mb-2">Tillagning</h2>
        {r.steps.length === 0 ? (
          <p className="text-neutral-600 text-sm">Inga steg tillagda.</p>
        ) : (
          <ol className="list-decimal pl-6 space-y-2">
            {r.steps.map((s, idx) => (
              <li key={idx}>
                <div className="flex items-center gap-2">
                  <span>{s.text}</span>
                  {s.timer ? <Timer seconds={s.timer} /> : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="text-sm text-forest/80">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function Timer({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(() => setLeft((x) => x - 1), 1000);
    return () => clearInterval(t);
  }, [left]);

  return (
    <button
      className="px-2 py-1 text-xs rounded border"
      onClick={() => setLeft(seconds)}
    >
      {left > 0 ? `${left}s` : "Starta"}
    </button>
  );
}