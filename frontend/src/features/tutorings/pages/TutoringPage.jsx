import { useState, useEffect, useMemo } from "react";
import { useTutorings } from "../hooks/useTutorings";
import TutoringList from "../components/TutoringList";
import TutoringSearchBar from "../components/TutoringSearchBar";
import Pagination from "@components/Pagination";
import { useParams, useNavigate } from "react-router-dom";

export default function TutoringPage({ filters = {}, mode = "" }) {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // selector de búsqueda (por materia/tema) proveniente de origin/dev
  const [searchBy, setSearchBy] = useState("course");
  const [showWithoutTutor, setShowWithoutTutor] = useState(false);

  // 1) aseguramos course_id + 2) agregamos search_by
  const mergedFilters = useMemo(() => {
    const baseFilters = { ...filters };

    if (showWithoutTutor) {
      baseFilters.no_tutor = true;
    }

    baseFilters.search_by = searchBy;

    return baseFilters;
  }, [filters, searchBy, showWithoutTutor]);

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

  // query local con debounce
  const [query, setQuery] = useState(search);
  useEffect(() => {
    setQuery(search);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [query, setSearch, setPage]);

  // si cambia el modo de búsqueda, volvemos a la página 1
  useEffect(() => {
    setPage(1);
  }, [searchBy, setPage]);

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-4 content-scroll">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold p-2 text-black">
              Tutorías Disponibles
            </h1>

            {mode === "serTutor" && (
              <button
                type="button"
                className="btn"
                onClick={() => navigate(`/tutorias/elegir_temas/tutor/${courseId}`)}
              >
                Crear nueva tutoría
              </button>
            )}

            {mode === "serEstudiante" && (
              <button
                type="button"
                className="btn"
                onClick={() =>
                  navigate(`/tutorias/elegir_temas/estudiante/${courseId}`)
                }
              >
                Solicitar nueva tutoría
              </button>
            )}
          </div>

          {/* Si llegamos sin modo, puede buscar por materia o tema */}
          {mode === "" && (
            <TutoringSearchBar
              query={query}
              onQueryChange={(e) => setQuery(e.target.value)}
              searchBy={searchBy}
              onSearchByChange={setSearchBy}
              placeholder={
                searchBy === "course"
                  ? "Buscar por materia..."
                  : "Buscar por tema..."
              }
            />
          )}
          {/* Si llegamos desde la materia específica, solo puede filtrar por tema */}
          {(mode === "serTutor" || mode === "serEstudiante") && (
            <TutoringSearchBar
              query={query}
              onQueryChange={(e) => setQuery(e.target.value)}
              searchBy={"subject"}
              onSearchByChange={setSearchBy}
              placeholder={"Buscar por tema..."}
            />
          )}

            {/* Filter toggle */}
            <label className="flex items-center gap-2 cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={showWithoutTutor}
                onChange={(e) => setShowWithoutTutor(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Tutor Indefinido</span>
            </label>

          <TutoringList tutorings={tutorings} mode={mode} loading={loading} error={error} />

          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
