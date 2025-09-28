import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

import { CoursePage, CourseDetailPage } from "@/features/courses";
import { ProfilePage, SignInPage, RegisterPage, TutorPage, VisitorFlow, ForgotPasswordPage, ResetPasswordPage, UserProfilePage} from "@/features/users";
import { SubjectPage } from "@/features/subjects";
import SubjectDetailPage from "@/features/subjects/pages/SubjectDetailPage";
import { RequireGuestRoute } from "./RequireGuestRoute";
import { TutoringPage } from "@/features/tutorings";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RequireGuestRoute />}>
        <Route path="/iniciar_sesion" element={<SignInPage />} />
        <Route path="/registrarse" element={<RegisterPage />} />
        <Route path="/flujo-visitante" element={<VisitorFlow />} />
        <Route path="/olvide_contrasena" element={<ForgotPasswordPage />} />
        <Route path="/restablecer_contrasena" element={<ResetPasswordPage />} />
      </Route>
     <Route element={<PrivateRoute />}>
        <Route path="/tutorias" element={<TutoringPage filters={{}} mode="" />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/tutores" element={<TutorPage />} />
        <Route path="/usuarios/:id" element={<UserProfilePage />} />
      </Route>
      <Route path="/" element={<Navigate to="/materias" replace />} />
      <Route path="/materias" element={<CoursePage />} />
      <Route path="/materias/:courseId" element={<CourseDetailPage />} />
      <Route path="/temas/:subjectId" element={<SubjectDetailPage />} />
      <Route path="/tutores" element={<TutorPage />} />
    </Routes>
  );
}
