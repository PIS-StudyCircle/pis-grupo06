import { useState, useEffect } from "react";
import CourseList from "../components/CourseList";

import { useCourses } from "../hooks/useCourses";
import SearchInput from "@components/SearchInput";
import Pagination from "@components/Pagination";
import PageTitle from "@components/PageTitle";
import TopTutors from "../components/TopTutors";  
import { useUser } from "@context/UserContext";

export default function CoursePage() {
  const {
    courses,
    loading,
    error,
    pagination,
    page,
    setPage,
    search,
    setSearch,
    showFavorites,
    setShowFavorites,
  } = useCourses();
  const totalPages = pagination.last || 1;

  const [query, setQuery] = useState(search);
  const { user } = useUser();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, setPage, setSearch]);

  return (
    <div className="flex flex-col py-6 content-scroll">
      <div className="flex justify-center gap-10 pl-32 pr-10">
        {/* Columna izquierda: cursos */}
        <div className="flex-[1.6]">
          <PageTitle title="Materias Disponibles" className="titulo" />
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar materia..."
          />

          {user && (
            <label className="flex items-center gap-2 cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={showFavorites}
                onChange={(e) => setShowFavorites(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Favoritos</span>
            </label>
          )}

          <CourseList courses={courses} loading={loading} error={error} />
          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>

        {/* Columna derecha: ranking */}
        <div className="flex-[0.8]">
          <TopTutors />
        </div>
      </div>
    </div>
  );
}
