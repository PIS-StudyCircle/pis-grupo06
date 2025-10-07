import { useState, useEffect, useMemo } from "react";
import { useTutorings } from "../hooks/useTutorings";
import TutoringList from "../components/TutoringList";
import TutoringSearchBar from "../components/TutoringSearchBar";
import Pagination from "@components/Pagination";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

export default function TutoringPage({ filters = {}, mode = "" }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const courseName = state?.courseName;

  // estados
  const [searchBy, setSearchBy] = useState("course");
  const [showWithoutTutor, setShowWithoutTutor] = useState(false);
  const [query, setQuery] = useState("");
  const forceSubjectSearch = ["serTutor", "serEstudiante"].includes(mode);

  // filtros combinados
  const mergedFilters = useMemo(() => {
    const base = { ...filters, search_by: searchBy };
    if (showWithoutTutor) base.no_tutor = true;
    if (courseId) base.course_id = courseId;
    return base;
  }, [filters, searchBy, showWithoutTutor, courseId]);

  const {
    tutorings,
    loading,
    error,
    pagination,
    page,
    setPage,
    search,
    setSearch,
  } = useTutorings(1, 20, mergedFilters, mode);

  const totalPages = pagination?.last || 1;

  // sincronización de búsqueda con debounce
  useEffect(() => setQuery(search), [search]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, setSearch, setPage]);

  useEffect(() => setPage(1), [searchBy, setPage]);
  useEffect(() => {
    if (forceSubjectSearch) setSearchBy("subject");
  }, [forceSubjectSearch]);

  const goToCreateTutoring = () =>
    navigate(
      `/tutorias/elegir_temas/${
        mode === "serTutor" ? "tutor" : "estudiante"
      }/${courseId}`
    );

  const showFilterToggle = !["serTutor", "serEstudiante"].includes(mode);

  console.log({ mode, courseName });

  // vista especial si es serTutor y no hay tutorías
  if (!loading && mode === "serTutor" && tutorings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 text-black text-center">
          No hay tutorías disponibles para{" "}
          {courseName ? (
            <Link
              to={`/materias/${courseId}`}
              className="text-blue-600 hover:underline"
            >
              {courseName}
            </Link>
          ) : (
            "esta materia"
          )}
          .
        </h1>
        <button type="button" className="btn" onClick={goToCreateTutoring}>
          Crear nueva tutoría
        </button>
      </div>
    );
  }

  // vista especial si es serEstudiante y no hay tutorías
  if (!loading && mode === "serEstudiante" && tutorings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 text-black text-center">
          No hay tutorías disponibles para{" "}
          {courseName ? (
            <Link
              to={`/materias/${courseId}`}
              className="text-blue-600 hover:underline"
            >
              {courseName}
            </Link>
          ) : (
            "esta materia"
          )}
          .
        </h1>

        <button type="button" className="btn" onClick={goToCreateTutoring}>
          Solicitar nueva tutoría
        </button>
      </div>
    );
  }

  // layout base (se muestra siempre)
  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-4 content-scroll">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold p-2 text-black">
              {mode === "serTutor"
                ? `Tutorías disponibles para ${courseName || ""}`
                : "Tutorías disponibles"}
            </h1>

            {["serTutor", "serEstudiante"].includes(mode) && (
              <button
                type="button"
                className="btn"
                onClick={goToCreateTutoring}
              >
                {mode === "serTutor"
                  ? "Crear nueva tutoría"
                  : "Solicitar nueva tutoría"}
              </button>
            )}
          </div>

          {/* Barra de búsqueda */}
          <TutoringSearchBar
            query={query}
            onQueryChange={(e) => setQuery(e.target.value)}
            searchBy={forceSubjectSearch ? "subject" : searchBy}
            onSearchByChange={forceSubjectSearch ? () => {} : setSearchBy}
            options={
              forceSubjectSearch
                ? [{ value: "subject", label: "Tema" }]
                : [
                    { value: "course", label: "Materia" },
                    { value: "subject", label: "Tema" },
                  ]
            }
            placeholder={
              (forceSubjectSearch ? "subject" : searchBy) === "course"
                ? "Buscar por materia..."
                : "Buscar por tema..."
            }
          />

          {/* Filtro toggle */}
          {showFilterToggle && (
            <label className="flex items-center gap-2 cursor-pointer ml-4 mt-2">
              <input
                type="checkbox"
                checked={showWithoutTutor}
                onChange={(e) => setShowWithoutTutor(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Tutor indefinido</span>
            </label>
          )}

          {/* Contenido principal */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh] text-gray-600">
              Cargando tutorías...
            </div>
          ) : tutorings.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center text-gray-700">
              <p className="text-lg font-medium mb-2">
                No se encontraron tutorías.
              </p>
              <p>Probá ajustando los filtros o el término de búsqueda.</p>
            </div>
          ) : (
            <>
              <TutoringList
                tutorings={tutorings}
                mode={mode}
                loading={loading}
                error={error}
              />
              <Pagination
                page={page}
                setPage={setPage}
                totalPages={totalPages}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
