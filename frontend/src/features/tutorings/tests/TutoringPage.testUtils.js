import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render } from "@testing-library/react";
import * as tutoringHooks from "../hooks/useTutorings";
import { jest } from "@jest/globals";

// Datos de prueba
export const baseTutorings = [
  {
    id: 1, course: { name: "Álgebra" }, scheduled_at: "2025-10-08T15:00:00Z", duration_mins: 60, modality: "Online",
    tutor_id: 1, tutor_name: "Juan", tutor_last_name: "Pérez", tutor_email: "juan@example.com",
    capacity: 5, enrolled: 0, subjects: [{ id: 1, name: "Tema 1" }],
  },
  {
    id: 2, course: { name: "Física" }, scheduled_at: "2025-10-09T16:00:00Z",
    duration_mins: 90, modality: "Presencial",
    tutor_id: null, tutor_name: "", tutor_last_name: "",
    tutor_email: "", capacity: 3, enrolled: 0, subjects: [{ id: 2, name: "Mecánica" }],
  },
  {
    id: 3, course: { name: "Química" }, scheduled_at: "2025-10-10T17:00:00Z", duration_mins: 45, modality: "Online",
    tutor_id: 2, tutor_name: "Ana", tutor_last_name: "García", tutor_email: "ana@example.com", 
    capacity: 2, enrolled: 1, subjects: [{ id: 3, name: "Orgánica" }],
  },
  {
    id: 4, course: { name: "Química" }, scheduled_at: "2025-10-11T17:00:00Z",
    duration_mins: 45, modality: "Presencial", tutor_id: 2,
    tutor_name: "Ana", tutor_last_name: "García", tutor_email: "ana@example.com", capacity: 2,
    enrolled: 1, subjects: [{ id: 3, name: "Orgánica" }],
  },
  
  {
    id: 5, course: { name: "Química" }, scheduled_at: "2025-10-11T17:00:00Z",
    duration_mins: 45, modality: "Presencial",
    tutor_id: null, tutor_name: "", tutor_last_name: "",
    tutor_email: "", capacity: 3, enrolled: 0, subjects: [{ id: 3, name: "Orgánica" }],
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

  export const setPageMock = jest.fn();
  export const setSearchMock = jest.fn();

  export const mockUseTutorings = ({
    tutorings = baseTutorings,
    loading = false,
    error = null,
    pagination = { last: 1, current: 1 },
    page = 1,
    setPage = undefined,
    setSearch = undefined,
    query = "",
    searchBy = "course",
    includeUndefinedTutor = false,
  } = {}) => {
    const normalize = (str = "") =>
      String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
      jest.spyOn(tutoringHooks, "useTutorings").mockImplementation(
        (
          // eslint-disable-next-line no-unused-vars
          initialPage = 1, 
          // eslint-disable-next-line no-unused-vars
          perPage = 20, 
          mergedFilters = {}
        ) => {
        const [internalQuery, setInternalQuery] = React.useState(query);
        const [internalSearchBy, setInternalSearchBy] = React.useState(searchBy);
        const [internalPage, setInternalPage] = React.useState(page);
  
        React.useEffect(() => {
          if (mergedFilters?.search_by !== undefined && mergedFilters.search_by !== internalSearchBy) {
            setInternalSearchBy(mergedFilters.search_by);
          }
        }, [mergedFilters?.search_by, internalSearchBy]);
  
        const currentQuery = mergedFilters?.search ?? internalQuery;
        const currentSearchBy = mergedFilters?.search_by ?? internalSearchBy;
        const currentPage = internalPage;
  
        const exposedSetSearch =
          setSearch !== undefined ? setSearch : (val) => setInternalQuery(val);
        const exposedSetPage =
          setPage !== undefined ? setPage : (p) => setInternalPage(p);
        const exposedSetSearchBy = (val) => {
          if (setSearch === undefined) setInternalSearchBy(val);
        };
  
        const filtered = React.useMemo(() => {
            const listSource = Array.isArray(mergedFilters?.tutorings ?? tutorings)
              ? (mergedFilters?.tutorings ?? tutorings).slice()
              : [];
          
            const noTutorFlag = mergedFilters?.no_tutor ?? includeUndefinedTutor;
            let list = noTutorFlag ? listSource.filter((t) => !t.tutor_id) : listSource;
          
            if (currentQuery) {
              const q = normalize(currentQuery);
              if ((currentSearchBy || "course") === "course") {
                list = list.filter((t) => normalize(t.course?.name).includes(q));
              } else {
                list = list.filter(
                  (t) =>
                    Array.isArray(t.subjects) &&
                    t.subjects.some((s) => normalize(s.name).includes(q))
                );
              }
            }
          
            return list;
          }, [mergedFilters?.tutorings, currentQuery, currentSearchBy, mergedFilters?.no_tutor]);
  
        return {
          tutorings: filtered,
          loading,
          error,
          pagination: { ...pagination, current: currentPage },
          page: currentPage,
          setPage: exposedSetPage,
          search: currentQuery,
          setSearch: exposedSetSearch,
          searchBy: currentSearchBy,
          setSearchBy: exposedSetSearchBy,
        };
      }
    );
  };