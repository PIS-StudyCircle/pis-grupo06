import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render } from "@testing-library/react";
import * as tutoringHooks from "../hooks/useTutorings";

// Datos de prueba
export const baseTutorings = [
  {
    id: 1,
    course: { name: "Álgebra" },
    scheduled_at: "2025-10-08T15:00:00Z",
    duration_mins: 60,
    modality: "Online",
    tutor_id: 1,
    tutor_name: "Juan",
    tutor_last_name: "Pérez",
    tutor_email: "juan@example.com",
    capacity: 5,
    enrolled: 0,
    subjects: [{ id: 1, name: "Tema 1" }],
  },
  {
    id: 2,
    course: { name: "Física" },
    scheduled_at: "2025-10-09T16:00:00Z",
    duration_mins: 90,
    modality: "Presencial",
    tutor_id: null,
    tutor_name: "",
    tutor_last_name: "",
    tutor_email: "",
    capacity: 3,
    enrolled: 0,
    subjects: [{ id: 2, name: "Mecánica" }],
  },
  {
    id: 3,
    course: { name: "Química" },
    scheduled_at: "2025-10-10T17:00:00Z",
    duration_mins: 45,
    modality: "Online",
    tutor_id: 2,
    tutor_name: "Ana",
    tutor_last_name: "García",
    tutor_email: "ana@example.com",
    capacity: 2,
    enrolled: 1,
    subjects: [{ id: 3, name: "Orgánica" }],
  },
];

// Render con router
export const renderWithRouter = (ui, path = "/tutorias/123") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/tutorias/:courseId" element={ui} />
      </Routes>
    </MemoryRouter>
  );

  // Mock de useTutorings
  export const mockUseTutorings = ({
    tutorings = baseTutorings,
    loading = false,
    error = null,
    page = 1,
    setPage = jest.fn(),
    search = "",
    setSearch = jest.fn(),
    pagination = { last: 1, current: 1 },
  } = {}) => {
    jest.spyOn(tutoringHooks, "useTutorings").mockReturnValue({
      tutorings,
      loading,
      error,
      page,
      setPage,
      search,
      setSearch,
      pagination,
    });
  };