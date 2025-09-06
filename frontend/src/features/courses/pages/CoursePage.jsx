import NavBar from "../../../shared/components/NavBar";
import CourseCard from "../components/CourseCard";
import { useCourses } from "../hooks/useCourses";
import ReactPaginate from "react-paginate";

export default function CoursePage() {
  const { courses, loading, error, pagination, page, setPage } = useCourses();
  const totalPages = pagination.last || 1; // aseguramos que haya al menos 1 página

  if (loading) return <div>Cargando materias...</div>;
  if (error) return <div>Error al cargar las materias 😢</div>;

  return (
    <>
      <NavBar />
      <div className="flex justify-center min-h-screen bg-[#f3f8f9] p-4">
        <div className="flex w-full container gap-4">
          <div className="w-1/4 h-4/5 bg-white rounded-lg shadow-md"></div>

          <div className="flex flex-col w-3/4 px-6">
            <h1 className="text-2xl font-bold p-2 mb-4 text-black">Materias Disponibles</h1>

            {courses.length === 0 ? (
              <div>No hay materias disponibles</div>
            ) : (
              courses.map((course) => <CourseCard key={course.id} course={course} />)
            )}

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

          <div className="w-1/4 h-4/5 bg-white rounded-lg shadow-md"></div>
        </div>
      </div>
    </>
  );
}
