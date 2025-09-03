import { Routes, Route } from "react-router-dom";
import { Login } from "@/features/login";
import { FacultiesPage } from "@/features/faculties";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<FacultiesPage />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

