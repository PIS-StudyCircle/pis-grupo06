import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

import { CoursePage, CourseDetailPage } from "@/features/courses";
import { ProfilePage, SignInPage, RegisterPage, TutorPage, VisitorFlow, ForgotPasswordPage, ResetPasswordPage, UserProfilePage} from "@/features/users";
import { SubjectPage } from "@/features/subjects";
import { RequireGuestRoute } from "./RequireGuestRoute";
import { TutoringPage, SelectSubjectsByTutor, CreateTutoringByTutor, CreateTutoringByStudent } from "@/features/tutorings";
import { Error404Page } from "@components/Error404";


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
        <Route path="/tutorias/ser_tutor/:courseId" element={<TutoringPage filters={{}} mode="serTutor" />} />
        <Route path="/tutorias/elegir_temas/:mode/:courseId" element={<SelectSubjectsByTutor />} />
        <Route path="/tutorias/crear/:courseId" element={<CreateTutoringByTutor />} />
        <Route path="/tutorias/solicitar/:courseId" element={<CreateTutoringByStudent />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/tutores" element={<TutorPage />} />
        <Route path="/usuarios/:id" element={<UserProfilePage />} />
        <Route path="/tutorias/materia/:courseId" element={<TutoringPage filters={{}} mode="serEstudiante" />} />
      </Route>
      <Route path="/" element={<Navigate to="/materias" replace />} />
      <Route path="/materias" element={<CoursePage />} />
      <Route path="/materias/:courseId" element={<CourseDetailPage />} />
      <Route path="/tutores" element={<TutorPage />} />
      <Route path="*" element={<Error404Page />} />
    </Routes>
  );
}
