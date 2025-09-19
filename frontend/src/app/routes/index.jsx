import { Routes, Route, Navigate } from "react-router-dom";
import { SignInPage, RegisterPage } from "@/features/users";
import { RequireGuestRoute } from "./RequireGuestRoute";
import  PrivateRoute  from "./PrivateRoute";

import CoursePage from "@/features/courses/pages/CoursePage";
import TutoringPage from "@/features/tutorings/pages/TutoringPage";
import PruebaPage from "@/features/tutorings/pages/PruebaPage";


export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RequireGuestRoute />}>
        <Route path="/iniciar_sesion" element={<SignInPage />} />
        <Route path="/registrarse" element={<RegisterPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/materias" replace />} />
      <Route path="/materias" element={<CoursePage />} />
     <Route element={<PrivateRoute />}>
        <Route path="/tutorias" element={<TutoringPage filters={{}} mode="" />} />
      </Route>

      {/* Ruta de prueba filtros, se puede eliminar despues */}
      <Route path="/pruebaFiltrosTutorias" element={<PruebaPage />} />
    </Routes>
  );
}
