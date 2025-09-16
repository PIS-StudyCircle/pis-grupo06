import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { SignInPage, RegisterPage } from "@/features/users";
import { RequireGuestRoute } from "./RequireGuestRoute";

import CoursePage from "@/features/courses/pages/CoursePage";
import CourseDetailPage from "@/features/courses/pages/CourseDetailPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RequireGuestRoute />}>
        <Route path="/sign_in" element={<SignInPage />} />
        <Route path="/sign_up" element={<RegisterPage />} />
      </Route>
      
      <Route path="/" element={<Navigate to="/courses" replace />} />
      <Route path="/courses" element={<CoursePage />} />
      <Route path="/courses/:courseId" element={<CourseDetailPage />} />
    </Routes>
  );
}
