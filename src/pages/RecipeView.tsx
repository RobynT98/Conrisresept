import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getRecipe } from "../db";
import { Recipe } from "../types";

export default function RecipeView() {
  const { id } = useParams();
  const nav = useNavigate();
  const [r, setR] = useState<Recipe | null>(null);

  useEffect(() => {
    if (id) getRecipe(id).then(setR);
  }, [id]);

  if (!r) return <p>Laddar…</p>;

  return (
    <article className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl">{r.title}</h1>
        <Link to={`/recipe/${r.id}#edit`} onClick={(e)=>{e.preventDefault(); nav(`/recipe/${r.id}`);}} />
      </div>

      {r.image && <img src={r.image} alt="" className="w-full rounded-xl" />}

      <div className="grid grid-cols-3 gap-3">
        <Info label="Kapitel" value={r.chapter} />
        <Info label="Portioner" value={String(r.servings)} />
        <Info label="Tid" value={`${r.time.total} min`} />
      </div>

      <section>
        <h2 className="font-display text-xl mb-2">Ingredienser</h2>
        <ul className="list-disc pl-6">
          {r.ingredients.map((i, idx) => (
            <li key={idx}>
              {(i.qty ?? "") + " " + (i.unit || "")} {i.item} {i.note ? `– ${i.note}` : ""}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl mb-2">Tillagning</h2>
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
      </section>
    </article>
  );
}

function Info({label, value}:{label:string; value:string}) {
  return (
    <div className="rounded-lg border bg-white p-3">
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
    <button className="px-2 py-1 text-xs rounded border"
      onClick={()=>setLeft(seconds)}>
      {left > 0 ? `${left}s` : "Starta"}
    </button>
  );
}