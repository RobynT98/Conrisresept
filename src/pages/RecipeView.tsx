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
    <article className="space-y-6 border border-amber-100 bg-white/60 rounded-2xl p-4 sm:p-6 shadow-sm">
      {/* Titel */}
      <h1 className="font-display text-3xl text-center">{r.title}</h1>

      {/* Actions under titel – diskreta */}
      <div className="flex justify-center gap-3">
        <button
          className="px-4 py-1.5 rounded-lg border border-forest/20 text-forest/70 bg-transparent hover:bg-forest/5 transition-colors text-sm"
          onClick={() => nav(`/recipe/${r.id}/edit`)}
        >
          Redigera
        </button>
        <button
          className="px-4 py-1.5 rounded-lg border border-red-200 text-red-500 bg-transparent hover:bg-red-50 transition-colors text-sm"
          onClick={async () => {
            if (!confirm("Ta bort receptet? Det går inte att ångra.")) return;
            await deleteRecipe(r.id);
            nav("/");
          }}
        >
          Ta bort
        </button>
      </div>

      {/* Bild */}
      {r.image && (
        <img
          src={r.image}
          alt=""
          className="w-full max-h-[400px] object-cover rounded-2xl border"
        />
      )}

      {/* Grundinfo – kompakt, i rad */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
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

/* Kompakt “etikett”-kort */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-amber-100 bg-white/70 px-3 py-2 min-w-[96px] text-center shadow-sm">
      <div className="text-xs text-forest/80">{label}</div>
      <div className="font-medium text-sm">{value}</div>
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