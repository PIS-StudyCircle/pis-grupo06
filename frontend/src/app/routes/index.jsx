import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { SignInPage, RegisterPage } from "@/features/users";
import { RequireGuestRoute } from "./RequireGuestRoute";
import ProfilePage from "@/features/users/pages/Profile";


import CoursePage from "@/features/courses/pages/CoursePage";
import VisitorFlow from "@/features/visitors/pages/VisitorFlow";
import CourseDetailPage from "@/features/courses/pages/CourseDetailPage";
import SelectTutoringByTutor from "@/features/tutoring/pages/SelectTutoringByTutor";
import CreateTutoringByTutor from "@/features/tutoring/pages/CreateTutoringByTutor";


export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RequireGuestRoute />}>
        <Route path="/iniciar_sesion" element={<SignInPage />} />
        <Route path="/registrarse" element={<RegisterPage />} />
        <Route path="/flujo-visitante" element={<VisitorFlow />} />
      </Route>

      <Route path="/" element={<Navigate to="/materias" replace />} />

      <Route path="/materias" element={<CoursePage />} />
      <Route element={<PrivateRoute />}>
        <Route path="/materias/:courseId" element={<CourseDetailPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/tutoria/elegir_temas" element={<SelectTutoringByTutor />} />
        <Route path="/tutoria/crear_tutoria" element={<CreateTutoringByTutor />} />
      </Route>

    </Routes>
  );
}
