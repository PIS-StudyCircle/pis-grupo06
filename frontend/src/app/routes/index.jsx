import { Routes, Route } from "react-router-dom";
import { FacultiesPage } from "@/features/faculties";
import { BookingPage, CalendlyPage } from "@/features/calendly";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<BookingPage />} />
      <Route path="/calendly-prototype" element={<CalendlyPage />} />
    </Routes>
  );
}
