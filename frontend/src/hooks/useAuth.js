import { useSelector } from "react-redux";

export function useAuth() {
  const { user, accessToken } = useSelector((state) => state.auth);

  const role = user?.role || null;
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isAdmin = role === "ADMIN" || isSuperAdmin;
  const isAuthenticated = !!accessToken;

  return { user, role, isSuperAdmin, isAdmin, isAuthenticated };
}
