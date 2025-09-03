import { Routes, Route } from "react-router-dom";
import { FacultiesPage } from "@/features/faculties";
import BookingPage from "@/features/calendly/pages/BookingPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<BookingPage />} />
    </Routes>
  );
}
