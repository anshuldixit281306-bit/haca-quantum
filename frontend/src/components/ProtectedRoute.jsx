import { Navigate, Outlet, useLocation } from "react-router-dom";

export function ProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
  return token ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

export function AdminRoute() {
  const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
  const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
  let role = "student";
  try {
    role = JSON.parse(storedUser || "{}").role || role;
  } catch {
    role = "student";
  }
  return token && role === "admin" ? <Outlet /> : <Navigate to={token ? "/dashboard" : "/login"} replace />;
}
