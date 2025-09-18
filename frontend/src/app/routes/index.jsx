import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { SignInPage, RegisterPage } from "@/features/users";
import { RequireGuestRoute } from "./RequireGuestRoute";
import ProfilePage from "@/features/users/pages/Profile";


import CoursePage from "@/features/courses/pages/CoursePage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RequireGuestRoute />}>
        <Route path="/iniciar_sesion" element={<SignInPage />} />
        <Route path="/registrarse" element={<RegisterPage />} />
      </Route>
      

      <Route element={<PrivateRoute />}>
        <Route path="/perfil" element={<ProfilePage />} />
      </Route>

      <Route path="/" element={<Navigate to="/materias" replace />} />
      <Route path="/materias" element={<CoursePage />} />
    </Routes>
  );
}
