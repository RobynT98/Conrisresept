import { NavLink } from "react-router-dom";

export default function TabBar() {
  return (
    <nav className="sm:hidden sticky bottom-0 w-full bg-paper border-t border-neutral-200">
      <div className="max-w-screen-md mx-auto grid grid-cols-5 text-xs">
        <NavLink to="/" className="p-3 text-center">Start</NavLink>
        <NavLink to="/search" className="p-3 text-center">Sök</NavLink>
        <NavLink to="/shopping" className="p-3 text-center">Inköp</NavLink>
        <NavLink to="/recipe/new" className="p-3 text-center">Nytt</NavLink>
        <NavLink to="/settings" className="p-3 text-center">Mer</NavLink>
      </div>
    </nav>
  );
}