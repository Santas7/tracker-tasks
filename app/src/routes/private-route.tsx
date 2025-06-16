import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "../core/store/hooks";

export const PrivateRoute: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};
