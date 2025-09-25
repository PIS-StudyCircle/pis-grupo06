import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { SignInPage, RegisterPage, TutorPage } from "@/features/users";
import { RequireGuestRoute } from "./RequireGuestRoute";
import ProfilePage from "@/features/users/pages/Profile";


import { CoursePage, CourseDetailPage } from "@/features/courses";

import VisitorFlow from "@/features/visitors/pages/VisitorFlow";



export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RequireGuestRoute />}>
        <Route path="/iniciar_sesion" element={<SignInPage />} />
        <Route path="/registrarse" element={<RegisterPage />} />
        <Route path="/tutores" element={<TutorPage />} />
        <Route path="/flujo-visitante" element={<VisitorFlow />} />
      </Route>

      <Route path="/" element={<Navigate to="/materias" replace />} />

      <Route path="/materias" element={<CoursePage />} />
      <Route element={<PrivateRoute />}>
        <Route path="/materias/:courseId" element={<CourseDetailPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}
