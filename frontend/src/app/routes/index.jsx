import { Routes, Route, Navigate } from "react-router-dom";
import { SignInPage, RegisterPage } from "@/features/users";
import { RequireGuestRoute } from "./RequireGuestRoute";
import  PrivateRoute  from "./PrivateRoute";

import { useUser } from "@context/UserContext";

import CoursePage from "@/features/courses/pages/CoursePage";
import TutoringPage from "@/features/tutorings/pages/TutoringPage";
import PruebaPage from "@/features/tutorings/pages/PruebaPage";
import ProfilePage from "@/features/users/pages/Profile";
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
      </Route>
     <Route element={<PrivateRoute />}>
        <Route path="/tutorias" element={<TutoringPage filters={{}} mode="" />} />
      </Route>

      {/* Ruta de prueba filtros, se puede eliminar despues */}
      <Route path="/pruebaFiltrosTutorias" element={<PruebaPage />} />
      
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/materias" element={<CoursePage />} />
      <Route element={<PrivateRoute />}> 
        <Route path="/materias/:courseId" element={<CourseDetailPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}
