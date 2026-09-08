import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/useAuth.js";

export default function ProtectedRoute({ children }) {
  const { loading, isLoggedIn } = useAuth();

  if (loading) {
    return <div className="admin-shell" style={{ display: "grid", placeItems: "center" }}>Loading…</div>;
  }
  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
