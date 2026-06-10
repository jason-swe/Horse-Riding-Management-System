import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { getDefaultRoute } from "./roleRoutes";

function ProtectedRoute({ role, children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.isLoading) {
    return <div className="auth-loading">Restoring session...</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && !auth.roles.includes(role)) {
    return <Navigate to={getDefaultRoute(auth.roles)} replace />;
  }

  return children;
}

export default ProtectedRoute;
