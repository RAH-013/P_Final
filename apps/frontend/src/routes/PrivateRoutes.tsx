import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../hooks/useUser";

interface PrivateRouteProps {
  admin?: boolean;
}

export function PrivateRoute({ admin = false }: PrivateRouteProps) {
  const { user, loading } = useUser();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (admin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
