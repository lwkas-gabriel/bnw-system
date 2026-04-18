import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import { AppLayout } from "../shared/components/AppLayout";
import { PageLoader } from "../shared/components/PageLoader";

const HomePage             = lazy(() => import("../pages/HomePage"));
const CharacterListPage    = lazy(() => import("../pages/CharacterListPage"));
const CharacterBuilderPage = lazy(() => import("../pages/CharacterBuilderPage"));
const CombatPage           = lazy(() => import("../pages/CombatPage"));
const ItemsPage            = lazy(() => import("../pages/ItemsPage"));
const ImportPage           = lazy(() => import("../pages/ImportPage"));
const ShipsPage            = lazy(() => import("../pages/ShipsPage"));
const PericiasPage         = lazy(() => import("../pages/PericiasPage"));
const ProfissoesPage       = lazy(() => import("../pages/ProfissoesPage"));

function SuspenseLayout() {
  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </AppLayout>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SuspenseLayout />,
    children: [
      { index: true,                element: <HomePage /> },
      { path: "characters",         element: <CharacterListPage /> },
      { path: "characters/new",     element: <CharacterBuilderPage /> },
      { path: "characters/:id",     element: <CharacterBuilderPage /> },
      { path: "combat",             element: <CombatPage /> },
      { path: "items",              element: <ItemsPage /> },
      { path: "import",             element: <ImportPage /> },
      { path: "ships",              element: <ShipsPage /> },
      { path: "professions",        element: <ProfissoesPage /> },
      { path: "pericias",           element: <PericiasPage /> },
    ],
  },
]);
