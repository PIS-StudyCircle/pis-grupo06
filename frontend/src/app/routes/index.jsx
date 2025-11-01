import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

import { CoursePage, CourseDetailPage } from "@/features/courses";
import {
  ProfilePage,
  SignInPage,
  RegisterPage,
  UserPage,
  VisitorFlow,
  ForgotPasswordPage,
  ResetPasswordPage,
  UserProfilePage,
  SessionsPage,
} from "@/features/users";
import EditProfilePage from "@/features/users/pages/EditProfilePage";
import { SubjectPage } from "@/features/subjects";
import SubjectDetailPage from "@/features/subjects/pages/SubjectDetailPage";
import { RequireGuestRoute } from "./RequireGuestRoute";
import { TutoringPage, SelectSubjectsByTutor, CreateTutoringByTutor, CreateTutoringByStudent, ChooseScheduleByTutor, ChooseScheduleByStudent} from "@/features/tutorings";
import { Error404Page } from "@components/Error404";


import {
  SessionListPage,
  AppointClassPage,
} from "@/features/calendar";

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
        <Route
          path="/tutorias"
          element={<TutoringPage filters={{}} mode="" />}
        />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/editar-perfil" element={<EditProfilePage />} />
        <Route path="/usuarios/:id" element={<UserProfilePage />} />
        <Route path="/notificaciones" element={<SessionsPage />} />

        <Route path="/tutorias" element={<TutoringPage filters={{}} mode="" />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/usuarios/:id" element={<UserProfilePage />} />
        <Route path="/tutorias/:tutoringId/elegir_horario_tutor" element={<ChooseScheduleByTutor />} />
        <Route path="/tutorias/:tutoringId/elegir_horario_estudiante" element={<ChooseScheduleByStudent />} />

        <Route
          path="/tutorias/ser_tutor/:courseId"
          element={<TutoringPage filters={{}} mode="serTutor" />}
        />
        <Route
          path="/tutorias/elegir_temas/:mode/:courseId"
          element={<SelectSubjectsByTutor />}
        />
        <Route
          path="/tutorias/crear/:courseId"
          element={<CreateTutoringByTutor />}
        />
        <Route
          path="/tutorias/solicitar/:courseId"
          element={<CreateTutoringByStudent />}
        />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/usuarios" element={<UserPage />} />
        <Route path="/usuarios/:id" element={<UserProfilePage />} />
        <Route
          path="/tutorias/materia/:courseId"
          element={<TutoringPage filters={{}} mode="serEstudiante" />}
        />
        
        <Route
          path="/materias/:courseId/temas/:subjectId"
          element={<SubjectDetailPage />}
        />
      </Route>

      <Route path="/" element={<Navigate to="/materias" replace />} />
      <Route path="/materias" element={<CoursePage />} />
      <Route path="/materias/:courseId" element={<CourseDetailPage />} />

      <Route path="/materias/:courseId/temas" element={<SubjectPage />} />

      <Route path="/prototipoCalendar" element={<SessionListPage />} />
      <Route path="/appoint" element={<AppointClassPage />} />

      <Route path="/usuarios" element={<UserPage />} />
      <Route path="*" element={<Error404Page />} />
    </Routes>
  );
}
