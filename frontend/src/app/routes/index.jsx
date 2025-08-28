import { Routes, Route } from "react-router-dom";
import { FacultiesPage } from "@/features/faculties";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<FacultiesPage />} />
    </Routes>
  );
}
