import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { PrivateRoute } from "./PrivateRoutes";
import { UserProvider } from "../providers/UserProvider";
import Main from "../layouts/Main";
import Auth from "../pages/Auth";

const Home = lazy(() => import("../pages/Home"));
const Profile = lazy(() => import("../pages/private/Profile"));
const Admin = lazy(() => import("../pages/admin/Admin"));
const NotFound = lazy(() => import("../pages/NotFound"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<UserProvider />}>
      <Route element={<Main />}>
        <Route path="/" element={<Home />} />

        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<PrivateRoute admin />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>

      <Route path="/auth" element={<Auth />} />
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);

export default function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
