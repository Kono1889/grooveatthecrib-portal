import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAdminStore from "../store/adminStore";

export default function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, verifySession, logout } = useAdminStore();

  useEffect(() => {
    // Verify session on mount
    verifySession();

    // Set up token expiration check every minute
    const interval = setInterval(() => {
      if (!useAdminStore.getState().isTokenValid()) {
        logout();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [verifySession, logout]);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
