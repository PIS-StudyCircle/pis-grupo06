import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { SignInPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage} from "@/features/users";
import { RequireGuestRoute } from "./RequireGuestRoute";
import ProfilePage from "@/features/users/pages/Profile";

import { useUser } from "@context/UserContext";

import CoursePage from "@/features/courses/pages/CoursePage";
import VisitorFlow from "@/features/visitors/pages/VisitorFlow";
import CourseDetailPage from "@/features/courses/pages/CourseDetailPage";

function HomeRedirect() {
  const { user, booting } = useUser();
  
  if (booting) return null; // o spinner
  
  return user 
    ? <Navigate to="/materias" replace /> 
    : <Navigate to="/flujo-visitante" replace />;
}

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
      
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/materias" element={<CoursePage />} />
      <Route element={<PrivateRoute />}> 
        <Route path="/materias/:courseId" element={<CourseDetailPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}
