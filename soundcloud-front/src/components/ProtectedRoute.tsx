import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store"; // Corrected path

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user } = useSelector((state: RootState) => state.user);
  
  // We can also check if there's a token in localStorage as a fallback
  // during the very first render before Redux gets hydrated by App.tsx
  const hasToken = !!localStorage.getItem("token");

  if (!user && !hasToken) {
    // Not logged in -> redirect to login
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role?.toLowerCase() !== 'admin') {
    // Logged in but not an admin -> redirect to home
    return <Navigate to="/home" replace />;
  }

  // Authorized -> render the route
  return children;
};

export default ProtectedRoute;
