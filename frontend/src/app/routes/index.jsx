import { Routes, Route, Navigate } from "react-router-dom";
import CoursePage from "@/features/courses/pages/CoursePage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/courses" replace />} />
      <Route path="/courses" element={<CoursePage />} />
    </Routes>
  );
}
