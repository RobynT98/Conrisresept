import { createHashRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Search from "./pages/Search";
import RecipeForm from "./pages/RecipeForm";
import RecipeView from "./pages/RecipeView";
import Shopping from "./pages/Shopping";
import Notes from "./pages/Notes";
import Settings from "./pages/Settings";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "search", element: <Search /> },
      { path: "recipe/new", element: <RecipeForm /> },
      { path: "recipe/:id", element: <RecipeView /> },
      { path: "recipe/:id/edit", element: <RecipeForm /> }, // ← redigeringsläge
      { path: "shopping", element: <Shopping /> },
      { path: "notes", element: <Notes /> },
      { path: "settings", element: <Settings /> }
    ]
  }
]);

export default router;