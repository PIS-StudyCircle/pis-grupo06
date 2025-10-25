import { useState, useEffect, useMemo } from "react";
import { useTutorings} from "../hooks/useTutorings";
import TutoringList from "../components/TutoringList";
import TutoringSearchBar from "../components/TutoringSearchBar";
import Pagination from "@components/Pagination";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PageTitle from "@components/PageTitle";

export default function TutoringPage({ filters = {}, mode = "", titleClass = "titulo" }) {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const location = useLocation();
  const courseName = location.state?.courseName || "";

  // selector de búsqueda (por materia/tema) proveniente de origin/dev
  const [searchBy, setSearchBy] = useState("course");
  const [showWithoutTutor, setShowWithoutTutor] = useState(false);
  const forceSubjectSearch = mode === "serTutor" || mode === "serEstudiante";

  // 1) aseguramos course_id + 2) agregamos search_by
  const mergedFilters = useMemo(() => {
    const baseFilters = { ...filters };

    if (showWithoutTutor) {
      baseFilters.no_tutor = true;
    }

    if (courseId) baseFilters.course_id = courseId;

    baseFilters.search_by = searchBy;

    return baseFilters;
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
    onDesuscribirse, // PIS-23
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

  useEffect(() => {
    if (forceSubjectSearch) setSearchBy("subject");
  }, [forceSubjectSearch, setSearchBy]);

  const handleNavigateToTopics = () => {
    const rolePath = mode === "serTutor" ? "tutor" : "estudiante";
    navigate(`/tutorias/elegir_temas/${rolePath}/${courseId}`);
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-4 content-scroll">
        <div className="max-w-5xl mx-auto">
          <PageTitle 
            title={
                ["serTutor", "serEstudiante"].includes(mode)
                  ? `Tutorías Disponibles para ${courseName || ""}`
                  : "Tutorías Disponibles"
              }
            className={titleClass}>
            {["serTutor", "serEstudiante"].includes(mode) && (
              <button
                type="button"
                className="btn"
                onClick={handleNavigateToTopics}
              >
                {mode === "serTutor"
                  ? "Crear nueva tutoría"
                  : "Solicitar nueva tutoría"}
              </button>
            )}
          </PageTitle>
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

          {/* Filter toggle */}
          {mode !== "serTutor" && mode !== "serEstudiante" && (
            <label className="flex items-center gap-2 cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={showWithoutTutor}
                onChange={(e) => {
                  setShowWithoutTutor(e.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Solo sin tutor</span>
            </label>
          )}

          <TutoringList
            courseName={courseName ? courseName : query}
            tutorings={tutorings}
            mode={mode}
            loading={loading}
            error={error}
            onDesuscribirse={onDesuscribirse}
          />

          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
