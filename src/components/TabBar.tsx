import { NavLink } from "react-router-dom";

const base =
  "p-3 text-center relative select-none transition-colors";
const active =
  "font-semibold text-neutral-900 after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-0.5 after:h-1.5 after:w-6 after:rounded-full after:bg-forest";
const inactive = "text-neutral-700";

export default function TabBar() {
  return (
    <nav
      className="sm:hidden sticky bottom-0 w-full bg-paper/95 border-t border-neutral-200 backdrop-blur"
      aria-label="Nedre navigering"
    >
      <div className="max-w-screen-md mx-auto grid grid-cols-5 text-xs">
        <NavLink
          to="/"
          className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
        >
          Start
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
        >
          Sök
        </NavLink>
        <NavLink
          to="/shopping"
          className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
        >
          Inköp
        </NavLink>
        <NavLink
          to="/recipe/new"
          className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
        >
          Nytt
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
        >
          Mer
        </NavLink>
      </div>
    </nav>
  );
}