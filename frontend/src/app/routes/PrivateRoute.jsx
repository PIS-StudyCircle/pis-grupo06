import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@context/UserContext";

export default function PrivateRoute() {
  const { user, booting } = useUser();
  if (booting) return null; // o spinner
  return user ? <Outlet /> : <Navigate to="/iniciar_sesion" replace />;
}