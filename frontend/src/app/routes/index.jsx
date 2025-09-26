import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { CoursePage, CourseDetailPage } from "@/features/courses";
import { ProfilePage, SignInPage, RegisterPage, TutorPage, VisitorFlow } from "@/features/users";
import { SubjectPage } from "@/features/subjects";
import { RequireGuestRoute } from "./RequireGuestRoute";
import { TutoringPage } from "@/features/tutorings";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RequireGuestRoute />}>
        <Route path="/iniciar_sesion" element={<SignInPage />} />
        <Route path="/registrarse" element={<RegisterPage />} />
        <Route path="/flujo-visitante" element={<VisitorFlow />} />
      </Route>
     <Route element={<PrivateRoute />}>
        <Route path="/tutorias" element={<TutoringPage filters={{}} mode="" />} />
        <Route path="/perfil" element={<ProfilePage />} />
        {/* SOLO PARA PROBAR MIENTRAS DESARROLLAMOS CREAR TEMA */}
        <Route path="/subjects/:courseId" element={<SubjectPage showButton={true} showCheckbox={true} />} /> 
      </Route>
      <Route path="/" element={<Navigate to="/materias" replace />} />
      <Route path="/materias" element={<CoursePage />} />
      <Route path="/materias/:courseId" element={<CourseDetailPage />} />
      <Route path="/tutores" element={<TutorPage />} />
      <Route path="/materias/:courseId" element={<CourseDetailPage />} />
    </Routes>
  );
}
