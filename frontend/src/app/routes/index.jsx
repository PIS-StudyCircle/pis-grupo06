import { Routes, Route, Navigate } from "react-router-dom";
import CoursePage from "@/features/courses/pages/CoursePage";
import CourseDetailPage from "@/features/courses/pages/CourseDetailPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/courses" replace />} />
      <Route path="/courses" element={<CoursePage />} />
      <Route path="/courses/:courseId" element={<CourseDetailPage />} />
    </Routes>
  );
}
