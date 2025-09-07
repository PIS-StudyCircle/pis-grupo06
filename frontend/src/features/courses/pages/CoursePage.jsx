import { useState } from "react";
import NavBar from "@components/NavBar";
import Footer from "@components/Footer";
import CourseCard from "../components/CourseCard";
import { useCourses } from "../hooks/useCourses";
import { useFilteredCourses } from "../hooks/useFiltredCourses";
import ReactPaginate from "react-paginate";

export default function CoursePage() {
  const { courses, loading, error, pagination, page, setPage } = useCourses();
  const totalPages = pagination.last || 1;

  // Estado para la búsqueda
  const [search, setSearch] = useState("");

  // Filtrar cursos por nombre
  const filteredCourses = useFilteredCourses(courses, search);


  if (loading) return <div>Cargando materias...</div>;
  if (error) return <div>Error al cargar las materias 😢</div>;

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
          <input
            type="text"
            placeholder="Buscar materia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Lista de cursos filtrados */}
          {filteredCourses.length === 0 ? (
            <div>No hay materias disponibles</div>
          ) : (
            filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          )}

          {/* Paginación */}
          {totalPages > 1 && (
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
