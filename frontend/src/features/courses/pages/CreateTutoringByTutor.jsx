import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Footer from "@components/Footer";
import { useCourse } from "../hooks/useCourse";
import { useSubjects } from "../hooks/useSubjects";
import SearchInput from "@components/SearchInput";
import Pagination from "@components/Pagination";
import { FiFilter } from "react-icons/fi";
import SubjectList from "../components/SubjectList";

//cambiar todo lo que diga courses por subjects y crear nuevos hooks
//por simplicidad y para visualizar como queda la página, solo muestra los cursos

export default function CreateTutoringByTutor() {
 const [searchParams] = useSearchParams();
  const courseId = searchParams.get("curso");
  const { course, loadingCourse, errorCourse } = useCourse(courseId);
  const {
      subjects,
      loading,
      error,
      pagination,
      page,
      setPage,
      search,
      setSearch,
    } = useSubjects(courseId);
  const totalPages = pagination.last || 1;
  const [query, setQuery] = useState(search);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  
  const toggleSubject = (subjectId) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, setPage, setSearch]);

  // Envía los temas seleccionados al backend
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Temas seleccionados: " + selectedSubjects.join(", "));
  };

  const filteredSubjects = subjects?.filter((subject) =>
    subject.name.toLowerCase().includes(query.toLowerCase())
  ) ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <div className="p-6 max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            {loadingCourse && (
              <div className="p-6 max-w-3xl mx-auto">Cargando curso...</div>
            )}
            {errorCourse && (
              <div className="p-6 max-w-3xl mx-auto text-red-600">
                Error: {errorCourse.message}
              </div>
            )}
            <div className="p-6 max-w-3xl mx-auto space-y-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {course && course.name}
              </h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-gray-700 mb-6">
                  Selecciona los temas que deseas incluir en tu tutoría.
                </p>
                <button
                  type="submit"
                  className={`btn btn-primary mt-4 ${selectedSubjects.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={selectedSubjects.length === 0}
                >
                  Guardar selección
                </button>
              </form>

              {/* Buscador + Filtro */}
              <div className="flex items-center gap-2 mb-4 relative">
                <div className="flex-1">
                  <SearchInput
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Buscar tema..."
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-ghost p-2"
                  title="Filtrar temas"
                  onClick={() => setShowFilter((v) => !v)}
                >
                  <FiFilter size={22} />
                </button>
                
                <button
                  type="button"
                  className="btn btn-primary"
                  // onClick={() => navigate(`/tema/crear?curso=${course.id}`)}
                >
                  Crear tema
                </button>
              </div>
              
              <SubjectList
                subjects={filteredSubjects}
                loading={loading}
                error={error}
                onToggle={toggleSubject}
                selectedSubjects={selectedSubjects}
              />

              <Pagination page={page} setPage={setPage} totalPages={totalPages} />

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* Menú de filtros
                  {showFilter && (
                    <div className="absolute right-0 top-full mt-2 bg-white border rounded shadow p-4 z-10">
                      <div className="mb-2 font-semibold">Opciones de filtro</div>
                      <label className="block mb-1">
                        <input type="checkbox" /> Ejemplo de filtro 1
                      </label>
                      <label className="block mb-1">
                        <input type="checkbox" /> Ejemplo de filtro 2
                      </label>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary mt-2"
                        onClick={() => setShowFilter(false)}
                      >
                        Aplicar filtros
                      </button>
                    </div>
                  )}
                  */