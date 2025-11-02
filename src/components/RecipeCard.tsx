import { Link } from "react-router-dom";
import { Recipe } from "../types";

type Variant = "default" | "compact";

export default function RecipeCard({
  recipe,
  variant = "default",
}: {
  recipe: Recipe;
  variant?: Variant;
}) {
  const compact = variant === "compact";
  const imgHeight = compact ? "h-28" : "h-44";
  const titleSize = compact ? "text-base" : "text-lg";
  const padding = compact ? "p-2.5" : "p-3";

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="
        group block rounded-2xl border border-amber-100 bg-white/80
        shadow-sm hover:shadow-md hover:bg-white transition-all overflow-hidden
      "
    >
      {recipe.image ? (
        <img
          src={recipe.image}
          alt={`Bild på ${recipe.title}`}
          className={`w-full ${imgHeight} object-cover transition-transform duration-300 group-hover:scale-[1.03]`}
          loading="lazy"
        />
      ) : (
        <div
          className={`w-full ${imgHeight} bg-gradient-to-br from-butter/50 to-amber-100/30`}
          aria-hidden="true"
        />
      )}

      <div className={`${padding} space-y-1`}>
        {recipe.chapter && (
          <div className="text-[11px] uppercase tracking-wide text-forest/70 font-medium">
            {recipe.chapter}
          </div>
        )}

        <h3
          className={`font-display ${titleSize} text-neutral-900 group-hover:text-forest transition-colors`}
        >
          {recipe.title}
        </h3>

        <div className="text-xs text-neutral-500 flex gap-2">
          {recipe.servings ? <span>{recipe.servings} port</span> : null}
          {recipe.time?.total ? <span>{recipe.time.total} min</span> : null}
        </div>
      </div>
    </Link>
  );
}