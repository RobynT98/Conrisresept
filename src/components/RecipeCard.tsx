import { Link } from "react-router-dom";
import { Recipe } from "../types";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="group block rounded-2xl border border-amber-100 bg-white/80 shadow-sm hover:shadow-md hover:bg-white transition-all overflow-hidden"
    >
      {recipe.image ? (
        <img
          src={recipe.image}
          alt={`Bild på ${recipe.title}`}
          className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-44 bg-gradient-to-br from-butter/50 to-amber-100/30" />
      )}

      <div className="p-3 space-y-1">
        {recipe.chapter && (
          <div className="text-xs uppercase tracking-wide text-forest/70 font-medium">
            {recipe.chapter}
          </div>
        )}
        <h3 className="font-display text-lg text-neutral-900 group-hover:text-forest transition-colors">
          {recipe.title}
        </h3>

        <div className="text-xs text-neutral-500 flex gap-2">
          {recipe.servings && <span>{recipe.servings} port</span>}
          {recipe.time?.total && <span>{recipe.time.total} min</span>}
        </div>
      </div>
    </Link>
  );
}