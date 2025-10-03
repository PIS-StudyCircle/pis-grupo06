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

  // 1) aseguramos course_id + 2) agregamos search_by
  const mergedFilters = useMemo(() => {
    const base = filters ?? {};
    return { ...base, course_id: courseId, search_by: searchBy };
  }, [filters, courseId, searchBy]);

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

  const totalPages = (pagination && pagination.last) || 1;

  // query local con debounce
  const [query, setQuery] = useState(search);
  useEffect(() => {
    setQuery(search);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      if (page !== 1) setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [query, page, setSearch, setPage]);

  // si cambia el modo de búsqueda, volvemos a la página 1
  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [searchBy, page, setPage]);

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
          <TutoringList
            tutorings={tutorings}
            mode={mode}
            loading={loading}
            error={error}
          />

          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
