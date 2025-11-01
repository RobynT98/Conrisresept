import { Outlet, NavLink } from "react-router-dom";
import NavBar from "./components/NavBar";
import TabBar from "./components/TabBar";

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col">
      <NavBar />
      <main className="flex-1 max-w-screen-md w-full mx-auto px-4 py-4">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}