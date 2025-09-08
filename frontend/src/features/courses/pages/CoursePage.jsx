import { useState, useEffect } from "react";
import NavBar from "@components/NavBar";
import Footer from "@components/Footer";
import CourseCard from "../components/CourseCard";
import { useCourses } from "../hooks/useCourses";
import ReactPaginate from "react-paginate";

export default function CoursePage() {
  const { courses, loading, error, pagination, page, setPage, search, setSearch } = useCourses();
  const totalPages = pagination.pages || 1;

  // estado local para el input
  const [query, setQuery] = useState(search);

  // debounce: actualiza el search real solo cuando el user deja de tipear
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0">
        <NavBar />
      </div>

      <div className="flex flex-1 overflow-hidden bg-[#f3f8f9]">
        <div className="w-1/4 bg-white rounded-lg shadow-md m-4"></div>

        {/* Contenido central con scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-4 content-scroll">
          <h1 className="text-2xl font-bold p-2 mb-4 text-black">
            Materias Disponibles
          </h1>

          {/* Input de búsqueda */}
          <div className="relative w-full mb-4">
            {/* Ícono SVG de búsqueda */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
              />
            </svg>

            <input
              type="text"
              placeholder="Buscar materia..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full shadow-sm 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Resultados */}
          {loading ? (
            <div>Cargando materias...</div>
          ) : error ? (
            <div>Error al cargar las materias. </div>
          ) : courses.length === 0 ? (
            <div>No hay materias disponibles. </div>
          ) : (
            courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          )}

          {/* Paginación */}
          {!loading && totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <ReactPaginate
                forcePage={page - 1}
                pageCount={totalPages}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={({ selected }) => setPage(selected + 1)}
                previousLabel="<"
                nextLabel=">"
                containerClassName="flex space-x-2"
                pageLinkClassName="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-blue-500 hover:text-white cursor-pointer transition"
                previousLinkClassName="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-blue-500 hover:text-white cursor-pointer transition"
                nextLinkClassName="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-blue-500 hover:text-white cursor-pointer transition"
                activeLinkClassName="bg-blue-500 text-white border-blue-500"
                disabledLinkClassName="opacity-50 cursor-not-allowed"
              />
            </div>
          )}
        </div>

        <div className="w-1/4 bg-white rounded-lg shadow-md m-4"></div>
      </div>
      <Footer />
    </div>
  );
}
