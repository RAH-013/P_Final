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

const Home = lazy(() => import("../pages/Home"));
const Content = lazy(() => import("../pages/Content"));
const Auth = lazy(() => import("../pages/Auth"));
const NotFound = lazy(() => import("../pages/NotFound"));

const Profile = lazy(() => import("../pages/private/Profile"));
const Preferences = lazy(() => import("../pages/private/Preferences"));
const Comments = lazy(() => import("../pages/private/Comments"));
const Likes = lazy(() => import("../pages/private/Likes"));
const Recommendations = lazy(() => import("../pages/private/Recommendations"));

const Admin = lazy(() => import("../pages/admin/Admin"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<UserProvider />}>
      <Route element={<Main />}>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<Content />} />
        <Route path="/series/:id" element={<Content />} />

        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/likes" element={<Likes />} />
          <Route path="/comments" element={<Comments />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Route>

        <Route element={<PrivateRoute admin />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/users/:userId/comments" element={<Comments />} />
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
