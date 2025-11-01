import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <header className="w-full border-b border-neutral-200 bg-paper/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-screen-md mx-auto px-4 py-3 flex items-center justify-between">
        <NavLink to="/" className="font-display text-xl text-maroon">
          Conrisresept
        </NavLink>
        <nav className="hidden sm:flex gap-4">
          <NavLink to="/search" className="text-sm">Sök</NavLink>
          <NavLink to="/shopping" className="text-sm">Inköp</NavLink>
          <NavLink to="/recipe/new" className="text-sm">Nytt recept</NavLink>
          <NavLink to="/settings" className="text-sm">Mer</NavLink>
        </nav>
      </div>
    </header>
  );
}