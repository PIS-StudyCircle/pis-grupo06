import { Routes, Route, Navigate } from "react-router-dom";
import CoursePage from "@/features/courses/pages/CoursePage";
import VisitorFlow from "@/features/visitors/pages/VisitorFlow";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/courses" replace />} />
      <Route path="/courses" element={<CoursePage />} />
      <Route path="/visitor-flow" element={<VisitorFlow />} />
    </Routes>
  );
}
