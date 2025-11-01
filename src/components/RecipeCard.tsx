import { Link } from "react-router-dom";
import { Recipe } from "../types";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="block rounded-xl shadow-paper border border-neutral-200 bg-white overflow-hidden"
    >
      {recipe.image ? (
        <img src={recipe.image} alt="" className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-butter/40" />
      )}
      <div className="p-3">
        <div className="text-sm text-forest/80">{recipe.chapter}</div>
        <h3 className="font-display text-lg">{recipe.title}</h3>
      </div>
    </Link>
  );
}