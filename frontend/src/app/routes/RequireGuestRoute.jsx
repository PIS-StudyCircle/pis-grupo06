import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../features/users/hooks/user_context";

export function RequireGuestRoute() {
  const { user, booting } = useUser();
  if (booting) return null; // o un spinner
  return (user) ? <Navigate to="/" replace /> : <Outlet />;
}