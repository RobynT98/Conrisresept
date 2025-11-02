import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <header className="w-full border-b border-neutral-200 bg-paper/90 backdrop-blur sticky top-0 z-10">
      <div className="max-w-screen-md mx-auto px-4 py-3 flex items-center justify-between">
        <NavLink to="/" className="font-display text-xl text-maroon">
          Conrisresept
        </NavLink>

        {/* Desktop-nav */}
        <nav className="hidden sm:flex gap-2">
          <NavLink to="/search" className="btn-ghost text-sm">Sök</NavLink>
          <NavLink to="/shopping" className="btn-ghost text-sm">Inköp</NavLink>
          <NavLink to="/notes" className="btn-ghost text-sm">Anteckningar</NavLink>
          <NavLink to="/recipe/new" className="btn-primary text-sm">Nytt recept</NavLink>
          <NavLink to="/settings" className="btn-ghost text-sm">Mer</NavLink>
        </nav>
      </div>
    </header>
  );
}