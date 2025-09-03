import { Routes, Route } from "react-router-dom";
import { FacultiesPage } from "@/features/faculties";
import CoursePage from "@/features/courses/pages/CoursePage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<FacultiesPage />} />
      <Route path="/courses" element={<CoursePage />} />
    </Routes>
  );
}
