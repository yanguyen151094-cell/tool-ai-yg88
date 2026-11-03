import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import HomePage from "../pages/home/page";
import LoginPage from "../pages/login/page";
import GamesPage from "../pages/games/page";
import AdminPage from "../pages/admin/page";

const routes: RouteObject[] = [
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/games", element: <GamesPage /> },
  { path: "/admin", element: <AdminPage /> },
  { path: "*", element: <NotFound /> },
];

export default routes;